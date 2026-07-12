"""TransitOps email notification helpers built on the shared Brevo service."""

from __future__ import annotations

import html
import logging
import os
from datetime import datetime, timezone

from source.shared_infrastructure.brevo_email_service import (
    BrevoEmailDeliveryResult,
    BrevoEmailRequest,
    send_email,
)
from source.shared_infrastructure.database_models.trip_model import Trip
from source.shared_infrastructure.database_models.user_account_model import UserAccount
from source.shared_infrastructure.database_models.driver_model import Driver


TRANSIT_OPS_APPLICATION_NAME = "TransitOps"

logger = logging.getLogger(__name__)


def notify_user_of_successful_login(user_account: UserAccount) -> BrevoEmailDeliveryResult:
    login_datetime = datetime.now(timezone.utc)
    details = {
        "Date": login_datetime.strftime("%Y-%m-%d"),
        "Time": login_datetime.strftime("%H:%M UTC"),
    }
    html_content = _build_email_html(
        heading="New login to your ERP account",
        greeting_name=user_account.full_name,
        message="Your TransitOps account was logged in successfully.",
        details=details,
        action_url=_frontend_url(),
        action_label="Open TransitOps",
        closing_message="If this login was not performed by you, please contact your administrator immediately.",
    )
    return _safely_send_email(
        BrevoEmailRequest(
            recipient_name=user_account.full_name,
            recipient_email=user_account.email,
            subject="New login to your ERP account",
            html_content=html_content,
        )
    )


def notify_user_of_trip_status_change(
    user_account: UserAccount,
    trip: Trip,
    status_action: str,
) -> BrevoEmailDeliveryResult:
    return _notify_trip_recipient(
        recipient_name=user_account.full_name,
        recipient_email=user_account.email,
        trip=trip,
        status_action=status_action,
    )


def notify_driver_of_trip_status_change(
    driver: Driver,
    trip: Trip,
    status_action: str,
) -> BrevoEmailDeliveryResult:
    """Notify the assigned driver when a trip lifecycle action succeeds."""
    return _notify_trip_recipient(
        recipient_name=driver.name,
        recipient_email=driver.email,
        trip=trip,
        status_action=status_action,
    )


def _notify_trip_recipient(
    recipient_name: str,
    recipient_email: str,
    trip: Trip,
    status_action: str,
) -> BrevoEmailDeliveryResult:
    trip_url = f"{_frontend_url()}/trips/{trip.id}"
    subject = f"TransitOps trip #{trip.id} {status_action}"
    details = {
        "Trip": f"#{trip.id}",
        "Route": f"{trip.source} to {trip.destination}",
        "Driver": trip.driver.name if trip.driver else "Not available",
        "Vehicle": trip.vehicle.registration_number if trip.vehicle else "Not available",
        "Status": trip.status.value,
    }
    html_content = _build_email_html(
        heading=subject,
        greeting_name=recipient_name,
        message=f"Trip #{trip.id} has been {status_action}.",
        details=details,
        action_url=trip_url,
        action_label="View trip",
        closing_message="This email confirms a critical trip lifecycle status change.",
    )
    return _safely_send_email(
        BrevoEmailRequest(
            recipient_name=recipient_name,
            recipient_email=recipient_email,
            subject=subject,
            html_content=html_content,
        )
    )


def _safely_send_email(email_request: BrevoEmailRequest) -> BrevoEmailDeliveryResult:
    try:
        result = send_email(email_request)
    except Exception:
        logger.exception("TransitOps email notification failed unexpectedly.")
        return BrevoEmailDeliveryResult(False, "email_notification_failed")

    if not result.was_successful:
        logger.info("TransitOps email notification was not delivered: %s.", result.failure_reason)

    return result


def _frontend_url() -> str:
    return os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")


def _build_email_html(
    heading: str,
    greeting_name: str,
    message: str,
    details: dict[str, str],
    action_url: str,
    action_label: str,
    closing_message: str,
) -> str:
    escaped_heading = html.escape(heading)
    escaped_greeting_name = html.escape(greeting_name)
    escaped_message = html.escape(message)
    escaped_action_url = html.escape(action_url, quote=True)
    escaped_action_label = html.escape(action_label)
    escaped_closing_message = html.escape(closing_message)
    detail_rows = "".join(
        "<tr>"
        f"<td style=\"padding:8px 12px;color:#475569;\">{html.escape(label)}</td>"
        f"<td style=\"padding:8px 12px;font-weight:600;color:#0f172a;\">{html.escape(value)}</td>"
        "</tr>"
        for label, value in details.items()
    )

    return f"""<!doctype html>
<html>
  <body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
    <main style="max-width:640px;margin:0 auto;padding:24px;">
      <section style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:24px;">
        <h1 style="font-size:22px;line-height:1.3;margin:0 0 16px;">{escaped_heading}</h1>
        <p style="font-size:16px;line-height:1.5;margin:0 0 12px;">Hello {escaped_greeting_name},</p>
        <p style="font-size:16px;line-height:1.5;margin:0 0 18px;">{escaped_message}</p>
        <table style="width:100%;border-collapse:collapse;background:#f8fafc;margin:0 0 22px;">{detail_rows}</table>
        <p style="margin:0 0 22px;">
          <a href="{escaped_action_url}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:11px 16px;border-radius:6px;font-weight:700;">{escaped_action_label}</a>
        </p>
        <p style="font-size:14px;line-height:1.5;color:#475569;margin:0 0 18px;">{escaped_closing_message}</p>
        <p style="font-size:14px;line-height:1.5;color:#475569;margin:0;">Regards,<br>{TRANSIT_OPS_APPLICATION_NAME} Team</p>
      </section>
    </main>
  </body>
</html>"""
