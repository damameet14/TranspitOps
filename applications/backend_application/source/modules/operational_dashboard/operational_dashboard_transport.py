"""HTTP transport layer for operational dashboard KPIs."""

from fastapi import APIRouter

operational_dashboard_router = APIRouter(
    prefix="/dashboard",
    tags=["operational dashboard"],
)

# Endpoints implemented in Phase 4
