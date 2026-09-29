export const state = {
  currentLevel: 1,
  score: 0,
  lives: 3,
  gameState: "PLAYING", // PLAYING, LEVEL_CLEARED, GAME_OVER

  player: {
    x: 1.15,
    y: 1.15,
    size: 26,
    speedLevel: 1,
    speed: 2.5,
    maxBombs: 1,
    bombRange: 1,
    facing: "DOWN",
    animFrame: 0,
    alive: true
  },

  grid: [],
  bombs: [],
  explosions: [],
  items: [],
  enemies: [],
  exitDoor: { r: -1, c: -1, unlocked: false },
  floatingTexts: [],
  keys: {}
};

export function resetPlayerStats() {
  state.player.maxBombs = 1;
  state.player.bombRange = 1;
  state.player.speed = 2.5;
  state.player.speedLevel = 1;
}