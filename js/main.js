import { TILE, SINGLE_COLS, SINGLE_ROWS, COOP_COLS, COOP_ROWS } from './config.js';
import { state, resetPlayerStats } from './state.js';
import { AudioEngine } from './audio.js';
import {
  updateHUD,
  showLobbyView,
  hideLobby,
  setDisplayedRoomCode,
  getDisplayedRoomCode,
  setJoinError,
  getEnteredRoomCode,
  setEnteredRoomCode,
  showBanner,
  setupBannerListener
} from './ui.js';
import { canMoveTo, checkPlayerBombOverlap, checkRevive, addFloatingText } from './physics.js';
import { placeBomb, triggerExplosion } from './bomb.js';
import { startLevel } from './level.js';
import { draw } from './renderer.js';
import {
  generateRoomCode,
  initHost,
  joinRoom,
  sendNetworkData,
  setNetworkCallbacks,
  closeNetwork
} from './network.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let frameCount = 0;

function configureCanvasSize(mode) {
  if (mode === "COOP") {
    canvas.width = COOP_COLS * TILE;
    canvas.height = COOP_ROWS * TILE;
  } else {
    canvas.width = SINGLE_COLS * TILE;
    canvas.height = SINGLE_ROWS * TILE;
  }
}

// Local keyboard event listeners
window.addEventListener("keydown", (e) => {
  AudioEngine.init();
  state.keys[e.code] = true;

  if (state.mode === "SINGLE") {
    if (e.code === "Space" && state.gameState === "PLAYING") {
      placeBomb("p1");
    }
  } else if (state.mode === "COOP") {
    if (state.role === "HOST") {
      if (e.code === "Space" && state.gameState === "PLAYING") placeBomb("p1");
      if (e.code === "KeyE" && state.gameState === "PLAYING") checkRevive(state.players.p1, state.players.p2, "p1");
    } else if (state.role === "CLIENT") {
      sendNetworkData({ type: "INPUT", payload: extractClientKeys() });
    }
  }
});

window.addEventListener("keyup", (e) => {
  state.keys[e.code] = false;
  if (state.mode === "COOP" && state.role === "CLIENT") {
    sendNetworkData({ type: "INPUT", payload: extractClientKeys() });
  }
});

function extractClientKeys() {
  return {
    ArrowUp: !!state.keys["ArrowUp"],
    ArrowDown: !!state.keys["ArrowDown"],
    ArrowLeft: !!state.keys["ArrowLeft"],
    ArrowRight: !!state.keys["ArrowRight"],
    KeyW: !!state.keys["KeyW"],
    KeyS: !!state.keys["KeyS"],
    KeyA: !!state.keys["KeyA"],
    KeyD: !!state.keys["KeyD"],
    Space: !!state.keys["Space"],
    KeyE: !!state.keys["KeyE"]
  };
}

// Clipboard Action Bindings
const btnCopyCode = document.getElementById("btnCopyCode");
btnCopyCode.addEventListener("click", async () => {
  const code = getDisplayedRoomCode();
  if (!code || code === "------") return;

  try {
    await navigator.clipboard.writeText(code);
    btnCopyCode.innerText = "✓ COPIED!";
    btnCopyCode.classList.add("btn-copied");
    setTimeout(() => {
      btnCopyCode.innerText = "📋 COPY";
      btnCopyCode.classList.remove("btn-copied");
    }, 1500);
  } catch (err) {
    console.error("Clipboard copy failed:", err);
  }
});

const btnPasteCode = document.getElementById("btnPasteCode");
btnPasteCode.addEventListener("click", async () => {
  try {
    const rawText = await navigator.clipboard.readText();
    const sanitized = rawText.toUpperCase().trim().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    if (sanitized) {
      setEnteredRoomCode(sanitized);
    }
  } catch (err) {
    setJoinError("Clipboard permission denied.");
  }
});

// Lobby Navigation UI bindings
document.getElementById("btnSelectSingle").addEventListener("click", () => {
  state.mode = "SINGLE";
  state.role = "HOST";
  configureCanvasSize("SINGLE");
  hideLobby();
  resetGame();
  updateHUD();
});

document.getElementById("btnSelectCoop").addEventListener("click", () => {
  showLobbyView("COOP_CHOICE");
});

document.getElementById("btnBackToMode").addEventListener("click", () => {
  showLobbyView("MODE_SELECT");
});

document.getElementById("btnCreateGame").addEventListener("click", () => {
  state.mode = "COOP";
  state.role = "HOST";
  configureCanvasSize("COOP");
  updateHUD();

  const roomCode = generateRoomCode();
  setDisplayedRoomCode(roomCode);
  showLobbyView("HOST_WAIT");

  initHost(
    roomCode,
    () => {
      hideLobby();
      resetGame();
      updateHUD();
    },
    (err) => {
      showLobbyView("COOP_CHOICE");
      alert("Peer connection error: " + err.type);
    }
  );
});

document.getElementById("btnCancelHost").addEventListener("click", () => {
  closeNetwork();
  showLobbyView("COOP_CHOICE");
});

document.getElementById("btnJoinGame").addEventListener("click", () => {
  showLobbyView("JOIN_INPUT");
});

document.getElementById("btnCancelJoin").addEventListener("click", () => {
  closeNetwork();
  showLobbyView("COOP_CHOICE");
});

document.getElementById("btnSubmitJoin").addEventListener("click", () => {
  const code = getEnteredRoomCode();
  if (code.length !== 6) {
    setJoinError("Room code must be 6 characters.");
    return;
  }

  setJoinError("Connecting to host...");
  state.mode = "COOP";
  state.role = "CLIENT";
  configureCanvasSize("COOP");
  updateHUD();

  joinRoom(
    code,
    () => {
      hideLobby();
      updateHUD();
    },
    (err) => {
      setJoinError("Connection failed. Check code.");
    }
  );
});

setupBannerListener(() => {
  if (state.gameState === "GAME_OVER") {
    if (state.role === "HOST") {
      resetGame();
    }
  } else if (state.gameState === "LEVEL_CLEARED") {
    if (state.role === "HOST") {
      startLevel(state.currentLevel + 1);
    }
  }
});

// Network callbacks for Client
setNetworkCallbacks({
  onSnapshot: (snapshot) => {
    state.grid = snapshot.grid;
    state.bombs = snapshot.bombs;
    state.explosions = snapshot.explosions;
    state.items = snapshot.items;
    state.enemies = snapshot.enemies;
    state.exitDoor = snapshot.exitDoor;
    state.floatingTexts = snapshot.floatingTexts;
    state.players = snapshot.players;
    state.currentLevel = snapshot.currentLevel;
    state.score = snapshot.score;
    state.gameState = snapshot.gameState;
    state.cols = snapshot.cols;
    state.rows = snapshot.rows;

    if (canvas.width !== state.cols * TILE || canvas.height !== state.rows * TILE) {
      canvas.width = state.cols * TILE;
      canvas.height = state.rows * TILE;
    }

    updateHUD();

    if (state.gameState === "GAME_OVER") {
      showBanner({
        title: "GAME OVER",
        titleColor: "#e74c3c",
        sub: `Both players fell. Stage: ${state.currentLevel}`,
        btnText: "WAITING FOR HOST"
      });
    } else if (state.gameState === "LEVEL_CLEARED") {
      showBanner({
        title: `STAGE ${state.currentLevel} CLEARED!`,
        titleColor: "#f1c40f",
        sub: "Preparing next sector...",
        btnText: "WAITING FOR HOST"
      });
    }
  },
  onEvent: (event) => {
    if (event.name === "BOMB_SET") AudioEngine.bombSet();
    if (event.name === "EXPLOSION") AudioEngine.explosion();
    if (event.name === "POWERUP") AudioEngine.powerup();
    if (event.name === "DEATH") AudioEngine.death();
    if (event.name === "STAGE_CLEAR") AudioEngine.stageClear();
    if (event.name === "REVIVE") AudioEngine.revive();
  }
});

function resetGame() {
  state.currentLevel = 1;
  state.score = 0;
  resetPlayerStats(state.players.p1);
  resetPlayerStats(state.players.p2);
  startLevel(1);
}

function playerKilled(playerKey) {
  const p = state.players[playerKey];
  if (!p || !p.alive || p.invincibleTimer > 0) return;

  p.alive = false;
  AudioEngine.death();
  updateHUD();

  if (state.mode === "COOP" && state.role === "HOST") {
    sendNetworkData({ type: "EVENT", payload: { name: "DEATH", playerKey } });
  }

  const p1Dead = !state.players.p1.alive;
  const p2Dead = state.mode === "COOP" ? !state.players.p2.alive : true;

  if (p1Dead && p2Dead) {
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

  if (state.mode === "COOP" && state.role === "HOST") {
    sendNetworkData({ type: "EVENT", payload: { name: "STAGE_CLEAR" } });
  }

  showBanner({
    title: `STAGE ${state.currentLevel} CLEARED!`,
    titleColor: "#f1c40f",
    sub: "All upgrades carried over!",
    btnText: `PROCEED TO STAGE ${state.currentLevel + 1}`
  });
}

function processPlayerMovement(player, inputKeys, playerKey) {
  if (!player.alive) return;

  if (player.invincibleTimer > 0) player.invincibleTimer--;

  let dx = 0;
  let dy = 0;
  const step = player.speed / TILE;

  if (inputKeys["ArrowUp"] || inputKeys["KeyW"]) { dy -= step; player.facing = "UP"; }
  if (inputKeys["ArrowDown"] || inputKeys["KeyS"]) { dy += step; player.facing = "DOWN"; }
  if (inputKeys["ArrowLeft"] || inputKeys["KeyA"]) { dx -= step; player.facing = "LEFT"; }
  if (inputKeys["ArrowRight"] || inputKeys["KeyD"]) { dx += step; player.facing = "RIGHT"; }

  if (dx !== 0 || dy !== 0) player.animFrame += 0.2;

  // Horizontal movement & corner sliding
  if (dx !== 0) {
    if (canMoveTo(player.x + dx, player.y, playerKey)) {
      player.x += dx;
    } else {
      const targetY = Math.round(player.y);
      if (Math.abs(player.y - targetY) < 0.35 && canMoveTo(player.x + dx, targetY, playerKey)) {
        player.y += (targetY - player.y) * 0.25;
      }
    }
  }

  // Vertical movement & corner sliding
  if (dy !== 0) {
    if (canMoveTo(player.x, player.y + dy, playerKey)) {
      player.y += dy;
    } else {
      const targetX = Math.round(player.x);
      if (Math.abs(player.x - targetX) < 0.35 && canMoveTo(targetX, player.y + dy, playerKey)) {
        player.x += (targetX - player.x) * 0.25;
      }
    }
  }
}

function updateHost() {
  if (state.gameState !== "PLAYING") return;

  processPlayerMovement(state.players.p1, state.keys, "p1");

  if (state.mode === "COOP") {
    processPlayerMovement(state.players.p2, state.remoteKeys, "p2");

    if (state.remoteKeys.Space) {
      placeBomb("p2");
      state.remoteKeys.Space = false;
    }

    if (state.remoteKeys.KeyE) {
      checkRevive(state.players.p2, state.players.p1, "p2");
      state.remoteKeys.KeyE = false;
    }
  }

  state.bombs.forEach(b => {
    if (b.passableFor) {
      if (b.passableFor.p1 && !checkPlayerBombOverlap(state.players.p1, b)) {
        b.passableFor.p1 = false;
      }
      if (state.mode === "COOP" && b.passableFor.p2 && !checkPlayerBombOverlap(state.players.p2, b)) {
        b.passableFor.p2 = false;
      }
    }
  });

  for (let i = state.bombs.length - 1; i >= 0; i--) {
    state.bombs[i].timer--;
    if (state.bombs[i].timer <= 0) {
      triggerExplosion(state.bombs[i]);
      state.bombs.splice(i, 1);
    }
  }

  state.items.forEach(it => {
    if (it.immunityTimer > 0) it.immunityTimer--;
  });

  for (let i = state.explosions.length - 1; i >= 0; i--) {
    const exp = state.explosions[i];
    exp.timer--;

    const p1r = Math.floor(state.players.p1.y + 0.35);
    const p1c = Math.floor(state.players.p1.x + 0.35);
    if (p1r === exp.r && p1c === exp.c && state.players.p1.alive && state.players.p1.invincibleTimer <= 0) {
      playerKilled("p1");
    }

    if (state.mode === "COOP") {
      const p2r = Math.floor(state.players.p2.y + 0.35);
      const p2c = Math.floor(state.players.p2.x + 0.35);
      if (p2r === exp.r && p2c === exp.c && state.players.p2.alive && state.players.p2.invincibleTimer <= 0) {
        playerKilled("p2");
      }
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

    for (let j = state.items.length - 1; j >= 0; j--) {
      const it = state.items[j];
      if (it.revealed && it.immunityTimer <= 0 && it.r === exp.r && it.c === exp.c) {
        state.items.splice(j, 1);
      }
    }

    if (exp.timer <= 0) state.explosions.splice(i, 1);
  }

  const livingPlayers = [{ key: "p1", p: state.players.p1 }];
  if (state.mode === "COOP") livingPlayers.push({ key: "p2", p: state.players.p2 });

  livingPlayers.forEach(({ p }) => {
    if (!p.alive) return;
    const pr = Math.floor(p.y + 0.35);
    const pc = Math.floor(p.x + 0.35);

    state.items.forEach((it, idx) => {
      if (it.revealed && it.r === pr && it.c === pc) {
        AudioEngine.powerup();
        if (state.mode === "COOP") sendNetworkData({ type: "EVENT", payload: { name: "POWERUP" } });

        if (it.type === "BOMB") {
          p.maxBombs++;
          addFloatingText("+1 BOMB!", p.x * TILE, p.y * TILE, "#3498db");
        } else if (it.type === "FIRE") {
          p.bombRange++;
          addFloatingText("+1 RANGE!", p.x * TILE, p.y * TILE, "#e74c3c");
        } else if (it.type === "SPEED") {
          p.speedLevel++;
          p.speed = Math.min(4.0, p.speed + 0.35);
          addFloatingText("+SPEED!", p.x * TILE, p.y * TILE, "#2ecc71");
        } else if (it.type === "LIFE") {
          p.lives++;
          addFloatingText("+1 LIFE!", p.x * TILE, p.y * TILE, "#e91e63");
        }

        state.items.splice(idx, 1);
        state.score += 50;
        updateHUD();
      }
    });
  });

  const dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
  state.enemies.forEach(e => {
    if (!e.alive) return;
    const curDir = dirs[e.dir];
    const stepE = e.speed / TILE;
    const nextX = e.x + curDir.dx * stepE;
    const nextY = e.y + curDir.dy * stepE;

    if (canMoveTo(nextX, nextY, null)) {
      e.x = nextX;
      e.y = nextY;
    } else {
      e.dir = Math.floor(Math.random() * 4);
    }

    if (state.players.p1.alive && state.players.p1.invincibleTimer <= 0) {
      if (Math.hypot(state.players.p1.x - e.x, state.players.p1.y - e.y) < 0.55) {
        playerKilled("p1");
      }
    }

    if (state.mode === "COOP" && state.players.p2.alive && state.players.p2.invincibleTimer <= 0) {
      if (Math.hypot(state.players.p2.x - e.x, state.players.p2.y - e.y) < 0.55) {
        playerKilled("p2");
      }
    }
  });

  const allEnemiesDead = state.enemies.length > 0 && state.enemies.every(e => !e.alive);
  if (allEnemiesDead && !state.exitDoor.unlocked) {
    state.exitDoor.unlocked = true;
  }

  if (state.exitDoor.unlocked && state.grid[state.exitDoor.r][state.exitDoor.c] === 0) {
    const p1InDoor = Math.floor(state.players.p1.y + 0.35) === state.exitDoor.r &&
      Math.floor(state.players.p1.x + 0.35) === state.exitDoor.c;
    const p2InDoor = state.mode === "COOP" &&
      Math.floor(state.players.p2.y + 0.35) === state.exitDoor.r &&
      Math.floor(state.players.p2.x + 0.35) === state.exitDoor.c;

    if ((state.players.p1.alive && p1InDoor) || (state.mode === "COOP" && state.players.p2.alive && p2InDoor)) {
      levelCompleted();
    }
  }

  for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
    state.floatingTexts[i].y -= 0.6;
    state.floatingTexts[i].life--;
    if (state.floatingTexts[i].life <= 0) state.floatingTexts.splice(i, 1);
  }

  frameCount++;
  if (state.mode === "COOP" && frameCount % 2 === 0) {
    sendNetworkData({
      type: "SNAPSHOT",
      payload: {
        grid: state.grid,
        bombs: state.bombs,
        explosions: state.explosions,
        items: state.items,
        enemies: state.enemies,
        exitDoor: state.exitDoor,
        floatingTexts: state.floatingTexts,
        players: state.players,
        currentLevel: state.currentLevel,
        score: state.score,
        gameState: state.gameState,
        cols: state.cols,
        rows: state.rows
      }
    });
  }
}

function gameLoop() {
  try {
    if (state.role === "HOST") {
      updateHost();
    }
    draw(ctx);
  } catch (err) {
    console.error("Game loop error:", err);
  }
  requestAnimationFrame(gameLoop);
}

showLobbyView("MODE_SELECT");
gameLoop();