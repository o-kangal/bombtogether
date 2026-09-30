# Agent Execution Guidelines & Router

This document is the primary entrypoint for any automated software engineering agent (Claude Code, Cursor, Windsurf, Aider, etc.) operating on the **BombTogether** codebase.

## Project Essence
BombTogether is an arcade, zero-dependency, peer-to-peer multiplayer Bomberman-style web game running entirely on Vanilla JavaScript (ES6 Modules), Canvas API, Web Audio API, and WebRTC (PeerJS).

---

## Agent Operational Rules
1. **Never introduce a build step or package manager:** Do not create `package.json`, do not add `npm`, `vite`, `webpack`, `typescript`, or external libraries.
2. **Strict English Invariant:** All code, identifier names, comments, terminal outputs, and in-game texts must remain 100% in English.
3. **Preserve Host-Authoritative Architecture:** The client must never make decisions regarding physics, damage, bomb timers, revives, or enemy AI. The client only sends inputs and renders snapshots.
4. **Targeted Reading:** Before making any modifications, read only the specific specification documents relevant to your task from the router matrix below.

---

## Documentation Router Matrix

| If your task relates to... | You MUST read these files first | Primary source files |
| :--- | :--- | :--- |
| Project constraints & invariants | `docs/agent/00_INVARIANTS.md` | `index.html`, `js/config.js` |
| WebRTC, PeerJS, packet synchronization | `docs/agent/01_NETWORKING.md` | `js/network.js`, `js/main.js` |
| Movement, collisions, corner-sliding | `docs/agent/02_PHYSICS.md` | `js/physics.js`, `js/bomb.js` |
| Health, revive, stage progression, enemy AI | `docs/agent/03_GAMEPLAY.md` | `js/state.js`, `js/level.js`, `js/main.js` |
| Sound effects, synthesizer, audio bugs | `docs/agent/04_AUDIO.md` | `js/audio.js` |
| Code formatting, architectural conventions | `docs/agent/05_CODE_STYLE.md` | Entire `js/` directory |
| Local execution, verification & testing | `docs/agent/06_TESTING.md` | Browser runtime |
| Backlog features & bugfix specifications | `docs/agent/TASKS.md` | Specified per task |

---

## Quick Task Workflow
1. Identify the task scope and read corresponding specifications from `docs/agent/`.
2. Inspect the authoritative state model in `js/state.js` before making any stateful changes.
3. Verify changes locally via a local static web server (`python3 -m http.server 8000`).
4. Update `docs/agent/TASKS.md` when completing a task or documenting a newly identified edge case.