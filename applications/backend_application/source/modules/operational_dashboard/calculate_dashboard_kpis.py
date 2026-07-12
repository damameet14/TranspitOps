"""Calculate operational dashboard KPIs by querying aggregate data.

Returns a single KPI payload with fleet status, driver status,
financial summaries, and utilization metrics.
"""

from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.vehicle_model import Vehicle, VehicleStatus
from source.shared_infrastructure.database_models.driver_model import Driver, DriverStatus
from source.shared_infrastructure.database_models.trip_model import Trip, TripStatus
from source.shared_infrastructure.database_models.fuel_log_model import FuelLog
from source.shared_infrastructure.database_models.expense_model import Expense
from source.shared_infrastructure.database_models.maintenance_log_model import MaintenanceLog

from source.modules.operational_dashboard.operational_dashboard_contracts import (
    DashboardKpiResult,
    DriverStatusBreakdown,
    FleetStatusBreakdown,
)


def calculate_dashboard_kpis(database_session: Session) -> DashboardKpiResult:
    """Aggregate all KPI metrics in a single database round-trip batch."""

    # ── Fleet counts ──────────────────────────────────────
    vehicle_status_counts = dict(
        database_session.query(Vehicle.status, func.count(Vehicle.id))
        .group_by(Vehicle.status)
        .all()
    )
    total_vehicles = sum(vehicle_status_counts.values())
    fleet_status = FleetStatusBreakdown(
        available=vehicle_status_counts.get(VehicleStatus.AVAILABLE, 0),
        on_trip=vehicle_status_counts.get(VehicleStatus.ON_TRIP, 0),
        in_shop=vehicle_status_counts.get(VehicleStatus.IN_SHOP, 0),
        retired=vehicle_status_counts.get(VehicleStatus.RETIRED, 0),
    )

    non_retired = total_vehicles - fleet_status.retired
    fleet_utilization = (fleet_status.on_trip / non_retired * 100) if non_retired > 0 else 0

    # ── Driver counts ─────────────────────────────────────
    driver_status_counts = dict(
        database_session.query(Driver.status, func.count(Driver.id))
        .group_by(Driver.status)
        .all()
    )
    total_drivers = sum(driver_status_counts.values())
    driver_status = DriverStatusBreakdown(
        available=driver_status_counts.get(DriverStatus.AVAILABLE, 0),
        on_trip=driver_status_counts.get(DriverStatus.ON_TRIP, 0),
        off_duty=driver_status_counts.get(DriverStatus.OFF_DUTY, 0),
        suspended=driver_status_counts.get(DriverStatus.SUSPENDED, 0),
    )

    avg_safety = database_session.query(func.avg(Driver.safety_score)).scalar() or 0
    expired_count = (
        database_session.query(func.count(Driver.id))
        .filter(Driver.license_expiry_date < date.today())
        .scalar()
    ) or 0

    # ── Trip counts ───────────────────────────────────────
    trip_status_counts = dict(
        database_session.query(Trip.status, func.count(Trip.id))
        .group_by(Trip.status)
        .all()
    )
    total_trips = sum(trip_status_counts.values())
    active_trips = (
        trip_status_counts.get(TripStatus.DRAFT, 0)
        + trip_status_counts.get(TripStatus.DISPATCHED, 0)
    )
    completed_trips = trip_status_counts.get(TripStatus.COMPLETED, 0)
    cancelled_trips = trip_status_counts.get(TripStatus.CANCELLED, 0)

    # ── Financial aggregates ──────────────────────────────
    total_revenue = float(
        database_session.query(func.coalesce(func.sum(Trip.revenue), 0))
        .filter(Trip.status == TripStatus.COMPLETED)
        .scalar()
    )

    total_fuel_cost = float(
        database_session.query(func.coalesce(func.sum(FuelLog.cost), 0)).scalar()
    )

    total_expenses = float(
        database_session.query(func.coalesce(func.sum(Expense.amount), 0)).scalar()
    )

    total_maintenance_cost = float(
        database_session.query(func.coalesce(func.sum(MaintenanceLog.cost), 0)).scalar()
    )

    return DashboardKpiResult(
        total_vehicles=total_vehicles,
        total_drivers=total_drivers,
        total_trips=total_trips,
        active_trips=active_trips,
        completed_trips=completed_trips,
        cancelled_trips=cancelled_trips,
        total_revenue=total_revenue,
        total_fuel_cost=total_fuel_cost,
        total_expenses=total_expenses,
        total_maintenance_cost=total_maintenance_cost,
        fleet_utilization_percent=round(fleet_utilization, 1),
        average_safety_score=round(float(avg_safety), 1),
        drivers_with_expired_license=expired_count,
        fleet_status=fleet_status,
        driver_status=driver_status,
    )
