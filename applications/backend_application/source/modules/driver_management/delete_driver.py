"""Delete a driver from the fleet."""

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.driver_model import Driver
from source.shared_infrastructure.database_models.trip_model import Trip
from source.shared_infrastructure.standard_error_responses import (
    DriverHasTripHistoryError,
    ResourceNotFoundError,
)


def delete_driver(database_session: Session, driver_id: int) -> None:
    """Remove an unused driver, preserving drivers referenced by trip history."""
    driver = database_session.query(Driver).filter(Driver.id == driver_id).first()
    if driver is None:
        raise ResourceNotFoundError("Driver", driver_id)

    referenced_trip = database_session.query(Trip.id).filter(Trip.driver_id == driver_id).first()
    if referenced_trip is not None:
        raise DriverHasTripHistoryError(driver_id)

    database_session.delete(driver)
    try:
        database_session.commit()
    except IntegrityError as integrity_error:
        database_session.rollback()
        raise DriverHasTripHistoryError(driver_id) from integrity_error
