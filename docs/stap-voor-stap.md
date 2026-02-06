# Step-by-step: set up the Homey Music Assistant project (local + GitHub)

This guide is written for beginners. Each step explains what you do and why.

---

## Step 1 - Install the basics

### What

Install:

- Node.js 20 (LTS)
- Git
- VS Code (or another editor)
- Homey CLI

### Why

- Node.js runs your app and tooling.
- Git keeps version history.
- An editor makes development easier.
- Homey CLI is needed to run/test Homey apps locally.

### Commands

```bash
node -v
git --version
npm i -g homey
homey --version
```

Expected: a Node version around v20.x and a Homey CLI version output.

---

## Step 2 - Create a GitHub repository

### What

On GitHub, create a new repository, for example:
`homey-music-assistant`

### Why

GitHub is your central backup, collaboration, and CI/CD base.

### Recommended settings

- Visibility: Private (you can switch to Public later)
- Disable Add a README (we will commit locally first)
- Disable .gitignore (we create it locally)
- Disable License (we add it locally, for example MIT)

---

## Step 3 - Create a local project folder and initialize Git

### What

Create a folder and initialize git.

### Why

You start with a clean, controlled base.

```bash
mkdir homey-music-assistant
cd homey-music-assistant
git init
```

---

## Step 4 - Bootstrap the Homey app

### What

Generate a Homey app skeleton.

### Why

This gives you the correct SDK v3 structure immediately.

```bash
homey app create
```

Choose during the wizard:

- SDK: v3
- JavaScript
- App id (for example `com.yourname.musicassistant`)
- App name: `Music Assistant`

---

## Step 5 - Extend the project structure

### What

Create the folders you will need later.

### Why

A clean structure prevents chaos as the app grows.

```bash
mkdir -p src/lib src/flow/actions docs .github/workflows .github/ISSUE_TEMPLATE assets locales
```

Add core files:

- `README.md`
- `CHANGELOG.md`
- `LICENSE` (MIT)
- `docs/architecture.md`
- `docs/api-notes.md`

---

## Step 6 - Connect the local repo to GitHub

### What

Add the remote and push.

### Why

Your local work is now backed up on GitHub.

```bash
git remote add origin git@github.com:<your-account>/homey-music-assistant.git
# or HTTPS:
# git remote add origin https://github.com/<your-account>/homey-music-assistant.git

git branch -M main
git add .
git commit -m "chore: bootstrap Homey Music Assistant project"
git push -u origin main
```

---

## Step 7 - Enable code quality from day one

### What

Add ESLint.

### Why

Consistent style and fewer mistakes from day 1.

```bash
npm i -D eslint
npx eslint --init
```

Minimal scripts in `package.json`:

```json
{
  "scripts": {
    "lint": "eslint .",
    "test": "node --test"
  }
}
```

---

## Step 8 - Add CI via GitHub Actions

### What

Create workflow `.github/workflows/ci.yml`.

### Why

Every push/check automatically runs lint and tests.

Minimal CI:

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

## Step 9 - Start the Music Assistant client (MVP)

### What

Create `src/lib/musicAssistantClient.js` with methods:

- `getPlayers()`
- `getGroups()`
- `getRadioStations()`
- `getPlaylists()`
- `searchTracks(query)`
- `playMedia(target, media)`
- `announce(targets, message, options)`

### Why

One central API client keeps your app maintainable and testable.

---

## Step 10 - Build Flow cards after the client

### What

Create action cards with dropdown/autocomplete.

### Why

Stabilize the backend first, then build UX on top. That is faster and more reliable.

---

## Music Assistant settings

- `ma_host`: required, the Music Assistant host (IP/hostname).
- `ma_port`: optional, default is 8095 (this is commonly the default MA port).
- `ma_token`: required bearer token (long-lived recommended).

### Create a long-lived bearer token

1. Settings
2. Users
3. Dropdown menu on the user tile (three dots)
4. Access tokens
5. New token
6. Copy the token and paste it into `ma_token` in Homey

Security note: keep the token secret.

---

## Handy feature workflow

1. Pick a small task (for example `getPlayers`).
2. Write code.
3. Run lint/tests.
4. Commit with Conventional Commit.
5. Push and open a PR.

Example commit messages:

- `feat(flow): add play radio station action card`
- `feat(client): add searchTracks with timeout handling`
- `docs: document MA API assumptions`

---

If you want, we can go through steps 1 to 4 together next.
