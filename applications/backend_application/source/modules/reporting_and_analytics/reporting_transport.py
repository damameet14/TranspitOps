"""HTTP transport layer for reporting and analytics."""

from fastapi import APIRouter

reporting_router = APIRouter(
    prefix="/reports",
    tags=["reporting and analytics"],
)

# Endpoints implemented in Phase 4
