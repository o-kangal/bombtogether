# Gameplay Systems, Health Pools & Entity Lifecycles

## Health & Respawn Mechanics

### Individual Life Tracking
* Both players start with 3 lives (lives = 3).
* When an active player suffers lethal damage (bomb explosion or enemy collision):
  1. p.alive = false
  2. p.lives--
  3. AudioEngine.death() is triggered.
  4. updateHUD() must be called immediately.

### Self-Respawn (When lives > 0)
* The player body disappears, and a countdown begins: p.respawnTimer = 90 (1.5 seconds at 60 FPS).
* Once the timer reaches zero:
  * p.alive = true
  * Coordinates reset to their home corner (P1: Top-Left 1.15, 1.15; P2: Bottom-Right COLS - 2 + 0.15, ROWS - 2 + 0.15).
  * p.invincibleTimer = 180 (3 seconds invulnerability window with visual blinking).
  * updateHUD() is invoked.

### Permanent Gravestone & Teammate Revive (When lives === 0)
* When a player loses their last life, they do not respawn automatically.
* A gravestone sprite is drawn at their last location (drawPlayer RIP graphic).
* The fallen player's HUD displays skull icon.
* Revive Action (Key 'E'):
  * Surviving player must have at least 2 lives (activePlayer.lives >= 2).
  * Surviving player stands within 1.2 tile distance of the gravestone (dist <= 1.2).
  * When E is triggered:
    1. activePlayer.lives--
    2. deadPlayer.lives = 1
    3. deadPlayer.alive = true
    4. deadPlayer.invincibleTimer = 180
    5. AudioEngine.revive() triggers.
    6. updateHUD() MUST be called immediately to prevent visual health discrepancies.

## Stage Progression & Exit Portal
* An exit portal is concealed behind one random destructible brick during maze generation.
* The exit portal remains inactive (unlocked = false) until every enemy on the map is eliminated.
* Once unlocked, stepping onto the portal tile advances to the next stage (currentLevel + 1).
* If one player is deceased with 0 lives when the stage is cleared, their corpse/gravestone is carried over to the next stage's starting corner, allowing their teammate to revive them in the next stage.
* Game Over: Triggered only when both players are dead and neither has remaining lives (!p1CanRespawn && !p2CanRespawn).