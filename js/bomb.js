import { state } from './state.js';
import { AudioEngine } from './audio.js';
import { sendNetworkData } from './network.js';
import { checkPlayerBombOverlap } from './physics.js';

export function placeBomb(playerKey) {
  const p = state.players[playerKey];
  if (!p || !p.alive) return;

  const currentPlaced = state.bombs.filter(b => b.owner === playerKey).length;
  if (currentPlaced >= p.maxBombs) return;

  const r = Math.floor(p.y + 0.35);
  const c = Math.floor(p.x + 0.35);

  if (state.bombs.some(b => b.r === r && b.c === c)) return;

  // Track initial passability individually so neither player gets trapped
  const newBomb = {
    r,
    c,
    timer: 180,
    range: p.bombRange,
    owner: playerKey,
    passableFor: {
      p1: checkPlayerBombOverlap(state.players.p1, { r, c }),
      p2: state.mode === "COOP" ? checkPlayerBombOverlap(state.players.p2, { r, c }) : false
    }
  };

  state.bombs.push(newBomb);
  AudioEngine.bombSet();

  if (state.mode === "COOP" && state.role === "HOST") {
    sendNetworkData({ type: "EVENT", payload: { name: "BOMB_SET" } });
  }
}

export function triggerExplosion(bomb) {
  AudioEngine.explosion();

  if (state.mode === "COOP" && state.role === "HOST") {
    sendNetworkData({ type: "EVENT", payload: { name: "EXPLOSION" } });
  }

  const directions = [
    { dr: 0, dc: 0 },
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 }
  ];

  directions.forEach(dir => {
    for (let dist = 1; dist <= bomb.range; dist++) {
      const nr = bomb.r + dir.dr * dist;
      const nc = bomb.c + dir.dc * dist;

      if (dir.dr === 0 && dir.dc === 0 && dist > 1) continue;
      if (nr < 0 || nr >= state.rows || nc < 0 || nc >= state.cols) break;
      if (state.grid[nr][nc] === 1) break;

      state.explosions.push({ r: nr, c: nc, timer: 28 });

      // Trigger chain reactions
      const otherBomb = state.bombs.find(b => b.r === nr && b.c === nc);
      if (otherBomb) otherBomb.timer = 0;

      // Break destructible brick
      if (state.grid[nr][nc] === 2) {
        state.grid[nr][nc] = 0;
        state.score += 15;

        const hiddenItem = state.items.find(it => it.r === nr && it.c === nc);
        if (hiddenItem) {
          hiddenItem.revealed = true;
          hiddenItem.immunityTimer = 35;
        }
        break;
      }
    }
  });
}