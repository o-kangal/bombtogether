import { TILE, ROWS, COLS } from './config.js';
import { state } from './state.js';

export function draw(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // 1. Grid background
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? "#5dbb63" : "#52a457";
      ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
    }
  }

  // 2. Exit door
  if (state.exitDoor.r !== -1 && state.grid[state.exitDoor.r][state.exitDoor.c] === 0) {
    const dx = state.exitDoor.c * TILE;
    const dy = state.exitDoor.r * TILE;
    ctx.fillStyle = state.exitDoor.unlocked ? "#2980b9" : "#7f8c8d";
    ctx.fillRect(dx + 4, dy + 4, TILE - 8, TILE - 8);

    ctx.fillStyle = state.exitDoor.unlocked ? "#00ffff" : "#34495e";
    ctx.fillRect(dx + 10, dy + 10, TILE - 20, TILE - 20);

    if (state.exitDoor.unlocked) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(dx + 6, dy + 6, TILE - 12, TILE - 12);
    }
  }

  // 3. Power-up items
  state.items.forEach(it => {
    if (!it.revealed || state.grid[it.r][it.c] !== 0) return;
    const ix = it.c * TILE + 6;
    const iy = it.r * TILE + 6 + Math.sin(Date.now() / 150) * 2;
    const size = TILE - 12;

    ctx.fillStyle = "#ecf0f1";
    ctx.fillRect(ix, iy, size, size);
    ctx.strokeStyle = "#2c3e50";
    ctx.lineWidth = 2;
    ctx.strokeRect(ix, iy, size, size);

    ctx.font = "18px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (it.type === "BOMB") ctx.fillText("💣", ix + size / 2, iy + size / 2);
    if (it.type === "FIRE") ctx.fillText("🔥", ix + size / 2, iy + size / 2);
    if (it.type === "SPEED") ctx.fillText("👟", ix + size / 2, iy + size / 2);
  });

  // 4. Solid walls and destructible bricks
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = state.grid[r][c];
      const px = c * TILE;
      const py = r * TILE;

      if (tile === 1) {
        ctx.fillStyle = "#7f8c8d";
        ctx.fillRect(px, py, TILE, TILE);
        ctx.fillStyle = "#bdc3c7";
        ctx.fillRect(px, py, TILE, 4);
        ctx.fillRect(px, py, 4, TILE);
        ctx.fillStyle = "#34495e";
        ctx.fillRect(px, py + TILE - 4, TILE, 4);
        ctx.fillRect(px + TILE - 4, py, 4, TILE);

        ctx.fillStyle = "#2c3e50";
        ctx.fillRect(px + 8, py + 8, 5, 5);
        ctx.fillRect(px + TILE - 13, py + 8, 5, 5);
        ctx.fillRect(px + 8, py + TILE - 13, 5, 5);
        ctx.fillRect(px + TILE - 13, py + TILE - 13, 5, 5);
      } else if (tile === 2) {
        ctx.fillStyle = "#d35400";
        ctx.fillRect(px + 1, py + 1, TILE - 2, TILE - 2);
        ctx.fillStyle = "#e67e22";
        ctx.fillRect(px + 3, py + 3, TILE - 6, TILE / 2 - 4);
        ctx.fillStyle = "#a04000";
        ctx.fillRect(px + 3, py + TILE / 2, TILE - 6, TILE / 2 - 4);

        ctx.strokeStyle = "#5e2605";
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 2, py + 2, TILE - 4, TILE - 4);
        ctx.beginPath();
        ctx.moveTo(px + 2, py + TILE / 2);
        ctx.lineTo(px + TILE - 2, py + TILE / 2);
        ctx.stroke();
      }
    }
  }

  // 5. Bombs
  state.bombs.forEach(b => {
    const cx = b.c * TILE + TILE / 2;
    const cy = b.r * TILE + TILE / 2;
    const pulse = Math.sin(Date.now() / 80) * 1.5;

    ctx.fillStyle = "#111111";
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 13 + pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cx - 4, cy - 3, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#d35400";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 11);
    ctx.quadraticCurveTo(cx + 6, cy - 16, cx + 8, cy - 18);
    ctx.stroke();

    ctx.fillStyle = Math.random() < 0.5 ? "#f1c40f" : "#e74c3c";
    ctx.beginPath();
    ctx.arc(cx + 8, cy - 18, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // 6. Explosions
  state.explosions.forEach(exp => {
    const px = exp.c * TILE;
    const py = exp.r * TILE;

    ctx.fillStyle = "rgba(231, 76, 60, 0.85)";
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = "rgba(241, 196, 15, 0.9)";
    ctx.fillRect(px + 6, py + 6, TILE - 12, TILE - 12);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(px + 12, py + 12, TILE - 24, TILE - 24);
  });

  // 7. Enemies
  state.enemies.forEach(e => {
    if (!e.alive) return;
    const ex = e.x * TILE + 6;
    const ey = e.y * TILE + 6 + Math.sin(Date.now() / 100) * 1.5;

    if (e.type === "RED_BALLOM") {
      ctx.fillStyle = "#e74c3c";
      ctx.beginPath();
      ctx.arc(ex + 14, ey + 14, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.fillRect(ex + 8, ey + 8, 4, 6);
      ctx.fillRect(ex + 16, ey + 8, 4, 6);
      ctx.fillStyle = "#000";
      ctx.fillRect(ex + 9, ey + 10, 2, 3);
      ctx.fillRect(ex + 17, ey + 10, 2, 3);
    } else {
      ctx.fillStyle = "#3498db";
      ctx.beginPath();
      ctx.arc(ex + 14, ey + 12, 13, Math.PI, 0, false);
      ctx.lineTo(ex + 27, ey + 26);
      ctx.lineTo(ex + 20, ey + 22);
      ctx.lineTo(ex + 14, ey + 26);
      ctx.lineTo(ex + 8, ey + 22);
      ctx.lineTo(ex + 1, ey + 26);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.fillRect(ex + 6, ey + 8, 5, 5);
      ctx.fillRect(ex + 16, ey + 8, 5, 5);
      ctx.fillStyle = "#e74c3c";
      ctx.fillRect(ex + 8, ey + 10, 2, 2);
      ctx.fillRect(ex + 18, ey + 10, 2, 2);
    }
  });

  // 8. Player character
  if (state.player.alive) {
    const px = state.player.x * TILE + 5;
    const py = state.player.y * TILE + 3;
    const bounce = Math.sin(state.player.animFrame) * 1.5;

    ctx.fillStyle = "#2980b9";
    ctx.fillRect(px + 7, py + 16 + bounce, 16, 12);

    ctx.fillStyle = "#111";
    ctx.fillRect(px + 7, py + 22 + bounce, 16, 3);
    ctx.fillStyle = "#f1c40f";
    ctx.fillRect(px + 13, py + 22 + bounce, 4, 3);

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(px + 15, py + 10 + bounce, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#bdc3c7";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#e74c3c";
    ctx.beginPath();
    ctx.arc(px + 15, py - 3 + bounce, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffb8b8";
    ctx.fillRect(px + 8, py + 6 + bounce, 14, 8);

    ctx.fillStyle = "#111";
    if (state.player.facing === "LEFT") {
      ctx.fillRect(px + 9, py + 8 + bounce, 2, 4);
      ctx.fillRect(px + 14, py + 8 + bounce, 2, 4);
    } else if (state.player.facing === "RIGHT") {
      ctx.fillRect(px + 13, py + 8 + bounce, 2, 4);
      ctx.fillRect(px + 18, py + 8 + bounce, 2, 4);
    } else if (state.player.facing === "UP") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(px + 8, py + 6 + bounce, 14, 8);
    } else {
      ctx.fillRect(px + 10, py + 8 + bounce, 2, 5);
      ctx.fillRect(px + 17, py + 8 + bounce, 2, 5);
    }

    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(px + 5, py + 28, 8, 5);
    ctx.fillRect(px + 17, py + 28, 8, 5);
  }

  // 9. Floating texts
  state.floatingTexts.forEach(ft => {
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillStyle = ft.color;
    ctx.textAlign = "center";
    ctx.fillText(ft.text, ft.x, ft.y);
  });
}