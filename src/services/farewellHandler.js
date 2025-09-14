
import {
  handleLoserTransition,
  getUserKarmaPoints,
  getUserCredits,
} from "./userState.js";

export async function showFarewellAndExit() {
  return new Promise((resolve) => {
    // Determine the reason for becoming a loser
    const karmaPoints = getUserKarmaPoints();
    const credits = getUserCredits();

    let message = "";
    let title = "";

    if (karmaPoints >= 1000) {
      title = "⚡ KARMA OVERLOAD ⚡";
      message = `
        <div style="font-size: 18px; line-height: 1.4; color: #d32f2f;">
          <strong>Your karma has reached critical levels!</strong><br><br>
          <span style="color: #666;">With ${karmaPoints} karma points, your choices have consequences...</span><br><br>
          🔸 Too many bad decisions<br>
          🔸 Too many selfish actions<br>
          🔸 Too many risky bets<br><br>
          <em>The universe has spoken.</em>
        </div>
      `;
    } else {
      title = "💸 FINANCIALLY RUINED 💸";
      message = `
        <div style="font-size: 18px; line-height: 1.4; color: #d32f2f;">
          <strong>You've lost everything!</strong><br><br>
          <span style="color: #666;">With ${credits} credits remaining, you're broke...</span><br><br>
          🔸 Poor financial decisions<br>
          🔸 Reckless gambling<br>
          🔸 No self-control<br><br>
          <em>Time to start over.</em>
        </div>
      `;
    }

    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: 'Inter', system-ui, sans-serif;
    `;

    const popup = document.createElement("div");
    popup.style.cssText = `
      background: #fff;
      border: 4px solid #d32f2f;
      border-radius: 20px;
      padding: 40px;
      max-width: 500px;
      text-align: center;
      position: relative;
      animation: farewellEntrance 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;

    popup.innerHTML = `
      <div style="font-size: 28px; font-weight: 900; color: #d32f2f; margin-bottom: 20px;">
        ${title}
      </div>
      ${message}
      <div style="margin-top: 30px;">
        <button id="farewellBtn" style="
          background: #d32f2f;
          color: white;
          border: none;
          padding: 15px 30px;
          font-size: 18px;
          font-weight: 700;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        ">
          Accept Fate
        </button>
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes farewellEntrance {
        0% { transform: scale(0.3) translateY(-50px); opacity: 0; }
        50% { transform: scale(1.1) translateY(10px); opacity: 0.9; }
        100% { transform: scale(1) translateY(0); opacity: 1; }
      }
      
      @keyframes destructionShake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
      
      @keyframes destructionFade {
        0% { opacity: 1; transform: scale(1) rotate(0deg); }
        50% { opacity: 0.5; transform: scale(0.8) rotate(5deg); }
        100% { opacity: 0; transform: scale(0.3) rotate(15deg); }
      }
    `;
    document.head.appendChild(style);

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    const preventEscape = async (event) => {
      event.preventDefault();
      event.returnValue = "";

      await handleLoserTransition();

      return "";
    };

    window.addEventListener("beforeunload", preventEscape, { capture: true });

    // Also prevent via visibility change
    const handleVisibilityEscape = async () => {
      if (document.hidden) {
        await handleLoserTransition();
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityEscape);

    // Handle button click
    const btn = document.getElementById("farewellBtn");
    btn.addEventListener("mouseenter", () => {
      btn.style.background = "#b71c1c";
      btn.style.transform = "scale(1.05)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.background = "#d32f2f";
      btn.style.transform = "scale(1)";
    });

    btn.addEventListener("click", async () => {
      console.log("Accept Fate button clicked!");

      btn.disabled = true;
      btn.innerHTML = "Processing...";
      btn.style.background = "#999";
      btn.style.cursor = "not-allowed";

      window.removeEventListener("beforeunload", preventEscape, {
        capture: true,
      });
      document.removeEventListener("visibilitychange", handleVisibilityEscape);

      try {
        popup.style.animation =
          "destructionShake 0.5s ease-in-out, destructionFade 1s ease-in-out 0.5s forwards";

        console.log("Starting loser transition...");
        const success = await handleLoserTransition();
        console.log("Loser transition result:", success);

        setTimeout(() => {
          try {
            // Clean up
            if (document.body.contains(overlay)) {
              document.body.removeChild(overlay);
            }
            if (document.head.contains(style)) {
              document.head.removeChild(style);
            }

            console.log("Redirecting to login...");

            // Redirect to login
            if (window.location.pathname !== "/") {
              window.location.href = "/";
            }

            resolve();
          } catch (cleanupError) {
            console.error("Error during cleanup:", cleanupError);
            // Force redirect even if cleanup fails
            window.location.href = "/";
            resolve();
          }
        }, 1500);
      } catch (error) {
        console.error("Error in Accept Fate handler:", error);

        // Fallback: force redirect even if something fails
        alert("Account deletion failed, but you will be logged out.");

        // Clear local data manually
        try {
          localStorage.removeItem("kt_user");
          const { resetAllProgress } = await import("./userState.js");
          resetAllProgress();
        } catch (fallbackError) {
          console.error("Fallback cleanup failed:", fallbackError);
        }

        // Force redirect
        window.location.href = "/";
        resolve();
      }
    });
  });
}
