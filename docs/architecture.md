# Architecture

## Goal

A Homey Pro app that integrates Music Assistant through its HTTP RPC API (and optional WebSocket API later).

## High-level design

- Homey App (Node.js / Homey SDK v3)
- Music Assistant server (HTTP RPC API: POST /api, plus GET /info)

Homey communicates directly with Music Assistant (no Home Assistant required as an API layer).

## Modules

- `src/lib/musicAssistantClient.js`
  - Handles HTTP calls to Music Assistant (POST /api and GET /info)
  - Provides higher-level functions like getPlayers(), playMedia(), etc.

- `src/flow/actions/`
  - Flow action card implementations

## Settings

- `ma_host` (IP / hostname)
- `ma_port` (default: 8095)
- `ma_token` (optional bearer token)

## Future extensions

- Optional WebSocket connection for real-time events (player_updated, queue_updated, etc.)
- Better resume behaviour for announcements
- Browsing library (artists/albums)
- Favorites
