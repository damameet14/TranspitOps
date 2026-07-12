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

from datetime import date, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from source.application_startup.database_connection import get_database_session
from source.shared_infrastructure.database_models.user_account_model import UserAccount, UserRole
from source.shared_infrastructure.role_based_access_control import (
    get_current_authenticated_user,
    require_role,
)
from source.shared_infrastructure.transit_ops_email_notifications import notify_driver_of_license_expiry
from source.shared_infrastructure.database_models.driver_model import Driver

from source.modules.driver_management.driver_management_contracts import (
    CreateDriverRequest,
    DriverResponse,
    DriverRecommendationResponse,
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
    if current_user.role == UserRole.DRIVER:
        drivers = [retrieve_driver_by_id(database_session, current_user.driver_id)] if current_user.driver_id else []
    else:
        manager_filter = current_user.id if current_user.role == UserRole.FLEET_MANAGER else None
        drivers = retrieve_all_drivers(database_session, manager_filter)
    return [_driver_to_response(driver) for driver in drivers]


@driver_management_router.get("/available", response_model=list[DriverResponse])
def list_available_drivers(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> list[DriverResponse]:
    """List drivers eligible for trip assignment (available, valid license, not on trip)."""
    manager_filter = current_user.id if current_user.role == UserRole.FLEET_MANAGER else None
    drivers = retrieve_available_drivers(database_session, manager_filter)
    return [_driver_to_response(driver) for driver in drivers]


<<<<<<< HEAD
@driver_management_router.get("/recommendations", response_model=list[DriverRecommendationResponse])
def recommend_available_drivers(
    current_user: Annotated[UserAccount, Depends(require_role(UserRole.FLEET_MANAGER))],
    database_session: Annotated[Session, Depends(get_database_session)],
    location_id: int = Query(..., gt=0),
    vehicle_id: int = Query(..., gt=0),
) -> list[DriverRecommendationResponse]:
    """Rank eligible owned drivers by location, license fit, and safety score."""
    from source.shared_infrastructure.database_models.vehicle_model import Vehicle, VehicleType
    vehicle = database_session.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if vehicle is None:
        raise HTTPException(status_code=404, detail={"detail": "Vehicle not found.", "code": "VEHICLE_NOT_FOUND"})
    drivers = retrieve_available_drivers(database_session, current_user.id if current_user.role == UserRole.FLEET_MANAGER else None)
    ranked: list[DriverRecommendationResponse] = []
    for driver in drivers:
        license_matches = vehicle.type not in (VehicleType.TRUCK,) or "HMV" in driver.license_category or "TR" in driver.license_category
        if not license_matches:
            continue
        location_points = 40 if driver.current_location_id == location_id else 0
        license_points = 25
        safety_points = round(driver.safety_score * 0.35)
        response = _driver_to_response(driver).model_dump()
        ranked.append(DriverRecommendationResponse(**response, recommendation_score=location_points + license_points + safety_points, recommendation_reason=("Same service location, compatible license" if location_points else "Available with compatible license")))
    return sorted(ranked, key=lambda item: (-item.recommendation_score, item.name))


=======
>>>>>>> 8b2d77ce78de4ecc024e41e576d67e9f1ba9f407
@driver_management_router.post("/license-reminders")
def send_license_expiry_reminders(
    current_user: Annotated[UserAccount, Depends(require_role(UserRole.FLEET_MANAGER, UserRole.SAFETY_OFFICER))],
    database_session: Annotated[Session, Depends(get_database_session)],
    days: int = 30,
) -> dict[str, int]:
    """Email drivers whose license is expired or expires within the requested window."""
    today = date.today()
    drivers = database_session.query(Driver).filter(Driver.license_expiry_date <= today + timedelta(days=max(0, min(days, 365)))).all()
    sent = 0
    for driver in drivers:
        result = notify_driver_of_license_expiry(driver, (driver.license_expiry_date - today).days)
        if result.was_successful:
            sent += 1
    return {"eligible": len(drivers), "sent": sent, "failed": len(drivers) - sent}


@driver_management_router.get("/{driver_id}", response_model=DriverResponse)
def get_driver(
    driver_id: int,
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> DriverResponse:
    """Get a single driver by ID."""
    driver = retrieve_driver_by_id(database_session, driver_id)
    if current_user.role == UserRole.DRIVER and current_user.driver_id != driver.id:
        raise HTTPException(status_code=403, detail={"detail": "Drivers may only view their own profile.", "code": "DRIVER_SCOPE_VIOLATION"})
    if current_user.role == UserRole.FLEET_MANAGER and driver.fleet_manager_id != current_user.id:
        raise HTTPException(status_code=403, detail={"detail": "This driver belongs to another fleet manager.", "code": "FLEET_MANAGER_SCOPE_VIOLATION"})
    return _driver_to_response(driver)


@driver_management_router.post("", response_model=DriverResponse, status_code=201)
def create_new_driver(
    create_request: CreateDriverRequest,
    current_user: Annotated[UserAccount, Depends(require_role(UserRole.FLEET_MANAGER))],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> DriverResponse:
    """Create a new driver. Fleet Manager or Safety Officer only."""
    driver = create_driver(database_session, create_request, current_user.id if current_user.role == UserRole.FLEET_MANAGER else None)
    return _driver_to_response(driver)


@driver_management_router.put("/{driver_id}", response_model=DriverResponse)
def update_existing_driver(
    driver_id: int,
    update_request: UpdateDriverRequest,
    current_user: Annotated[UserAccount, Depends(require_role(UserRole.FLEET_MANAGER, UserRole.SAFETY_OFFICER))],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> DriverResponse:
    """Update an existing driver. Fleet Manager or Safety Officer only."""
    existing_driver = retrieve_driver_by_id(database_session, driver_id)
    if current_user.role == UserRole.FLEET_MANAGER and existing_driver.fleet_manager_id != current_user.id:
        raise HTTPException(status_code=403, detail={"detail": "This driver belongs to another fleet manager.", "code": "FLEET_MANAGER_SCOPE_VIOLATION"})
    driver = update_driver(database_session, driver_id, update_request)
    return _driver_to_response(driver)


@driver_management_router.delete("/{driver_id}", status_code=204)
def delete_existing_driver(
    driver_id: int,
    current_user: Annotated[UserAccount, Depends(require_role(UserRole.FLEET_MANAGER, UserRole.SAFETY_OFFICER))],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> None:
    """Delete a driver. Fleet Manager or Safety Officer only."""
    existing_driver = retrieve_driver_by_id(database_session, driver_id)
    if current_user.role == UserRole.FLEET_MANAGER and existing_driver.fleet_manager_id != current_user.id:
        raise HTTPException(status_code=403, detail={"detail": "This driver belongs to another fleet manager.", "code": "FLEET_MANAGER_SCOPE_VIOLATION"})
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
        fleet_manager_id=driver.fleet_manager_id,
        current_location_id=driver.current_location_id,
    )
