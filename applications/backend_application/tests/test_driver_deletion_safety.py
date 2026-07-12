"""Regression tests for safe driver deletion."""

import unittest
from unittest.mock import MagicMock

from sqlalchemy.exc import IntegrityError

from source.modules.driver_management.delete_driver import delete_driver
from source.shared_infrastructure.standard_error_responses import DriverHasTripHistoryError


class DriverDeletionSafetyTests(unittest.TestCase):
    def test_driver_with_trip_history_returns_conflict_without_deleting(self):
        database_session = MagicMock()
        driver_query = MagicMock()
        trip_query = MagicMock()
        database_session.query.side_effect = [driver_query, trip_query]
        driver_query.filter.return_value.first.return_value = MagicMock(id=1)
        trip_query.filter.return_value.first.return_value = (10,)

        with self.assertRaises(DriverHasTripHistoryError) as raised_error:
            delete_driver(database_session, driver_id=1)

        self.assertEqual(409, raised_error.exception.status_code)
        self.assertEqual("DRIVER_HAS_TRIP_HISTORY", raised_error.exception.detail["code"])
        database_session.delete.assert_not_called()

    def test_foreign_key_race_rolls_back_and_returns_conflict(self):
        database_session = MagicMock()
        driver_query = MagicMock()
        trip_query = MagicMock()
        database_session.query.side_effect = [driver_query, trip_query]
        driver_query.filter.return_value.first.return_value = MagicMock(id=8)
        trip_query.filter.return_value.first.return_value = None
        database_session.commit.side_effect = IntegrityError("DELETE", {}, Exception("foreign key"))

        with self.assertRaises(DriverHasTripHistoryError):
            delete_driver(database_session, driver_id=8)

        database_session.rollback.assert_called_once_with()


if __name__ == "__main__":
    unittest.main()
