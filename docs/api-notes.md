# Music Assistant API Notes (MVP aannames)

Deze app gebruikt directe HTTP-calls naar Music Assistant.

## Aannames
- MA API draait op `http://<host>:8095`.
- Endpoints in de client zijn gekozen op basis van gangbare MA patronen, maar kunnen per MA-versie verschillen.
- Voor announcements is resume **best-effort** en speler-afhankelijk.

## Te valideren in volgende stap
- Exacte endpointnamen en payloadvelden afstemmen op de Swagger van jouw MA-instance.
- Response-vormen mappen naar Homey dropdown/autocomplete format.
