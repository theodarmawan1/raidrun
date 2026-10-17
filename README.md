# RAIDRUN — Interactive Gamified Running Prototype

> **Prototype — mock data**: This project is an interactive usability-testing and demo prototype built with React, TypeScript, Vite, and Zustand. All runner profiles, Raid Bosses, community damage ticks, events, party leaderboards, and routes run on simulated local mock data (`src/data/mock.ts`).

---

## Features Overview

- **2D Island Home World (`/`)**:
  - Scrollable/camera-following 2D island map (`2.5x` viewport height) where **Mint** walks via tap-to-move (`Free Walk — Distance counts in Raids`).
  - Four land-anchored ground markers (compact icon + name pill):
    1. **Raid Portal** (northern stone plaza at the end of the trail)
    2. **Live Event** (flat paved area near the wooden bridge)
    3. **Water Station** (grassy bank at the edge of the pond)
    4. **Popular Spot** (stone patio near the Park Cafe & wooden benches)
  - Contextual info cards appear only when Mint walks near a marker or when a marker is tapped.
- **Runner Hub (`/hub`)**:
  - Reached via the Flag button on the Home HUD.
  - 5 tabs: **Overview** (15-day streak, daily & weekly quests), **Raids** (past raid history: Glacio, Drakey, Magmo), **Routes** (GBK North Loop, Park Perimeter Run, Create New Route placeholder), **Events** (category filters & event list), and **RSVP** (confirmed events with QR check-in code and Cancel action).
- **Multiplayer Raid Loop (`/raid/lobby` → `/run` → `/raid/results` → `/run/complete`)**:
  - Pokémon GO–style shared Raid Boss battle (`Ember Titan`, `3,000 HP`).
  - Boss HP decreases from both the user's running distance and simulated fellow runners (`128 Runners Joined`).
  - Includes a **Demo Speed (`30x`)** toggle so testers can defeat the boss in ~45 seconds, or **Leave Raid** early with confirmation.
- **Map Discovery (`/map`)**:
  - Searchable spot directory with category filter chips (`Raids`, `Events`, `Water`, `Routes`) and an interactive tactical mini-map.
- **Events Discovery & RSVP Flow (`/events`)**:
  - Featured **RAIDRUN CITY MARATHON** banner with `JOIN` CTA, distance/runner/countdown chips, category tiles (`Easy Run`, `Night Run`, `Trail Challenge`), event detail modal, and `"You're In!"` confirmation modal synced with Zustand.
- **My Deck (`/deck`)**:
  - Boss collection grid (`3 / 12 Collected` initially: `Ember Titan`, `Glacio`, `Magma`, `Drakey`, plus locked `???` slots). Defeating a boss in a raid adds/updates it in the deck.
- **Party Leaderboard (`/party`)**:
  - `Velocity` party card with weekly goal progress (`142 / 200 KM`), member lineup, and weekly distance leaderboard synced with your run rewards.
- **Runner Profile (`/profile`)**:
  - Mint avatar, Level & XP bar, `Weekly` vs `Total` distance metrics, 6-stat summary grid, earned badges, and quick link to Hub quests.

---

## Getting Started

### 1. Prerequisites
- **Node.js** `>= 18.x` and **npm** `>= 9.x`

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open the local URL shown in the terminal (typically `http://localhost:5173`) in your browser or mobile device emulator.

### 4. Production Build & Preview
```bash
npm run build
npm run preview
```
`npm run build` runs TypeScript type-checking (`tsc -b`), bundles the app into `dist/`, and generates the PWA manifest (`manifest.webmanifest`) and Workbox service worker (`sw.js`).

---

## How Mock Data Works (`src/data/mock.ts` & `src/store/useAppStore.ts`)

All initial prototype data lives in **`src/data/mock.ts`**:
- `INITIAL_USER`: Runner level, XP (`3,200 / 4,000 XP`), energy (`30/30`), coins (`1,520`), `weeklyDistanceKm` (`42.5 KM`), `totalDistanceKm` (`145.2 KM`), and raid stats.
- `ACTIVE_RAID_BOSS`: `Ember Titan` (`3,000 HP`, reward XP/coins, lobby runner count).
- `BOSS_DECK` & `PAST_RAIDS`: Collected and encountered Raid Bosses (`Ember Titan`, `Glacio`, `Magma`, `Drakey`) and historical raid logs.
- `DISCOVERY_EVENTS` & `MAP_SPOTS`: Official running events, featured marathon metadata, water stations, and community routes.
- `PARTY_INFO`, `DAILY_QUESTS`, & `WEEKLY_QUEST`: Party members, weekly leaderboard standings, and quest progress.

Runtime state changes (claiming run XP/coins/distance, defeating a boss, RSVPing or canceling an event, toggling Demo Speed) are managed in **`src/store/useAppStore.ts`** via Zustand during the browser session. Refreshing the page resets the prototype back to the baseline mock state.

---

## Deploying to Vercel / Static Hosting

This repository includes a preconfigured **`vercel.json`** with SPA client-side route rewrites (`/(.*) -> /index.html`) and **PWA support** via `vite-plugin-pwa`.

### Deploy with Vercel CLI or Git Integration:
1. Push this repository to GitHub/GitLab/Bitbucket and import it into [Vercel](https://vercel.com), **or** run:
   ```bash
   npx vercel --prod
   ```
2. Vercel automatically detects Vite (`npm run build`, output directory `dist/`).
3. Open the deployed HTTPS URL on a phone browser and use **"Add to Home Screen"** to install RAIDRUN as a standalone full-screen PWA.
