# SendGrid test helper

This repository contains a small helper script to test SendGrid email sending using the `SENDGRID_API_KEY` env var.

Prerequisites
- Python 3
- Install the SendGrid library:
  ```bash
  pip install -r scripts/requirements.txt
  ```
- Ensure your API key is loaded in the shell (you already created `sendgrid.env`):
  ```bash
  source ./sendgrid.env
  ```

Usage
- Send a test email:
  ```bash
  python scripts/send_test_email.py --to you@example.com --from from_email@example.com
  ```

- You can also set default addresses via env vars:
  - `SENDGRID_TO`
  - `SENDGRID_FROM`

Notes
- I will not send emails automatically for you; run the script locally when you want to test.
- In production, prefer server-side, authenticated email sending and store the API key in a secure secret manager.
