# Homey Music Assistant App

Dit project bevat een Homey SDK v3 app die direct met de Music Assistant API communiceert.

## Instellingen (nieuw)

Via Homey app settings kun je nu configureren:
- `ma_host` (verplicht)
- `ma_port` (default `8095`)
- `ma_api_key` (optioneel)

De app leest deze waarden uit `this.homey.settings` en gebruikt ze voor alle MA API-calls.

## Test connection

De settings pagina kan een app-endpoint aanroepen:
- `POST /test-connection`

Response:
- `{ ok: true, details: { ... } }`
- `{ ok: false, error: "..." }`

## Development

```bash
npm ci
npm run lint
npm test
```
