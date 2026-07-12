"""Unit tests for Brevo email delivery."""

import json
import os
import unittest
from io import BytesIO
from unittest.mock import patch
from urllib.error import HTTPError

from source.shared_infrastructure.brevo_email_service import (
    BrevoEmailRequest,
    send_email,
)


class SuccessfulHTTPResponse:
    status = 201

    def __enter__(self):
        return self

    def __exit__(self, exception_type, exception_value, traceback):
        return False


class BrevoEmailServiceTests(unittest.TestCase):
    def test_send_email_posts_expected_brevo_request(self):
        captured_requests = []

        def fake_urlopen(request, timeout):
            captured_requests.append((request, timeout))
            return SuccessfulHTTPResponse()

        with patch.dict(
            os.environ,
            {
                "BREVO_API_KEY": "test-api-key",
                "BREVO_SENDER_EMAIL": "no-reply@example.com",
                "BREVO_SENDER_NAME": "TransitOps",
            },
            clear=True,
        ), patch("source.shared_infrastructure.brevo_email_service.urlopen", fake_urlopen):
            result = send_email(
                BrevoEmailRequest(
                    recipient_name="Fleet Manager",
                    recipient_email="fleet@example.com",
                    subject="Welcome to TransitOps",
                    html_content="<p>Hello</p>",
                )
            )

        self.assertTrue(result.was_successful)
        request, timeout = captured_requests[0]
        self.assertEqual(10, timeout)
        self.assertEqual("https://api.brevo.com/v3/smtp/email", request.full_url)
        self.assertEqual("test-api-key", request.get_header("Api-key"))
        body = json.loads(request.data.decode("utf-8"))
        self.assertEqual("no-reply@example.com", body["sender"]["email"])
        self.assertEqual("fleet@example.com", body["to"][0]["email"])

    def test_send_email_returns_failure_when_api_key_is_missing(self):
        with patch.dict(os.environ, {}, clear=True):
            result = send_email(
                BrevoEmailRequest(
                    recipient_name="Fleet Manager",
                    recipient_email="fleet@example.com",
                    subject="New login",
                    html_content="<p>Hello</p>",
                )
            )

        self.assertFalse(result.was_successful)
        self.assertEqual("missing_brevo_api_key", result.failure_reason)

    def test_send_email_returns_failure_when_recipient_email_is_missing(self):
        with patch.dict(os.environ, {"BREVO_API_KEY": "test-api-key"}, clear=True):
            result = send_email(
                BrevoEmailRequest(
                    recipient_name="Fleet Manager",
                    recipient_email="",
                    subject="New login",
                    html_content="<p>Hello</p>",
                )
            )

        self.assertFalse(result.was_successful)
        self.assertEqual("missing_recipient_email", result.failure_reason)

    def test_send_email_returns_safe_failure_for_brevo_http_error(self):
        def fake_urlopen(request, timeout):
            raise HTTPError(
                url=request.full_url,
                code=401,
                msg="Unauthorized",
                hdrs=None,
                fp=BytesIO(b"{}"),
            )

        with patch.dict(
            os.environ,
            {
                "BREVO_API_KEY": "test-api-key",
                "BREVO_SENDER_EMAIL": "no-reply@example.com",
            },
            clear=True,
        ), patch("source.shared_infrastructure.brevo_email_service.urlopen", fake_urlopen):
            result = send_email(
                BrevoEmailRequest(
                    recipient_name="Fleet Manager",
                    recipient_email="fleet@example.com",
                    subject="New login",
                    html_content="<p>Hello</p>",
                )
            )

        self.assertFalse(result.was_successful)
        self.assertEqual("brevo_delivery_failed", result.failure_reason)


if __name__ == "__main__":
    unittest.main()
