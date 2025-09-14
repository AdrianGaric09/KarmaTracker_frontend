import { createRouter, createWebHistory } from "vue-router";
import Login from "./views/Login.vue";
import Signup from "./views/signUp.vue";
import Welcome from "./views/Welcome.vue";
import Yes from "./views/Yes.vue";
import No from "./views/No.vue";
import Start from "./views/Start.vue";
import Proceed from "./views/Proceed.vue";
import Scenario from "./views/scenario.vue";
import Profile from "./views/Profile.vue";
import TmlProceed from "./views/tmlProceed.vue";
import TestMyLuck from "./views/testMyLuck.vue";
import ColorPrediction from "./views/colorPrediction.vue";
import CoinFlip from "./views/coinFlip.vue";
import RandomPrize from "./views/randomPrize.vue";
import MiProceed from "./views/miProceed.vue";
import MyItems from "./views/myItems.vue";
import MyPoints from "./views/myPoints.vue";
import Users from "./views/Users.vue";
import Contact from "./views/Contact.vue";
import Leaderboard from "./views/Leaderboard.vue";

const routes = [
  { path: "/", name: "Login", component: Login },
  { path: "/signup", name: "Signup", component: Signup },
  {
    path: "/welcome",
    name: "Welcome",
    component: Welcome,
    meta: { requiresAuth: true },
  },
  { path: "/yes", name: "Yes", component: Yes, meta: { requiresAuth: true } },
  { path: "/no", name: "No", component: No, meta: { requiresAuth: true } },
  {
    path: "/start",
    name: "Start",
    component: Start,
    meta: { requiresAuth: true },
  },
  {
    path: "/proceed",
    name: "Proceed",
    component: Proceed,
    meta: { requiresAuth: true },
  },
  {
    path: "/home",
    name: "Home",
    component: Scenario,
    meta: { requiresAuth: true },
  },
  { path: "/scenario", redirect: "/home" },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: "/tml-intro",
    name: "TmlProceed",
    component: TmlProceed,
    meta: { requiresAuth: true },
  },
  {
    path: "/games",
    name: "TestMyLuck",
    component: TestMyLuck,
    meta: { requiresAuth: true },
  },
  { path: "/test-my-luck", redirect: "/games" },
  {
    path: "/games/color",
    name: "ColorPrediction",
    component: ColorPrediction,
    meta: { requiresAuth: true },
  },
  {
    path: "/games/coin",
    name: "CoinFlip",
    component: CoinFlip,
    meta: { requiresAuth: true },
  },
  {
    path: "/games/random",
    name: "RandomPrize",
    component: RandomPrize,
    meta: { requiresAuth: true },
  },
  {
    path: "/items-intro",
    name: "MiProceed",
    component: MiProceed,
    meta: { requiresAuth: true },
  },
  {
    path: "/items",
    name: "MyItems",
    component: MyItems,
    meta: { requiresAuth: true },
  },
  {
    path: "/points",
    name: "MyPoints",
    component: MyPoints,
    meta: { requiresAuth: true },
  },
  {
    path: "/users",
    name: "Users",
    component: Users,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/contact",
    name: "Contact",
    component: Contact,
    meta: { requiresAuth: true },
  },
  {
    path: "/leaderboard",
    name: "Leaderboard",
    component: Leaderboard,
    meta: { requiresAuth: true, requiresWinner: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});


function isAuthenticated() {
  try {
    const userData = localStorage.getItem("kt_user");
    if (!userData) return false;
    const user = JSON.parse(userData);
    return user && user.email;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
}

function isAdmin() {
  try {
    const userData = localStorage.getItem("kt_user");
    if (!userData) return false;
    const user = JSON.parse(userData);
    return user && user.isAdmin === true;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

function isLoser() {
  try {
    const userData = localStorage.getItem("kt_user");
    if (!userData) return false;
    const user = JSON.parse(userData);
    if (!user || !user.email) return false;

    if (user.isLoser === true) {
      console.log("User is marked as loser in user data");
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking loser status:", error);
    return false;
  }
}

function isWinner() {
  try {
    const userData = localStorage.getItem("kt_user");
    if (!userData) return false;
    const user = JSON.parse(userData);
    if (!user || !user.email) return false;

    return user.isWinner === true;
  } catch (error) {
    console.error("Error checking winner status:", error);
    return false;
  }
}

function saveCurrentRoute(to) {
  try {
    if (to.name !== "Login" && to.name !== "Signup") {
      const userData = localStorage.getItem("kt_user");
      if (userData) {
        const user = JSON.parse(userData);
        if (user && user.email) {
          const safeEmail = user.email
            .toLowerCase()
            .replace(/[^a-z0-9@._-]/g, "");

          if (to.path === "/home") {
            localStorage.setItem(`kt_has_reached_home_${safeEmail}`, "true");
          }

          localStorage.setItem(`kt_last_route_${safeEmail}`, to.path);
        }
      }

      localStorage.setItem("kt_last_route", to.path);
    }
  } catch (error) {
    console.error("Error saving route:", error);
  }
}

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);
  const requiresWinner = to.matched.some((record) => record.meta.requiresWinner);
  const userAuthenticated = isAuthenticated();
  const userIsAdmin = isAdmin();
  const userIsLoser = isLoser();
  const userIsWinner = isWinner();

  if (requiresAuth && !userAuthenticated) {
    return next("/");
  }

  if (userAuthenticated && userIsLoser) {
    console.log("User is authenticated and is a loser, checking route access");
    // Losers can only access contact page and login page
    const allowedRoutes = ["Contact", "Login", "Signup"];
    if (!allowedRoutes.includes(to.name)) {
      console.log("Loser trying to access restricted route:", to.name, "redirecting to contact");
      return next("/contact");
    } else {
      console.log("Loser accessing allowed route:", to.name);
    }
  }

  if (requiresAdmin && !userIsAdmin) {
    return next("/home");
  }

  if (requiresWinner && (!userIsWinner || userIsAdmin)) {
    return next("/home");
  }

  saveCurrentRoute(to);

  next();
});

export default router;
