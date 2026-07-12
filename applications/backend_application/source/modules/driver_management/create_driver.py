"""Create a new driver in the fleet."""

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.driver_model import Driver, DriverStatus
from source.shared_infrastructure.standard_error_responses import TransitOpsError
from source.modules.driver_management.driver_management_contracts import CreateDriverRequest


class DuplicateLicenseNumberError(TransitOpsError):
    def __init__(self, license_number: str):
        super().__init__(
            status_code=409,
            detail=f"Driver with license number '{license_number}' already exists.",
            error_code="DUPLICATE_LICENSE_NUMBER",
        )


def create_driver(
    database_session: Session,
    create_request: CreateDriverRequest,
) -> Driver:
    """Insert a new driver record. Raises 409 if license number is taken."""
    new_driver = Driver(
        name=create_request.name,
        license_number=create_request.license_number,
        license_category=create_request.license_category,
        license_expiry_date=create_request.license_expiry_date,
        contact_number=create_request.contact_number,
        safety_score=create_request.safety_score,
        status=DriverStatus.AVAILABLE,
    )

    database_session.add(new_driver)

    try:
        database_session.commit()
        database_session.refresh(new_driver)
    except IntegrityError:
        database_session.rollback()
        raise DuplicateLicenseNumberError(create_request.license_number)

    return new_driver
