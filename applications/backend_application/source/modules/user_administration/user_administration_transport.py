"""Administrator-only staff account and driver ownership operations."""

from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from source.application_startup.database_connection import get_database_session
from source.modules.user_authentication.authenticate_user_credentials import hash_password
from source.shared_infrastructure.database_models.driver_model import Driver
from source.shared_infrastructure.database_models.user_account_model import UserAccount, UserRole
from source.shared_infrastructure.role_based_access_control import require_role
from source.shared_infrastructure.standard_error_responses import ResourceNotFoundError


class CreateStaffUserRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    role: Literal["fleet_manager", "safety_officer", "financial_analyst"]


class StaffUserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool


class DriverFleetManagerAssignmentRequest(BaseModel):
    fleet_manager_id: int = Field(gt=0)


user_administration_router = APIRouter(prefix="/admin", tags=["user administration"])


def _staff_user_response(user: UserAccount) -> StaffUserResponse:
    return StaffUserResponse(id=user.id, email=user.email, full_name=user.full_name, role=user.role.value, is_active=user.is_active)


@user_administration_router.get("/users", response_model=list[StaffUserResponse])
def list_staff_users(
    current_user: Annotated[UserAccount, Depends(require_role(UserRole.ADMIN))],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> list[StaffUserResponse]:
    users = database_session.query(UserAccount).order_by(UserAccount.full_name).all()
    return [_staff_user_response(user) for user in users]


@user_administration_router.post("/users", response_model=StaffUserResponse, status_code=201)
def create_staff_user(
    request: CreateStaffUserRequest,
    current_user: Annotated[UserAccount, Depends(require_role(UserRole.ADMIN))],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> StaffUserResponse:
    if database_session.query(UserAccount.id).filter(UserAccount.email == str(request.email)).first():
        raise HTTPException(status_code=409, detail={"detail": "A user with this email already exists.", "code": "DUPLICATE_USER_EMAIL"})
    user = UserAccount(email=str(request.email), full_name=request.full_name, hashed_password=hash_password(request.password), role=UserRole(request.role), is_active=True)
    database_session.add(user)
    database_session.commit()
    database_session.refresh(user)
    return _staff_user_response(user)


@user_administration_router.patch("/users/{user_id}/active", response_model=StaffUserResponse)
def set_staff_user_active_status(
    user_id: int,
    is_active: bool,
    current_user: Annotated[UserAccount, Depends(require_role(UserRole.ADMIN))],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> StaffUserResponse:
    user = database_session.query(UserAccount).filter(UserAccount.id == user_id).first()
    if user is None:
        raise ResourceNotFoundError("User account", user_id)
    if user.id == current_user.id and not is_active:
        raise HTTPException(status_code=409, detail={"detail": "Administrators cannot deactivate their own active session.", "code": "SELF_DEACTIVATION_NOT_ALLOWED"})
    user.is_active = is_active
    database_session.commit()
    database_session.refresh(user)
    return _staff_user_response(user)


@user_administration_router.patch("/drivers/{driver_id}/fleet-manager")
def assign_driver_to_fleet_manager(
    driver_id: int,
    request: DriverFleetManagerAssignmentRequest,
    current_user: Annotated[UserAccount, Depends(require_role(UserRole.ADMIN))],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> dict[str, int]:
    driver = database_session.query(Driver).filter(Driver.id == driver_id).first()
    if driver is None:
        raise ResourceNotFoundError("Driver", driver_id)
    manager = database_session.query(UserAccount).filter(UserAccount.id == request.fleet_manager_id, UserAccount.role == UserRole.FLEET_MANAGER, UserAccount.is_active.is_(True)).first()
    if manager is None:
        raise HTTPException(status_code=422, detail={"detail": "The selected user is not an active fleet manager.", "code": "INVALID_FLEET_MANAGER"})
    driver.fleet_manager_id = manager.id
    database_session.commit()
    return {"driver_id": driver.id, "fleet_manager_id": manager.id}
