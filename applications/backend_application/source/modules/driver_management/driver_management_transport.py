"""HTTP transport layer for driver management operations.

Routes:
    GET    /drivers           — List all drivers
    GET    /drivers/available — List drivers eligible for trip assignment
    GET    /drivers/{id}      — Get a single driver
    POST   /drivers           — Create a new driver
    PUT    /drivers/{id}      — Update a driver
    DELETE /drivers/{id}      — Delete a driver

Role restrictions:
    Safety Officer: full CRUD on driver profiles
    Fleet Manager: full CRUD
    Driver: read-only
    Financial Analyst: read-only
"""

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from source.application_startup.database_connection import get_database_session
from source.shared_infrastructure.database_models.user_account_model import UserAccount, UserRole
from source.shared_infrastructure.role_based_access_control import (
    get_current_authenticated_user,
    require_role,
)

from source.modules.driver_management.driver_management_contracts import (
    CreateDriverRequest,
    DriverResponse,
    UpdateDriverRequest,
)
from source.modules.driver_management.create_driver import create_driver
from source.modules.driver_management.retrieve_drivers import (
    retrieve_all_drivers,
    retrieve_available_drivers,
    retrieve_driver_by_id,
)
from source.modules.driver_management.update_driver import update_driver
from source.modules.driver_management.delete_driver import delete_driver


driver_management_router = APIRouter(
    prefix="/drivers",
    tags=["driver management"],
)


@driver_management_router.get("", response_model=list[DriverResponse])
def list_all_drivers(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> list[DriverResponse]:
    """List all drivers in the fleet."""
    drivers = retrieve_all_drivers(database_session)
    return [_driver_to_response(driver) for driver in drivers]


@driver_management_router.get("/available", response_model=list[DriverResponse])
def list_available_drivers(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> list[DriverResponse]:
    """List drivers eligible for trip assignment (available, valid license, not on trip)."""
    drivers = retrieve_available_drivers(database_session)
    return [_driver_to_response(driver) for driver in drivers]


@driver_management_router.get("/{driver_id}", response_model=DriverResponse)
def get_driver(
    driver_id: int,
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> DriverResponse:
    """Get a single driver by ID."""
    driver = retrieve_driver_by_id(database_session, driver_id)
    return _driver_to_response(driver)


@driver_management_router.post("", response_model=DriverResponse, status_code=201)
def create_new_driver(
    create_request: CreateDriverRequest,
    current_user: Annotated[UserAccount, Depends(require_role(UserRole.FLEET_MANAGER, UserRole.SAFETY_OFFICER))],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> DriverResponse:
    """Create a new driver. Fleet Manager or Safety Officer only."""
    driver = create_driver(database_session, create_request)
    return _driver_to_response(driver)


@driver_management_router.put("/{driver_id}", response_model=DriverResponse)
def update_existing_driver(
    driver_id: int,
    update_request: UpdateDriverRequest,
    current_user: Annotated[UserAccount, Depends(require_role(UserRole.FLEET_MANAGER, UserRole.SAFETY_OFFICER))],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> DriverResponse:
    """Update an existing driver. Fleet Manager or Safety Officer only."""
    driver = update_driver(database_session, driver_id, update_request)
    return _driver_to_response(driver)


@driver_management_router.delete("/{driver_id}", status_code=204)
def delete_existing_driver(
    driver_id: int,
    current_user: Annotated[UserAccount, Depends(require_role(UserRole.FLEET_MANAGER, UserRole.SAFETY_OFFICER))],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> None:
    """Delete a driver. Fleet Manager or Safety Officer only."""
    delete_driver(database_session, driver_id)


def _driver_to_response(driver) -> DriverResponse:
    """Map a Driver ORM model to the API response contract."""
    return DriverResponse(
        id=driver.id,
        name=driver.name,
        email=driver.email,
        license_number=driver.license_number,
        license_category=driver.license_category,
        license_expiry_date=driver.license_expiry_date,
        contact_number=driver.contact_number,
        safety_score=driver.safety_score,
        status=driver.status.value,
        is_license_expired=driver.license_expiry_date < date.today(),
        created_at=driver.created_at,
        updated_at=driver.updated_at,
    )
