"""Create a new maintenance record and auto-update vehicle status.

Business rule 9 — When a maintenance record is created with Active status,
the associated vehicle's status is set to In Shop.
"""

from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.maintenance_log_model import MaintenanceLog, MaintenanceStatus
from source.shared_infrastructure.database_models.vehicle_model import Vehicle, VehicleStatus
from source.shared_infrastructure.standard_error_responses import ResourceNotFoundError
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
