"""Dispatch a trip: Draft → Dispatched.

Business rule 6 — On dispatch, set vehicle.status = On Trip and
driver.status = On Trip. Transactional.
"""

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.trip_model import Trip, TripStatus
from source.shared_infrastructure.database_models.vehicle_model import Vehicle, VehicleStatus
from source.shared_infrastructure.database_models.driver_model import Driver, DriverStatus
from source.shared_infrastructure.standard_error_responses import (
    InvalidTripStateTransitionError,
    ResourceNotFoundError,
)


def dispatch_trip(
    database_session: Session,
    trip_id: int,
) -> Trip:
    """Transition trip from Draft to Dispatched.

    Side effects:
        - Vehicle status → On Trip
        - Driver status → On Trip
        - Trip dispatched_at timestamp set

    Raises InvalidTripStateTransitionError if trip is not in Draft status.
    """
    trip = database_session.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise ResourceNotFoundError("Trip", trip_id)

    if trip.status != TripStatus.DRAFT:
        raise InvalidTripStateTransitionError(trip_id, trip.status.value, TripStatus.DISPATCHED.value)

    # Update vehicle status
    vehicle = database_session.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
    if vehicle is not None:
        vehicle.status = VehicleStatus.ON_TRIP

    # Update driver status
    driver = database_session.query(Driver).filter(Driver.id == trip.driver_id).first()
    if driver is not None:
        driver.status = DriverStatus.ON_TRIP

    # Transition trip
    trip.status = TripStatus.DISPATCHED
    trip.dispatched_at = datetime.now(timezone.utc)

    database_session.commit()
    database_session.refresh(trip)

    return trip
