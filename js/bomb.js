import { ROWS, COLS } from './config.js';
import { state } from './state.js';
import { AudioEngine } from './audio.js';

export function placeBomb() {
  if (!state.player.alive) return;
  if (state.bombs.length >= state.player.maxBombs) return;

  const r = Math.floor(state.player.y + 0.35);
  const c = Math.floor(state.player.x + 0.35);

  if (state.bombs.some(b => b.r === r && b.c === c)) return;

  state.bombs.push({
    r,
    c,
    timer: 180, // ~3 seconds at 60fps
    range: state.player.bombRange,
    passable: true
  });
  AudioEngine.bombSet();
}

export function triggerExplosion(bomb) {
  AudioEngine.explosion();
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
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break;
      if (state.grid[nr][nc] === 1) break; // Hard walls stop blast rays

      state.explosions.push({ r: nr, c: nc, timer: 28 });

      // Chain reaction with other bombs
      const otherBomb = state.bombs.find(b => b.r === nr && b.c === nc);
      if (otherBomb) {
        otherBomb.timer = 0;
      }

      if (state.grid[nr][nc] === 2) {
        state.grid[nr][nc] = 0; // Destroy destructible brick
        state.score += 15;

        // Reveal hidden power-up with grace period to prevent immediate destruction by current blast
        const hiddenItem = state.items.find(it => it.r === nr && it.c === nc);
        if (hiddenItem) {
          hiddenItem.revealed = true;
          hiddenItem.immunityTimer = 35;
        }

        break; // Blast wave does not penetrate bricks
      }
    }
  });
}