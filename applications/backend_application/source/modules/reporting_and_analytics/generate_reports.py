"""Generate report data for all 4 report types.

Each function queries the database and returns a structured report payload.
"""

from datetime import date

from sqlalchemy import func, case
from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.vehicle_model import Vehicle
from source.shared_infrastructure.database_models.driver_model import Driver
from source.shared_infrastructure.database_models.trip_model import Trip, TripStatus
from source.shared_infrastructure.database_models.fuel_log_model import FuelLog
from source.shared_infrastructure.database_models.expense_model import Expense
from source.shared_infrastructure.database_models.maintenance_log_model import MaintenanceLog, MaintenanceStatus

from source.modules.reporting_and_analytics.reporting_contracts import (
    DriverPerformanceReport,
    DriverPerformanceRow,
    ExpenseBreakdownReport,
    ExpenseBreakdownRow,
    MaintenanceCostReport,
    MaintenanceCostRow,
    ReportFilterRequest,
    TripSummaryReport,
    TripSummaryRow,
)


def generate_trip_summary_report(
    database_session: Session,
    filters: ReportFilterRequest,
) -> TripSummaryReport:
    """Report 1: Trip summary grouped by vehicle.

    Shows total trips, distance, revenue, and fuel efficiency per vehicle.
    """
    query = (
        database_session.query(
            Vehicle.id,
            Vehicle.registration_number,
            Vehicle.name_model,
            func.count(Trip.id).label("total_trips"),
            func.coalesce(func.sum(Trip.actual_distance_km), 0).label("total_distance"),
            func.coalesce(func.sum(Trip.revenue), 0).label("total_revenue"),
            func.coalesce(func.sum(Trip.fuel_consumed_liters), 0).label("total_fuel"),
        )
        .join(Trip, Trip.vehicle_id == Vehicle.id)
        .filter(Trip.status == TripStatus.COMPLETED)
    )

    if filters.vehicle_id:
        query = query.filter(Vehicle.id == filters.vehicle_id)
    if filters.region:
        query = query.filter(Vehicle.region == filters.region)
    if filters.start_date:
        query = query.filter(Trip.completed_at >= filters.start_date)
    if filters.end_date:
        query = query.filter(Trip.completed_at <= filters.end_date)

    query = query.group_by(Vehicle.id, Vehicle.registration_number, Vehicle.name_model)
    results = query.all()

    rows = []
    grand_total_trips = 0
    grand_total_revenue = 0.0
    grand_total_distance = 0.0
    grand_total_fuel_cost = 0.0

    for row in results:
        fuel_cost = float(row.total_fuel) * 100  # ₹100/liter default
        total_fuel = float(row.total_fuel)
        total_dist = float(row.total_distance)
        avg_efficiency = (total_dist / total_fuel) if total_fuel > 0 else 0

        trip_row = TripSummaryRow(
            vehicle_id=row.id,
            vehicle_registration_number=row.registration_number,
            vehicle_name_model=row.name_model,
            total_trips=row.total_trips,
            total_distance_km=total_dist,
            total_revenue=float(row.total_revenue),
            total_fuel_liters=total_fuel,
            total_fuel_cost=fuel_cost,
            average_km_per_liter=round(avg_efficiency, 2),
        )
        rows.append(trip_row)
        grand_total_trips += row.total_trips
        grand_total_revenue += float(row.total_revenue)
        grand_total_distance += total_dist
        grand_total_fuel_cost += fuel_cost

    return TripSummaryReport(
        rows=rows,
        grand_total_trips=grand_total_trips,
        grand_total_revenue=grand_total_revenue,
        grand_total_distance_km=grand_total_distance,
        grand_total_fuel_cost=grand_total_fuel_cost,
    )


def generate_expense_breakdown_report(
    database_session: Session,
    filters: ReportFilterRequest,
) -> ExpenseBreakdownReport:
    """Report 2: Expense breakdown by category."""
    query = (
        database_session.query(
            Expense.type,
            func.sum(Expense.amount).label("total_amount"),
            func.count(Expense.id).label("count"),
        )
    )

    if filters.vehicle_id:
        query = query.filter(Expense.vehicle_id == filters.vehicle_id)
    if filters.start_date:
        query = query.filter(Expense.expense_date >= filters.start_date)
    if filters.end_date:
        query = query.filter(Expense.expense_date <= filters.end_date)

    query = query.group_by(Expense.type).order_by(func.sum(Expense.amount).desc())
    results = query.all()

    grand_total = sum(float(row.total_amount) for row in results)

    rows = []
    for row in results:
        amount = float(row.total_amount)
        rows.append(ExpenseBreakdownRow(
            expense_type=row.type,
            total_amount=amount,
            transaction_count=row.count,
            percentage_of_total=round((amount / grand_total * 100) if grand_total > 0 else 0, 1),
        ))

    return ExpenseBreakdownReport(rows=rows, grand_total=grand_total)


def generate_driver_performance_report(
    database_session: Session,
    filters: ReportFilterRequest,
) -> DriverPerformanceReport:
    """Report 3: Driver performance with trip stats and fuel efficiency."""
    drivers = database_session.query(Driver).order_by(Driver.safety_score.desc()).all()
    today = date.today()

    rows = []
    for driver in drivers:
        # Count completed trips
        trip_query = (
            database_session.query(
                func.count(Trip.id).label("trip_count"),
                func.coalesce(func.sum(Trip.actual_distance_km), 0).label("total_distance"),
                func.coalesce(func.sum(Trip.revenue), 0).label("total_revenue"),
                func.coalesce(func.sum(Trip.fuel_consumed_liters), 0).label("total_fuel"),
            )
            .filter(Trip.driver_id == driver.id, Trip.status == TripStatus.COMPLETED)
        )

        if filters.start_date:
            trip_query = trip_query.filter(Trip.completed_at >= filters.start_date)
        if filters.end_date:
            trip_query = trip_query.filter(Trip.completed_at <= filters.end_date)

        trip_stats = trip_query.first()

        total_dist = float(trip_stats.total_distance)
        total_fuel = float(trip_stats.total_fuel)
        avg_eff = (total_dist / total_fuel) if total_fuel > 0 else 0

        rows.append(DriverPerformanceRow(
            driver_id=driver.id,
            driver_name=driver.name,
            safety_score=driver.safety_score,
            total_trips_completed=trip_stats.trip_count,
            total_distance_km=total_dist,
            total_revenue_generated=float(trip_stats.total_revenue),
            average_fuel_efficiency_km_per_liter=round(avg_eff, 2),
            license_expiry_date=driver.license_expiry_date,
            is_license_expired=driver.license_expiry_date < today,
        ))

    total_drivers = len(rows)
    avg_safety = sum(r.safety_score for r in rows) / total_drivers if total_drivers > 0 else 0

    return DriverPerformanceReport(
        rows=rows,
        total_drivers=total_drivers,
        average_safety_score=round(avg_safety, 1),
    )


def generate_maintenance_cost_report(
    database_session: Session,
    filters: ReportFilterRequest,
) -> MaintenanceCostReport:
    """Report 4: Maintenance cost per vehicle."""
    query = (
        database_session.query(
            Vehicle.id,
            Vehicle.registration_number,
            Vehicle.name_model,
            func.count(MaintenanceLog.id).label("total_count"),
            func.coalesce(func.sum(MaintenanceLog.cost), 0).label("total_cost"),
            func.sum(case((MaintenanceLog.status == MaintenanceStatus.ACTIVE, 1), else_=0)).label("active_count"),
            func.sum(case((MaintenanceLog.status == MaintenanceStatus.CLOSED, 1), else_=0)).label("closed_count"),
        )
        .join(MaintenanceLog, MaintenanceLog.vehicle_id == Vehicle.id)
    )

    if filters.vehicle_id:
        query = query.filter(Vehicle.id == filters.vehicle_id)
    if filters.region:
        query = query.filter(Vehicle.region == filters.region)
    if filters.start_date:
        query = query.filter(MaintenanceLog.created_at >= filters.start_date)
    if filters.end_date:
        query = query.filter(MaintenanceLog.created_at <= filters.end_date)

    query = query.group_by(Vehicle.id, Vehicle.registration_number, Vehicle.name_model)
    query = query.order_by(func.sum(MaintenanceLog.cost).desc())
    results = query.all()

    rows = []
    grand_total_cost = 0.0
    total_records = 0

    for row in results:
        cost = float(row.total_cost)
        rows.append(MaintenanceCostRow(
            vehicle_id=row.id,
            vehicle_registration_number=row.registration_number,
            vehicle_name_model=row.name_model,
            total_maintenance_count=row.total_count,
            total_maintenance_cost=cost,
            active_records=int(row.active_count),
            closed_records=int(row.closed_count),
        ))
        grand_total_cost += cost
        total_records += row.total_count

    return MaintenanceCostReport(
        rows=rows,
        grand_total_cost=grand_total_cost,
        total_records=total_records,
    )
