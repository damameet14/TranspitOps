"""CRUD operations for fuel logs and expenses."""

from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.fuel_log_model import FuelLog
from source.shared_infrastructure.database_models.expense_model import Expense
from source.shared_infrastructure.database_models.vehicle_model import Vehicle
from source.shared_infrastructure.standard_error_responses import ResourceNotFoundError
from source.modules.fuel_and_expense_tracking.fuel_and_expense_contracts import (
    CreateExpenseRequest,
    CreateFuelLogRequest,
)


# ── Fuel Log Operations ───────────────────────────────────

def retrieve_all_fuel_logs(
    database_session: Session,
    vehicle_id_filter: int | None = None,
) -> list[FuelLog]:
    """Return fuel logs, optionally filtered by vehicle."""
    query = database_session.query(FuelLog).order_by(FuelLog.log_date.desc())
    if vehicle_id_filter is not None:
        query = query.filter(FuelLog.vehicle_id == vehicle_id_filter)
    return query.all()


def create_fuel_log(
    database_session: Session,
    create_request: CreateFuelLogRequest,
) -> FuelLog:
    """Insert a manual fuel log entry. Validates vehicle exists."""
    vehicle = database_session.query(Vehicle).filter(Vehicle.id == create_request.vehicle_id).first()
    if vehicle is None:
        raise ResourceNotFoundError("Vehicle", create_request.vehicle_id)

    new_log = FuelLog(
        vehicle_id=create_request.vehicle_id,
        trip_id=create_request.trip_id,
        liters=create_request.liters,
        cost=create_request.cost,
        log_date=create_request.log_date,
    )
    database_session.add(new_log)
    database_session.commit()
    database_session.refresh(new_log)
    return new_log


# ── Expense Operations ────────────────────────────────────

def retrieve_all_expenses(
    database_session: Session,
    vehicle_id_filter: int | None = None,
    type_filter: str | None = None,
) -> list[Expense]:
    """Return expenses, optionally filtered by vehicle and/or type."""
    query = database_session.query(Expense).order_by(Expense.expense_date.desc())
    if vehicle_id_filter is not None:
        query = query.filter(Expense.vehicle_id == vehicle_id_filter)
    if type_filter is not None:
        query = query.filter(Expense.type == type_filter)
    return query.all()


def create_expense(
    database_session: Session,
    create_request: CreateExpenseRequest,
) -> Expense:
    """Insert a new expense. Validates vehicle exists."""
    vehicle = database_session.query(Vehicle).filter(Vehicle.id == create_request.vehicle_id).first()
    if vehicle is None:
        raise ResourceNotFoundError("Vehicle", create_request.vehicle_id)

    new_expense = Expense(
        vehicle_id=create_request.vehicle_id,
        type=create_request.type,
        amount=create_request.amount,
        expense_date=create_request.expense_date,
        notes=create_request.notes,
    )
    database_session.add(new_expense)
    database_session.commit()
    database_session.refresh(new_expense)
    return new_expense


def retrieve_distinct_expense_types(database_session: Session) -> list[str]:
    """Return all distinct expense types for filter dropdowns."""
    rows = (
        database_session.query(Expense.type)
        .distinct()
        .order_by(Expense.type)
        .all()
    )
    return [row[0] for row in rows]
