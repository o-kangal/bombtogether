import { SINGLE_COLS, SINGLE_ROWS, COOP_COLS, COOP_ROWS } from './config.js';
import { state } from './state.js';
import { updateHUD, hideBanner } from './ui.js';

export function startLevel(lvl) {
  state.currentLevel = lvl;
  state.gameState = "PLAYING";
  hideBanner();

  if (state.mode === "COOP") {
    state.cols = COOP_COLS;
    state.rows = COOP_ROWS;
  } else {
    state.cols = SINGLE_COLS;
    state.rows = SINGLE_ROWS;
  }

  state.bombs = [];
  state.explosions = [];
  state.items = [];
  state.enemies = [];
  state.floatingTexts = [];
  state.exitDoor = { r: -1, c: -1, unlocked: false };

  // Setup Player 1 spawn
  state.players.p1.x = 1.15;
  state.players.p1.y = 1.15;
  state.players.p1.facing = "DOWN";
  state.players.p1.respawnTimer = 0;
  if (state.players.p1.lives <= 0) {
    state.players.p1.alive = false;
  } else {
    state.players.p1.alive = true;
    state.players.p1.invincibleTimer = 60;
  }

  // Setup Player 2 spawn in Co-op mode
  if (state.mode === "COOP") {
    state.players.p2.x = state.cols - 2 + 0.15;
    state.players.p2.y = state.rows - 2 + 0.15;
    state.players.p2.facing = "UP";
    state.players.p2.respawnTimer = 0;
    if (state.players.p2.lives <= 0) {
      state.players.p2.alive = false;
    } else {
      state.players.p2.alive = true;
      state.players.p2.invincibleTimer = 60;
    }
  }

  state.grid = [];
  const brickCandidates = [];

  for (let r = 0; r < state.rows; r++) {
    state.grid[r] = [];
    for (let c = 0; c < state.cols; c++) {
      const isP1Spawn = (r <= 2 && c <= 2);
      const isP2Spawn = (state.mode === "COOP" && r >= state.rows - 3 && c >= state.cols - 3);

      if (r === 0 || r === state.rows - 1 || c === 0 || c === state.cols - 1) {
        state.grid[r][c] = 1;
      } else if (r % 2 === 0 && c % 2 === 0) {
        state.grid[r][c] = 1;
      } else if (isP1Spawn || isP2Spawn) {
        state.grid[r][c] = 0;
      } else {
        if (Math.random() < 0.60) {
          state.grid[r][c] = 2;
          brickCandidates.push({ r, c });
        } else {
          state.grid[r][c] = 0;
        }
      }
    }
  }

  shuffleArray(brickCandidates);

  if (brickCandidates.length > 0) {
    const doorSpot = brickCandidates.pop();
    state.exitDoor.r = doorSpot.r;
    state.exitDoor.c = doorSpot.c;
  }

  const powerupPool = ["BOMB", "FIRE", "SPEED"];
  if (state.mode === "COOP") powerupPool.push("LIFE");

  const totalItemsCount = Math.max(3, Math.floor(brickCandidates.length * 0.16));

  for (let i = 0; i < totalItemsCount && brickCandidates.length > 0; i++) {
    const spot = brickCandidates.pop();
    const type = powerupPool[i % powerupPool.length];
    state.items.push({
      r: spot.r,
      c: spot.c,
      type,
      revealed: false,
      immunityTimer: 0
    });
  }

  const enemyCount = state.mode === "COOP"
    ? Math.min(3 + state.currentLevel, 9)
    : Math.min(2 + state.currentLevel, 7);

  const spawnSpots = [
    { r: 1, c: state.cols - 2 },
    { r: state.rows - 2, c: 1 },
    { r: 5, c: 7 },
    { r: 7, c: 9 },
    { r: 3, c: 11 },
    { r: 9, c: 5 }
  ];

  for (let i = 0; i < enemyCount; i++) {
    const spot = spawnSpots[i % spawnSpots.length];
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