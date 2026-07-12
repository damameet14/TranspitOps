"""Authenticate user credentials against stored password hashes.

Verifies email + password, then issues a JWT access token.
"""

import os
from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.user_account_model import UserAccount


password_hashing_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-to-a-random-secret-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRY_HOURS = 12


def verify_password(submitted_plain_text_password: str, stored_hashed_password: str) -> bool:
    """Check if a plain-text password matches the stored bcrypt hash."""
    return password_hashing_context.verify(submitted_plain_text_password, stored_hashed_password)


def hash_password(plain_text_password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return password_hashing_context.hash(plain_text_password)


def create_access_token(user_email: str) -> tuple[str, int]:
    """Create a JWT access token for the given user email.

    Returns:
        A tuple of (encoded_token, expires_in_seconds).
    """
    expires_in_seconds = ACCESS_TOKEN_EXPIRY_HOURS * 3600
    expiration_time = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRY_HOURS)

    token_payload = {
        "sub": user_email,
        "exp": expiration_time,
        "iat": datetime.now(timezone.utc),
    }

    encoded_token = jwt.encode(token_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_token, expires_in_seconds


def authenticate_user_credentials(
    database_session: Session,
    email: str,
    submitted_password: str,
) -> UserAccount | None:
    """Look up the user by email and verify the submitted password.

    Returns the UserAccount if authentication succeeds, None otherwise.
    Uses a generic failure response to prevent account enumeration.
    """
    user_account = (
        database_session.query(UserAccount)
        .filter(UserAccount.email == email)
        .first()
    )

    if user_account is None:
        return None

    if not verify_password(submitted_password, user_account.hashed_password):
        return None

    return user_account
