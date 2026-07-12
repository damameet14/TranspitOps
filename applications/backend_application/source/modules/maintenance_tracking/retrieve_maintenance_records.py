"""Retrieve maintenance records with optional filtering."""

from typing import Optional

from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.maintenance_log_model import MaintenanceLog, MaintenanceStatus
from source.shared_infrastructure.standard_error_responses import ResourceNotFoundError


def retrieve_all_maintenance_records(
    database_session: Session,
    vehicle_id_filter: Optional[int] = None,
    status_filter: Optional[str] = None,
) -> list[MaintenanceLog]:
    """Return all maintenance records, optionally filtered by vehicle or status."""
    query = database_session.query(MaintenanceLog)
    if vehicle_id_filter is not None:
        query = query.filter(MaintenanceLog.vehicle_id == vehicle_id_filter)
    if status_filter is not None:
        try:
            maintenance_status = MaintenanceStatus(status_filter)
            query = query.filter(MaintenanceLog.status == maintenance_status)
        except ValueError:
            pass  # Ignore invalid status filter
    return query.order_by(MaintenanceLog.created_at.desc()).all()


def retrieve_maintenance_record_by_id(
    database_session: Session,
    maintenance_id: int,
) -> MaintenanceLog:
    """Return a single maintenance record by ID. Raises 404 if not found."""
    record = database_session.query(MaintenanceLog).filter(MaintenanceLog.id == maintenance_id).first()
    if record is None:
        raise ResourceNotFoundError("MaintenanceLog", maintenance_id)
    return record
