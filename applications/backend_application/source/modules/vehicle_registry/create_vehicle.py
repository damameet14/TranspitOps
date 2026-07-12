"""Create a new vehicle in the fleet registry.

Enforces business rule 1: registration_number must be unique.
"""

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.vehicle_model import Vehicle, VehicleStatus, VehicleType
from source.shared_infrastructure.standard_error_responses import DuplicateRegistrationNumberError
from source.modules.vehicle_registry.vehicle_registry_contracts import CreateVehicleRequest


def create_vehicle(
    database_session: Session,
    create_request: CreateVehicleRequest,
) -> Vehicle:
    """Insert a new vehicle record. Raises 409 if registration number is taken.

    Business rule 1: Vehicle registration_number is unique (DB constraint + friendly error).
    """
    new_vehicle = Vehicle(
        registration_number=create_request.registration_number,
        name_model=create_request.name_model,
        type=VehicleType(create_request.type),
        max_load_capacity_kg=create_request.max_load_capacity_kg,
        odometer_km=create_request.odometer_km,
        acquisition_cost=create_request.acquisition_cost,
        status=VehicleStatus.AVAILABLE,
        region=create_request.region,
    )

    database_session.add(new_vehicle)

    try:
        database_session.commit()
        database_session.refresh(new_vehicle)
    except IntegrityError:
        database_session.rollback()
        raise DuplicateRegistrationNumberError(create_request.registration_number)

    return new_vehicle
