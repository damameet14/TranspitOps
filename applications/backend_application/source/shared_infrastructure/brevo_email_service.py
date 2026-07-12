"""Brevo transactional email delivery for TransitOps backend workflows."""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


BREVO_TRANSACTIONAL_EMAIL_URL = "https://api.brevo.com/v3/smtp/email"
DEFAULT_BREVO_TIMEOUT_SECONDS = 10

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class BrevoEmailRequest:
    recipient_name: str
    recipient_email: str
    subject: str
    html_content: str


@dataclass(frozen=True)
class BrevoEmailDeliveryResult:
    was_successful: bool
    failure_reason: str | None = None


def send_email(email_request: BrevoEmailRequest) -> BrevoEmailDeliveryResult:
    """Send one transactional email through Brevo without exposing secrets."""
    brevo_api_key = os.getenv("BREVO_API_KEY", "").strip()
    sender_email = os.getenv("BREVO_SENDER_EMAIL", "").strip()
    sender_name = os.getenv("BREVO_SENDER_NAME", "TransitOps").strip() or "TransitOps"

    if not email_request.recipient_email:
        return BrevoEmailDeliveryResult(False, "missing_recipient_email")

    if not brevo_api_key:
        logger.info("Brevo email skipped because BREVO_API_KEY is not configured.")
        return BrevoEmailDeliveryResult(False, "missing_brevo_api_key")

    if not sender_email:
        logger.info("Brevo email skipped because BREVO_SENDER_EMAIL is not configured.")
        return BrevoEmailDeliveryResult(False, "missing_sender_email")

    request_body = {
        "sender": {"name": sender_name, "email": sender_email},
        "to": [
            {
                "name": email_request.recipient_name or email_request.recipient_email,
                "email": email_request.recipient_email,
            }
        ],
        "subject": email_request.subject,
        "htmlContent": email_request.html_content,
    }

    request = Request(
        BREVO_TRANSACTIONAL_EMAIL_URL,
        data=json.dumps(request_body).encode("utf-8"),
        headers={
            "api-key": brevo_api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=DEFAULT_BREVO_TIMEOUT_SECONDS) as response:
            if 200 <= response.status < 300:
                return BrevoEmailDeliveryResult(True)

            logger.warning("Brevo email failed with HTTP status %s.", response.status)
            return BrevoEmailDeliveryResult(False, "brevo_http_error")
    except HTTPError as error:
        logger.warning("Brevo email failed with HTTP status %s.", error.code)
        error.close()
    except URLError:
        logger.warning("Brevo email failed because the Brevo API could not be reached.")
    except Exception:
        logger.exception("Brevo email failed unexpectedly.")

    return BrevoEmailDeliveryResult(False, "brevo_delivery_failed")
