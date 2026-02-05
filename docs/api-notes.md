# Music Assistant API Notes

## Source
Music Assistant exposes a JSON API and Swagger documentation.

- Docs: https://www.music-assistant.io/api/
- Swagger on local instance: http://<MA_HOST>:8095/api-docs

## Important concepts
- Players (speakers)
- Player groups
- Media items (radio, playlists, tracks)
- Queue management
- Announcements (pause -> announce -> resume)

## Assumptions
- API is reachable on LAN
- Authentication may be enabled (token)

## TODO
- Confirm exact endpoints for:
  - Fetch players
  - Fetch radio stations
  - Fetch playlists
  - Search tracks
  - Play media on player
  - Announce to players
