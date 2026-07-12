"""HTTP transport layer for fuel log and expense operations.

Routes:
    GET  /fuel-logs           — List fuel logs (optional ?vehicle_id= filter)
    POST /fuel-logs           — Create a manual fuel log
    GET  /expenses            — List expenses (optional ?vehicle_id= and ?type= filters)
    POST /expenses            — Create a new expense
    GET  /expenses/types      — List distinct expense types for filters

Role restrictions:
    Fleet Manager: full access
    Financial Analyst: full access
    Driver: read fuel logs, no expenses
    Safety Officer: read-only
"""

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from source.application_startup.database_connection import get_database_session
from source.shared_infrastructure.database_models.user_account_model import UserAccount, UserRole
from source.shared_infrastructure.role_based_access_control import (
    get_current_authenticated_user,
    require_role,
)

from source.modules.fuel_and_expense_tracking.fuel_and_expense_contracts import (
    CreateExpenseRequest,
    CreateFuelLogRequest,
    ExpenseResponse,
    FuelLogResponse,
)
from source.modules.fuel_and_expense_tracking.fuel_and_expense_operations import (
    create_expense,
    create_fuel_log,
    retrieve_all_expenses,
    retrieve_all_fuel_logs,
    retrieve_distinct_expense_types,
)


fuel_and_expense_router = APIRouter(tags=["fuel and expense tracking"])


# ── Fuel Logs ──────────────────────────────────────────────

@fuel_and_expense_router.get("/fuel-logs", response_model=list[FuelLogResponse])
def list_fuel_logs(
    current_user: Annotated[UserAccount, Depends(require_role(UserRole.FINANCIAL_ANALYST))],
    database_session: Annotated[Session, Depends(get_database_session)],
    vehicle_id: Optional[int] = Query(None),
) -> list[FuelLogResponse]:
    """List all fuel logs with optional vehicle filter."""
    logs = retrieve_all_fuel_logs(database_session, vehicle_id_filter=vehicle_id)
    return [_fuel_log_to_response(log) for log in logs]


@fuel_and_expense_router.post("/fuel-logs", response_model=FuelLogResponse, status_code=201)
def create_new_fuel_log(
    create_request: CreateFuelLogRequest,
    current_user: Annotated[
        UserAccount,
        Depends(require_role(UserRole.FINANCIAL_ANALYST)),
    ],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> FuelLogResponse:
    """Create a manual fuel log. Fleet Manager or Financial Analyst only."""
    log = create_fuel_log(database_session, create_request)
    return _fuel_log_to_response(log)


# ── Expenses ───────────────────────────────────────────────

@fuel_and_expense_router.get("/expenses", response_model=list[ExpenseResponse])
def list_expenses(
    current_user: Annotated[UserAccount, Depends(require_role(UserRole.FINANCIAL_ANALYST))],
    database_session: Annotated[Session, Depends(get_database_session)],
    vehicle_id: Optional[int] = Query(None),
    type: Optional[str] = Query(None),
) -> list[ExpenseResponse]:
    """List all expenses with optional vehicle and type filters."""
    expenses = retrieve_all_expenses(
        database_session,
        vehicle_id_filter=vehicle_id,
        type_filter=type,
    )
    return [_expense_to_response(exp) for exp in expenses]


@fuel_and_expense_router.post("/expenses", response_model=ExpenseResponse, status_code=201)
def create_new_expense(
    create_request: CreateExpenseRequest,
    current_user: Annotated[
        UserAccount,
        Depends(require_role(UserRole.FINANCIAL_ANALYST)),
    ],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> ExpenseResponse:
    """Create a new expense. Fleet Manager or Financial Analyst only."""
    expense = create_expense(database_session, create_request)
    return _expense_to_response(expense)


@fuel_and_expense_router.get("/expenses/types", response_model=list[str])
def list_expense_types(
    current_user: Annotated[UserAccount, Depends(require_role(UserRole.FINANCIAL_ANALYST))],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> list[str]:
    """List distinct expense types for filter dropdowns."""
    return retrieve_distinct_expense_types(database_session)


# ── Response Mappers ───────────────────────────────────────

def _fuel_log_to_response(log) -> FuelLogResponse:
    return FuelLogResponse(
        id=log.id,
        vehicle_id=log.vehicle_id,
        trip_id=log.trip_id,
        liters=float(log.liters),
        cost=float(log.cost),
        log_date=log.log_date,
        created_at=log.created_at,
        vehicle_registration_number=log.vehicle.registration_number if log.vehicle else None,
        vehicle_name_model=log.vehicle.name_model if log.vehicle else None,
    )


def _expense_to_response(expense) -> ExpenseResponse:
    return ExpenseResponse(
        id=expense.id,
        vehicle_id=expense.vehicle_id,
        type=expense.type,
        amount=float(expense.amount),
        expense_date=expense.expense_date,
        notes=expense.notes,
        created_at=expense.created_at,
        vehicle_registration_number=expense.vehicle.registration_number if expense.vehicle else None,
        vehicle_name_model=expense.vehicle.name_model if expense.vehicle else None,
    )
