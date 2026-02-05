# Architecture

## Goal
A Homey Pro app that integrates Music Assistant through its JSON API.

## High-level design
- Homey App (Node.js / Homey SDK v3)
- Music Assistant server (HTTP JSON API)

Homey communicates directly with Music Assistant.
Home Assistant is not required as an API layer.

## Modules
- `src/lib/musicAssistantClient.js`
  - Handles all HTTP calls to Music Assistant
  - Provides higher-level functions like `getPlayers()`, `playRadio()`, etc.

- `src/flow/actions/`
  - Flow action card implementations

## Settings
- Host (IP / hostname)
- Port (default: 8095)
- Optional API token

## Future extensions
- Better resume behaviour for announcements
- Browsing library (artists/albums)
- Favorites
