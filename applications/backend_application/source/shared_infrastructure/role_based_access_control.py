"""Role-based access control dependencies for FastAPI route protection.

Provides `get_current_authenticated_user` to decode JWT tokens and
`require_role` to gate endpoints by user role.
"""

import os
from datetime import datetime, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from source.application_startup.database_connection import get_database_session
from source.shared_infrastructure.database_models.user_account_model import UserAccount, UserRole


JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-to-a-random-secret-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRY_HOURS = 12

http_bearer_scheme = HTTPBearer()


def get_current_authenticated_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(http_bearer_scheme)],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> UserAccount:
    """Decode the JWT bearer token and return the authenticated user.

    Raises 401 if the token is invalid, expired, or the user does not exist.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_email: str | None = payload.get("sub")
        token_expiration = payload.get("exp")
        if user_email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"detail": "Invalid authentication token.", "code": "INVALID_TOKEN"},
            )
        if token_expiration and datetime.fromtimestamp(token_expiration, tz=timezone.utc) < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"detail": "Authentication token has expired.", "code": "TOKEN_EXPIRED"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"detail": "Could not validate authentication token.", "code": "TOKEN_VALIDATION_FAILED"},
        )

    user_account = (
        database_session.query(UserAccount).filter(UserAccount.email == user_email).first()
    )
    if user_account is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"detail": "User account not found.", "code": "USER_NOT_FOUND"},
        )
    if not getattr(user_account, "is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"detail": "This user account is deactivated.", "code": "ACCOUNT_DEACTIVATED"},
        )

    return user_account


def require_role(*allowed_roles: UserRole):
    """Factory that returns a FastAPI dependency checking the user's role.

    Usage:
        @router.get("/vehicles", dependencies=[Depends(require_role(UserRole.FLEET_MANAGER))])
    """
    def role_checker(
        current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    ) -> UserAccount:
        if current_user.role != UserRole.ADMIN and current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "detail": f"Role '{current_user.role.value}' does not have permission for this action.",
                    "code": "INSUFFICIENT_ROLE",
                },
            )
        return current_user

    return role_checker
