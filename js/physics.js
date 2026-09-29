import { TILE } from './config.js';
import { state } from './state.js';
import { AudioEngine } from './audio.js';
import { sendNetworkData } from './network.js';
import { updateHUD } from './ui.js';

export function checkPlayerBombOverlap(player, bomb) {
  if (!player) return false;
  const pSize = player.size / TILE;
  const pad = 0.04;
  return (
    player.x + pad < bomb.c + 1 &&
    player.x + pSize - pad > bomb.c &&
    player.y + pad < bomb.r + 1 &&
    player.y + pSize - pad > bomb.r
  );
}

export function canMoveTo(x, y, playerKey = null, playerSize = 26) {
  const pad = 0.08;
  const pSize = playerSize / TILE;
  const left = Math.floor(x + pad);
  const right = Math.floor(x + pSize - pad);
  const top = Math.floor(y + pad);
  const bottom = Math.floor(y + pSize - pad);

  const corners = [
    { r: top, c: left },
    { r: top, c: right },
    { r: bottom, c: left },
    { r: bottom, c: right }
  ];

  for (const pt of corners) {
    if (pt.r < 0 || pt.r >= state.rows || pt.c < 0 || pt.c >= state.cols) return false;
    if (state.grid[pt.r][pt.c] !== 0) return false;
  }

  for (const b of state.bombs) {
    const isPassable = (playerKey && b.passableFor) ? b.passableFor[playerKey] : false;
    if (!isPassable) {
      if (
        x + pad < b.c + 1 &&
        x + pSize - pad > b.c &&
        y + pad < b.r + 1 &&
        y + pSize - pad > b.r
      ) {
        return false;
      }
    }
  }

  return true;
}

export function checkRevive(activePlayer, deadPlayer, activeKey) {
  if (!activePlayer.alive || deadPlayer.alive || deadPlayer.lives > 0) return;
  if (activePlayer.lives <= 1) return;

  const dist = Math.hypot(activePlayer.x - deadPlayer.x, activePlayer.y - deadPlayer.y);
  if (dist <= 1.2) {
    activePlayer.lives--;
    deadPlayer.alive = true;
    deadPlayer.lives = 1;
    deadPlayer.respawnTimer = 0;
    deadPlayer.invincibleTimer = 180; // 3 seconds invulnerability window

    AudioEngine.revive();
    addFloatingText("REVIVED!", deadPlayer.x * TILE + 20, deadPlayer.y * TILE, "#2ecc71");
    updateHUD();

    if (state.mode === "COOP" && state.role === "HOST") {
      sendNetworkData({
        type: "EVENT",
        payload: { name: "REVIVE", x: deadPlayer.x, y: deadPlayer.y }
      });
    }
  }
}

export function addFloatingText(text, x, y, color = "#f1c40f") {
  state.floatingTexts.push({ text, x, y, life: 40, color });
}