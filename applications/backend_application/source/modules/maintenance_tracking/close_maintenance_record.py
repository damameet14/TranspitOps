"""Close a maintenance record and restore vehicle availability.

Business rule 10 — When a maintenance record is closed:
    - Maintenance status → Closed
    - If vehicle was not Retired → vehicle.status = Available
"""

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.maintenance_log_model import MaintenanceLog, MaintenanceStatus
from source.shared_infrastructure.database_models.vehicle_model import Vehicle, VehicleStatus
from source.shared_infrastructure.standard_error_responses import (
    InvalidTripStateTransitionError,
    ResourceNotFoundError,
)


def close_maintenance_record(
    database_session: Session,
    maintenance_id: int,
) -> MaintenanceLog:
    """Transition maintenance record from Active to Closed.

    Business rule 10: If vehicle.status is not Retired, set to Available.

    Raises ResourceNotFoundError if maintenance record not found.
    Raises InvalidTripStateTransitionError if record is already Closed.
    """
    record = database_session.query(MaintenanceLog).filter(MaintenanceLog.id == maintenance_id).first()
    if record is None:
        raise ResourceNotFoundError("MaintenanceLog", maintenance_id)

    if record.status == MaintenanceStatus.CLOSED:
        raise InvalidTripStateTransitionError(
            maintenance_id,
            record.status.value,
            MaintenanceStatus.CLOSED.value,
        )

    # Close the record
    record.status = MaintenanceStatus.CLOSED
    record.closed_at = datetime.now(timezone.utc)

    # Rule 10: Restore vehicle availability unless Retired
    vehicle = database_session.query(Vehicle).filter(Vehicle.id == record.vehicle_id).first()
    if vehicle is not None and vehicle.status != VehicleStatus.RETIRED:
        vehicle.status = VehicleStatus.AVAILABLE

    database_session.commit()
    database_session.refresh(record)

    return record
