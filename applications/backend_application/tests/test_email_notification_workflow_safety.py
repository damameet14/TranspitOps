"""Tests proving email failures do not block existing ERP transport actions."""

import unittest
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import patch

from source.shared_infrastructure.brevo_email_service import BrevoEmailDeliveryResult

try:
    from source.modules.trip_lifecycle_management.trip_lifecycle_transport import (
        dispatch_existing_trip,
    )
    from source.modules.user_authentication.user_authentication_transport import login
except ModuleNotFoundError as import_error:
    dispatch_existing_trip = None
    login = None
    TRANSPORT_IMPORT_ERROR = import_error
else:
    TRANSPORT_IMPORT_ERROR = None


@unittest.skipIf(TRANSPORT_IMPORT_ERROR is not None, f"Backend dependencies unavailable: {TRANSPORT_IMPORT_ERROR}")
class EmailNotificationWorkflowSafetyTests(unittest.TestCase):
    def test_login_returns_token_when_email_delivery_fails(self):
        authenticated_user = SimpleNamespace(
            id=1,
            email="fleet@example.com",
            full_name="Fleet Manager",
            role=SimpleNamespace(value="fleet_manager"),
        )
        login_request = SimpleNamespace(email="fleet@example.com", password="correct-password")

        with patch(
            "source.modules.user_authentication.user_authentication_transport.authenticate_user_credentials",
            return_value=authenticated_user,
        ), patch(
            "source.modules.user_authentication.user_authentication_transport.create_access_token",
            return_value=("access-token", 43200),
        ), patch(
            "source.modules.user_authentication.user_authentication_transport.notify_user_of_successful_login",
            return_value=BrevoEmailDeliveryResult(False, "brevo_delivery_failed"),
        ):
            result = login(login_request, database_session=object())

        self.assertEqual("access-token", result.access_token)
        self.assertEqual(1, result.user_id)

    def test_trip_dispatch_returns_trip_when_email_delivery_fails(self):
        trip = SimpleNamespace(
            id=25,
            source="Ahmedabad",
            destination="Surat",
            vehicle_id=3,
            driver_id=4,
            cargo_weight_kg=1200,
            planned_distance_km=265,
            actual_distance_km=None,
            revenue=12000,
            status=SimpleNamespace(value="dispatched"),
            final_odometer_km=None,
            fuel_consumed_liters=None,
            dispatched_at=None,
            completed_at=None,
            created_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
            vehicle=SimpleNamespace(registration_number="GJ01AB1234", name_model="Tata Ace"),
            driver=SimpleNamespace(name="Amit Driver"),
        )
        current_user = SimpleNamespace(
            email="driver@example.com",
            full_name="Driver User",
            role=SimpleNamespace(value="driver"),
        )

        with patch(
            "source.modules.trip_lifecycle_management.trip_lifecycle_transport.dispatch_trip",
            return_value=trip,
        ), patch(
            "source.modules.trip_lifecycle_management.trip_lifecycle_transport.notify_user_of_trip_status_change",
            return_value=BrevoEmailDeliveryResult(False, "brevo_delivery_failed"),
        ):
            result = dispatch_existing_trip(
                trip_id=trip.id,
                current_user=current_user,
                database_session=object(),
            )

        self.assertEqual(trip.id, result.id)
        self.assertEqual("dispatched", result.status)


if __name__ == "__main__":
    unittest.main()
