# 3D Dino

**Play:** https://3d-dino-three.vercel.app

A 3D remake of the Chrome offline T-Rex runner, built with Three.js and no game framework.

## Features

- Variable-height jumps (hold to jump higher) and fast-fall
- Cactus clusters and pterodactyls, with gaps that scale with speed
- Speed ramps up as you play, and the world cycles between day and night
- Four biomes with instanced foliage: Savanna, Bamboo, Jungle and Jurassic
- Score, high score, menu and sound

## Controls

| Key | Action |
| --- | --- |
| Space / W / Up | Jump (hold for higher) |
| S / Down | Fast-fall |

## Stack

Three.js · Vite · Vitest · plain JavaScript (ES modules)

## Code

The game is split into small modules in `src/`: `game.js` (loop), `player.js` (physics), `spawn.js` and `obstacles.js`, `collision.js`, `score.js`, `biomes.js` and `forest.js` (scenery), `camera.js`, `audio.js`. All tuning values live in `config.js`. Gameplay logic is covered by 47 unit tests in `tests/`.

## Run locally

```bash
npm install
npm run dev
npm test
```

## Credits

- T-Rex, cacti and foliage by Quaternius (CC0)
- "Pterablocktyls" by Hoai Nguyen, CC BY 4.0, from Poly Pizza
