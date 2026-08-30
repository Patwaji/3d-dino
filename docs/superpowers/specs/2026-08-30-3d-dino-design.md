# 3D Dino — Design

Date: 2026-08-30
Status: Approved

## Summary

A 3D remake of the Chrome offline T-Rex runner. Gameplay is identical to the original — endless side-scrolling, jump and duck only, one hit ends the run. The change is entirely presentational: real 3D models, real lights and shadows, and a three-quarter camera instead of a flat side view.

Built by hand in vanilla JavaScript with Three.js, as a learning project.

## Decisions

| Decision | Choice |
| --- | --- |
| Gameplay change | None. Mechanics match the original exactly. |
| Visual approach | Real 3D meshes, lit and shadowed. Not a 2D game in a 3D costume. |
| Camera | Three-quarter offset, ~30–40° off the run line, raised and pulled back. |
| Models | Pre-made CC0 asset packs, not hand-modelled. |
| Scope | Full faithful feature set of the original. |
| Stack | Three.js + Vite + vanilla JS. No framework, no physics library. |

### Working style

This is a learning project. Every implementation step is explained in plain language *before* its code is written. Code ships with no comments and no filler — explanation lives in conversation, not in the source. Commits carry no AI co-author trailer.

## Assets

| Asset | Source | Licence |
| --- | --- | --- |
| T-Rex (rigged: Run, Jump, Death) | Quaternius — Animated Dinosaurs | CC0 |
| Pterodactyl | Quaternius flying set | CC0 |
| Cactus, rocks, ground props | Kenney nature/desert packs | CC0 |

Models are downloaded into `public/models/` and committed to the repo. No CDN — the game runs fully offline, in keeping with the original.

## Architecture

One file per responsibility. Each module is small enough to read in one sitting, with a single job and an explicit interface.

### Engine layer

- **`scene.js`** — renderer, scene, lights, shadow map config, fog, resize handling.
- **`camera.js`** — the three-quarter rig: position, lookAt target, aspect updates. Optional speed-linked drift is added here later without touching anything else.
- **`assets.js`** — `GLTFLoader`, asset manifest, load-once cache, and a clone helper.

### Game layer

- **`game.js`** — state machine (`waiting` → `playing` → `gameover`), owns update order.
- **`player.js`** — dino state (running / jumping / ducking / dead), jump physics, `AnimationMixer` and clip crossfading, hitbox.
- **`obstacles.js`** — spawner, object pool, cactus clusters and pterodactyl heights, recycling.
- **`world.js`** — ground segment scrolling and recycling, background props, day/night cycle.
- **`collision.js`** — pure AABB overlap test. No dependencies.
- **`score.js`** — distance-to-score conversion, localStorage high score, milestone events.

### Shell

- **`input.js`** — keyboard and touch, normalised into intents (`jump`, `duck`, `restart`).
- **`ui.js`** — DOM overlay for score, high score, game over, and the loading screen. HTML text rather than 3D text: sharper and free.
- **`audio.js`** — jump, milestone, and death sounds.
- **`main.js`** — bootstrap and the `requestAnimationFrame` loop.

### Core principle: the world moves, the dino does not

The dino stays at x = 0 for the entire run; only its Y changes. Obstacles and ground segments travel toward it and are recycled once behind the camera.

This keeps collision as a distance check near the origin, keeps the scene out of float-precision trouble on long runs, and means the same recycling pattern serves both ground and obstacles.

### Loop timing

Delta-time based, using `clock.getDelta()` clamped to ~50 ms so a backgrounded tab cannot teleport the player into an obstacle on return. All velocities are expressed in units per second, making behaviour framerate-independent.

## Mechanics

Values are ported from the original and converted from pixels-per-frame to units-per-second. They are starting points for tuning, not fixed constants.

### Speed

- Start: 6 u/s
- Acceleration: 0.05 u/s²
- Cap: 13 u/s

### Jump

Single impulse with constant gravity. No double jump, no air control. Tuned to roughly 0.62 s of hang time and a 1.7 unit peak — enough to clear a large cactus with a small margin.

Releasing the jump key early cuts upward velocity, giving a variable-height jump. This is what makes the jump feel controlled rather than scripted.

### Duck

Swaps to the duck animation clip and shortens the hitbox; position is unchanged. Ducking while airborne applies a fast-fall, matching the original. This is the main source of skill expression in the game.

### Obstacles

- **Cactus:** clusters of 1–3, small or large, ground-level.
- **Pterodactyl:** three heights — low (jump required), mid (duck required), high (passes overhead, a deliberate fake-out). Spawning begins past 450 points.

Spawn gaps are computed as a randomised multiple of *current speed*, not a fixed distance, so spacing stays clearable at maximum speed. Every spawn must be reachable; unfair deaths are a bug.

### Collision

Axis-aligned bounding boxes, dino against obstacle, with boxes inset slightly from the visual meshes. Forgiving hitboxes are deliberate — the difference between a fair loss and a frustrating one.

### Death and restart

All motion freezes, the death clip plays, the camera punches in slightly, and the game-over overlay appears. Any key restarts.

### Day/night

Every 700 points, fog colour, background colour, and light intensity lerp to the alternate palette over roughly 2 seconds. Same geometry, different lighting.

## Rendering

- Perspective camera, fov ~45.
- `WebGLRenderer` with antialiasing; `pixelRatio` capped at 2.
- One directional light casting shadows, plus a hemisphere light for fill. The shadow camera frustum is fitted tightly to the play area — a loose frustum is the usual cause of low-quality shadows.
- Fog matched to the background colour conceals the end of the ground plane, so the world reads as endless without drawing more of it.
- Ground is built from tiled segments that recycle, rather than one large plane, so props can sit on them and the recycling logic is shared with obstacles.

### Skinned mesh cloning

Rigged models must be cloned with `SkeletonUtils.clone()`. A plain `.clone()` shares the skeleton, causing every instance to animate in lockstep.

### Performance

Target is 60 fps on a mid-range laptop. All obstacles, ground segments, and props come from object pools; nothing is allocated during play. Instancing is available if prop counts ever justify it, but pooling alone is expected to be sufficient.

## Failure handling

| Failure | Behaviour |
| --- | --- |
| Asset load fails | Visible error on the loading screen, not a black void. |
| WebGL unavailable | Plain HTML fallback message. |
| `localStorage` blocked | High score kept in memory; the game still runs. |
| Tab loses focus | Auto-pause; the delta clamp covers the resume. |
| Window resize | Camera aspect and renderer size updated. |

## Testing

Automated tests cover pure logic only, using Vitest:

- **`collision.js`** — overlap true/false, edge-touching cases, ducked hitbox dimensions.
- **Spawn spacing** — never produces an unclearable gap at maximum speed.
- **`score.js`** — distance-to-score conversion, high score persistence and fallback.

Everything else is game feel, which is verified by playing it. No mocking of Three.js and no render snapshots — high cost, no signal.

## Build order

Each milestone produces something visible or playable.

1. Vite project with a spinning cube — verifies the toolchain.
2. Scene, lights, shadows, ground, camera rig — the empty world.
3. Load the T-Rex and play its run clip.
4. Input, jump physics, duck, animation crossfading.
5. Ground segment recycling — the world moves.
6. Obstacle spawner and pool.
7. Collision, death, restart.
8. Score, high score, UI overlay.
9. Pterodactyls, speed ramp, day/night cycle.
10. Sound, polish, and optional speed-linked camera drift.

## Explicitly out of scope

- Lane changing, steering, or any movement beyond jump and duck.
- Power-ups, biomes, weather, or other mechanics the original lacks.
- Hand-modelled assets. Custom models may replace the CC0 packs later; the loader code will not change.
- Multiplayer, leaderboards, or any backend.
