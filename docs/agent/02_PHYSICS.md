# Physics, Collision & Movement Heuristics

## Coordinate Space
* Game positions (player.x, player.y, enemy.x, enemy.y) are float values in tile coordinates (not pixels).
* Rendering converts tile coordinates to pixel coordinates via Math.floor(x * TILE).
* Tile indices are computed as r = Math.floor(y + 0.35) and c = Math.floor(x + 0.35).

## AABB Collision & Boundary Checks
Movement validation (canMoveTo) tests the 4 corners of an entity's bounding box using an inward padding:
* pad = 0.08
* pSize = playerSize / TILE (where playerSize = 26, approx 0.65 tiles)
* Corners evaluated:
  * Top-Left: (x + pad, y + pad)
  * Top-Right: (x + pSize - pad, y + pad)
  * Bottom-Left: (x + pad, y + pSize - pad)
  * Bottom-Right: (x + pSize - pad, y + pSize - pad)

## Corner Sliding (Nudging)
To provide smooth arcade navigation around corners:
1. Horizontal Slide (dx !== 0):
   If direct movement is blocked, calculate the nearest integer grid lane targetY = Math.round(player.y).
   If Math.abs(player.y - targetY) < 0.35 and canMoveTo(player.x + dx, targetY) is valid, apply vertical adjustment:
   player.y += (targetY - player.y) * 0.25;
2. Vertical Slide (dy !== 0):
   If direct movement is blocked, calculate targetX = Math.round(player.x).
   If Math.abs(player.x - targetX) < 0.35 and canMoveTo(targetX, player.y + dy) is valid, apply horizontal adjustment:
   player.x += (targetX - player.x) * 0.25;

WARNING: Do not invert coordinate deltas in vertical corner sliding. Misassigning targetX to player.y results in violent wall-clipping traps for Player 2.

## Bomb Passability (passableFor)
* Bombs are created with per-player passability flags:
  passableFor: { p1: checkOverlap(p1), p2: checkOverlap(p2) }
* When a player drops a bomb, they can move off it freely.
* Once the player's bounding box completely leaves the bomb's tile boundaries, that player's passableFor flag flips to false.
* Other players cannot walk through a bomb unless they were already overlapping it when placed.