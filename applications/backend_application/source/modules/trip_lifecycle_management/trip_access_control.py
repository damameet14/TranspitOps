"""Business authorization rules for driver-owned trip data and actions."""

from source.shared_infrastructure.database_models.user_account_model import UserAccount, UserRole
from source.shared_infrastructure.standard_error_responses import (
    DriverAccountNotLinkedError,
    DriverTripOwnershipError,
)


def require_trip_driver_ownership(user: UserAccount, trip_driver_id: int) -> None:
    """Allow managers globally while restricting a driver login to its linked driver."""
    if user.role != UserRole.DRIVER:
        return
    if user.driver_id is None:
        raise DriverAccountNotLinkedError()
    if user.driver_id != trip_driver_id:
        raise DriverTripOwnershipError(trip_driver_id)
