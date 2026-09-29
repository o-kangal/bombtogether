import { state } from './state.js';

const hudLevel = document.getElementById("hudLevel");
const hudLives = document.getElementById("hudLives");
const hudBombs = document.getElementById("hudBombs");
const hudFire = document.getElementById("hudFire");
const hudSpeed = document.getElementById("hudSpeed");
const hudScore = document.getElementById("hudScore");

const bannerOverlay = document.getElementById("bannerOverlay");
const bannerTitle = document.getElementById("bannerTitle");
const bannerSub = document.getElementById("bannerSub");
const bannerBtn = document.getElementById("bannerBtn");

export function updateHUD() {
  hudLevel.innerText = state.currentLevel;
  hudLives.innerText = "❤️".repeat(Math.max(0, state.lives));
  hudBombs.innerText = state.player.maxBombs;
  hudFire.innerText = state.player.bombRange;
  hudSpeed.innerText = state.player.speedLevel;
  hudScore.innerText = state.score;
}

export function showBanner({ title, titleColor = "#f1c40f", sub, btnText }) {
  bannerTitle.innerText = title;
  bannerTitle.style.color = titleColor;
  bannerSub.innerText = sub;
  bannerBtn.innerText = btnText;
  bannerOverlay.style.display = "flex";
}

export function hideBanner() {
  bannerOverlay.style.display = "none";
}

export function setupBannerListener(handler) {
  bannerBtn.addEventListener("click", handler);
}