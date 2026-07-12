"""Create current draft trips or completed historical trip records."""

from datetime import date, datetime, time, timezone

from sqlalchemy.orm import Session

from source.modules.trip_lifecycle_management.trip_lifecycle_contracts import CreateTripRequest
from source.shared_infrastructure.database_models.driver_model import Driver, DriverStatus
from source.shared_infrastructure.database_models.fuel_log_model import FuelLog
from source.shared_infrastructure.database_models.service_location_model import ServiceLocation
from source.shared_infrastructure.database_models.trip_model import Trip, TripStatus
from source.shared_infrastructure.database_models.vehicle_model import Vehicle, VehicleStatus
from source.shared_infrastructure.standard_error_responses import (
    CargoWeightExceedsCapacityError,
    DriverNotEligibleForTripError,
    ResourceNotFoundError,
    VehicleNotAvailableForDispatchError,
)


def create_trip_as_draft(database_session: Session, create_request: CreateTripRequest) -> Trip:
    """Validate assignment rules and persist a current or historical trip."""
    vehicle = database_session.query(Vehicle).filter(Vehicle.id == create_request.vehicle_id).first()
    if vehicle is None:
        raise ResourceNotFoundError("Vehicle", create_request.vehicle_id)
    driver = database_session.query(Driver).filter(Driver.id == create_request.driver_id).first()
    if driver is None:
        raise ResourceNotFoundError("Driver", create_request.driver_id)

    if create_request.cargo_weight_kg > float(vehicle.max_load_capacity_kg):
        raise CargoWeightExceedsCapacityError(create_request.cargo_weight_kg, float(vehicle.max_load_capacity_kg))

    if not create_request.is_past_trip:
        if vehicle.status != VehicleStatus.AVAILABLE:
            raise VehicleNotAvailableForDispatchError(vehicle.id, vehicle.status.value)
        if driver.status == DriverStatus.SUSPENDED or driver.license_expiry_date < date.today() or driver.status != DriverStatus.AVAILABLE:
            raise DriverNotEligibleForTripError(driver.id, "driver must be available with a valid license")
        active_statuses = [TripStatus.DRAFT, TripStatus.DISPATCHED]
        existing_vehicle_trip = database_session.query(Trip).filter(Trip.vehicle_id == vehicle.id, Trip.status.in_(active_statuses)).first()
        if existing_vehicle_trip:
            raise VehicleNotAvailableForDispatchError(vehicle.id, f"already assigned to trip {existing_vehicle_trip.id}")
        existing_driver_trip = database_session.query(Trip).filter(Trip.driver_id == driver.id, Trip.status.in_(active_statuses)).first()
        if existing_driver_trip:
            raise DriverNotEligibleForTripError(driver.id, f"already assigned to trip {existing_driver_trip.id}")

    source_location = database_session.query(ServiceLocation).filter(ServiceLocation.id == create_request.source_location_id).first() if create_request.source_location_id else None
    destination_location = database_session.query(ServiceLocation).filter(ServiceLocation.id == create_request.destination_location_id).first() if create_request.destination_location_id else None
    if create_request.source_location_id and source_location is None:
        raise ResourceNotFoundError("Service location", create_request.source_location_id)
    if create_request.destination_location_id and destination_location is None:
        raise ResourceNotFoundError("Service location", create_request.destination_location_id)

    source = create_request.source or f"{create_request.source_street_address}, {source_location.city}, {source_location.state}"
    destination = create_request.destination or f"{create_request.destination_street_address}, {destination_location.city}, {destination_location.state}"
    is_past_trip = create_request.is_past_trip
    new_trip = Trip(
        source=source,
        destination=destination,
        source_street_address=create_request.source_street_address,
        destination_street_address=create_request.destination_street_address,
        source_location_id=create_request.source_location_id,
        destination_location_id=create_request.destination_location_id,
        trip_date=create_request.trip_date,
        vehicle_id=create_request.vehicle_id,
        driver_id=create_request.driver_id,
        cargo_weight_kg=create_request.cargo_weight_kg,
        planned_distance_km=create_request.planned_distance_km,
        actual_distance_km=create_request.actual_distance_km,
        revenue=create_request.revenue,
        status=TripStatus.COMPLETED if is_past_trip else TripStatus.DRAFT,
        final_odometer_km=create_request.final_odometer_km,
        fuel_consumed_liters=create_request.fuel_consumed_liters,
        dispatched_at=datetime.combine(create_request.trip_date, time(8), tzinfo=timezone.utc) if is_past_trip else None,
        completed_at=datetime.combine(create_request.trip_date, time(18), tzinfo=timezone.utc) if is_past_trip else None,
    )
    database_session.add(new_trip)
    database_session.flush()
    if is_past_trip:
        database_session.add(FuelLog(vehicle_id=vehicle.id, trip_id=new_trip.id, liters=create_request.fuel_consumed_liters, cost=create_request.fuel_cost or create_request.fuel_consumed_liters * 100, log_date=create_request.trip_date))
    database_session.commit()
    database_session.refresh(new_trip)
    return new_trip
