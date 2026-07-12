"""Create a new trip as a Draft with business rule enforcement.

Business rules enforced:
    Rule 2 — Vehicle must be Available (not In Shop, On Trip, or Retired).
    Rule 3 — Driver must be eligible (not Suspended, not expired license).
    Rule 4 — Neither vehicle nor driver may already be on an active trip.
    Rule 5 — Cargo weight must not exceed vehicle max load capacity.
"""

from datetime import date

from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.trip_model import Trip, TripStatus
from source.shared_infrastructure.database_models.vehicle_model import Vehicle, VehicleStatus
from source.shared_infrastructure.database_models.driver_model import Driver, DriverStatus
from source.shared_infrastructure.standard_error_responses import (
    CargoWeightExceedsCapacityError,
    DriverNotEligibleForTripError,
    ResourceNotFoundError,
    VehicleNotAvailableForDispatchError,
)
from source.modules.trip_lifecycle_management.trip_lifecycle_contracts import CreateTripRequest


def create_trip_as_draft(
    database_session: Session,
    create_request: CreateTripRequest,
) -> Trip:
    """Validate all business rules and insert a new trip in Draft status.

    Returns the created Trip ORM object.
    Raises appropriate HTTP errors when rules are violated.
    """
    # Load vehicle
    vehicle = database_session.query(Vehicle).filter(Vehicle.id == create_request.vehicle_id).first()
    if vehicle is None:
        raise ResourceNotFoundError("Vehicle", create_request.vehicle_id)

    # Load driver
    driver = database_session.query(Driver).filter(Driver.id == create_request.driver_id).first()
    if driver is None:
        raise ResourceNotFoundError("Driver", create_request.driver_id)

    # Rule 2: Vehicle must be Available
    if vehicle.status != VehicleStatus.AVAILABLE:
        raise VehicleNotAvailableForDispatchError(vehicle.id, vehicle.status.value)

    # Rule 3: Driver must not be Suspended and license must not be expired
    if driver.status == DriverStatus.SUSPENDED:
        raise DriverNotEligibleForTripError(driver.id, "driver is suspended")

    if driver.license_expiry_date < date.today():
        raise DriverNotEligibleForTripError(driver.id, "driver license has expired")

    # Rule 3 extended: Driver must be Available (not Off Duty, not On Trip)
    if driver.status != DriverStatus.AVAILABLE:
        raise DriverNotEligibleForTripError(
            driver.id,
            f"driver status is '{driver.status.value}' — must be 'available'",
        )

    # Rule 4: Check no active trips for this vehicle or driver
    active_trip_statuses = [TripStatus.DRAFT, TripStatus.DISPATCHED]
    existing_vehicle_trip = (
        database_session.query(Trip)
        .filter(Trip.vehicle_id == vehicle.id, Trip.status.in_(active_trip_statuses))
        .first()
    )
    if existing_vehicle_trip is not None:
        raise VehicleNotAvailableForDispatchError(
            vehicle.id, f"already assigned to trip {existing_vehicle_trip.id}"
        )

    existing_driver_trip = (
        database_session.query(Trip)
        .filter(Trip.driver_id == driver.id, Trip.status.in_(active_trip_statuses))
        .first()
    )
    if existing_driver_trip is not None:
        raise DriverNotEligibleForTripError(
            driver.id, f"already assigned to trip {existing_driver_trip.id}"
        )

    # Rule 5: Cargo weight must not exceed vehicle capacity
    if create_request.cargo_weight_kg > float(vehicle.max_load_capacity_kg):
        raise CargoWeightExceedsCapacityError(
            create_request.cargo_weight_kg,
            float(vehicle.max_load_capacity_kg),
        )

    # All rules passed — create trip
    new_trip = Trip(
        source=create_request.source,
        destination=create_request.destination,
        vehicle_id=create_request.vehicle_id,
        driver_id=create_request.driver_id,
        cargo_weight_kg=create_request.cargo_weight_kg,
        planned_distance_km=create_request.planned_distance_km,
        revenue=create_request.revenue,
        status=TripStatus.DRAFT,
    )

    database_session.add(new_trip)
    database_session.commit()
    database_session.refresh(new_trip)

    return new_trip
