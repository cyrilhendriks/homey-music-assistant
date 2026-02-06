# Homey Music Assistant App

This project contains a Homey SDK v3 app that talks directly to the Music Assistant JSON API.

## Current status

- Step 8 complete: quality and CI setup (per the guide)
- Step 9 in progress (MVP): `MusicAssistantClient` with timeout/error handling and initial tests
- Next: Flow action cards with dropdown/autocomplete

## Settings

- `ma_host` (required): Music Assistant host (IP/hostname)
- `ma_port` (optional): default is 8095 (this is commonly the default MA port)
  The default port is usually shown in Music Assistant under Settings → System → Webserver → Base URL.
- `ma_token` (optional): bearer token

### Create a long-lived bearer token

1. Settings
2. Users
3. Dropdown menu on the user tile (three dots)
4. Access tokens
5. New token
6. Copy the token and paste it into `ma_token` in Homey

Security note: keep the token secret.

## Important files

- `src/lib/musicAssistantClient.js` - API client for players, groups, playlists, radio, track search, play, and announce
- `src/lib/logger.js` - simple logger abstraction
- `test/musicAssistantClient.test.js` - base unit tests
- `docs/api-notes.md` - API assumptions to validate against your MA Swagger

## Tests

```bash
npm test
```

## Restore structure (if you accidentally moved files)

```bash
./scripts/normalize-structure.sh
npm test
```
