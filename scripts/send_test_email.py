#!/usr/bin/env python3
"""Simple SendGrid test script.

Usage:
  # ensure SENDGRID_API_KEY is set (e.g. source ./sendgrid.env)
  python scripts/send_test_email.py --to you@example.com --from from_email@example.com

The script will print the response status and headers but will NOT send automatically unless you run it.
"""

import os
import argparse

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail


def main():
    parser = argparse.ArgumentParser(description="Send a test email via SendGrid")
    parser.add_argument("--to", dest="to_email", help="Recipient email address")
    parser.add_argument("--from", dest="from_email", help="From email address")
    parser.add_argument("--subject", dest="subject", default="Sending with Twilio SendGrid is Fun")
    parser.add_argument("--html", dest="html", default="<strong>and easy to do anywhere, even with Python</strong>")
    args = parser.parse_args()

    api_key = os.environ.get("SENDGRID_API_KEY")
    if not api_key:
        print("ERROR: SENDGRID_API_KEY not set. Source your sendgrid.env or export the env var.")
        return 2

    to_email = args.to_email or os.environ.get("SENDGRID_TO")
    from_email = args.from_email or os.environ.get("SENDGRID_FROM") or "from_email@example.com"

    if not to_email:
        print("ERROR: Recipient not provided. Use --to or set SENDGRID_TO in your environment.")
        return 2

    message = Mail(
        from_email=from_email,
        to_emails=to_email,
        subject=args.subject,
        html_content=args.html,
    )

    try:
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        print("Sent — status:", response.status_code)
        # Print body & headers for debugging; response.body might be bytes
        try:
            print("Body:", response.body.decode() if isinstance(response.body, (bytes, bytearray)) else response.body)
        except Exception:
            print("Body: <unprintable>")
        print("Headers:")
        for k, v in response.headers.items():
            print(f"  {k}: {v}")
        return 0
    except Exception as e:
        print("ERROR sending email:", e)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
