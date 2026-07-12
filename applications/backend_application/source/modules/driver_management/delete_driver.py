"""Delete a driver from the fleet."""

from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.driver_model import Driver
from source.shared_infrastructure.standard_error_responses import ResourceNotFoundError


def delete_driver(database_session: Session, driver_id: int) -> None:
    """Remove a driver by ID. Raises 404 if not found."""
    driver = database_session.query(Driver).filter(Driver.id == driver_id).first()
    if driver is None:
        raise ResourceNotFoundError("Driver", driver_id)

    database_session.delete(driver)
    database_session.commit()
