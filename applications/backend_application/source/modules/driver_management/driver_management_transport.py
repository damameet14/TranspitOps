"""HTTP transport layer for driver management operations."""

from fastapi import APIRouter

driver_management_router = APIRouter(
    prefix="/drivers",
    tags=["driver management"],
)

# Endpoints implemented in Phase 2
