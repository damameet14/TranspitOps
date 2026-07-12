"""Regression tests for safe vehicle deletion."""

import unittest
from unittest.mock import MagicMock

from sqlalchemy.exc import IntegrityError

from source.modules.vehicle_registry.delete_vehicle import delete_vehicle
from source.shared_infrastructure.standard_error_responses import VehicleHasTripHistoryError


class VehicleDeletionSafetyTests(unittest.TestCase):
    def test_vehicle_with_trip_history_returns_conflict_without_deleting(self):
        database_session = MagicMock()
        vehicle_query = MagicMock()
        trip_query = MagicMock()
        database_session.query.side_effect = [vehicle_query, trip_query]
        vehicle_query.filter.return_value.first.return_value = MagicMock(id=6)
        trip_query.filter.return_value.first.return_value = (42,)

        with self.assertRaises(VehicleHasTripHistoryError) as raised_error:
            delete_vehicle(database_session, vehicle_id=6)

        self.assertEqual(409, raised_error.exception.status_code)
        self.assertEqual("VEHICLE_HAS_TRIP_HISTORY", raised_error.exception.detail["code"])
        database_session.delete.assert_not_called()
        database_session.commit.assert_not_called()

    def test_foreign_key_race_rolls_back_and_returns_conflict(self):
        database_session = MagicMock()
        vehicle_query = MagicMock()
        trip_query = MagicMock()
        database_session.query.side_effect = [vehicle_query, trip_query]
        vehicle_query.filter.return_value.first.return_value = MagicMock(id=9)
        trip_query.filter.return_value.first.return_value = None
        database_session.commit.side_effect = IntegrityError("DELETE", {}, Exception("foreign key"))

        with self.assertRaises(VehicleHasTripHistoryError):
            delete_vehicle(database_session, vehicle_id=9)

        database_session.rollback.assert_called_once_with()


if __name__ == "__main__":
    unittest.main()
