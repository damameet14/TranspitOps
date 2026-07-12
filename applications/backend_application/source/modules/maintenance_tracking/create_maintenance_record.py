"""Create a new maintenance record and auto-update vehicle status.

Business rule 9 — When a maintenance record is created with Active status,
the associated vehicle's status is set to In Shop.
"""

from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.maintenance_log_model import MaintenanceLog, MaintenanceStatus
from source.shared_infrastructure.database_models.vehicle_model import Vehicle, VehicleStatus
from source.shared_infrastructure.database_models.trip_model import Trip, TripStatus
from source.shared_infrastructure.standard_error_responses import (
    ResourceNotFoundError,
    VehicleNotEligibleForMaintenanceError,
)
from source.modules.maintenance_tracking.maintenance_tracking_contracts import CreateMaintenanceRecordRequest


def create_maintenance_record(
    database_session: Session,
    create_request: CreateMaintenanceRecordRequest,
) -> MaintenanceLog:
    """Insert a new maintenance record and set vehicle to In Shop.

    Business rule 9: Active maintenance → vehicle.status = In Shop.
    Transactional — both the record insertion and vehicle status update
    happen in the same commit.
    """
    # Verify vehicle exists
    vehicle = database_session.query(Vehicle).filter(Vehicle.id == create_request.vehicle_id).first()
    if vehicle is None:
        raise ResourceNotFoundError("Vehicle", create_request.vehicle_id)

    if vehicle.status != VehicleStatus.AVAILABLE:
        raise VehicleNotEligibleForMaintenanceError(vehicle.id, f"current status is '{vehicle.status.value}'")

    active_trip = database_session.query(Trip.id).filter(
        Trip.vehicle_id == vehicle.id,
        Trip.status.in_([TripStatus.DRAFT, TripStatus.DISPATCHED]),
    ).first()
    if active_trip is not None:
        raise VehicleNotEligibleForMaintenanceError(vehicle.id, "vehicle is assigned to an active trip")

    active_maintenance = database_session.query(MaintenanceLog.id).filter(
        MaintenanceLog.vehicle_id == vehicle.id,
        MaintenanceLog.status == MaintenanceStatus.ACTIVE,
    ).first()
    if active_maintenance is not None:
        raise VehicleNotEligibleForMaintenanceError(vehicle.id, "an active maintenance record already exists")

    # Create the maintenance record
    new_record = MaintenanceLog(
        vehicle_id=create_request.vehicle_id,
        type=create_request.type,
        cost=create_request.cost,
        description=create_request.description,
        status=MaintenanceStatus.ACTIVE,
    )
    database_session.add(new_record)

    # Rule 9: vehicle goes to In Shop
    vehicle.status = VehicleStatus.IN_SHOP

    database_session.commit()
    database_session.refresh(new_record)

    return new_record
