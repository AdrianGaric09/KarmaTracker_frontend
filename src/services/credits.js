const KEY = "kt_user";
const DEFAULT_CREDITS = 1100;

export function readUser() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch (_) {
    return {};
  }
}

export function writeUser(obj) {
  try {
    localStorage.setItem(KEY, JSON.stringify(obj));
  } catch (error) {
    console.debug("Failed to write user to localStorage:", error);
  }
}

export function getCredits() {
  try {
    const { getUserCredits, getCurrentUser } = require("./userState.js");
    const user = getCurrentUser();
    if (user) {
      return getUserCredits();
    }
  } catch (error) {
    console.debug("Failed to get user credits from userState:", error);
  }

  const u = readUser();
  if (typeof u.credits !== "number") {
    u.credits = DEFAULT_CREDITS;
    writeUser(u);
  }
  return u.credits;
}

export function setCredits(value) {
  const v = Math.max(0, Math.floor(Number(value) || 0));

  try {
    const { setUserCredits, getCurrentUser } = require("./userState.js");
    const user = getCurrentUser();
    if (user) {
      return setUserCredits(v);
    }
  } catch (error) {
    console.debug("Failed to set user credits via userState:", error);
  }

  const u = readUser();
  u.credits = v;
  writeUser(u);
  return v;
}

export function addCredits(delta) {
  try {
    const { addUserCredits, getCurrentUser } = require("./userState.js");
    const user = getCurrentUser();
    if (user) {
      return addUserCredits(Math.floor(Number(delta) || 0));
    }
  } catch (error) {
    console.debug("Failed to add user credits via userState:", error);
  }

  const cur = getCredits();
  return setCredits(cur + Math.floor(Number(delta) || 0));
}

export function clampBet(maxBet) {
  const credits = getCredits();
  return Math.max(0, Math.min(maxBet, credits));
}
