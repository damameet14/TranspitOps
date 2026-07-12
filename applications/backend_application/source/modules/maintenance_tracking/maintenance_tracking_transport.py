"""HTTP transport layer for maintenance tracking operations.

Routes:
    GET    /maintenance             — List all maintenance records (optional filters)
    POST   /maintenance             — Create a new maintenance record
    GET    /maintenance/{id}        — Get a single maintenance record
    POST   /maintenance/{id}/close  — Close a maintenance record

Role restrictions:
    Fleet Manager: full access (create, close, read)
    Safety Officer: read-only
    Driver: read-only
    Financial Analyst: read-only
"""

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from source.application_startup.database_connection import get_database_session
from source.shared_infrastructure.database_models.user_account_model import UserAccount, UserRole
from source.shared_infrastructure.role_based_access_control import (
    get_current_authenticated_user,
    require_role,
)

from source.modules.maintenance_tracking.maintenance_tracking_contracts import (
    CreateMaintenanceRecordRequest,
    MaintenanceRecordResponse,
)
from source.modules.maintenance_tracking.create_maintenance_record import create_maintenance_record
from source.modules.maintenance_tracking.close_maintenance_record import close_maintenance_record
from source.modules.maintenance_tracking.retrieve_maintenance_records import (
    retrieve_all_maintenance_records,
    retrieve_maintenance_record_by_id,
)


maintenance_tracking_router = APIRouter(
    prefix="/maintenance",
    tags=["maintenance tracking"],
)


@maintenance_tracking_router.get("", response_model=list[MaintenanceRecordResponse])
def list_all_maintenance_records(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
    vehicle_id: Optional[int] = Query(None, description="Filter by vehicle ID"),
    status: Optional[str] = Query(None, description="Filter by status (active/closed)"),
) -> list[MaintenanceRecordResponse]:
    """List all maintenance records with optional filters."""
    records = retrieve_all_maintenance_records(
        database_session,
        vehicle_id_filter=vehicle_id,
        status_filter=status,
    )
    return [_maintenance_to_response(record) for record in records]


@maintenance_tracking_router.post("", response_model=MaintenanceRecordResponse, status_code=201)
def create_new_maintenance_record(
    create_request: CreateMaintenanceRecordRequest,
    current_user: Annotated[
        UserAccount,
        Depends(require_role(UserRole.FLEET_MANAGER)),
    ],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> MaintenanceRecordResponse:
    """Create a new maintenance record. Fleet Manager only. Sets vehicle to In Shop."""
    record = create_maintenance_record(database_session, create_request)
    return _maintenance_to_response(record)


@maintenance_tracking_router.get("/{maintenance_id}", response_model=MaintenanceRecordResponse)
def get_maintenance_record(
    maintenance_id: int,
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> MaintenanceRecordResponse:
    """Get a single maintenance record by ID."""
    record = retrieve_maintenance_record_by_id(database_session, maintenance_id)
    return _maintenance_to_response(record)


@maintenance_tracking_router.post("/{maintenance_id}/close", response_model=MaintenanceRecordResponse)
def close_existing_maintenance_record(
    maintenance_id: int,
    current_user: Annotated[
        UserAccount,
        Depends(require_role(UserRole.FLEET_MANAGER)),
    ],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> MaintenanceRecordResponse:
    """Close a maintenance record. Fleet Manager only. Restores vehicle to Available."""
    record = close_maintenance_record(database_session, maintenance_id)
    return _maintenance_to_response(record)


def _maintenance_to_response(record) -> MaintenanceRecordResponse:
    """Map a MaintenanceLog ORM model to the API response contract."""
    return MaintenanceRecordResponse(
        id=record.id,
        vehicle_id=record.vehicle_id,
        type=record.type,
        cost=float(record.cost),
        description=record.description,
        status=record.status.value,
        created_at=record.created_at,
        closed_at=record.closed_at,
        vehicle_registration_number=record.vehicle.registration_number if record.vehicle else None,
        vehicle_name_model=record.vehicle.name_model if record.vehicle else None,
    )
