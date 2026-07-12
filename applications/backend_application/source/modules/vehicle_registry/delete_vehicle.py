"""Delete a vehicle from the fleet registry."""

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.trip_model import Trip
from source.shared_infrastructure.database_models.vehicle_model import Vehicle
from source.shared_infrastructure.standard_error_responses import (
    ResourceNotFoundError,
    VehicleHasTripHistoryError,
)


def delete_vehicle(database_session: Session, vehicle_id: int) -> None:
    """Remove an unused vehicle, preserving vehicles referenced by trip history."""
    vehicle = database_session.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if vehicle is None:
        raise ResourceNotFoundError("Vehicle", vehicle_id)

    referenced_trip = database_session.query(Trip.id).filter(Trip.vehicle_id == vehicle_id).first()
    if referenced_trip is not None:
        raise VehicleHasTripHistoryError(vehicle_id)

    database_session.delete(vehicle)
    try:
        database_session.commit()
    except IntegrityError as integrity_error:
        database_session.rollback()
        raise VehicleHasTripHistoryError(vehicle_id) from integrity_error
