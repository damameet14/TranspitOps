"""Regression coverage for driver-owned trip authorization."""

from types import SimpleNamespace
import pytest

from source.modules.trip_lifecycle_management.trip_access_control import require_trip_driver_ownership
from source.shared_infrastructure.database_models.user_account_model import UserRole
from source.shared_infrastructure.standard_error_responses import (
    DriverAccountNotLinkedError,
    DriverTripOwnershipError,
)


def test_driver_can_manage_own_trip():
    user = SimpleNamespace(role=UserRole.DRIVER, driver_id=3)
    require_trip_driver_ownership(user, 3)


def test_driver_cannot_manage_another_drivers_trip():
    user = SimpleNamespace(role=UserRole.DRIVER, driver_id=3)
    with pytest.raises(DriverTripOwnershipError):
        require_trip_driver_ownership(user, 4)


def test_unlinked_driver_account_is_rejected():
    user = SimpleNamespace(role=UserRole.DRIVER, driver_id=None)
    with pytest.raises(DriverAccountNotLinkedError):
        require_trip_driver_ownership(user, 3)
