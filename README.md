# Rowan's Learning World

A private, offline-first learning app (PWA) for a 5-year-old: phonics and arithmetic first, adventure on top.
Runs on phone, laptop and TV browsers from one codebase. Everything is stored on the device.

Created using Anthropic Claude. Keep this on internal versions until a human has reviewed and verified it.

## Run & Deploy

- **Live Hosted App:** https://rowan-learning-world-ap1.web.app

```bash
npm install
npm run dev        # http://localhost:5173 (also on your LAN: use the "Network" URL on the TV/phone)
npm test           # 96 tests: engine, generators, reports, cross-device sync, and UI flows
npm run build      # production build in dist/ (installable, works offline after first load)
npm run deploy     # builds and deploys to Firebase Hosting + Firestore
```

First run: create a player, then the **Treasure Hunt** placement sets his starting level for reading and math.
**Grown-ups** (lock icon): hold 3 seconds, solve a times-table, then create a 4-digit PIN.

## What is in version 1

- Players ("Who's playing?"), each with their own skills, level, theme, stickers and reports
- Placement Treasure Hunt: binary search up each skill ladder, no hints, no "wrong" sounds (about 8 to 14 questions per subject)
- Themes as skins: Pirate Adventure and Super Family (original characters and scenery drawn in SVG)
- Adaptive engine: weighted mastery 0-100, New / Practicing / Getting it / Mastered (2+ days), spaced review at 3, 7, 21 days,
  70/20/10 current/review/stretch mix, in-session up/down steps, frustration guard, parent focus pins and level caps
- Reading: Word Builder (drag or tap letters), Blend the Plank, Sight-word Cannon, Mystery story (The Missing Map)
- Math: Coin Count (count + compare), Treasure Add (add, make 10), Sneaky Thief (subtract), with support fading from coins to number line to bare numbers
- Skill games (feed the level engine): Number Bonds Bridge (make 10), Rhyme Ropes (rhyming), Captain's Log (following written directions), Group Names (collective nouns like a pride of lions, plus plurals like mouse and mice)
- Puzzle Cove / Brain Gym island (play only, not tracked as skills): Code Breaker (gem Mastermind), Tower Puzzle (Tower of Hanoi), Memory Match (pictures, letters, numbers), Echo Sequence, What's Missing?
- Games: Tic-Tac-Toe (easy/medium/grown-up), Number Maze (starts at 12x12 and grows to 30x30, collecting up to 6 numbers in order; one press runs along a corridor, level is remembered per player)
- Helper hints on every question: Nudge, Narrow, Show me, then Explain
- Missions: 5 short activities then a treasure chest (stars + stickers); no ads, no purchases, no streak punishment
- Parent Mode: levels (start here / cap / focus / reset), activity toggles, daily limit with 5-minute warning, bedtime lock, hint mode, allowed themes, voice speed, on-demand Captain's Report (today / last session / 7 / 30 days / custom, side by side, print to PDF, copy), export all data
- D-pad friendly: every screen works with arrows + Enter (Escape/Back goes back), 64px+ targets

## Adding things

- **New mini-app:** create `src/apps/MyGame.tsx`, add one entry to `src/core/registry.ts` (id, subject, skills it serves). The hub, missions, Parent toggles and reports pick it up. Skill-based games can reuse `Round` + `QuestionCard`.
- **New skill:** add it to `src/core/skills.ts` (order = ladder order) and a generator branch in `src/content/generators.ts`.
- **New words:** add to `src/content/words.json` under the skill id. Tiles and sounds are derived automatically.
- **New theme:** add an object to `src/core/themes.ts`. No game code changes.

## Known limits (worth knowing before you rely on it)

- **Phonics sounds use the browser's text-to-speech**, which can't say a clean /k/ or short vowel. Respellings live in `src/content/phonics.ts` (`SOUND_TEXT`) and may need tuning per device. For proper sounds, drop recordings at `public/audio/phonemes/<key>.mp3` (keys: `a`, `sh`, `a_e`...) and list the keys in `public/audio/phonemes/index.json`; they are used automatically.
- Look: illustrated SVG scenery, helpers (a parrot and a robot), coins and islands are original and built in code. Picture answers (animals, objects) are still emoji; swap in illustrations by theme later.
- Data lives in `localStorage` on each device (no sync yet). Use Parent Mode > Players & data > Export for a backup.
- Grown-up PIN is a speed bump for a child, not strong security.
- Not built yet: Sound Blaster, Rhyme Ropes, Captain's Log, Number Bonds Bridge, skip counting, other islands (science, geography, art), cloud sync, TV app wrapper, custom family content, optional AI explanations.
- Using real Paw Patrol / Toy Story / Incredibles characters is fine privately but can't be shared publicly; keep any such theme as a private pack.
