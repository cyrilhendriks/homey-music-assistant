# Homey Music Assistant App

Dit project bevat een Homey SDK v3 app die direct met de Music Assistant API communiceert.

## Huidige status

- ✅ Stap 8: basis quality/CI-voorbereiding (volgens handleiding)
- ✅ Stap 9 (MVP gestart): `MusicAssistantClient` met timeout/error handling + eerste tests
- ⏭️ Volgende stap: Flow action cards met dropdown/autocomplete

## Belangrijke bestanden

- `src/lib/musicAssistantClient.js` — API client voor spelers, groepen, playlists, radio, track search, play en announce.
- `src/lib/logger.js` — simpele logger abstraction.
- `test/musicAssistantClient.test.js` — basis unit tests.
- `docs/api-notes.md` — API aannames die nog op jouw MA Swagger gevalideerd moeten worden.

## Testen

```bash
npm test
```


## Structuur herstellen (als je per ongeluk bestanden hebt verplaatst)

```bash
./scripts/normalize-structure.sh
npm test
```
