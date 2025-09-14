
import { addUserKarmaPoints, checkLoserConditions } from "./userState.js";

async function trackKarma(points, reason = "") {
  try {
    const { getCurrentUser } = await import("./userState.js");
    const user = getCurrentUser();
    if (user && user.isAdmin === true) {
      console.debug(`Karma tracking skipped: User is an admin and immune to karma changes`);
      return null;
    }

    const { isWinnerImmuneToKarma } = await import("./userState.js");
    if (isWinnerImmuneToKarma()) {
      console.debug(`Karma tracking skipped: User is a winner and immune to karma changes`);
      return null;
    }

    const newTotal = addUserKarmaPoints(points);
    console.debug(`Karma tracked: +${points} (${reason}). Total: ${newTotal}`);

    if (checkLoserConditions()) {
      console.log("User has reached loser conditions, triggering farewell...");

      const { showFarewellAndExit } = await import("./farewellHandler.js");
      await showFarewellAndExit();
    }

    return newTotal;
  } catch (error) {
    console.error("Error tracking karma:", error);
    return null;
  }
}


export function trackBadScenarioChoice() {
  return trackKarma(100, "bad scenario choice");
}

export function trackItemPurchase() {
  return trackKarma(100, "item purchase");
}

export function trackUsernameChange() {
  return trackKarma(100, "username change");
}

export function trackTestMyLuckPlay(betAmount = 0) {
  const karmaPoints = betAmount >= 300 ? 200 : 100;
  return trackKarma(karmaPoints, `test my luck play (bet: ${betAmount})`);
}

export function trackNoChoice() {
  return trackKarma(100, 'chose "no" at beginning');
}

export function shouldTrackKarma() {
  try {
    const { getCurrentUser } = require("./userState.js");
    const user = getCurrentUser();
    return user && user.email; // Only track for logged-in users
  } catch (error) {
    return false;
  }
}

export async function checkKarmaOnLoad() {
  try {
    // Check if user is an admin (immune to karma)
    const { getCurrentUser } = await import("./userState.js");
    const user = getCurrentUser();
    if (user && user.isAdmin === true) {
      console.debug("Karma check skipped: User is an admin and immune to karma changes");
      return;
    }

    const { checkLoserConditions, getUserKarmaPoints } = await import(
      "./userState.js"
    );

    if (checkLoserConditions()) {
      const karmaPoints = getUserKarmaPoints();

      // If karma is at 1000+, set up beforeunload protection
      if (karmaPoints >= 1000) {
        setupKarmaProtection();
      }

      console.log(
        "User has reached loser conditions on load, triggering farewell..."
      );

      // Import and show farewell
      const { showFarewellAndExit } = await import("./farewellHandler.js");
      await showFarewellAndExit();
    }
  } catch (error) {
    console.error("Error checking karma on load:", error);
  }
}

function setupKarmaProtection() {
  const handleBeforeUnload = async (event) => {
    event.preventDefault();
    event.returnValue = ""; // Required for Chrome

    try {
      const { handleLoserTransition } = await import("./userState.js");
      await handleLoserTransition();
    } catch (error) {
      console.error("Error handling karma evasion:", error);
    }

    return "";
  };

  window.addEventListener("beforeunload", handleBeforeUnload, {
    capture: true,
  });

  const handleVisibilityChange = async () => {
    if (document.hidden) {
      try {
        const { getUserKarmaPoints } = await import("./userState.js");
        if (getUserKarmaPoints() >= 1000) {
          const { handleLoserTransition } = await import("./userState.js");
          await handleLoserTransition();
        }
      } catch (error) {
        console.error("Error handling karma evasion via visibility:", error);
      }
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
}
