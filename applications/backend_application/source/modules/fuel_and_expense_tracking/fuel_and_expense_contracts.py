"""Pydantic contracts for fuel log and expense tracking."""

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


# ── Fuel Logs ──────────────────────────────────────────────

class CreateFuelLogRequest(BaseModel):
    """Request body for POST /fuel-logs."""
    vehicle_id: int
    trip_id: Optional[int] = None
    liters: float = Field(..., gt=0)
    cost: float = Field(..., gt=0)
    log_date: date


class FuelLogResponse(BaseModel):
    """Single fuel log in API responses."""
    id: int
    vehicle_id: int
    trip_id: Optional[int]
    liters: float
    cost: float
    log_date: date
    created_at: datetime
    vehicle_registration_number: Optional[str] = None
    vehicle_name_model: Optional[str] = None

    model_config = {"from_attributes": True}


# ── Expenses ───────────────────────────────────────────────

class CreateExpenseRequest(BaseModel):
    """Request body for POST /expenses."""
    vehicle_id: int
    type: str = Field(..., min_length=1, max_length=100)
    amount: float = Field(..., gt=0)
    expense_date: date
    notes: Optional[str] = None


class ExpenseResponse(BaseModel):
    """Single expense in API responses."""
    id: int
    vehicle_id: int
    type: str
    amount: float
    expense_date: date
    notes: Optional[str]
    created_at: datetime
    vehicle_registration_number: Optional[str] = None
    vehicle_name_model: Optional[str] = None

    model_config = {"from_attributes": True}
