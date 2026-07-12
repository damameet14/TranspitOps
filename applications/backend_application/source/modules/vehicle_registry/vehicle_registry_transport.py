"""HTTP transport layer for vehicle registry operations.

Routes:
    GET    /vehicles           — List all vehicles
    GET    /vehicles/available — List vehicles eligible for dispatch
    GET    /vehicles/regions   — List distinct regions for filter dropdowns
    GET    /vehicles/{id}      — Get a single vehicle
    POST   /vehicles           — Create a new vehicle
    PUT    /vehicles/{id}      — Update a vehicle
    DELETE /vehicles/{id}      — Delete a vehicle

Role restrictions:
    Fleet Manager: full CRUD
    Driver, Safety Officer: read-only
    Financial Analyst: read-only
"""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from source.application_startup.database_connection import get_database_session
from source.shared_infrastructure.database_models.user_account_model import UserAccount, UserRole
from source.shared_infrastructure.role_based_access_control import (
    get_current_authenticated_user,
    require_role,
)

from source.modules.vehicle_registry.vehicle_registry_contracts import (
    CreateVehicleRequest,
    UpdateVehicleRequest,
    VehicleResponse,
)
from source.modules.vehicle_registry.create_vehicle import create_vehicle
from source.modules.vehicle_registry.retrieve_vehicles import (
    retrieve_all_vehicles,
    retrieve_available_vehicles,
    retrieve_distinct_vehicle_regions,
    retrieve_vehicle_by_id,
)
from source.modules.vehicle_registry.update_vehicle import update_vehicle
from source.modules.vehicle_registry.delete_vehicle import delete_vehicle


vehicle_registry_router = APIRouter(
    prefix="/vehicles",
    tags=["vehicle registry"],
)


@vehicle_registry_router.get("", response_model=list[VehicleResponse])
def list_all_vehicles(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> list[VehicleResponse]:
    """List all vehicles in the fleet registry."""
    vehicles = retrieve_all_vehicles(database_session)
    return [_vehicle_to_response(vehicle) for vehicle in vehicles]


@vehicle_registry_router.get("/available", response_model=list[VehicleResponse])
def list_available_vehicles(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> list[VehicleResponse]:
    """List vehicles eligible for dispatch (Available status only)."""
    vehicles = retrieve_available_vehicles(database_session)
    return [_vehicle_to_response(vehicle) for vehicle in vehicles]


@vehicle_registry_router.get("/regions", response_model=list[str])
def list_vehicle_regions(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> list[str]:
    """List distinct vehicle regions for filter dropdowns."""
    return retrieve_distinct_vehicle_regions(database_session)


@vehicle_registry_router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(
    vehicle_id: int,
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> VehicleResponse:
    """Get a single vehicle by ID."""
    vehicle = retrieve_vehicle_by_id(database_session, vehicle_id)
    return _vehicle_to_response(vehicle)


@vehicle_registry_router.post("", response_model=VehicleResponse, status_code=201)
def create_new_vehicle(
    create_request: CreateVehicleRequest,
    current_user: Annotated[UserAccount, Depends(require_role(UserRole.FLEET_MANAGER))],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> VehicleResponse:
    """Create a new vehicle. Fleet Manager only."""
    vehicle = create_vehicle(database_session, create_request)
    return _vehicle_to_response(vehicle)


@vehicle_registry_router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_existing_vehicle(
    vehicle_id: int,
    update_request: UpdateVehicleRequest,
    current_user: Annotated[UserAccount, Depends(require_role(UserRole.FLEET_MANAGER))],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> VehicleResponse:
    """Update an existing vehicle. Fleet Manager only."""
    vehicle = update_vehicle(database_session, vehicle_id, update_request)
    return _vehicle_to_response(vehicle)


@vehicle_registry_router.delete("/{vehicle_id}", status_code=204)
def delete_existing_vehicle(
    vehicle_id: int,
    current_user: Annotated[UserAccount, Depends(require_role(UserRole.FLEET_MANAGER))],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> None:
    """Delete a vehicle. Fleet Manager only."""
    delete_vehicle(database_session, vehicle_id)


def _vehicle_to_response(vehicle) -> VehicleResponse:
    """Map a Vehicle ORM model to the API response contract."""
    return VehicleResponse(
        id=vehicle.id,
        registration_number=vehicle.registration_number,
        name_model=vehicle.name_model,
        type=vehicle.type.value,
        max_load_capacity_kg=float(vehicle.max_load_capacity_kg),
        odometer_km=float(vehicle.odometer_km),
        acquisition_cost=float(vehicle.acquisition_cost),
        status=vehicle.status.value,
        region=vehicle.region,
        created_at=vehicle.created_at,
        updated_at=vehicle.updated_at,
    )
