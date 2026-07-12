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


def calculate_dashboard_kpis(
    database_session: Session,
    vehicle_type_filter: str | None = None,
    vehicle_status_filter: str | None = None,
    region_filter: str | None = None,
<<<<<<< HEAD
    trip_driver_ids: list[int] | None = None,
    include_financial_metrics: bool = True,
=======
>>>>>>> 8b2d77ce78de4ecc024e41e576d67e9f1ba9f407
) -> DashboardKpiResult:
    """Aggregate all KPI metrics in a single database round-trip batch."""

    # ── Fleet counts ──────────────────────────────────────
    vehicle_query = database_session.query(Vehicle)
    if vehicle_type_filter:
        vehicle_query = vehicle_query.filter(Vehicle.type == vehicle_type_filter)
    if vehicle_status_filter:
        vehicle_query = vehicle_query.filter(Vehicle.status == vehicle_status_filter)
    if region_filter:
        vehicle_query = vehicle_query.filter(Vehicle.region == region_filter)
    filtered_vehicle_ids = [vehicle.id for vehicle in vehicle_query.all()]
    vehicle_status_counts = dict(
        database_session.query(Vehicle.status, func.count(Vehicle.id))
        .filter(Vehicle.id.in_(filtered_vehicle_ids))
        .group_by(Vehicle.status).all()
    ) if filtered_vehicle_ids else {}
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

    safety_query = database_session.query(func.avg(Driver.safety_score))
    if trip_driver_ids is not None:
        safety_query = safety_query.filter(Driver.id.in_(trip_driver_ids))
    avg_safety = safety_query.scalar() or 0
    expired_count = (
        database_session.query(func.count(Driver.id))
        .filter(Driver.license_expiry_date < date.today())
        .scalar()
    ) or 0

    # ── Trip counts ───────────────────────────────────────
<<<<<<< HEAD
    trip_query = database_session.query(Trip.status, func.count(Trip.id)).filter(Trip.vehicle_id.in_(filtered_vehicle_ids))
    if trip_driver_ids is not None:
        trip_query = trip_query.filter(Trip.driver_id.in_(trip_driver_ids))
    trip_status_counts = dict(trip_query.group_by(Trip.status).all()) if filtered_vehicle_ids else {}
=======
    trip_status_counts = dict(
        database_session.query(Trip.status, func.count(Trip.id))
        .filter(Trip.vehicle_id.in_(filtered_vehicle_ids))
        .group_by(Trip.status).all()
    ) if filtered_vehicle_ids else {}
>>>>>>> 8b2d77ce78de4ecc024e41e576d67e9f1ba9f407
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
        .filter(Trip.status == TripStatus.COMPLETED, Trip.vehicle_id.in_(filtered_vehicle_ids))
        .scalar()
    )
    if trip_driver_ids is not None:
        total_revenue = float(database_session.query(func.coalesce(func.sum(Trip.revenue), 0)).filter(Trip.status == TripStatus.COMPLETED, Trip.driver_id.in_(trip_driver_ids)).scalar())

    total_fuel_cost = float(
        database_session.query(func.coalesce(func.sum(FuelLog.cost), 0))
        .filter(FuelLog.vehicle_id.in_(filtered_vehicle_ids)).scalar()
    )

    total_expenses = float(
        database_session.query(func.coalesce(func.sum(Expense.amount), 0))
        .filter(Expense.vehicle_id.in_(filtered_vehicle_ids)).scalar()
    )

    total_maintenance_cost = float(
        database_session.query(func.coalesce(func.sum(MaintenanceLog.cost), 0))
        .filter(MaintenanceLog.vehicle_id.in_(filtered_vehicle_ids)).scalar()
    )

    if not include_financial_metrics:
        total_revenue = total_fuel_cost = total_expenses = total_maintenance_cost = 0

    return DashboardKpiResult(
        total_vehicles=total_vehicles,
        total_drivers=total_drivers,
        total_trips=total_trips,
        active_trips=active_trips,
        pending_trips=trip_status_counts.get(TripStatus.DRAFT, 0),
        active_vehicles=non_retired,
        drivers_on_duty=driver_status.available + driver_status.on_trip,
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
