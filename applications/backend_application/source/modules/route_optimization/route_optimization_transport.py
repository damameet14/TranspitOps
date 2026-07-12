"""HTTP transport layer for route optimization suggestions."""

from fastapi import APIRouter

route_optimization_router = APIRouter(
    prefix="/routes",
    tags=["route optimization"],
)

# Endpoints implemented in Phase 4
