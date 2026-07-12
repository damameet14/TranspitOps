"""HTTP transport layer for user authentication.

Routes:
    POST /user-authentication/login — Authenticate with email and password
    GET  /user-authentication/current-user — Get currently authenticated user info
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from source.application_startup.database_connection import get_database_session
from source.shared_infrastructure.database_models.user_account_model import UserAccount
from source.shared_infrastructure.role_based_access_control import get_current_authenticated_user
from source.shared_infrastructure.transit_ops_email_notifications import (
    notify_user_of_successful_login,
)

from source.modules.user_authentication.authenticate_user_credentials import (
    authenticate_user_credentials,
    create_access_token,
)
from source.modules.user_authentication.user_authentication_contracts import (
    CurrentUserResult,
    UserLoginRequest,
    UserLoginResult,
)


user_authentication_router = APIRouter(
    prefix="/user-authentication",
    tags=["user authentication"],
)


@user_authentication_router.post("/login", response_model=UserLoginResult)
def login(
    login_request: UserLoginRequest,
    database_session: Annotated[Session, Depends(get_database_session)],
) -> UserLoginResult:
    """Authenticate a user with email and password, returning a JWT access token."""
    authenticated_user = authenticate_user_credentials(
        database_session=database_session,
        email=login_request.email,
        submitted_password=login_request.password,
    )

    if authenticated_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"detail": "Invalid email or password.", "code": "INVALID_CREDENTIALS"},
        )

    access_token, expires_in_seconds = create_access_token(authenticated_user.email)
    notify_user_of_successful_login(authenticated_user)

    return UserLoginResult(
        access_token=access_token,
        expires_in_seconds=expires_in_seconds,
        user_id=authenticated_user.id,
        full_name=authenticated_user.full_name,
        role=authenticated_user.role.value,
        driver_id=getattr(authenticated_user, "driver_id", None),
    )


@user_authentication_router.get("/current-user", response_model=CurrentUserResult)
def get_current_user_info(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
) -> CurrentUserResult:
    """Return profile information for the currently authenticated user."""
    return CurrentUserResult(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role.value,
        driver_id=getattr(current_user, "driver_id", None),
        created_at=current_user.created_at,
    )
