"""HTTP transport layer for trip lifecycle management.

Routes:
    GET    /trips              — List all trips (optional ?status= filter)
    POST   /trips              — Create a new trip in Draft status
    GET    /trips/{id}         — Get a single trip
    POST   /trips/{id}/dispatch — Transition Draft → Dispatched
    POST   /trips/{id}/complete — Transition Dispatched → Completed
    POST   /trips/{id}/cancel   — Cancel from Draft or Dispatched

Role restrictions:
    Fleet Manager: full CRUD + lifecycle actions
    Driver: create, dispatch, complete, cancel + read
    Safety Officer: read-only
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
from source.shared_infrastructure.transit_ops_email_notifications import (
    notify_driver_of_trip_status_change,
    notify_user_of_trip_status_change,
)

from source.modules.trip_lifecycle_management.trip_lifecycle_contracts import (
    CompleteTripRequest,
    CreateTripRequest,
    TripResponse,
)
from source.modules.trip_lifecycle_management.create_trip_as_draft import create_trip_as_draft
from source.modules.trip_lifecycle_management.dispatch_trip import dispatch_trip
from source.modules.trip_lifecycle_management.complete_trip import complete_trip
from source.modules.trip_lifecycle_management.cancel_trip import cancel_trip
from source.modules.trip_lifecycle_management.trip_access_control import require_trip_driver_ownership
from source.modules.trip_lifecycle_management.retrieve_trips import (
    retrieve_all_trips,
    retrieve_trip_by_id,
)


trip_lifecycle_router = APIRouter(
    prefix="/trips",
    tags=["trip lifecycle management"],
)


@trip_lifecycle_router.get("", response_model=list[TripResponse])
def list_all_trips(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
    status: Optional[str] = Query(None, description="Filter by trip status"),
) -> list[TripResponse]:
    """List all trips, optionally filtered by status."""
    driver_id_filter = current_user.driver_id if current_user.role == UserRole.DRIVER else None
    if current_user.role == UserRole.DRIVER and driver_id_filter is None:
        require_trip_driver_ownership(current_user, -1)
    trips = retrieve_all_trips(
        database_session, status_filter=status, driver_id_filter=driver_id_filter
    )
    return [_trip_to_response(trip) for trip in trips]


@trip_lifecycle_router.post("", response_model=TripResponse, status_code=201)
def create_new_trip(
    create_request: CreateTripRequest,
    current_user: Annotated[
        UserAccount,
        Depends(require_role(UserRole.FLEET_MANAGER, UserRole.DRIVER)),
    ],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> TripResponse:
    """Create a new trip in Draft status. Fleet Manager or Driver only."""
    require_trip_driver_ownership(current_user, create_request.driver_id)
    trip = create_trip_as_draft(database_session, create_request)
    return _trip_to_response(trip)


@trip_lifecycle_router.get("/{trip_id}", response_model=TripResponse)
def get_trip(
    trip_id: int,
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> TripResponse:
    """Get a single trip by ID."""
    trip = retrieve_trip_by_id(database_session, trip_id)
    require_trip_driver_ownership(current_user, trip.driver_id)
    return _trip_to_response(trip)


@trip_lifecycle_router.post("/{trip_id}/dispatch", response_model=TripResponse)
def dispatch_existing_trip(
    trip_id: int,
    current_user: Annotated[
        UserAccount,
        Depends(require_role(UserRole.FLEET_MANAGER, UserRole.DRIVER)),
    ],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> TripResponse:
    """Dispatch a trip (Draft → Dispatched). Fleet Manager or Driver only."""
    if current_user.role == UserRole.DRIVER:
        existing_trip = retrieve_trip_by_id(database_session, trip_id)
        require_trip_driver_ownership(current_user, existing_trip.driver_id)
    trip = dispatch_trip(database_session, trip_id)
    _notify_trip_recipients(current_user, trip, "dispatched")
    return _trip_to_response(trip)


@trip_lifecycle_router.post("/{trip_id}/complete", response_model=TripResponse)
def complete_existing_trip(
    trip_id: int,
    complete_request: CompleteTripRequest,
    current_user: Annotated[
        UserAccount,
        Depends(require_role(UserRole.FLEET_MANAGER, UserRole.DRIVER)),
    ],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> TripResponse:
    """Complete a trip (Dispatched → Completed). Fleet Manager or Driver only."""
    if current_user.role == UserRole.DRIVER:
        existing_trip = retrieve_trip_by_id(database_session, trip_id)
        require_trip_driver_ownership(current_user, existing_trip.driver_id)
    trip = complete_trip(database_session, trip_id, complete_request)
    _notify_trip_recipients(current_user, trip, "completed")
    return _trip_to_response(trip)


@trip_lifecycle_router.post("/{trip_id}/cancel", response_model=TripResponse)
def cancel_existing_trip(
    trip_id: int,
    current_user: Annotated[
        UserAccount,
        Depends(require_role(UserRole.FLEET_MANAGER, UserRole.DRIVER)),
    ],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> TripResponse:
    """Cancel a trip from Draft or Dispatched. Fleet Manager or Driver only."""
    if current_user.role == UserRole.DRIVER:
        existing_trip = retrieve_trip_by_id(database_session, trip_id)
        require_trip_driver_ownership(current_user, existing_trip.driver_id)
    trip = cancel_trip(database_session, trip_id)
    _notify_trip_recipients(current_user, trip, "cancelled")
    return _trip_to_response(trip)


def _trip_to_response(trip) -> TripResponse:
    """Map a Trip ORM model to the API response contract."""
    return TripResponse(
        id=trip.id,
        source=trip.source,
        destination=trip.destination,
        vehicle_id=trip.vehicle_id,
        driver_id=trip.driver_id,
        cargo_weight_kg=float(trip.cargo_weight_kg),
        planned_distance_km=float(trip.planned_distance_km),
        actual_distance_km=float(trip.actual_distance_km) if trip.actual_distance_km else None,
        revenue=float(trip.revenue),
        status=trip.status.value,
        final_odometer_km=float(trip.final_odometer_km) if trip.final_odometer_km else None,
        fuel_consumed_liters=float(trip.fuel_consumed_liters) if trip.fuel_consumed_liters else None,
        dispatched_at=trip.dispatched_at,
        completed_at=trip.completed_at,
        created_at=trip.created_at,
        vehicle_registration_number=trip.vehicle.registration_number if trip.vehicle else None,
        vehicle_name_model=trip.vehicle.name_model if trip.vehicle else None,
        driver_name=trip.driver.name if trip.driver else None,
    )


def _notify_trip_recipients(current_user: UserAccount, trip, status_action: str) -> None:
    """Notify the operator and assigned driver without duplicating the same address."""
    notify_user_of_trip_status_change(current_user, trip, status_action)
    driver_email = getattr(trip.driver, "email", None) if trip.driver else None
    if driver_email and driver_email.lower() != current_user.email.lower():
        notify_driver_of_trip_status_change(trip.driver, trip, status_action)
