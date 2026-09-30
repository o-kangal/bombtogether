# Code Style, Module Boundaries & Conventions

## File Structure & Separation of Concerns

| File | Exact Responsibility |
| :--- | :--- |
| js/config.js | Dimension constants, TILE size, room code sets. Pure exports. |
| js/state.js | Single source of truth. Contains mutable state and reset helpers. |
| js/audio.js | AudioContext synthesis singleton. |
| js/network.js | PeerJS lifecycle, connections, input/snapshot packet exchange. |
| js/physics.js | Coordinate math, AABB corner collisions, overlap calculations. |
| js/bomb.js | Bomb drops, chain reactions, destructible brick logic. |
| js/level.js | Procedural grid initialization, entity placement, item distribution. |
| js/ui.js | DOM query caching, HUD updates, modal display state. |
| js/renderer.js | Pure rendering routines. Must be stateless and crash-resilient. |
| js/main.js | Game loop orchestrator, event listener dispatcher. |

## Coding Standards
* Language: English only. No Turkish in comments, commit messages, or identifier names.
* Constants: Capital snake case (e.g., TILE, SINGLE_COLS, ROOM_CODE_ALPHABET).
* Variable Names: Descriptive camelCase (e.g., invincibleTimer, checkPlayerBombOverlap).
* Safe Renderer Rule: renderer.js must never assume state.grid or entity arrays are populated. Always use optional chaining or guard checks (if (!state.grid || state.grid.length === 0) return;).
* DOM Query Caching: Do not call document.getElementById inside 60 FPS update/render loops. Query elements once at module initialization inside ui.js.