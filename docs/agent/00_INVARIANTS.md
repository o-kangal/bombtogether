# Architectural Invariants & Non-Negotiable Constraints

The following rules must never be violated under any circumstances:

## 1. Zero-Build & Zero-Dependency Policy
* No `package.json`, `node_modules`, or build systems (no Webpack, Vite, Rollup, Parcel, Babel).
* No TypeScript. The codebase is standard, modern ECMAScript (ES6+) using native browser modules (`type="module"`).
* No external CSS libraries (no Tailwind, Bootstrap, Sass). Plain CSS only.
* External libraries are strictly limited to PeerJS, loaded solely via CDN script tag in `index.html`. Do not bundle or install PeerJS locally.

## 2. Zero-Asset Audio Policy
* No external audio binaries (`.mp3`, `.wav`, `.ogg`).
* All audio must be synthesized dynamically at runtime using the native browser `Web Audio API` (`AudioContext`, `OscillatorNode`, `BiquadFilterNode`, `GainNode`).

## 3. Localization & Language
* The code, identifier names, code comments, UI texts, error messages, and documentation must remain strictly in English.

## 4. Grid & Scale Constraints
* **Tile Size:** 40x40 pixels (`TILE = 40`).
* **Single Player Grid:** 13 columns x 11 rows ($520 \times 440\text{ px}$).
* **Co-op Multiplayer Grid:** 17 columns x 13 rows ($680 \times 520\text{ px}$).
* Canvas dimensions must dynamically update when switching modes.

## 5. Network Authoritative Invariant
* Only the **Host** executes game logic, runs the physics loop, advances bomb timers, moves enemies, tracks health, and checks stage clearance.
* The **Client** is a thin display and input terminal: it captures local keystrokes, sends them via WebRTC DataChannel to the Host, and renders the snapshots received from the Host.