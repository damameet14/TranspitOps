"""Pydantic contracts for user authentication requests and responses."""

from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserLoginRequest(BaseModel):
    """Request body for POST /user-authentication/login."""
    email: EmailStr
    password: str


class UserLoginResult(BaseModel):
    """Successful login response with JWT access token."""
    access_token: str
    token_type: str = "bearer"
    expires_in_seconds: int
    user_id: int
    full_name: str
    role: str


class CurrentUserResult(BaseModel):
    """Response for GET /user-authentication/current-user."""
    id: int
    email: str
    full_name: str
    role: str
    created_at: datetime
