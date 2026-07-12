"""Update an existing driver in the fleet."""

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.driver_model import Driver, DriverStatus
from source.shared_infrastructure.standard_error_responses import ResourceNotFoundError
from source.modules.driver_management.create_driver import DuplicateLicenseNumberError
from source.modules.driver_management.driver_management_contracts import UpdateDriverRequest


def update_driver(
    database_session: Session,
    driver_id: int,
    update_request: UpdateDriverRequest,
) -> Driver:
    """Apply partial updates to a driver. Raises 404 if not found, 409 if license conflict."""
    driver = database_session.query(Driver).filter(Driver.id == driver_id).first()
    if driver is None:
        raise ResourceNotFoundError("Driver", driver_id)

    if update_request.name is not None:
        driver.name = update_request.name
    if update_request.license_number is not None:
        driver.license_number = update_request.license_number
    if update_request.license_category is not None:
        driver.license_category = update_request.license_category
    if update_request.license_expiry_date is not None:
        driver.license_expiry_date = update_request.license_expiry_date
    if update_request.contact_number is not None:
        driver.contact_number = update_request.contact_number
    if update_request.safety_score is not None:
        driver.safety_score = update_request.safety_score
    if update_request.status is not None:
        driver.status = DriverStatus(update_request.status)

    try:
        database_session.commit()
        database_session.refresh(driver)
    except IntegrityError:
        database_session.rollback()
        raise DuplicateLicenseNumberError(update_request.license_number or driver.license_number)

    return driver
