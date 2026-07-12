"""Regression tests for cross-module operational business rules."""

import unittest
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock

from pydantic import ValidationError

from source.modules.driver_management.driver_management_contracts import CreateDriverRequest, UpdateDriverRequest
from source.modules.maintenance_tracking.create_maintenance_record import create_maintenance_record
from source.modules.maintenance_tracking.maintenance_tracking_contracts import CreateMaintenanceRecordRequest
from source.modules.trip_lifecycle_management.complete_trip import complete_trip
from source.modules.trip_lifecycle_management.trip_lifecycle_contracts import CompleteTripRequest
from source.modules.vehicle_registry.vehicle_registry_contracts import UpdateVehicleRequest
from source.shared_infrastructure.database_models.trip_model import TripStatus
from source.shared_infrastructure.database_models.vehicle_model import VehicleStatus
from source.shared_infrastructure.standard_error_responses import (
    FinalOdometerRegressionError,
    VehicleNotEligibleForMaintenanceError,
)


class OperationalBusinessRuleSafetyTests(unittest.TestCase):
    def test_update_contracts_reject_unknown_enum_values(self):
        with self.assertRaises(ValidationError):
            UpdateDriverRequest(status="unknown")
        with self.assertRaises(ValidationError):
            UpdateVehicleRequest(type="spaceship")
        with self.assertRaises(ValidationError):
            UpdateVehicleRequest(status="missing")

    def test_driver_contract_requires_a_valid_email(self):
        with self.assertRaises(ValidationError):
            CreateDriverRequest(
                name="Test Driver",
                email="not-an-email",
                license_number="TEST-001",
                license_category="LMV",
                license_expiry_date="2030-01-01",
                contact_number="9999999999",
                safety_score=90,
            )

    def test_vehicle_on_trip_cannot_enter_maintenance(self):
        database_session = MagicMock()
        vehicle_query = MagicMock()
        database_session.query.return_value = vehicle_query
        vehicle_query.filter.return_value.first.return_value = SimpleNamespace(id=3, status=VehicleStatus.ON_TRIP)
        request = CreateMaintenanceRecordRequest(vehicle_id=3, type="inspection", cost=100, description=None)

        with self.assertRaises(VehicleNotEligibleForMaintenanceError):
            create_maintenance_record(database_session, request)

        database_session.add.assert_not_called()

    def test_trip_completion_cannot_reduce_vehicle_odometer(self):
        database_session = MagicMock()
        trip_query = MagicMock()
        vehicle_query = MagicMock()
        database_session.query.side_effect = [trip_query, vehicle_query]
        trip_query.filter.return_value.first.return_value = SimpleNamespace(
            id=5,
            status=TripStatus.DISPATCHED,
            vehicle_id=2,
            driver_id=4,
            created_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
        )
        vehicle_query.filter.return_value.first.return_value = SimpleNamespace(id=2, odometer_km=5000)
        request = CompleteTripRequest(final_odometer_km=4999, fuel_consumed_liters=10, actual_distance_km=100)

        with self.assertRaises(FinalOdometerRegressionError):
            complete_trip(database_session, trip_id=5, complete_request=request)

        database_session.commit.assert_not_called()


if __name__ == "__main__":
    unittest.main()
