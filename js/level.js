import { ROWS, COLS } from './config.js';
import { state } from './state.js';
import { updateHUD, hideBanner } from './ui.js';

export function startLevel(lvl) {
  state.currentLevel = lvl;
  state.gameState = "PLAYING";
  hideBanner();

  state.bombs = [];
  state.explosions = [];
  state.items = [];
  state.enemies = [];
  state.floatingTexts = [];
  state.exitDoor = { r: -1, c: -1, unlocked: false };

  state.player.x = 1.15;
  state.player.y = 1.15;
  state.player.alive = true;
  state.player.facing = "DOWN";

  // Grid initialization (1: Hard Wall, 2: Destructible Brick, 0: Empty)
  state.grid = [];
  const brickCandidates = [];

  for (let r = 0; r < ROWS; r++) {
    state.grid[r] = [];
    for (let c = 0; c < COLS; c++) {
      if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) {
        state.grid[r][c] = 1;
      } else if (r % 2 === 0 && c % 2 === 0) {
        state.grid[r][c] = 1;
      } else if (r <= 2 && c <= 2) {
        state.grid[r][c] = 0; // Safe player spawn zone
      } else {
        if (Math.random() < 0.62) {
          state.grid[r][c] = 2;
          brickCandidates.push({ r, c });
        } else {
          state.grid[r][c] = 0;
        }
      }
    }
  }

  shuffleArray(brickCandidates);

  // Hide exit door behind a brick
  if (brickCandidates.length > 0) {
    const doorSpot = brickCandidates.pop();
    state.exitDoor.r = doorSpot.r;
    state.exitDoor.c = doorSpot.c;
  }

  // Distribute power-ups under bricks
  const itemTypes = ["BOMB", "FIRE", "SPEED"];
  const itemCount = Math.min(3 + state.currentLevel, 6);

  for (let i = 0; i < itemCount && brickCandidates.length > 0; i++) {
    const spot = brickCandidates.pop();
    const type = itemTypes[i % itemTypes.length];
    state.items.push({
      r: spot.r,
      c: spot.c,
      type,
      revealed: false,
      immunityTimer: 0
    });
  }

  // Spawn enemy entities
  const enemyCount = Math.min(2 + state.currentLevel, 7);
  const enemySpawnSpots = [
    { r: ROWS - 2, c: COLS - 2 },
    { r: 1, c: COLS - 2 },
    { r: ROWS - 2, c: 1 },
    { r: 5, c: 9 },
    { r: 7, c: 5 },
    { r: 3, c: 9 }
  ];

  for (let i = 0; i < enemyCount; i++) {
    const spot = enemySpawnSpots[i % enemySpawnSpots.length];
    state.grid[spot.r][spot.c] = 0;
    state.grid[Math.max(1, spot.r - 1)][spot.c] = 0;
    state.grid[spot.r][Math.max(1, spot.c - 1)] = 0;

    const isSmart = i >= 3 || state.currentLevel >= 3;
    state.enemies.push({
      x: spot.c + 0.15,
      y: spot.r + 0.15,
      dir: Math.floor(Math.random() * 4),
      speed: 1.0 + Math.min(state.currentLevel * 0.15, 0.8),
      type: isSmart ? "BLUE_GHOST" : "RED_BALLOM",
      alive: true
    });
  }

  updateHUD();
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}