"""Pydantic contracts for reporting and analytics."""

from datetime import date
from typing import Optional

from pydantic import BaseModel


class ReportFilterRequest(BaseModel):
    """Common filter parameters for reports."""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    vehicle_id: Optional[int] = None
    region: Optional[str] = None


# ── Report 1: Trip Summary ────────────────────────────────

class TripSummaryRow(BaseModel):
    """One row in the trip summary report."""
    vehicle_id: int
    vehicle_registration_number: str
    vehicle_name_model: str
    total_trips: int
    total_distance_km: float
    total_revenue: float
    total_fuel_liters: float
    total_fuel_cost: float
    average_km_per_liter: float


class TripSummaryReport(BaseModel):
    """Full trip summary report payload."""
    rows: list[TripSummaryRow]
    grand_total_trips: int
    grand_total_revenue: float
    grand_total_distance_km: float
    grand_total_fuel_cost: float


# ── Report 2: Expense Breakdown ───────────────────────────

class ExpenseBreakdownRow(BaseModel):
    """One category in the expense breakdown."""
    expense_type: str
    total_amount: float
    transaction_count: int
    percentage_of_total: float


class ExpenseBreakdownReport(BaseModel):
    """Expense breakdown report by category."""
    rows: list[ExpenseBreakdownRow]
    grand_total: float


# ── Report 3: Driver Performance ──────────────────────────

class DriverPerformanceRow(BaseModel):
    """One row in the driver performance report."""
    driver_id: int
    driver_name: str
    safety_score: int
    total_trips_completed: int
    total_distance_km: float
    total_revenue_generated: float
    average_fuel_efficiency_km_per_liter: float
    license_expiry_date: date
    is_license_expired: bool


class DriverPerformanceReport(BaseModel):
    """Full driver performance report."""
    rows: list[DriverPerformanceRow]
    total_drivers: int
    average_safety_score: float


# ── Report 4: Maintenance Cost ────────────────────────────

class MaintenanceCostRow(BaseModel):
    """One row in the maintenance cost report."""
    vehicle_id: int
    vehicle_registration_number: str
    vehicle_name_model: str
    total_maintenance_count: int
    total_maintenance_cost: float
    active_records: int
    closed_records: int


class MaintenanceCostReport(BaseModel):
    """Full maintenance cost report by vehicle."""
    rows: list[MaintenanceCostRow]
    grand_total_cost: float
    total_records: int
