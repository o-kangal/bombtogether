import { SINGLE_COLS, SINGLE_ROWS } from './config.js';

function createPlayer(x, y, facing = "DOWN") {
  return {
    x,
    y,
    size: 26,
    speedLevel: 1,
    speed: 2.5,
    maxBombs: 1,
    bombRange: 1,
    facing,
    animFrame: 0,
    alive: true,
    lives: 3,
    invincibleTimer: 0,
    respawnTimer: 0
  };
}

export const state = {
  mode: "SINGLE", // "SINGLE" | "COOP"
  role: "HOST",   // "HOST" | "CLIENT"
  currentLevel: 1,
  score: 0,
  gameState: "LOBBY", // "LOBBY" | "PLAYING" | "LEVEL_CLEARED" | "GAME_OVER"

  cols: SINGLE_COLS,
  rows: SINGLE_ROWS,

  players: {
    p1: createPlayer(1.15, 1.15, "DOWN"),
    p2: createPlayer(1.15, 1.15, "UP")
  },

  grid: [],
  bombs: [],
  explosions: [],
  items: [],
  enemies: [],
  exitDoor: { r: -1, c: -1, unlocked: false },
  floatingTexts: [],

  keys: {},

  remoteKeys: {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,
    Space: false,
    KeyE: false
  }
};

export function resetPlayerStats(player) {
  player.maxBombs = 1;
  player.bombRange = 1;
  player.speed = 2.5;
  player.speedLevel = 1;
  player.lives = 3;
  player.alive = true;
  player.invincibleTimer = 0;
  player.respawnTimer = 0;
}