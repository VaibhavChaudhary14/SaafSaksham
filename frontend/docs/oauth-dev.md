# Local OAuth dev flow (Supabase + Google)

This document describes the local testing flow for provider OAuth with Supabase using the local consent emulator.

## Why this exists
- When developing OAuth flows locally, it's convenient to simulate an OAuth provider consent screen without involving real providers.
- The local consent page is available at `http://localhost:3000/oauth/consent` (dev-only).

## How to run a local end-to-end test
1. Start the dev server:
   ```bash
   pnpm dev
   ```
2. Run the helper script (automates authorize -> consent -> callback -> final redirect):
   ```bash
   ./scripts/test_oauth_flow.sh
   ```

What the script does:
- Calls Supabase `authorize` for `provider=google` to retrieve the `state` value.
- Calls the local consent endpoint to `approve` with the same `state` so the Supabase callback receives it.
- Follows redirects and prints the final URL.

Note: When using the local consent emulator, Supabase will attempt to exchange the `code` with the external provider. Because the `code` is a developer-generated value, the exchange will fail and you'll typically see a final URL containing an error (e.g. `error=server_error&error_description=Unable to exchange external code`). This is expected for the local simulation and verifies the full redirect & error handling chain.

## Making the real Google flow work
- In your Google Cloud OAuth client, add the Supabase callback as an authorized redirect URI:
  - `https://<YOUR_SUPABASE_PROJECT>.supabase.co/auth/v1/callback` (for example: `https://ywfyieidzgbbuyedsdoq.supabase.co/auth/v1/callback`)
- Ensure `redirect_to` is set to your app's local URL (`http://localhost:3000`) when initiating the authorize request.
- Start the dev server and perform the real Google sign-in flow.

## Notes & Troubleshooting
- If Supabase returns `bad_oauth_state`, make sure you initiated the `authorize` request first (Supabase stores state in a transient session), then use the same `state` when calling the consent emulator.
- If you see `Unable to exchange external code`, that's expected for the emulator; for a real provider the exchange should succeed if your client credentials are correct.

