const AVATAR_COLORS = {
  1: { primary: "#56C4FF", tint: "rgba(86, 196, 255, 0.12)" },
  2: { primary: "#FFEE56", tint: "rgba(255, 238, 86, 0.12)" },
  3: { primary: "#FF7A56", tint: "rgba(255, 122, 86, 0.12)" },
  4: { primary: "#FF94FB", tint: "rgba(255, 148, 251, 0.12)" },
  5: { primary: "#7E3F8D", tint: "rgba(126, 63, 141, 0.12)" },
  6: { primary: "#994BFF", tint: "rgba(153, 75, 255, 0.12)" },
  7: { primary: "#6FFF56", tint: "rgba(111, 255, 86, 0.12)" },
};

const DEFAULT_USER_STATE = {
  credits: 1100,
  avatarIndex: 1,
  isSwitchOn: false,
  usernameChanges: {
    count: 0,
    hasFreeChange: true,
  },
  gameProgress: {
    hasSpunWheel: false,
    wheelSpinCount: 0,
    lastWheelResult: null,
    gameHistory: [],
  },
  preferences: {
    selectedColor: null,
    lastVisitedPage: null,
  },
  onboarding: {
    hasOpenedMenuOnce: false,
    hasSeenOnboardingPopup: false,
  },
  crown: {
    isWinner: false,
    hasPurchasedCrown: false,
    purchaseTimestamp: null,
  },
};

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem("kt_user");
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user && user.email ? user : null;
  } catch (_) {
    return null;
  }
}

function getUserStateKey(userEmail) {
  if (!userEmail) return null;
  const safeEmail = userEmail.toLowerCase().replace(/[^a-z0-9@._-]/g, "");
  return `kt_state_${safeEmail}`;
}

export function getUserState() {
  const user = getCurrentUser();
  if (!user || !user.email) {
    return { ...DEFAULT_USER_STATE };
  }

  const stateKey = getUserStateKey(user.email);
  if (!stateKey) return { ...DEFAULT_USER_STATE };

  try {
    const raw = localStorage.getItem(stateKey);
    if (!raw) {
      return { ...DEFAULT_USER_STATE };
    }

    const savedState = JSON.parse(raw);
    return {
      ...DEFAULT_USER_STATE,
      ...savedState,
    };
  } catch (error) {
    console.debug("Failed to parse user state, using defaults:", error);
    return { ...DEFAULT_USER_STATE };
  }
}

export function saveUserState(state) {
  const user = getCurrentUser();
  if (!user || !user.email) {
    console.warn("Cannot save user state: no user logged in");
    return false;
  }

  const stateKey = getUserStateKey(user.email);
  if (!stateKey) return false;

  try {
    const currentState = getUserState();
    const mergedState = { ...currentState, ...state };
    localStorage.setItem(stateKey, JSON.stringify(mergedState));
    return true;
  } catch (error) {
    console.warn("Failed to save user state:", error);
    return false;
  }
}

export function updateUserState(updates) {
  return saveUserState(updates);
}

export function clearUserState() {
  const user = getCurrentUser();
  if (!user || !user.email) return;

  const stateKey = getUserStateKey(user.email);
  if (stateKey) {
    try {
      localStorage.removeItem(stateKey);
    } catch (error) {
      console.debug("Failed to clear user state:", error);
    }
  }
}

export function initializeUserState() {
  const state = getUserState();

  try {
    const { setCredits } = require("./credits.js");
    setCredits(state.credits);

    localStorage.setItem("kt_ui_off", state.isSwitchOn ? "1" : "0");

    const user = getCurrentUser();
    if (user) {
      user.avatarIndex = state.avatarIndex;
      localStorage.setItem("kt_user", JSON.stringify(user));
    }
  } catch (error) {
    console.warn("Failed to initialize user state:", error);
  }

  return state;
}

export function resetToDefaults() {
  try {
    const { setCredits } = require("./credits.js");
    setCredits(1100);

    localStorage.setItem("kt_ui_off", "0");
    localStorage.setItem("creditsOnHomescreen", "false");
  } catch (error) {
    console.debug("Failed to reset to defaults:", error);
  }
}

export function getUserCredits() {
  const state = getUserState();
  return state.credits;
}

export function setUserCredits(amount) {
  const credits = Math.max(0, Math.floor(Number(amount) || 0));
  updateUserState({ credits });

  try {
    const { setCredits } = require("./credits.js");
    setCredits(credits);
  } catch (error) {
    console.debug("Failed to sync credits with credits.js:", error);
  }

  return credits;
}

export function addUserCredits(delta) {
  const current = getUserCredits();
  return setUserCredits(current + Math.floor(Number(delta) || 0));
}

export function getUserAvatar() {
  const state = getUserState();
  return {
    avatarIndex: state.avatarIndex,
    isAvatar1: state.avatarIndex === 1,
  };
}

export function setUserAvatar(avatarIndex) {
  const index = Math.max(1, Math.min(7, Math.floor(Number(avatarIndex) || 1)));
  updateUserState({ avatarIndex: index });

  const user = getCurrentUser();
  if (user) {
    user.avatarIndex = index;
    localStorage.setItem("kt_user", JSON.stringify(user));
  }

  return index;
}

export function getUserSwitchState() {
  const state = getUserState();
  return state.isSwitchOn;
}

export function setUserSwitchState(isOn) {
  const switchOn = Boolean(isOn);
  updateUserState({ isSwitchOn: switchOn });

  localStorage.setItem("kt_ui_off", switchOn ? "1" : "0");

  return switchOn;
}

export function getUserCreditsHomescreenState() {
  const state = getUserState();
  return state.creditsOnHomescreen || false;
}

export function setUserCreditsHomescreenState(isOn) {
  const creditsOn = Boolean(isOn);
  updateUserState({ creditsOnHomescreen: creditsOn });

  localStorage.setItem("creditsOnHomescreen", creditsOn ? "true" : "false");

  return creditsOn;
}

export function getUserKarmaPoints() {
  const state = getUserState();
  return state.karmaPoints || 0;
}

export function setUserKarmaPoints(points) {
  const karmaPoints = Math.max(0, Math.floor(Number(points) || 0));
  updateUserState({ karmaPoints });

  try {
    const user = getCurrentUser();
    if (user) {
      user.karmaPoints = karmaPoints;
      localStorage.setItem("kt_user", JSON.stringify(user));
    }
  } catch (error) {
    console.debug("Failed to sync karma points to localStorage:", error);
  }

  return karmaPoints;
}

export function addUserKarmaPoints(delta) {
  const current = getUserKarmaPoints();
  const newPoints = current + Math.floor(Number(delta) || 0);
  return setUserKarmaPoints(newPoints);
}

export function checkLoserConditions() {
  const user = getCurrentUser();
  
  if (user && user.isAdmin === true) {
    return false;
  }
  
  const credits = getUserCredits();
  const karmaPoints = getUserKarmaPoints();

  return credits <= 0 || karmaPoints >= 1000;
}

export async function handleLoserTransition() {
  try {
    console.log("Starting handleLoserTransition...");

    const user = getCurrentUser();
    if (!user || !user.email) {
      console.error("No user found for loser transition");
      return false;
    }

    if (user.isAdmin === true) {
      console.log("Admin user is immune to loser transition");
      return false;
    }

    if (typeof user.email !== 'string' || user.email.length === 0) {
      console.error("Invalid user email for loser transition:", user.email);
      return false;
    }

    console.log("User found:", user.email);
    console.log("Username:", user.username || "No username");
    console.log("Karma points:", getUserKarmaPoints());
    console.log("Credits:", getUserCredits());
    
    const karmaPoints = getUserKarmaPoints();
    const credits = getUserCredits();
    
    if (typeof karmaPoints !== 'number' || typeof credits !== 'number') {
      console.error("Invalid karma or credits data:", { karmaPoints, credits });
      return false;
    }

    try {
      console.log("Calling API to mark user as loser...");
      const api = (await import("./api")).default;
      
      const loserData = {
        email: user.email,
        isLoser: true,
        loserReason: karmaPoints >= 1000 ? "karma_exceeded" : "credits_depleted",
        loserTimestamp: new Date().toISOString(),
        karmaPoints: karmaPoints,
        credits: credits
      };
      
      console.log("Sending loser data:", loserData);
      
      const response = await api.post("/api/mark-user-as-loser", loserData);
      console.log("API call successful:", response.data);
      
      if (response.status >= 200 && response.status < 300) {
        console.log("User successfully marked as loser");
      } else {
        console.warn("API call returned non-success status:", response.status);
      }
    } catch (apiError) {
      console.error("API call failed:", apiError);
      console.error("API error details:", {
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
        message: apiError.message
      });
      
      console.log("Continuing with local cleanup despite API failure...");
    }

    const loserUser = {
      ...user,
      isLoser: true,
      loserReason: karmaPoints >= 1000 ? "karma_exceeded" : "credits_depleted",
      loserTimestamp: new Date().toISOString()
    };
    localStorage.setItem("kt_user", JSON.stringify(loserUser));
    
    resetAllProgress();

    return true;
  } catch (error) {
    console.error("Failed to handle loser transition:", error);
    return false;
  }
}

export function updateGameProgress(progress) {
  const currentState = getUserState();
  const updatedProgress = {
    ...currentState.gameProgress,
    ...progress,
  };
  updateUserState({ gameProgress: updatedProgress });
  return updatedProgress;
}

export function hasUserSpunWheel() {
  const state = getUserState();
  return state.gameProgress.hasSpunWheel;
}

export function markWheelSpun(result = null) {
  const currentState = getUserState();
  const gameProgress = {
    ...currentState.gameProgress,
    hasSpunWheel: true,
    wheelSpinCount: (currentState.gameProgress.wheelSpinCount || 0) + 1,
    lastWheelResult: result,
  };
  updateUserState({ gameProgress });
}

export function getUsernameChangeInfo() {
  const state = getUserState();
  const count = state.usernameChanges?.count || 0;
  return {
    count: count,
    hasFreeChange: state.usernameChanges?.hasFreeChange !== false,
    needsToPay: count > 0 && !state.usernameChanges?.hasFreeChange,
    maxChangesReached: count >= 2,
  };
}

export function getUserOnboardingState(email = null) {
  const state = getUserState(email);
  return (
    state.onboarding || {
      hasOpenedMenuOnce: false,
      hasSeenOnboardingPopup: false,
    }
  );
}

export function updateOnboardingState(onboardingData) {
  const currentState = getUserState();
  const updatedOnboarding = {
    ...currentState.onboarding,
    ...onboardingData,
  };
  updateUserState({ onboarding: updatedOnboarding });
  return updatedOnboarding;
}

export function canChangeUsername() {
  const info = getUsernameChangeInfo();

  if (info.maxChangesReached) return false;

  if (info.hasFreeChange) return true;

  const credits = getUserCredits();
  return credits >= 500;
}

export function markUsernameChanged() {
  const currentState = getUserState();
  const usernameChanges = {
    count: (currentState.usernameChanges?.count || 0) + 1,
    hasFreeChange: false,
  };
  updateUserState({ usernameChanges });
}

export function purchaseUsernameChange() {
  const info = getUsernameChangeInfo();

  if (info.maxChangesReached) return false;

  const credits = getUserCredits();
  if (credits < 500) return false;

  setUserCredits(credits - 500);

  const currentState = getUserState();
  const usernameChanges = {
    ...currentState.usernameChanges,
    hasFreeChange: true,
  };
  updateUserState({ usernameChanges });

  return true;
}

export function resetAllProgress() {
  try {
    const user = getCurrentUser();
    if (!user) return false;

    const safeEmail = user.email.toLowerCase().replace(/[^a-z0-9@._-]/g, "");

    const stateKey = getUserStateKey(user.email);
    if (stateKey) {
      localStorage.removeItem(stateKey);
    }

    localStorage.removeItem(`kt_scenarios_completed_${safeEmail}`);
    localStorage.removeItem(`kt_unlocked_items_${safeEmail}`);
    localStorage.removeItem(`kt_last_route_${safeEmail}`);
    localStorage.removeItem(`kt_has_reached_home_${safeEmail}`);
    localStorage.removeItem(`kt_mi_proceed_${safeEmail}`);
    localStorage.removeItem(`kt_tml_proceed_${safeEmail}`);

    localStorage.removeItem("kt_scenarios_completed");
    localStorage.removeItem("kt_unlocked_items");
    localStorage.removeItem("kt_last_route");
    localStorage.removeItem("creditsOnHomescreen");

    resetToDefaults();

    const preservedStatus = {
      isAdmin: user.isAdmin || false,
      isWinner: user.isWinner || false,
      isLoser: user.isLoser || false
    };

    if (user.isAdmin === true) {
      setUserKarmaPoints(0);
      console.log("Admin karma points explicitly reset to 0");
    }

    initializeUserState();

    user.isAdmin = preservedStatus.isAdmin;
    user.isWinner = preservedStatus.isWinner;
    user.isLoser = preservedStatus.isLoser;
    localStorage.setItem("kt_user", JSON.stringify(user));
    
    console.log("User status preserved after reset:", preservedStatus);

    console.log(
      "All user progress has been reset - user will have fresh first-time experience"
    );
    return true;
  } catch (error) {
    console.error("Error resetting user progress:", error);
    return false;
  }
}

export function getAvatarColor(avatarIndex = null) {
  const index = avatarIndex || getUserAvatar().avatarIndex;
  return AVATAR_COLORS[index] || AVATAR_COLORS[1];
}

export function clearUserProgress(userEmail) {
  try {
    if (!userEmail) return false;

    const safeEmail = userEmail.toLowerCase().replace(/[^a-z0-9@._-]/g, "");

    localStorage.removeItem(`kt_state_${safeEmail}`);
    localStorage.removeItem(`kt_scenarios_completed_${safeEmail}`);
    localStorage.removeItem(`kt_unlocked_items_${safeEmail}`);
    localStorage.removeItem(`kt_last_route_${safeEmail}`);
    localStorage.removeItem(`kt_has_reached_home_${safeEmail}`);
    localStorage.removeItem(`kt_mi_proceed_${safeEmail}`);
    localStorage.removeItem(`kt_tml_proceed_${safeEmail}`);

    console.log(`Cleared progress for user: ${userEmail}`);
    return true;
  } catch (error) {
    console.error("Error clearing user progress:", error);
    return false;
  }
}

export function isEligibleForCrown() {
  const credits = getUserCredits();
  const karmaPoints = getUserKarmaPoints();
  const state = getUserState();
  
  return credits >= 5000 && karmaPoints <= 499 && !state.crown?.hasPurchasedCrown;
}

export function canPurchaseCrown() {
  return isEligibleForCrown();
}

export async function purchaseCrown() {
  if (!canPurchaseCrown()) return false;
  
  const credits = getUserCredits();
  if (credits < 5000) return false;
  
  setUserCredits(credits - 5000);
  
  const success = await promoteToWinner("Purchased crown for 5000 credits");
  
  if (success) {
    console.log("Crown purchased! User is now a winner with karma points set to 0.");
    return true;
  } else {
    console.log("Crown purchase failed or user already a winner");
    return false;
  }
}

export function isWinnerImmuneToKarma() {
  const state = getUserState();
  return state.crown?.isWinner || false;
}

export async function promoteToWinner(reason = "Wheel of Fortune") {
  try {
    const user = getCurrentUser();
    if (!user || !user.email) return false;
    
    if (user.isWinner === true) return false;
    
    const api = (await import("./api")).default;
    
    const response = await api.post("/api/admin/promote-winner", {
      email: user.email,
      adminEmail: "Wheel of Fortune",
      reason: reason
    });
    
    if (response.data) {
      // Update local user data
      user.isWinner = true;
      localStorage.setItem("kt_user", JSON.stringify(user));
      
      setUserKarmaPoints(0);
      
      // Update crown status
      const currentState = getUserState();
      const updatedCrown = {
        ...currentState.crown,
        isWinner: true,
        hasPurchasedCrown: true,
        purchaseTimestamp: new Date().toISOString(),
      };
      updateUserState({ crown: updatedCrown });
      
      console.log("User promoted to winner via wheel:", user.email);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error promoting to winner:", error);
    return false;
  }
}

export function isWinner() {
  const state = getUserState();
  return state.crown?.isWinner || false;
}

export function getCrownStatus() {
  const state = getUserState();
  return {
    isWinner: state.crown?.isWinner || false,
    hasPurchasedCrown: state.crown?.hasPurchasedCrown || false,
    purchaseTimestamp: state.crown?.purchaseTimestamp || null,
    isEligible: isEligibleForCrown(),
    canPurchase: canPurchaseCrown(),
  };
}

export function removeCrownStatus() {
  const currentState = getUserState();
  const updatedCrown = {
    ...currentState.crown,
    isWinner: false,
    hasPurchasedCrown: false,
    purchaseTimestamp: null,
  };
  
  updateUserState({ crown: updatedCrown });
  
  const user = getCurrentUser();
  if (user) {
    user.isWinner = false;
    localStorage.setItem("kt_user", JSON.stringify(user));
    console.log("User data updated with isWinner: false");
  }
  
  console.log("Crown status removed - user is no longer a winner.");
  return true;
}

export async function syncUserStatus() {
  try {
    const user = getCurrentUser();
    if (!user || !user.email) return false;

    const api = (await import("./api")).default;
    const response = await api.get(`/api/user-status/${user.email}`);
    
    if (response.data) {
      const { isWinner, isLoser, isAdmin } = response.data;
      
      user.isWinner = isWinner || false;
      user.isLoser = isLoser || false;
      user.isAdmin = isAdmin || false;
      
      if (isWinner) {
        setUserKarmaPoints(0);
        console.log("Winner karma points set to 0");
      }
      
      localStorage.setItem("kt_user", JSON.stringify(user));
      
      if (isWinner) {
        const currentState = getUserState();
        const updatedCrown = {
          ...currentState.crown,
          isWinner: true,
          hasPurchasedCrown: true,
          purchaseTimestamp: new Date().toISOString()
        };
        updateUserState({ crown: updatedCrown });
        console.log("Crown status synced for winner");
      }
      
      console.log("User status synced from backend:", {
        email: user.email,
        isWinner,
        isLoser,
        isAdmin
      });
      
      window.dispatchEvent(new CustomEvent('userStatusUpdated', {
        detail: { isWinner, isLoser, isAdmin }
      }));
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error syncing user status:", error);
    return false;
  }
}

export async function demoteToLoser(reason = "Wheel of Misfortune") {
  try {
    const user = getCurrentUser();
    if (!user || !user.email) return false;
    
    // Check if user is already a loser
    if (user.isLoser === true) return false;
    
    // Admins are immune to loser transition
    if (user.isAdmin === true) return false;
    
    const api = (await import("./api")).default;
    
    // Call the API to mark user as loser
    const loserData = {
      email: user.email,
      isLoser: true,
      loserReason: reason,
      loserTimestamp: new Date().toISOString(),
      karmaPoints: getUserKarmaPoints(),
      credits: getUserCredits()
    };
    
    const response = await api.post("/api/mark-user-as-loser", loserData);
    
    if (response.data) {
      // Update local user data
      user.isLoser = true;
      user.loserReason = reason;
      user.loserTimestamp = new Date().toISOString();
      localStorage.setItem("kt_user", JSON.stringify(user));
      
      console.log("User demoted to loser via wheel:", user.email);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error demoting to loser:", error);
    return false;
  }
}

// Legacy function for backward compatibility
export async function syncWinnerStatus() {
  return await syncUserStatus();
}
