# Task Backlog & Engineering Specifications

When implementing a task or fixing a bug, adhere to the standard specification template below.

---

## Task Specification Template
* ID: TASK-XXX
* Title: Concise title
* Status: TODO | IN_PROGRESS | COMPLETED
* Touch Points: Explicit list of files to modify
* Objective: Functional description of the feature or bug
* Acceptance Criteria:
  - Specific condition 1
  - Specific condition 2
* Edge Cases & Pitfalls: Architectural warnings, synchronization requirements.

---

## Active Backlog

### TASK-001: WebRTC Latency & Ping Indicator
* Status: TODO
* Touch Points: js/network.js, js/ui.js, index.html, css/style.css
* Objective: Display a lightweight latency indicator (ms) on the HUD during Co-op sessions so players can assess connection health.
* Acceptance Criteria:
  - Host and Client periodically ping/pong over DataChannel every 3 seconds.
  - Round-trip time (RTT) calculated and displayed in the HUD as PING: XX ms.
  - Color-coded: Green (<60ms), Yellow (60-150ms), Red (>150ms).
* Edge Cases: Avoid sending ping packets inside the 60 FPS loop. Use decoupled setInterval.

---

### TASK-002: Screen Shake & Brick Debris Particle FX
* Status: TODO
* Touch Points: js/renderer.js, js/state.js, js/bomb.js
* Objective: Add punchy screen shake during simultaneous bomb explosions and particle debris when bricks crumble.
* Acceptance Criteria:
  - Screen shake offset applied to canvas context matrix during explosions (duration <= 10 frames).
  - Small brick fragments burst outward when a destructible brick is eliminated.
  - Particle updates and rendering must not drop 60 FPS performance.
* Edge Cases: Canvas context transform matrix must be properly restored (ctx.restore()) after rendering shaken frames.