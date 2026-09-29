import { TILE, ROWS, COLS } from './config.js';
import { state } from './state.js';

export function canMoveTo(x, y) {
  const pad = 0.08;
  const pSize = state.player.size / TILE;
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
    if (pt.r < 0 || pt.r >= ROWS || pt.c < 0 || pt.c >= COLS) return false;
    if (state.grid[pt.r][pt.c] !== 0) return false;
  }

  for (const b of state.bombs) {
    if (!b.passable) {
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

export function addFloatingText(text, x, y, color = "#f1c40f") {
  state.floatingTexts.push({ text, x, y, life: 40, color });
}