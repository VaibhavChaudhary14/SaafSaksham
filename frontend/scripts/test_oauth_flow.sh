#!/usr/bin/env bash
set -euo pipefail

SUPABASE_URL="https://ywfyieidzgbbuyedsdoq.supabase.co"
REDIRECT_TO="http://localhost:3000"

echo "1) Requesting Supabase authorize URL to get state..."
LOCATION=$(curl -s -i "$SUPABASE_URL/auth/v1/authorize?provider=google&redirect_to=$REDIRECT_TO&scopes=openid%20email" \
  | grep -i '^location:' | sed -E 's/^[Ll]ocation:[[:space:]]*//' | tr -d '\r')

if [[ -z "$LOCATION" ]]; then
  echo "Failed to get redirect Location from Supabase authorize. Are you online and is Supabase reachable?"
  exit 1
fi

echo "Supabase->provider Location: $LOCATION"

STATE=$(echo "$LOCATION" | sed -n 's/.*[?&]state=\([^&]*\).*/\1/p')

if [[ -z "$STATE" ]]; then
  echo "Could not parse state from Location: $LOCATION"
  exit 1
fi

echo "2) Opening local consent approve endpoint with state"
CONSENT_URL="http://localhost:3000/oauth/consent/approve?redirect_uri=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1], safe=''))" "$SUPABASE_URL/auth/v1/callback")&redirect_to=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1], safe=''))" "$REDIRECT_TO")&state=$STATE"

echo "Consent URL: $CONSENT_URL"

FINAL_URL=$(curl -s -L -o /dev/null -w "%{url_effective}" "$CONSENT_URL")

echo "Final URL after full redirect chain: $FINAL_URL"

if echo "$FINAL_URL" | grep -q "error"; then
  echo "Note: the final URL contains an error query — this is expected for local dev consent because the code is a dev code and cannot be exchanged by Supabase."
else
  echo "Success: final URL did not contain 'error' — if this is the Supabase redirect_to it likely contains tokens (check app)."
fi
