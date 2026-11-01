# Rowan's Learning World — Design System (`DESIGN.md`)

Synthesized from **`ui-ux-pro-max`** (Claymorphism + Kid UX Heuristics) and **`impeccable`** (`delight`, `animate`, `bolder`, `colorize`).

## 1. Product & Audience Context
- **Primary User**: Rowan (age 5, emergent reader using phonics for 3–4 letter CVC/CCVC words, learning addition/subtraction/number bonds/logic).
- **Secondary User**: Parents (on-demand skill mastery report, curriculum overrides, screen-time & bedtime guard, multi-device Cloud Firestore sync).
- **Target Surfaces**:
  1. **Modern Touch & Desktop** (Laptop, Phone, Modern Tablet) — full 3D Claymorphism, spring physics, and animated SVG worlds.
  2. **Living Room TV** (Chromecast with Google TV via sideloaded APK + D-pad remote) — 10-foot UI legibility, glowing high-contrast spatial focus ring, zero hover dependence.
  3. **Legacy Tablet** (iPad on iOS 9.3.5 via differential `<script nomodule>` + `/legacy.css`) — graceful flexbox & static shadow fallback with zero compromise to modern devices.

## 2. Delight & Motion Thesis (`impeccable`)
- **Delight Thesis**: *"Every button, letter tile, and island feels like a chunky, squishy physical toy inside a living storybook world where Rowan's companion reacts to his effort."*
- **Motion Thesis**:
  - **Immediate Tactile Squish (`120–180ms`)**: Pressing or selecting any button, tile, or choice card compresses its 3D bottom lip (`translateY(5px) scale(0.97)`) and rebounds with a spring curve (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
  - **Companion Empathy**: The theme helper (`Pip` the Parrot, `Bolt` the Robot, `Scout` the Rescue Pup, `Blaze` the Creature Dragon) visibly chatters when speaking and jumps with sparkles (`mood="cheer"`) when Rowan solves a problem.
  - **Compositor-First & Accessible**: Animate `transform` and `opacity` on the compositor thread; dampen continuous motion under `@media (prefers-reduced-motion: reduce)` while preserving clear color/state feedback.

## 3. Claymorphism Tokens (`ui-ux-pro-max`)
- **Typography**: `"Fredoka Variable", "Fredoka", "Nunito", ui-rounded, system-ui, sans-serif` — rounded terminals that mirror early-reader print letterforms (`a`, `g`, `t`).
- **3D Toy Surfaces**:
  - **Cards & Choice Tiles**: Thick `4px–5px` light rim (`rgba(255,255,255,0.88)`), inner top specular gloss (`inset 0 4px 6px rgba(255,255,255,0.75)`), inner bottom clay shading (`inset 0 -6px 10px rgba(0,0,0,0.08)`), and a solid 3D lip (`0 9px 0 rgba(0,0,0,0.22), 0 18px 30px rgba(0,0,0,0.24)`).
  - **Tap Targets**: Minimum `64px × 64px` (`150px+` for primary answer cards).
