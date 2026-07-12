"""HTTP transport layer for reporting and analytics.

Routes (JSON):
    GET /reports/trip-summary          — Trip summary report
    GET /reports/expense-breakdown     — Expense breakdown by category
    GET /reports/driver-performance    — Driver performance report
    GET /reports/maintenance-cost      — Maintenance cost by vehicle

Routes (Export):
    GET /reports/{report_type}/csv     — Download CSV
    GET /reports/{report_type}/pdf     — Download PDF

All routes support optional query params: start_date, end_date, vehicle_id, region.
"""

from datetime import date
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session

from source.application_startup.database_connection import get_database_session
from source.shared_infrastructure.database_models.user_account_model import UserAccount, UserRole
from source.shared_infrastructure.role_based_access_control import (
    get_current_authenticated_user,
    require_role,
)

from source.modules.reporting_and_analytics.reporting_contracts import (
    DriverPerformanceReport,
    ExpenseBreakdownReport,
    MaintenanceCostReport,
    ReportFilterRequest,
    TripSummaryReport,
    VehicleProfitabilityReport,
)
from source.modules.reporting_and_analytics.generate_reports import (
    generate_driver_performance_report,
    generate_expense_breakdown_report,
    generate_maintenance_cost_report,
    generate_trip_summary_report,
    generate_vehicle_profitability_report,
)
from source.modules.reporting_and_analytics.export_report_data import (
    export_rows_to_csv,
    export_rows_to_pdf,
)


reporting_router = APIRouter(
    prefix="/reports",
    tags=["reporting and analytics"],
)


def _build_filters(
    start_date: Optional[date],
    end_date: Optional[date],
    vehicle_id: Optional[int],
    region: Optional[str],
) -> ReportFilterRequest:
    return ReportFilterRequest(
        start_date=start_date,
        end_date=end_date,
        vehicle_id=vehicle_id,
        region=region,
    )


# ── JSON Endpoints ────────────────────────────────────────

@reporting_router.get("/trip-summary", response_model=TripSummaryReport)
def get_trip_summary_report(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    vehicle_id: Optional[int] = None,
    region: Optional[str] = None,
):
    filters = _build_filters(start_date, end_date, vehicle_id, region)
    return generate_trip_summary_report(database_session, filters)


@reporting_router.get("/expense-breakdown", response_model=ExpenseBreakdownReport)
def get_expense_breakdown_report(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    vehicle_id: Optional[int] = None,
    region: Optional[str] = None,
):
    filters = _build_filters(start_date, end_date, vehicle_id, region)
    return generate_expense_breakdown_report(database_session, filters)


@reporting_router.get("/driver-performance", response_model=DriverPerformanceReport)
def get_driver_performance_report(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    vehicle_id: Optional[int] = None,
    region: Optional[str] = None,
):
    filters = _build_filters(start_date, end_date, vehicle_id, region)
    return generate_driver_performance_report(database_session, filters)


@reporting_router.get("/maintenance-cost", response_model=MaintenanceCostReport)
def get_maintenance_cost_report(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    vehicle_id: Optional[int] = None,
    region: Optional[str] = None,
):
    filters = _build_filters(start_date, end_date, vehicle_id, region)
    return generate_maintenance_cost_report(database_session, filters)


@reporting_router.get("/vehicle-profitability", response_model=VehicleProfitabilityReport)
def get_vehicle_profitability_report(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    vehicle_id: Optional[int] = None,
    region: Optional[str] = None,
):
    return generate_vehicle_profitability_report(database_session, _build_filters(start_date, end_date, vehicle_id, region))


@reporting_router.get("/vehicle-profitability/csv")
def export_vehicle_profitability_csv(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    vehicle_id: Optional[int] = None,
    region: Optional[str] = None,
):
    report = generate_vehicle_profitability_report(database_session, _build_filters(start_date, end_date, vehicle_id, region))
    headers = ["Vehicle", "Registration", "Revenue", "Fuel", "Maintenance", "Other", "Operational Cost", "Net Profit", "ROI %"]
    rows = [[r.vehicle_name_model, r.vehicle_registration_number, r.revenue, r.fuel_cost, r.maintenance_cost, r.other_expenses, r.total_operational_cost, r.net_profit, r.roi_percent] for r in report.rows]
    return Response(content=export_rows_to_csv(headers, rows), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=vehicle_profitability.csv"})


@reporting_router.get("/vehicle-profitability/pdf")
def export_vehicle_profitability_pdf(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    vehicle_id: Optional[int] = None,
    region: Optional[str] = None,
):
    report = generate_vehicle_profitability_report(database_session, _build_filters(start_date, end_date, vehicle_id, region))
    headers = ["Vehicle", "Reg.", "Revenue", "Op. Cost", "Net Profit", "ROI %"]
    rows = [[r.vehicle_name_model, r.vehicle_registration_number, f"Rs {r.revenue:,.0f}", f"Rs {r.total_operational_cost:,.0f}", f"Rs {r.net_profit:,.0f}", f"{r.roi_percent:.2f}%"] for r in report.rows]
    summary = [f"Revenue: Rs {report.total_revenue:,.0f}", f"Operational cost: Rs {report.total_operational_cost:,.0f}", f"Net profit: Rs {report.total_net_profit:,.0f}"]
    return Response(content=export_rows_to_pdf("Vehicle Profitability Report", headers, rows, summary), media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=vehicle_profitability.pdf"})


# ── CSV Export ────────────────────────────────────────────

@reporting_router.get("/trip-summary/csv")
def export_trip_summary_csv(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    vehicle_id: Optional[int] = None,
    region: Optional[str] = None,
):
    filters = _build_filters(start_date, end_date, vehicle_id, region)
    report = generate_trip_summary_report(database_session, filters)
    headers = ["Vehicle", "Registration", "Trips", "Distance (km)", "Revenue (₹)", "Fuel (L)", "Fuel Cost (₹)", "km/L"]
    rows = [
        [r.vehicle_name_model, r.vehicle_registration_number, r.total_trips,
         r.total_distance_km, r.total_revenue, r.total_fuel_liters, r.total_fuel_cost, r.average_km_per_liter]
        for r in report.rows
    ]
    csv_data = export_rows_to_csv(headers, rows)
    return Response(content=csv_data, media_type="text/csv",
                    headers={"Content-Disposition": "attachment; filename=trip_summary.csv"})


@reporting_router.get("/expense-breakdown/csv")
def export_expense_breakdown_csv(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    vehicle_id: Optional[int] = None,
    region: Optional[str] = None,
):
    filters = _build_filters(start_date, end_date, vehicle_id, region)
    report = generate_expense_breakdown_report(database_session, filters)
    headers = ["Type", "Amount (₹)", "Transactions", "% of Total"]
    rows = [[r.expense_type, r.total_amount, r.transaction_count, r.percentage_of_total] for r in report.rows]
    csv_data = export_rows_to_csv(headers, rows)
    return Response(content=csv_data, media_type="text/csv",
                    headers={"Content-Disposition": "attachment; filename=expense_breakdown.csv"})


@reporting_router.get("/driver-performance/csv")
def export_driver_performance_csv(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    vehicle_id: Optional[int] = None,
    region: Optional[str] = None,
):
    filters = _build_filters(start_date, end_date, vehicle_id, region)
    report = generate_driver_performance_report(database_session, filters)
    headers = ["Driver", "Safety Score", "Trips", "Distance (km)", "Revenue (₹)", "km/L", "License Expiry", "Expired?"]
    rows = [
        [r.driver_name, r.safety_score, r.total_trips_completed, r.total_distance_km,
         r.total_revenue_generated, r.average_fuel_efficiency_km_per_liter,
         str(r.license_expiry_date), "Yes" if r.is_license_expired else "No"]
        for r in report.rows
    ]
    csv_data = export_rows_to_csv(headers, rows)
    return Response(content=csv_data, media_type="text/csv",
                    headers={"Content-Disposition": "attachment; filename=driver_performance.csv"})


@reporting_router.get("/maintenance-cost/csv")
def export_maintenance_cost_csv(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    vehicle_id: Optional[int] = None,
    region: Optional[str] = None,
):
    filters = _build_filters(start_date, end_date, vehicle_id, region)
    report = generate_maintenance_cost_report(database_session, filters)
    headers = ["Vehicle", "Registration", "Records", "Cost (₹)", "Active", "Closed"]
    rows = [
        [r.vehicle_name_model, r.vehicle_registration_number, r.total_maintenance_count,
         r.total_maintenance_cost, r.active_records, r.closed_records]
        for r in report.rows
    ]
    csv_data = export_rows_to_csv(headers, rows)
    return Response(content=csv_data, media_type="text/csv",
                    headers={"Content-Disposition": "attachment; filename=maintenance_cost.csv"})


# ── PDF Export ────────────────────────────────────────────

@reporting_router.get("/trip-summary/pdf")
def export_trip_summary_pdf(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    vehicle_id: Optional[int] = None,
    region: Optional[str] = None,
):
    filters = _build_filters(start_date, end_date, vehicle_id, region)
    report = generate_trip_summary_report(database_session, filters)
    headers = ["Vehicle", "Reg. No.", "Trips", "Dist. (km)", "Revenue", "Fuel (L)", "Fuel Cost", "km/L"]
    rows = [
        [r.vehicle_name_model, r.vehicle_registration_number, str(r.total_trips),
         f"{r.total_distance_km:.0f}", f"₹{r.total_revenue:,.0f}", f"{r.total_fuel_liters:.1f}",
         f"₹{r.total_fuel_cost:,.0f}", f"{r.average_km_per_liter:.1f}"]
        for r in report.rows
    ]
    summary = [
        f"Total Trips: {report.grand_total_trips}",
        f"Total Revenue: ₹{report.grand_total_revenue:,.0f}",
        f"Total Fuel Cost: ₹{report.grand_total_fuel_cost:,.0f}",
    ]
    pdf_bytes = export_rows_to_pdf("Trip Summary Report", headers, rows, summary)
    return Response(content=pdf_bytes, media_type="application/pdf",
                    headers={"Content-Disposition": "attachment; filename=trip_summary.pdf"})


@reporting_router.get("/expense-breakdown/pdf")
def export_expense_breakdown_pdf(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    vehicle_id: Optional[int] = None,
    region: Optional[str] = None,
):
    filters = _build_filters(start_date, end_date, vehicle_id, region)
    report = generate_expense_breakdown_report(database_session, filters)
    headers = ["Type", "Amount", "Count", "% of Total"]
    rows = [
        [r.expense_type, f"₹{r.total_amount:,.0f}", str(r.transaction_count), f"{r.percentage_of_total:.1f}%"]
        for r in report.rows
    ]
    summary = [f"Grand Total: ₹{report.grand_total:,.0f}"]
    pdf_bytes = export_rows_to_pdf("Expense Breakdown Report", headers, rows, summary)
    return Response(content=pdf_bytes, media_type="application/pdf",
                    headers={"Content-Disposition": "attachment; filename=expense_breakdown.pdf"})


@reporting_router.get("/driver-performance/pdf")
def export_driver_performance_pdf(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    vehicle_id: Optional[int] = None,
    region: Optional[str] = None,
):
    filters = _build_filters(start_date, end_date, vehicle_id, region)
    report = generate_driver_performance_report(database_session, filters)
    headers = ["Driver", "Safety", "Trips", "Dist. (km)", "Revenue", "km/L", "License Exp.", "Expired"]
    rows = [
        [r.driver_name, str(r.safety_score), str(r.total_trips_completed),
         f"{r.total_distance_km:.0f}", f"₹{r.total_revenue_generated:,.0f}",
         f"{r.average_fuel_efficiency_km_per_liter:.1f}",
         str(r.license_expiry_date), "Yes" if r.is_license_expired else "No"]
        for r in report.rows
    ]
    summary = [f"Average Safety Score: {report.average_safety_score}"]
    pdf_bytes = export_rows_to_pdf("Driver Performance Report", headers, rows, summary)
    return Response(content=pdf_bytes, media_type="application/pdf",
                    headers={"Content-Disposition": "attachment; filename=driver_performance.pdf"})


@reporting_router.get("/maintenance-cost/pdf")
def export_maintenance_cost_pdf(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    vehicle_id: Optional[int] = None,
    region: Optional[str] = None,
):
    filters = _build_filters(start_date, end_date, vehicle_id, region)
    report = generate_maintenance_cost_report(database_session, filters)
    headers = ["Vehicle", "Reg. No.", "Records", "Cost", "Active", "Closed"]
    rows = [
        [r.vehicle_name_model, r.vehicle_registration_number, str(r.total_maintenance_count),
         f"₹{r.total_maintenance_cost:,.0f}", str(r.active_records), str(r.closed_records)]
        for r in report.rows
    ]
    summary = [f"Grand Total: ₹{report.grand_total_cost:,.0f} across {report.total_records} records"]
    pdf_bytes = export_rows_to_pdf("Maintenance Cost Report", headers, rows, summary)
    return Response(content=pdf_bytes, media_type="application/pdf",
                    headers={"Content-Disposition": "attachment; filename=maintenance_cost.pdf"})
