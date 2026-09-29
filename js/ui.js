import { state } from './state.js';

const topHud = document.getElementById("topHud");
const hudLevel = document.getElementById("hudLevel");
const hudScore = document.getElementById("hudScore");
const hudP2 = document.getElementById("hudP2");
const reviveHelp = document.getElementById("reviveHelp");

const p1Lives = document.getElementById("p1Lives");
const p1Bombs = document.getElementById("p1Bombs");
const p1Fire = document.getElementById("p1Fire");
const p1Speed = document.getElementById("p1Speed");

const p2Lives = document.getElementById("p2Lives");
const p2Bombs = document.getElementById("p2Bombs");
const p2Fire = document.getElementById("p2Fire");
const p2Speed = document.getElementById("p2Speed");

const lobbyOverlay = document.getElementById("lobbyOverlay");
const viewModeSelect = document.getElementById("viewModeSelect");
const viewCoopChoice = document.getElementById("viewCoopChoice");
const viewHostWait = document.getElementById("viewHostWait");
const viewJoinInput = document.getElementById("viewJoinInput");

const displayRoomCode = document.getElementById("displayRoomCode");
const inputRoomCode = document.getElementById("inputRoomCode");
const joinErrorMsg = document.getElementById("joinErrorMsg");

const bannerOverlay = document.getElementById("bannerOverlay");
const bannerTitle = document.getElementById("bannerTitle");
const bannerSub = document.getElementById("bannerSub");
const bannerBtn = document.getElementById("bannerBtn");
const bannerStatus = document.getElementById("bannerStatus");

export function updateHUD() {
  hudLevel.innerText = state.currentLevel;
  hudScore.innerText = state.score;

  // Player 1 HUD
  p1Lives.innerText = state.players.p1.lives > 0 ? "❤️".repeat(state.players.p1.lives) : "💀";
  p1Bombs.innerText = state.players.p1.maxBombs;
  p1Fire.innerText = state.players.p1.bombRange;
  p1Speed.innerText = state.players.p1.speedLevel;

  // Player 2 HUD
  if (state.mode === "COOP") {
    hudP2.style.display = "flex";
    reviveHelp.style.display = "inline";
    topHud.style.maxWidth = "680px";
    p2Lives.innerText = state.players.p2.lives > 0 ? "❤️".repeat(state.players.p2.lives) : "💀";
    p2Bombs.innerText = state.players.p2.maxBombs;
    p2Fire.innerText = state.players.p2.bombRange;
    p2Speed.innerText = state.players.p2.speedLevel;
  } else {
    hudP2.style.display = "none";
    reviveHelp.style.display = "none";
    topHud.style.maxWidth = "520px";
  }
}

export function showLobbyView(viewName) {
  lobbyOverlay.style.display = "flex";
  viewModeSelect.style.display = viewName === "MODE_SELECT" ? "flex" : "none";
  viewCoopChoice.style.display = viewName === "COOP_CHOICE" ? "flex" : "none";
  viewHostWait.style.display = viewName === "HOST_WAIT" ? "flex" : "none";
  viewJoinInput.style.display = viewName === "JOIN_INPUT" ? "flex" : "none";
  joinErrorMsg.innerText = "";
}

export function hideLobby() {
  lobbyOverlay.style.display = "none";
}

export function setDisplayedRoomCode(code) {
  displayRoomCode.innerText = code;
}

export function getDisplayedRoomCode() {
  return displayRoomCode.innerText.trim();
}

export function setJoinError(msg) {
  joinErrorMsg.innerText = msg;
}

export function getEnteredRoomCode() {
  return inputRoomCode.value.toUpperCase().trim();
}

export function setEnteredRoomCode(code) {
  inputRoomCode.value = code;
}

export function showBanner({ title, titleColor = "#f1c40f", sub, btnText, isWaiting = false, statusText = "" }) {
  bannerTitle.innerText = title;
  bannerTitle.style.color = titleColor;
  bannerSub.innerText = sub;

  if (isWaiting) {
    bannerBtn.style.display = "none";
    bannerStatus.style.display = "inline-block";
    bannerStatus.innerText = statusText || "WAITING FOR HOST...";
  } else {
    bannerBtn.style.display = "inline-block";
    bannerBtn.innerText = btnText;
    bannerStatus.style.display = "none";
  }

  bannerOverlay.style.display = "flex";
}

export function hideBanner() {
  bannerOverlay.style.display = "none";
}

export function setupBannerListener(handler) {
  bannerBtn.addEventListener("click", handler);
}