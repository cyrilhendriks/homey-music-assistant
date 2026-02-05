# Stap-voor-stap: Homey Music Assistant project opzetten (lokaal + GitHub)

Deze handleiding is geschreven voor beginners. Per stap leg ik uit **wat** je doet en **waarom**.

---

## Stap 1 — Installeer de basissoftware

### Wat doen we?
Installeer:
- **Node.js 20 (LTS)**
- **Git**
- **VS Code** (of andere editor)
- **Homey CLI**

### Waarom?
- Node.js draait je app en tooling.
- Git bewaart versiegeschiedenis.
- Een editor maakt ontwikkelen makkelijker.
- Homey CLI is nodig om Homey apps lokaal te runnen/testen.

### Commando’s
```bash
node -v
git --version
npm i -g homey
homey --version
```

> Verwacht: Node-versie rond v20.x en een Homey CLI versie-output.

---

## Stap 2 — Maak een GitHub repository

### Wat doen we?
Op GitHub maak je een nieuw repository aan, bijvoorbeeld:
`homey-music-assistant`

### Waarom?
GitHub is je centrale back-up, samenwerking en basis voor CI/CD.

### Instellingen (aanbevolen)
- Visibility: **Private** (later kun je naar Public)
- **README toevoegen uitzetten** (we doen lokaal een eerste commit)
- **.gitignore uitzetten** (maken we lokaal)
- **License uitzetten** (voegen we lokaal toe, bijv. MIT)

---

## Stap 3 — Maak lokaal projectmap en initialiseer Git

### Wat doen we?
Maak een map en initieer git.

### Waarom?
Je start met een schone, controleerbare basis.

```bash
mkdir homey-music-assistant
cd homey-music-assistant
git init
```

---

## Stap 4 — Bootstrap de Homey app basis

### Wat doen we?
Genereer een Homey app skeleton.

### Waarom?
Dit maakt direct de juiste SDK v3 basisstructuur.

```bash
homey app create
```

Kies tijdens de wizard:
- SDK: **v3**
- JavaScript
- App-id (bijv. `com.jouwnaam.musicassistant`)
- App-naam: `Music Assistant`

---

## Stap 5 — Basis projectstructuur uitbreiden

### Wat doen we?
Maak de mappen die je later nodig hebt.

### Waarom?
Een nette structuur voorkomt chaos zodra de app groeit.

```bash
mkdir -p src/lib src/flow/actions docs .github/workflows .github/ISSUE_TEMPLATE assets locales
```

Voeg kernbestanden toe:
- `README.md`
- `CHANGELOG.md`
- `LICENSE` (MIT)
- `docs/architecture.md`
- `docs/api-notes.md`

---

## Stap 6 — Koppel lokaal repo aan GitHub

### Wat doen we?
Voeg remote toe en push.

### Waarom?
Nu staat je lokale werk veilig op GitHub.

```bash
git remote add origin git@github.com:<jouw-account>/homey-music-assistant.git
# of HTTPS:
# git remote add origin https://github.com/<jouw-account>/homey-music-assistant.git

git branch -M main
git add .
git commit -m "chore: bootstrap Homey Music Assistant project"
git push -u origin main
```

---

## Stap 7 — Zet codekwaliteit direct aan

### Wat doen we?
Voeg ESLint + Prettier toe.

### Waarom?
Consistente stijl en minder fouten vanaf dag 1.

```bash
npm i -D eslint prettier eslint-config-prettier
npx eslint --init
```

Minimale scripts in `package.json`:
```json
{
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "node --test"
  }
}
```

---

## Stap 8 — Voeg CI toe via GitHub Actions

### Wat doen we?
Maak workflow `.github/workflows/ci.yml`.

### Waarom?
Elke push/check draait automatisch lint + test.

Minimale CI:
```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm test
```

---

## Stap 9 — Start met Music Assistant client (MVP)

### Wat doen we?
Maak `src/lib/musicAssistantClient.js` met methodes:
- `getPlayers()`
- `getGroups()`
- `getRadioStations()`
- `getPlaylists()`
- `searchTracks(query)`
- `playMedia(target, media)`
- `announce(targets, message, options)`

### Waarom?
Eén centrale API-client houdt je app onderhoudbaar en testbaar.

---

## Stap 10 — Bouw daarna pas de Flow cards

### Wat doen we?
Maak action cards met dropdown/autocomplete.

### Waarom?
Eerst backend stabiel, daarna UX erbovenop. Dat werkt sneller en betrouwbaarder.

---

## Handige werkvolgorde per feature

1. Kleine taak kiezen (bijv. `getPlayers`).
2. Code schrijven.
3. Lint/test draaien.
4. Commit met Conventional Commit.
5. Push en PR.

Voorbeeld commit messages:
- `feat(flow): add play radio station action card`
- `feat(client): add searchTracks with timeout handling`
- `docs: document MA API assumptions`

---

## Als je wilt, doen we hierna direct stap 1 t/m 4 samen

Dan begeleid ik je command-voor-command met controles (wat je moet zien, en wat te doen bij errors).
