# RAIDRUN Interactive Prototype: PRD for Antigravity

> How to use: put the reference images in `/design` (see section 2), paste the **Kickoff Prompt** (section 12) into Antigravity, set the agent to **Planning** mode, and run **one milestone per task** (section 10). Review the plan before approving each one.

## 1. Product summary
RAIDRUN is a gamified running app. Runners near each other fight a shared **Raid Boss**: every kilometer run adds damage to the boss's HP. The app also shows a map with popular spots, water stations, community-rated routes, official running events, a party leaderboard, quests, and a ghost-runner mode.

This build is an **interactive prototype** for usability testing and demos, not a production app. It runs in a mobile browser from a public link, with a stylized 3D low-poly island world as the map.

## 2. Reference material (source of truth for look and feel)
Export these from Figma as PNG at 2x into `/design`:
- `screens/`: map with avatar, raid lobby ("128 Runners Joined", START RAID), raid battle, raid results, raid victory summary, run complete (+XP, coins), events discovery, "You're In!" RSVP, party leaderboard, profile.
- `characters/`: Mint (runner avatar), Magmo (lava creature), Crystie (crystal mascot).
- `icons/`: isometric map icon sheet (bridge, trees, shops, gym, raid portal, event marker, water station, chest, gift, flag).

**Important:** the existing Figma screens are flattened raster images with inconsistent aspect ratios, so they have no real padding or components. Use them **only as visual reference**. Rebuild every screen as real UI. Do not paste the images in as backgrounds.

Extract design tokens (primary mint/teal, accent orange, text colors, corner radii, shadow style) from the references and write them to `src/styles/tokens.css` before building screens. Font: a rounded sans (e.g., Nunito or Poppins).

## 3. Goals
1. Every screen fits a modern phone with correct padding and safe areas.
2. A public URL anyone can open on a phone and try; installable as a PWA.
3. A navigable 3D island map with the runner avatar, a raid portal, and event/water markers.
4. A complete demo loop: Map → Raid lobby → Run (simulated) → Raid results → Run complete.
5. Fast first load and smooth animation on mid-range phones.

## 4. Non-goals (do not build)
Real multiplayer backend, accounts and login, payments, push notifications, native iOS or Android builds, and AI features. All "other runners", events, and leaderboards use **seeded mock data**. Label the prototype clearly in the UI footer or About page.

## 5. Target device and layout rules
- Primary test viewport: **iPhone 17, 402 x 874 CSS px**. Also verify 390 x 844 and 360 x 800.
- Mobile-first. On desktop, show the app centered in a phone-sized frame (max width 430 px).
- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
- Respect safe areas on every screen and fixed bar: `env(safe-area-inset-top|bottom|left|right)`.
- Minimum page padding **16 px** from every screen edge. No component may touch or clip at an edge. Minimum touch target **44 x 44 px**.
- Use Flexbox or Grid with relative units. No fixed pixel widths copied from images.
- Bottom tab bar (always visible, above the home indicator): **Map, Run, Raid, Party, Profile**.
- Use `100dvh`, never `100vh`.

## 6. Tech stack
Vite + React + TypeScript; Three.js through `@react-three/fiber` and `@react-three/drei`; Zustand for state; CSS variables for tokens; `vite-plugin-pwa` for the manifest and service worker. Deploy to Vercel, Netlify, or Firebase Hosting (HTTPS required). No backend.

## 7. Screens and components
1. **Map (home).** 3D island scene fills the screen behind a top HUD (avatar chip, level/XP bar, weather, labeled energy bar) and the tab bar. Markers: raid portal with boss silhouette, event marker, water station, popular spot. Tap a marker to open a bottom sheet. Companion Crystie follows the avatar.
2. **Raid lobby.** Boss name ("Ember Titan"), HP bar, countdown, avatar list with "128 runners joined", **START RAID** button.
3. **Run (simulated multiplayer raid).** Large distance, pace, moving time; animated running Mint sprite facing the boss over a scrolling background. Multiplayer raid rules (like Pokémon GO):
   - The raid ends **only** when the Boss HP reaches `0`. There is **no Pause button**.
   - Boss HP decreases continuously from both the **user's live run distance** AND **simulated other runners** (mock community damage ticking down over time).
   - A **"Demo speed"** toggle makes the boss be defeated in about **45 seconds** so a tester can complete the entire flow quickly. Optional real GPS behind a toggle using the Geolocation API, off by default.
   - While Boss HP > `0`, show a **"Leave Raid"** button instead of Finish. Tapping "Leave Raid" opens a confirmation dialog; confirming leaves the raid, keeps the distance run so far, and goes directly to the Run Complete summary **without** the "Raid Victory" banner.
   - When Boss HP reaches `0`, automatically navigate to **Raid results**, and from there to **Run complete** with the **"Raid Victory"** banner and rewards (XP, coins) dynamically calculated from the run and persisted to the Zustand store.
4. **Raid results.** Ranked list of runners (rank, name, distance, damage), your row highlighted, Continue button.
5. **Raid victory / Run complete.** Distance, avg pace, moving time, calories, raid damage, +XP, +coins, earned badges, **Claim Rewards**. Light confetti animation (positioned so it never overlaps the title). Shows the **"Raid Victory"** banner only if the boss was defeated (`bossHp === 0`), with all metrics and rewards consistent with the completed run.
6. **Events.** Event list and detail (name, distance, participants, countdown), RSVP flow ending in a "You're In!" confirmation.
7. **Party.** Party members, velocity stat, weekly leaderboard.
8. **Profile.** Avatar (Mint), distance, pace, streak, badges, daily/weekly quests with progress bars.
9. **Ghost runner** option inside the Run screen: race a personal record (mock data).

## 8. 3D world spec
- Style: soft low-poly isometric island, bright mint/teal palette, soft shadows, gentle animated water. Camera: fixed three-quarter view; drag to rotate within limits; pinch to zoom within limits.
- Avatar: low-poly runner in a mint outfit with idle and run animation. If no model is available, build a simple procedural character from primitives and keep it swappable for a `.glb` later.
- Environment: trees, bushes, benches, lamp posts, path, bridge, water, small buildings (cafe, gym). Start with **procedural primitives**; allow `.glb` swap-in from free CC0 low-poly packs.
- Raid portal: glowing ring with a floating boss silhouette (billboard sprite from the Magmo or Ember Titan art is acceptable).
- Performance: cap pixel ratio at 2, instance repeated objects, target 60 fps on a mid-range phone, keep initial JS under about 1.5 MB gzipped, lazy-load the 3D scene, show a lightweight loading screen.
- Provide a **2D fallback** (static illustrated map) if WebGL is unavailable.

### 8.1 Art direction and visual quality bar
**Decision to confirm before building (pick ONE and tell the agent):**
- **Option A (default): RAIDRUN's own style.** Soft, rounded, bright mint/teal, as in the Mint, Magmo, and Crystie art. Borrow only the *techniques* from the reference below.
- **Option B: Messenger-like style.** Ink-outlined cel-shaded look. This would require restyling the characters and icons, so only choose it if the team accepts that.
Do not mix the two styles in one scene.

**Reference: https://messenger.abeto.co** (screenshots in `/design/world-reference/`). Observed traits, to borrow as techniques:
- **Toon (cel) shading:** banded light and shadow, few color steps, almost no soft gradients.
- **Ink outlines:** dark outlines on objects (inverted-hull or edge-detection post-process); slightly irregular edges give a hand-drawn feel.
- **Posterized sky and ground:** clouds and grass as flat color shapes, not photographic textures.
- **Tight palette:** teal sky with muted grays and greens, with a few strong accent colors (orange, yellow, red) for interactive objects.
- **Small-planet / diorama framing** and a **third-person follow camera** behind the character.
- **Game UI as chunky "paper cards"** with thick outlines and a pixel-style display font. (For RAIDRUN, keep the mint rounded UI from the Figma references instead.)
- Bloom, heavy ambient occlusion, and realistic PBR are **not** part of this look; keep post-processing minimal and cheap.

**Rules for the agent:**
- Implement toon shading with a gradient ramp material and an outline pass behind a quality setting.
- Use authored `.glb` props where possible (CC0 low-poly packs or generated); raw primitives only as placeholders. Compress textures (WebP/KTX2) and meshes (meshopt/Draco).
- Techniques worth reusing (observed in the reference's network capture, not copied code): Draco-compressed geometry, KTX2/Basis compressed textures, a single color-grading LUT texture to unify the palette, small noise textures driving water and cloud shaders, heavy work (decoding, geometry) moved to web workers, and one base-resolution 3D scene split into regions that load on demand.
- Motion: eased camera, idle animations, animated water, small particles. Nothing static.
- Quality tiers: **High / Low** presets; Low disables outlines and effects and can fall back to the 2D map.
- After each visual pass, show a screenshot next to the reference and list what still differs.
- Scope the world to what the app needs: island terrain, path, water, trees, a few buildings, raid portal, event and water markers, and the avatar. Do not try to rebuild a full detailed city.

## 9. Mock data and state
Keep all data in `src/data/mock.ts` (runners, events, quests, leaderboard, boss). State in a Zustand store: current run (distance, time, pace), boss HP, XP/coins, RSVP'd events. Boss HP = total mock community distance minus the user's live run distance.

## 10. Milestones (run one per agent task)
1. **Foundation:** project scaffold, tokens, phone frame, safe-area utilities, bottom tab bar, routing, PWA setup. *Verify at 402x874.*
2. **Static screens:** build all screens (section 7) as responsive UI with mock data, no 3D yet.
3. **3D map:** island scene, avatar, markers, bottom sheet, 2D fallback, performance pass.
4. **Run loop:** simulated run, boss HP updates, results, rewards, confetti, optional GPS toggle.
5. **Polish and QA:** animations, empty/loading states, accessibility (contrast, labels, focus), audit of padding and touch targets, deploy, README.

## 11. Acceptance criteria
- On 402x874, 390x844, and 360x800: no horizontal scroll, no clipped or edge-touching components, 16 px minimum padding, tab bar clear of the home indicator.
- All screens match the reference look (colors, radii, typography) without using the images as backgrounds.
- The demo loop works end to end with no console errors.
- Lighthouse mobile performance of at least 80 for the home route; PWA installable.
- A public deployed URL, and a README explaining setup, deploy, and how mock data works.
- The agent attaches **browser screenshots at all three viewports** for each milestone as artifacts.

## 12. Kickoff Prompt (paste into Antigravity)
```
You are building "RAIDRUN", a mobile-first interactive prototype of a gamified running app. Read PRD.md in this workspace in full, then inspect the reference images in /design.

Rules:
1. Treat /design images as visual reference only. Rebuild every screen as real, responsive UI. Never use the images as screen backgrounds.
2. Target iPhone 17 (402x874 CSS px) and also check 390x844 and 360x800. Respect env(safe-area-inset-*), keep at least 16px padding from all screen edges, 44px minimum touch targets, use 100dvh.
3. Stack: Vite, React, TypeScript, @react-three/fiber, drei, Zustand, vite-plugin-pwa. No backend; all data is mock data in src/data/mock.ts.
4. Work in Planning mode. First produce an implementation plan for Milestone 1 only and wait for my approval. After each milestone, run the app in the browser, capture screenshots at the three viewports, list any layout issue you found and fixed, and stop.
5. Do not add features outside the PRD. If something is ambiguous, ask me.

Start with Milestone 1.
```

## 13. Notes for the research paper
This build lets the team run a real usability test (e.g., the System Usability Scale with 5 to 8 participants completing the task "join a raid and finish a run") and report it in the Test stage. Keep the prototype's mock-data nature explicit in the paper.
