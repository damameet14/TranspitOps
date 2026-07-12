"""HTTP transport layer for operational dashboard KPIs.

Routes:
    GET /dashboard/kpis — Returns all KPI metrics for the dashboard
"""

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from source.application_startup.database_connection import get_database_session
from source.shared_infrastructure.database_models.user_account_model import UserAccount
from source.shared_infrastructure.role_based_access_control import get_current_authenticated_user

from source.modules.operational_dashboard.operational_dashboard_contracts import DashboardKpiResult
from source.modules.operational_dashboard.calculate_dashboard_kpis import calculate_dashboard_kpis


operational_dashboard_router = APIRouter(
    prefix="/dashboard",
    tags=["operational dashboard"],
)


@operational_dashboard_router.get("/kpis", response_model=DashboardKpiResult)
def get_dashboard_kpis(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
    vehicle_type: str | None = Query(None),
    vehicle_status: str | None = Query(None),
    region: str | None = Query(None),
) -> DashboardKpiResult:
    """Return all operational KPI metrics for the dashboard. All roles can access."""
    return calculate_dashboard_kpis(
        database_session,
        vehicle_type_filter=vehicle_type,
        vehicle_status_filter=vehicle_status,
        region_filter=region,
    )
