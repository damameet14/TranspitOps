"""Retrieve vehicles from the fleet registry.

Provides listing (all, available-only, by-id) and distinct regions for filters.
"""

from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.vehicle_model import Vehicle, VehicleStatus
from source.shared_infrastructure.standard_error_responses import ResourceNotFoundError


def retrieve_all_vehicles(database_session: Session) -> list[Vehicle]:
    """Return all vehicles ordered by registration number."""
    return (
        database_session.query(Vehicle)
        .order_by(Vehicle.registration_number)
        .all()
    )


def retrieve_available_vehicles(database_session: Session) -> list[Vehicle]:
    """Return vehicles eligible for dispatch (status = Available only).

    Business rule 2: Retired and In Shop vehicles never appear in dispatch selection.
    """
    return (
        database_session.query(Vehicle)
        .filter(Vehicle.status == VehicleStatus.AVAILABLE)
        .order_by(Vehicle.registration_number)
        .all()
    )


def retrieve_vehicle_by_id(database_session: Session, vehicle_id: int) -> Vehicle:
    """Return a single vehicle by ID. Raises 404 if not found."""
    vehicle = database_session.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if vehicle is None:
        raise ResourceNotFoundError("Vehicle", vehicle_id)
    return vehicle


def retrieve_distinct_vehicle_regions(database_session: Session) -> list[str]:
    """Return all distinct non-null region values for filter dropdowns."""
    rows = (
        database_session.query(Vehicle.region)
        .filter(Vehicle.region.isnot(None))
        .distinct()
        .order_by(Vehicle.region)
        .all()
    )
    return [row[0] for row in rows]
