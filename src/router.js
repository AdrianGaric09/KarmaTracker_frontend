import { createRouter, createWebHistory } from "vue-router";
import Login from "./views/Login.vue";
import Signup from "./views/signUp.vue";
import Welcome from "./views/Welcome.vue";
import Yes from "./views/Yes.vue";
import Start from "./views/Start.vue";
import Proceed from "./views/Proceed.vue";
import Scenario from "./views/Scenarios.vue";

const routes = [
  { path: "/", name: "Login", component: Login },
  { path: "/signup", name: "Signup", component: Signup },
  { path: "/welcome", name: "Welcome", component: Welcome },
  { path: "/yes", name: "Yes", component: Yes },
  { path: "/start", name: "Start", component: Start },
  { path: "/proceed", name: "Proceed", component: Proceed },
  { path: "/scenario", name: "Scenario", component: Scenario },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
