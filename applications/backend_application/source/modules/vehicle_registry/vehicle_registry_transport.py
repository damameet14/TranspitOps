"""HTTP transport layer for vehicle registry operations."""

from fastapi import APIRouter

vehicle_registry_router = APIRouter(
    prefix="/vehicles",
    tags=["vehicle registry"],
)

# Endpoints implemented in Phase 2
