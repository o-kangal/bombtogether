import { TILE } from './config.js';
import { state, resetPlayerStats } from './state.js';
import { AudioEngine } from './audio.js';
import { updateHUD, showBanner, setupBannerListener } from './ui.js';
import { canMoveTo, addFloatingText } from './physics.js';
import { placeBomb, triggerExplosion } from './bomb.js';
import { startLevel } from './level.js';
import { draw } from './renderer.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

window.addEventListener("keydown", (e) => {
  AudioEngine.init();
  state.keys[e.code] = true;
  if (e.code === "Space" && state.gameState === "PLAYING") placeBomb();
});

window.addEventListener("keyup", (e) => {
  state.keys[e.code] = false;
});

function handleBannerClick() {
  if (state.gameState === "GAME_OVER") {
    state.currentLevel = 1;
    state.score = 0;
    state.lives = 3;
    resetPlayerStats();
    startLevel(1);
  } else if (state.gameState === "LEVEL_CLEARED") {
    startLevel(state.currentLevel + 1);
  }
}
setupBannerListener(handleBannerClick);

function playerDie() {
  state.player.alive = false;
  AudioEngine.death();
  state.lives--;
  updateHUD();

  if (state.lives > 0) {
    setTimeout(() => {
      startLevel(state.currentLevel);
    }, 1200);
  } else {
    state.gameState = "GAME_OVER";
    showBanner({
      title: "GAME OVER",
      titleColor: "#e74c3c",
      sub: `Final Score: ${state.score} - Reached Stage ${state.currentLevel}`,
      btnText: "PLAY AGAIN"
    });
  }
}

function levelCompleted() {
  state.gameState = "LEVEL_CLEARED";
  AudioEngine.stageClear();
  state.score += 500;
  updateHUD();

  showBanner({
    title: `STAGE ${state.currentLevel} CLEARED!`,
    titleColor: "#f1c40f",
    sub: "All upgrades carried over to the next stage!",
    btnText: `PROCEED TO STAGE ${state.currentLevel + 1}`
  });
}

function update() {
  if (state.gameState !== "PLAYING") return;

  const pSize = state.player.size / TILE;

  // Solidify bombs when player moves off them
  state.bombs.forEach(b => {
    if (b.passable) {
      const overlaps = (
        state.player.x < b.c + 1 &&
        state.player.x + pSize > b.c &&
        state.player.y < b.r + 1 &&
        state.player.y + pSize > b.r
      );
      if (!overlaps) b.passable = false;
    }
  });

  // Player movement with corner assistance
  let dx = 0;
  let dy = 0;
  const step = state.player.speed / TILE;

  if (state.keys["ArrowUp"] || state.keys["KeyW"]) { dy -= step; state.player.facing = "UP"; }
  if (state.keys["ArrowDown"] || state.keys["KeyS"]) { dy += step; state.player.facing = "DOWN"; }
  if (state.keys["ArrowLeft"] || state.keys["KeyA"]) { dx -= step; state.player.facing = "LEFT"; }
  if (state.keys["ArrowRight"] || state.keys["KeyD"]) { dx += step; state.player.facing = "RIGHT"; }

  if (dx !== 0 || dy !== 0) state.player.animFrame += 0.2;

  if (dx !== 0) {
    if (canMoveTo(state.player.x + dx, state.player.y)) {
      state.player.x += dx;
    } else {
      const nearY = Math.round(state.player.y);
      if (Math.abs(state.player.y - nearY) < 0.35 && canMoveTo(state.player.x + dx, nearY)) {
        state.player.y += (nearY - state.player.y) * 0.25;
      }
    }
  }

  if (dy !== 0) {
    if (canMoveTo(state.player.x, state.player.y + dy)) {
      state.player.y += dy;
    } else {
      const nearX = Math.round(state.player.x);
      if (Math.abs(state.player.x - nearX) < 0.35 && canMoveTo(nearX, state.player.y + dy)) {
        state.player.x += (nearX - state.player.x) * 0.25;
      }
    }
  }

  // Update bomb timers
  for (let i = state.bombs.length - 1; i >= 0; i--) {
    state.bombs[i].timer--;
    if (state.bombs[i].timer <= 0) {
      triggerExplosion(state.bombs[i]);
      state.bombs.splice(i, 1);
    }
  }

  // Decrement item explosion immunity timers
  state.items.forEach(it => {
    if (it.immunityTimer > 0) it.immunityTimer--;
  });

  // Update explosions and check collisions
  for (let i = state.explosions.length - 1; i >= 0; i--) {
    const exp = state.explosions[i];
    exp.timer--;

    const pr = Math.floor(state.player.y + 0.35);
    const pc = Math.floor(state.player.x + 0.35);
    if (pr === exp.r && pc === exp.c && state.player.alive) {
      playerDie();
    }

    state.enemies.forEach(e => {
      if (!e.alive) return;
      const er = Math.floor(e.y + 0.35);
      const ec = Math.floor(e.x + 0.35);
      if (er === exp.r && ec === exp.c) {
        e.alive = false;
        state.score += 100;
        addFloatingText("+100", ec * TILE + 20, er * TILE);
        updateHUD();
      }
    });

    // Destroy exposed items only if their immunity window has expired
    for (let j = state.items.length - 1; j >= 0; j--) {
      const it = state.items[j];
      if (it.revealed && it.immunityTimer <= 0 && it.r === exp.r && it.c === exp.c) {
        state.items.splice(j, 1);
      }
    }

    if (exp.timer <= 0) state.explosions.splice(i, 1);
  }

  // Power-up collection
  const pTileR = Math.floor(state.player.y + 0.35);
  const pTileC = Math.floor(state.player.x + 0.35);

  state.items.forEach((it, idx) => {
    if (it.revealed && it.r === pTileR && it.c === pTileC) {
      AudioEngine.powerup();
      if (it.type === "BOMB") {
        state.player.maxBombs++;
        addFloatingText("+1 BOMB!", state.player.x * TILE, state.player.y * TILE, "#3498db");
      } else if (it.type === "FIRE") {
        state.player.bombRange++;
        addFloatingText("+1 RANGE!", state.player.x * TILE, state.player.y * TILE, "#e74c3c");
      } else if (it.type === "SPEED") {
        state.player.speedLevel++;
        state.player.speed = Math.min(4.0, state.player.speed + 0.35);
        addFloatingText("+SPEED!", state.player.x * TILE, state.player.y * TILE, "#2ecc71");
      }
      state.items.splice(idx, 1);
      state.score += 50;
      updateHUD();
    }
  });

  // Enemy movement and player contact
  const dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
  state.enemies.forEach(e => {
    if (!e.alive) return;
    const curDir = dirs[e.dir];
    const stepE = e.speed / TILE;
    const nextX = e.x + curDir.dx * stepE;
    const nextY = e.y + curDir.dy * stepE;

    if (canMoveTo(nextX, nextY)) {
      e.x = nextX;
      e.y = nextY;
    } else {
      e.dir = Math.floor(Math.random() * 4);
    }

    const dist = Math.hypot(state.player.x - e.x, state.player.y - e.y);
    if (dist < 0.55 && state.player.alive) {
      playerDie();
    }
  });

  // Stage clearance checks
  const allEnemiesDead = state.enemies.length > 0 && state.enemies.every(e => !e.alive);
  if (allEnemiesDead && !state.exitDoor.unlocked) {
    state.exitDoor.unlocked = true;
  }

  if (state.exitDoor.unlocked && state.grid[state.exitDoor.r][state.exitDoor.c] === 0) {
    if (pTileR === state.exitDoor.r && pTileC === state.exitDoor.c) {
      levelCompleted();
    }
  }

  // Update floating indicator positions
  for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
    state.floatingTexts[i].y -= 0.6;
    state.floatingTexts[i].life--;
    if (state.floatingTexts[i].life <= 0) state.floatingTexts.splice(i, 1);
  }
}

function gameLoop() {
  update();
  draw(ctx);
  requestAnimationFrame(gameLoop);
}

startLevel(1);
gameLoop();