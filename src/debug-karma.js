

async function debugKarma() {
  try {
    console.log("=== KARMA DEBUG ===");

    const { getCurrentUser, getUserKarmaPoints, getUserCredits } = await import(
      "./services/userState.js"
    );

    const user = getCurrentUser();
    console.log("Current user:", user);

    if (user) {
      const karma = getUserKarmaPoints();
      const credits = getUserCredits();

      console.log("Karma points:", karma);
      console.log("Credits:", credits);

      if (karma >= 1000 || credits <= 0) {
        console.log("User should be a loser! Triggering farewell...");

        const { showFarewellAndExit } = await import(
          "./services/farewellHandler.js"
        );
        await showFarewellAndExit();
      } else {
        console.log("User is safe for now.");

        if (confirm("Set karma to 1000 for testing?")) {
          const { setUserKarmaPoints } = await import(
            "./services/userState.js"
          );
          setUserKarmaPoints(1000);
          console.log("Karma set to 1000, checking again...");

          const { checkKarmaOnLoad } = await import(
            "./services/karmaTracker.js"
          );
          await checkKarmaOnLoad();
        }
      }
    } else {
      console.log("No user logged in");
    }
  } catch (error) {
    console.error("Debug error:", error);
  }
}

async function debugLoserTransition() {
  try {
    console.log("=== LOSER TRANSITION DEBUG ===");
    
    const { getCurrentUser, getUserKarmaPoints, getUserCredits, handleLoserTransition } = await import(
      "./services/userState.js"
    );

    const user = getCurrentUser();
    console.log("Current user:", user);
    
    if (user) {
      console.log("Email:", user.email);
      console.log("Username:", user.username || "No username");
      console.log("Karma points:", getUserKarmaPoints());
      console.log("Credits:", getUserCredits());
      
      if (confirm("Test loser transition now? This will move you to losers and log you out!")) {
        console.log("Testing loser transition...");
        const result = await handleLoserTransition();
        console.log("Loser transition result:", result);
      }
    } else {
      console.log("No user logged in");
    }
  } catch (error) {
    console.error("Debug error:", error);
  }
}

debugKarma();

window.debugLoserTransition = debugLoserTransition;
