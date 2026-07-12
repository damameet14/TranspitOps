"""Pydantic contracts for the operational dashboard KPIs."""

from pydantic import BaseModel


class FleetStatusBreakdown(BaseModel):
    """Counts of vehicles by status for the dashboard."""
    available: int = 0
    on_trip: int = 0
    in_shop: int = 0
    retired: int = 0


class DriverStatusBreakdown(BaseModel):
    """Counts of drivers by status for the dashboard."""
    available: int = 0
    on_trip: int = 0
    off_duty: int = 0
    suspended: int = 0


class DashboardKpiResult(BaseModel):
    """Full KPI payload returned by GET /dashboard/kpis."""
    total_vehicles: int
    total_drivers: int
    total_trips: int
    active_trips: int  # Draft + Dispatched
    pending_trips: int
    active_vehicles: int
    drivers_on_duty: int
    completed_trips: int
    cancelled_trips: int
    total_revenue: float
    total_fuel_cost: float
    total_expenses: float
    total_maintenance_cost: float
    fleet_utilization_percent: float  # (on_trip / total_non_retired) * 100
    average_safety_score: float
    drivers_with_expired_license: int
    fleet_status: FleetStatusBreakdown
    driver_status: DriverStatusBreakdown
