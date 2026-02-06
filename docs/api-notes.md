# Music Assistant API Notes (MVP assumptions)

This app uses the Music Assistant HTTP RPC endpoint (POST /api) and optionally GET /info for unauthenticated server info.

## Assumptions

- The MA server is reachable at http://<ma_host>:<ma_port>.
- Default port is usually 8095 (visible in Music Assistant: Settings → System → Webserver → Base URL).
- Most commands are executed via HTTP RPC: POST /api with JSON body { "command": "...", "args": { ... } }.
- Authentication is required for most RPC commands. The app uses a long-lived bearer token stored as ma_token.
- Server info can be fetched without auth via GET /info (used for connection tests).

## Validate next

- Confirm the exact RPC command names and args in the Swagger UI of your MA instance.
- Map response shapes to Homey dropdown/autocomplete formats.
- Decide which features should use WebSocket events later (optional, for real-time updates).
