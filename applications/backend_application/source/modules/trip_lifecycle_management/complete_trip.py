"""Complete a trip: Dispatched → Completed.

Business rule 7 — On completion:
    - Require final_odometer_km and fuel_consumed_liters
    - Update vehicle.odometer_km to final_odometer_km
    - Set vehicle.status = Available
    - Set driver.status = Available
    - Auto-create a FuelLog entry for the consumed fuel
"""

from datetime import date, datetime, timezone

from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.trip_model import Trip, TripStatus
from source.shared_infrastructure.database_models.vehicle_model import Vehicle, VehicleStatus
from source.shared_infrastructure.database_models.driver_model import Driver, DriverStatus
from source.shared_infrastructure.database_models.fuel_log_model import FuelLog
from source.shared_infrastructure.standard_error_responses import (
    FinalOdometerRegressionError,
    InvalidTripStateTransitionError,
    ResourceNotFoundError,
)
from source.modules.trip_lifecycle_management.trip_lifecycle_contracts import CompleteTripRequest


def complete_trip(
    database_session: Session,
    trip_id: int,
    complete_request: CompleteTripRequest,
) -> Trip:
    """Transition trip from Dispatched to Completed.

    Side effects:
        - Vehicle odometer updated to final_odometer_km
        - Vehicle status → Available
        - Driver status → Available
        - FuelLog entry auto-created
        - Trip completed_at timestamp set

    Raises InvalidTripStateTransitionError if trip is not in Dispatched status.
    """
    trip = database_session.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise ResourceNotFoundError("Trip", trip_id)

    if trip.status != TripStatus.DISPATCHED:
        raise InvalidTripStateTransitionError(trip_id, trip.status.value, TripStatus.COMPLETED.value)

    vehicle = database_session.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
    if vehicle is not None and complete_request.final_odometer_km < float(vehicle.odometer_km):
        raise FinalOdometerRegressionError(
            vehicle.id,
            float(vehicle.odometer_km),
            complete_request.final_odometer_km,
        )

    # Update trip fields
    trip.final_odometer_km = complete_request.final_odometer_km
    trip.fuel_consumed_liters = complete_request.fuel_consumed_liters
    trip.actual_distance_km = complete_request.actual_distance_km
    trip.status = TripStatus.COMPLETED
    trip.completed_at = datetime.now(timezone.utc)

    # Update vehicle: odometer and status
    if vehicle is not None:
        vehicle.odometer_km = complete_request.final_odometer_km
        vehicle.status = VehicleStatus.AVAILABLE

    # Update driver status
    driver = database_session.query(Driver).filter(Driver.id == trip.driver_id).first()
    if driver is not None:
        driver.status = DriverStatus.AVAILABLE

    # Auto-create fuel log entry (cost estimated at ₹100/liter as default)
    fuel_log = FuelLog(
        vehicle_id=trip.vehicle_id,
        trip_id=trip.id,
        liters=complete_request.fuel_consumed_liters,
        cost=complete_request.fuel_consumed_liters * 100,  # Default ₹100/liter
        log_date=date.today(),
    )
    database_session.add(fuel_log)

    database_session.commit()
    database_session.refresh(trip)

    return trip
