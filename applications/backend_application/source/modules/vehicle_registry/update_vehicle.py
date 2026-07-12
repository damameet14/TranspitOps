"""Update an existing vehicle in the fleet registry."""

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.vehicle_model import Vehicle, VehicleStatus, VehicleType
from source.shared_infrastructure.standard_error_responses import (
    DuplicateRegistrationNumberError,
    ResourceNotFoundError,
)
from source.modules.vehicle_registry.vehicle_registry_contracts import UpdateVehicleRequest


def update_vehicle(
    database_session: Session,
    vehicle_id: int,
    update_request: UpdateVehicleRequest,
) -> Vehicle:
    """Apply partial updates to a vehicle. Raises 404 if not found, 409 if registration conflict."""
    vehicle = database_session.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if vehicle is None:
        raise ResourceNotFoundError("Vehicle", vehicle_id)

    if update_request.registration_number is not None:
        vehicle.registration_number = update_request.registration_number
    if update_request.name_model is not None:
        vehicle.name_model = update_request.name_model
    if update_request.type is not None:
        vehicle.type = VehicleType(update_request.type)
    if update_request.max_load_capacity_kg is not None:
        vehicle.max_load_capacity_kg = update_request.max_load_capacity_kg
    if update_request.odometer_km is not None:
        vehicle.odometer_km = update_request.odometer_km
    if update_request.acquisition_cost is not None:
        vehicle.acquisition_cost = update_request.acquisition_cost
    if update_request.status is not None:
        vehicle.status = VehicleStatus(update_request.status)
    if update_request.region is not None:
        vehicle.region = update_request.region

    try:
        database_session.commit()
        database_session.refresh(vehicle)
    except IntegrityError:
        database_session.rollback()
        raise DuplicateRegistrationNumberError(update_request.registration_number or vehicle.registration_number)

    return vehicle
