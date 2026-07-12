"""HTTP transport layer for user authentication.

Routes:
    POST /user-authentication/login — Authenticate with email and password
    GET  /user-authentication/current-user — Get currently authenticated user info
"""

from fastapi import APIRouter

user_authentication_router = APIRouter(
    prefix="/user-authentication",
    tags=["user authentication"],
)


# Endpoints implemented in Phase 2
