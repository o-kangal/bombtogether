# Local Testing & Multi-Client Verification

Because WebRTC DataChannels and ES6 Modules require standard origin isolation and network protocol security, local testing follows strict steps.

## 1. Starting the Local Web Server
File-system protocol (file:///) will block ES6 modules due to CORS policies. Run a local static HTTP server from the project root:

``` bash
# Python 3
python3 -m http.server 8000

# OR Node.js
npx serve .
``` 

## 2. Multi-Client Testing Routine
To verify Host-Client synchronization on a single machine:

1. Open Browser Window A (Host): Navigate to http://localhost:8000.
2. Open Browser Window B (Client): Open an Incognito / Private Window (or a different browser such as Chrome vs Firefox/Zen) and navigate to http://localhost:8000.
3. In Window A: Select CO-OP MULTIPLAYER -> CREATE GAME. Click COPY.
4. In Window B: Select CO-OP MULTIPLAYER -> JOIN GAME. Click PASTE -> CONNECT.
5. Observe that both overlays vanish and both players spawn in opposite corners.

## 3. Core Verification Checklist
* Both windows show canvas rendering without console errors.
* Moving Player 1 in Window A reflects smoothly in Window B.
* Moving Player 2 in Window B reflects smoothly in Window A.
* Player 2 can drop bombs and step off without sticking to corners or bombs.
* When Player 2 dies with lives remaining, auto-respawn occurs after 1.5s.
* When Player 2 dies with 0 lives, Player 1 can revive them via E key.
* HUD lives and icons match precisely on both windows after a revive.
* Clearing Stage 1 allows the Host to click CONTINUE and both windows cleanly advance to Stage 2.