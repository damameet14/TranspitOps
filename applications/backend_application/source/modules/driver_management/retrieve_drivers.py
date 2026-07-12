"""Retrieve drivers from the fleet.

Provides listing (all, available-only, by-id).
"""

from datetime import date

from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.driver_model import Driver, DriverStatus
from source.shared_infrastructure.database_models.trip_model import Trip, TripStatus
from source.shared_infrastructure.standard_error_responses import ResourceNotFoundError


def retrieve_all_drivers(database_session: Session, fleet_manager_id: int | None = None) -> list[Driver]:
    """Return all drivers ordered by name."""
    query = database_session.query(Driver)
    if fleet_manager_id is not None:
        query = query.filter(Driver.fleet_manager_id == fleet_manager_id)
    return query.order_by(Driver.name).all()


def retrieve_available_drivers(database_session: Session, fleet_manager_id: int | None = None) -> list[Driver]:
    """Return drivers eligible for trip assignment.

    Business rule 3: Drivers with expired licenses or Suspended status
    cannot be assigned to trips.
    Also excludes drivers already On Trip (rule 4).
    """
    today = date.today()
    drivers_with_active_trips = database_session.query(Trip.driver_id).filter(
        Trip.status.in_([TripStatus.DRAFT, TripStatus.DISPATCHED])
    )
    query = database_session.query(Driver)
    if fleet_manager_id is not None:
        query = query.filter(Driver.fleet_manager_id == fleet_manager_id)
    return (
        query
        .filter(
            Driver.status == DriverStatus.AVAILABLE,
            Driver.license_expiry_date >= today,
            ~Driver.id.in_(drivers_with_active_trips),
        )
        .order_by(Driver.name)
        .all()
    )


def retrieve_driver_by_id(database_session: Session, driver_id: int) -> Driver:
    """Return a single driver by ID. Raises 404 if not found."""
    driver = database_session.query(Driver).filter(Driver.id == driver_id).first()
    if driver is None:
        raise ResourceNotFoundError("Driver", driver_id)
    return driver
