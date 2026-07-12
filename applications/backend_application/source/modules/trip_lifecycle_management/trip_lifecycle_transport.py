"""HTTP transport layer for trip lifecycle management."""

from fastapi import APIRouter

trip_lifecycle_router = APIRouter(
    prefix="/trips",
    tags=["trip lifecycle management"],
)

# Endpoints implemented in Phase 3
