"""HTTP transport layer for maintenance tracking operations."""

from fastapi import APIRouter

maintenance_tracking_router = APIRouter(
    prefix="/maintenance",
    tags=["maintenance tracking"],
)

# Endpoints implemented in Phase 3
