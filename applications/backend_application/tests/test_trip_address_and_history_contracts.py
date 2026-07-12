"""Contract-level safety tests for structured and historical trip input."""

import unittest
from datetime import date, timedelta

from pydantic import ValidationError

from source.modules.trip_lifecycle_management.trip_lifecycle_contracts import CreateTripRequest


class TripAddressAndHistoryContractTests(unittest.TestCase):
    def base_request(self) -> dict:
        return {
            "source_street_address": "12 River Road",
            "source_location_id": 1,
            "destination_street_address": "8 Market Street",
            "destination_location_id": 2,
            "vehicle_id": 1,
            "driver_id": 1,
            "cargo_weight_kg": 100,
            "planned_distance_km": 20,
        }

    def test_current_trip_rejects_historical_date(self):
        request = self.base_request() | {"trip_date": date.today() - timedelta(days=1)}
        with self.assertRaises(ValidationError):
            CreateTripRequest(**request)

    def test_past_trip_requires_completion_measurements(self):
        request = self.base_request() | {"is_past_trip": True, "trip_date": date.today() - timedelta(days=1)}
        with self.assertRaises(ValidationError):
            CreateTripRequest(**request)

    def test_complete_past_trip_contract_is_accepted(self):
        request = self.base_request() | {
            "is_past_trip": True,
            "trip_date": date.today() - timedelta(days=1),
            "final_odometer_km": 12000,
            "fuel_consumed_liters": 8,
            "actual_distance_km": 65,
        }
        self.assertTrue(CreateTripRequest(**request).is_past_trip)


if __name__ == "__main__":
    unittest.main()
