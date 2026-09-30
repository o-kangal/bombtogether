# Networking & WebRTC Synchronization

## Architecture
BombTogether utilizes direct peer-to-peer browser communication via WebRTC DataChannels facilitated by PeerJS for signaling.

``` text
[Host / Player 1]                                      [Client / Player 2]
       │                                                       │
       │<──────── INPUT { keys: {...} } ───────────────────────│ (Continuous input transmission)
       │                                                       │
       ├─ Authoritative Game Loop (60 FPS)                     │
       ├─ Evaluates Physics & Collisions                       │
       ├─ Advances Stage & Entity States                       │
       │                                                       │
       │───────── SNAPSHOT (Broadcasted at ~30 FPS) ──────────>│ (Direct state render)
       │                                                       │
       │───────── EVENT { name: "BOMB_SET", ... } ────────────>│ (Instant auditory triggers)
``` 

## Room Code Protocol
* Host generates a 6-character room code from ROOM_CODE_ALPHABET (23456789ABCDEFGHJKLMNPQRSTUVWXYZ), excluding ambiguous characters (0, O, 1, I).
* The WebRTC identifier is namespaced: BOMBTOGETHER-COOP-[ROOM_CODE].
* Client normalizes user inputs using .toUpperCase().trim() before establishing the connection.

## Packet Definitions

### 1. INPUT (Client -> Host)
Sent immediately on keydown and keyup events:
``` json
{
  "type": "INPUT",
  "payload": {
    "ArrowUp": false,
    "ArrowDown": false,
    "ArrowLeft": false,
    "ArrowRight": false,
    "KeyW": false,
    "KeyS": false,
    "KeyA": false,
    "KeyD": false,
    "Space": false,
    "KeyE": false
  }
}
``` 

### 2. SNAPSHOT (Host -> Client)
Broadcasted every 2 frames (~30 FPS) to prevent DataChannel buffer overflows:
``` json
{
  "type": "SNAPSHOT",
  "payload": {
    "grid": [[0, 1, 2]],
    "bombs": [],
    "explosions": [],
    "items": [],
    "enemies": [],
    "exitDoor": { "r": 5, "c": 7, "unlocked": false },
    "floatingTexts": [],
    "players": { "p1": {}, "p2": {} },
    "currentLevel": 1,
    "score": 100,
    "gameState": "PLAYING",
    "cols": 17,
    "rows": 13
  }
}
``` 

### 3. EVENT (Host -> Client)
Sent immediately upon state transitions to trigger instant client-side audio playback:
``` json
{
  "type": "EVENT",
  "payload": {
    "name": "BOMB_SET",
    "x": 5.0,
    "y": 7.0
  }
}
``` 

## Critical Failure Modes
* Connection Drop: On DataChannel close, both players should encounter an actionable Game Over / Disconnection state.
* Canvas Size Mismatch: When receiving a snapshot, the Client must assert that its canvas dimensions match cols * TILE and rows * TILE.