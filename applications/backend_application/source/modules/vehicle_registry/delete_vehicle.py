"""Delete a vehicle from the fleet registry."""

from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.vehicle_model import Vehicle
from source.shared_infrastructure.standard_error_responses import ResourceNotFoundError


def delete_vehicle(database_session: Session, vehicle_id: int) -> None:
    """Remove a vehicle by ID. Raises 404 if not found."""
    vehicle = database_session.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if vehicle is None:
        raise ResourceNotFoundError("Vehicle", vehicle_id)

    database_session.delete(vehicle)
    database_session.commit()
