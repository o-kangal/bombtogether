# 💣 BombTogether

> A zero-dependency, serverless, peer-to-peer co-op multiplayer arcade game built entirely with modern Vanilla JavaScript (ES6 Modules), Canvas API, Web Audio API, and WebRTC (PeerJS).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deploy: Cloudflare Pages](https://img.shields.io/badge/Deployment-Cloudflare_Pages-F38020?logo=cloudflare)](https://bombtogether.com)
[![Platform: WebRTC](https://img.shields.io/badge/Networking-WebRTC_P2P-333333?logo=webrtc)](https://peerjs.com)

---

## 🕹️ Live Demo

Play instantly in your browser (no downloads, no accounts, no installations required):  
👉 **[https://bombtogether.com](https://bombtogether.com)**

---

## 🌟 Highlights

* **Pure Vanilla Architecture:** Zero frontend frameworks, zero bundlers, zero build steps. Runs natively in any modern web browser via ES6 Modules (`type="module"`).
* **Serverless P2P Multiplayer:** Direct browser-to-browser communication via **WebRTC DataChannels** using PeerJS. No expensive backend server required; game sessions run completely distributed with ultra-low latency.
* **Authoritative Host Synchronization:** Employs an authoritative host-client synchronization architecture to eliminate desynchronization across game sessions.
* **Zero-Asset Audio Engine:** Sound effects (explosions, white noise filtering, power-ups, movement chimes, and death sequences) are synthesized directly at runtime using the native **Web Audio API**.
* **Procedural Map Generation:** Balanced tile distribution ensuring reachable corridors, fair power-up distributions, safe player spawn clearings, and scaling difficulty across stages.
* **Co-op Teamplay & Revive Mechanics:** Features individual lives, persistent corpses/gravestones, auto-respawning, and an active teammate revive mechanism using shared health pools.

---

## 🛠️ Architecture & Technical Deep Dive

### 1. Directory Structure

``` text
bombtogether/
├── index.html          # Semantic HTML shell, viewport, HUD & modal overlays
├── LICENSE             # MIT License
├── README.md           # Engineering documentation
├── AGENTS.md           # Root entrypoint & router for AI agent contributors
├── docs/
│   └── agent/          # Internal architecture specifications & invariants
│       ├── 00_INVARIANTS.md   # Zero-build, vanilla constraints & core rules
│       ├── 01_NETWORKING.md   # WebRTC host-authoritative packet schemas
│       ├── 02_PHYSICS.md      # AABB collision & corner-sliding heuristics
│       ├── 03_GAMEPLAY.md     # Health, revive, portal & lifecycle rules
│       ├── 04_AUDIO.md        # Synthesized Web Audio API specifications
│       ├── 05_CODE_STYLE.md   # Module boundaries & architectural conventions
│       ├── 06_TESTING.md      # Local multi-client verification protocol
│       └── TASKS.md           # Engineering task backlog & bugfix specs
├── css/
│   └── style.css       # Retro arcade cabinet styling, CRT aesthetic & responsiveness
└── js/
├── config.js       # Game constants, dynamic grid dimensions & room code alphabet
├── audio.js        # Web Audio API procedural sound synthesizer (Oscillator & BiquadFilters)
├── state.js        # Centralized mutable game state and player data models
├── network.js      # WebRTC DataChannel abstractions, PeerJS lifecycle & payload routing
├── ui.js           # HUD manipulation, clipboard actions & overlay state machine
├── physics.js      # AABB collision checks, corner-sliding heuristics & interaction triggers
├── bomb.js         # Bomb placement, directional raycast ray-splitting & chain reactions
├── level.js        # Procedural maze generator, power-up balancing & entity spawner
├── renderer.js     # 60 FPS HTML5 Canvas retro rendering pipeline & sprite animator
└── main.js         # Master game loop, input capture, state updater & network broker
```

### 2. Network Synchronization Model (Authoritative Host)

``` text
[Client / Player 2]                                    [Host / Player 1]
        │                                                      │
        │─── INPUT_PACKET { keys: ArrowUp, Space, KeyE } ─────>│ (Captures remote input)
        │                                                      │
        │                                                      ├─ Step Physics & Collisions
        │                                                      ├─ Enemy AI Heuristics
        │                                                      ├─ Bomb Timers & Raycasts
        │                                                      ├─ Health & Revive Checks
        │                                                      │
        │<── SNAPSHOT_PACKET (~30 FPS World State) ────────────┤ (Broadcasts complete state)
        │    (grid, entities, bombs, players, timers)          │
        │                                                      │
        │<── EVENT_PACKET (Instant Audio / Stage Triggers) ────┤
        │                                                      │
[Canvas Direct Render]                                 [Canvas Direct Render]
``` 

* **Room Pairing:** 6-character room codes generated from a collision-safe 32-character alphabet (omitting ambiguous characters like `0`, `O`, `1`, `I`). Host registers `BOMBTOGETHER-COOP-[CODE]` via PeerJS signalling; Client connects with direct automatic sanitization.
* **Network Throttling Prevention:** World snapshots are transmitted at a stable ~30 Hz frame rate while local rendering runs at continuous 60 FPS requestAnimationFrame loops, preventing WebRTC DataChannel buffer saturation.
* **Decoupled Event Stream:** Audio triggers and vital gameplay banners are transmitted out-of-band via lightweight event packets, ensuring immediate auditory feedback even under network latency.

### 3. Collision Engine & Corner-Sliding Heuristics

To simulate authentic arcade Bomberman navigation within a discrete tile grid:
* **Axis-Aligned Bounding Box (AABB) with Inward Padding:** Karakter bounding box'ı tile sınırlarına takılmaması için içe doğru 0.08 tile pad ile hesaplanır.
* **Corner Sliding:** Karakter bir duvar veya kutunun köşesine çarptığında dikey veya yatay offset 0.35 tile eşiğinden küçükse motor karakteri otomatik olarak açık koridora kaydırır (nudging).
* **Multi-Entity Bomb Passability:** Oyuncular bomba bıraktığında bombanın içi geçilebilir (`passable`) kalır; oyuncunun hitbox'ı bombadan tamamen ayrıldığı an bomba katılaşır (`passableFor[playerKey] = false`).

### 4. Synthesized Audio Engine

The game contains **zero external MP3/WAV audio files**. All retro audio is generated in real-time:
* **Explosions:** White noise generation using a custom `AudioBuffer` populated with `Math.random()` values, piped through a low-pass `BiquadFilterNode` modulating downwards from 800 Hz to 50 Hz coupled with an exponential gain falloff.
* **Power-ups & Fanfares:** Arpeggiated sine/triangle wave sequences generated via precision-scheduled `OscillatorNode` chains.

---

## 🤖 Built with AI-Native Engineering (Human + AI Collaboration)

This project was built through an iterative, architecture-driven collaboration between **Onur Kangal** and **an AI Agent (Gemini)** acting as a Senior Systems Architect and Pair Programmer.

### How the Architecture Evolved:
1. **De-monolithization of Legacy Code:**  
   Transformed an experimental, single-file HTML prototype containing mixed inline logic, styles, and rendering into an enterprise-grade, clean ES module structure adhering to single-responsibility principles.
2. **Design of Serverless P2P Topology:**  
   Conceived and architected a cost-free, scalable co-op system using WebRTC DataChannels and an authoritative host model, bypassing the need for dedicated Node.js/Socket.io backend infrastructure.
3. **Complex Systems Debugging & Algorithmic Refinement:**
   * **Blast Wave Grace Period:** Solved a critical race condition where items revealed from broken bricks were instantly destroyed by the very blast wave that uncovered them by implementing an `immunityTimer` window.
   * **Corner Sliding Vector Inversion:** Diagnosed and corrected an axis calculation bug where Player 2 was pulled violently into walls during vertical navigation due to misassigned coordinate deltas (`targetX` applied to `player.y`).
   * **Decoupled Bomb Hitboxes:** Eliminated early solidification traps for Player 2 by moving from radial center distance calculations to per-player AABB clearance evaluation (`passableFor`).
   * **HUD Synchronization Race Condition:** Identified and fixed a DOM desynchronization bug during teammate revival where in-memory state changes failed to trigger immediate HUD updates on the Host, producing delayed health penalty visual artifacts.

---

## 🎮 Controls

| Action | Controls |
| :--- | :--- |
| **Move** | `Arrow Keys` or `W`, `A`, `S`, `D` |
| **Place Bomb** | `Spacebar` |
| **Revive Teammate** | `E` *(when standing near fallen partner in Co-op)* |
| **Quick Actions** | Dedicated `📋 COPY` and `📋 PASTE` buttons for room codes |

---

## 🚀 Local Development

Since the project uses native browser ES Modules, run it using any local static web server to avoid CORS file-protocol restrictions:

``` bash
# Clone the repository
git clone https://github.com/o-kangal/bombtogether.git
cd bombtogether

# Run with Python
python3 -m http.server 8000

# OR run with Node.js
npx serve .
``` 

Open `http://localhost:8000` in your browser.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.