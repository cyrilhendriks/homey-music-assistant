# Music Assistant API Notes

## Connection check

Voor de verbindingstest gebruikt de app `GET /api/info`.
Doel:
- bereikbaarheid van de MA instance controleren
- auth/header validatie meenemen wanneer `ma_api_key` is ingesteld

## Opmerking

De endpointkeuze is afgestemd op de publiek beschreven MA API server-info route.
Valideer dit altijd tegen de Swagger/OpenAPI van je eigen MA-versie.
