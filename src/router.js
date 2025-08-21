import { createRouter, createWebHistory } from 'vue-router';
import Login from './views/login.vue';
import Signup from './views/signUp.vue';
import Welcome from './views/welcome.vue';
import Yes from './views/yes.vue';
import Start from './views/start.vue';
import Proceed from './views/proceed.vue';

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/signup', name: 'Signup', component: Signup },
  { path: '/welcome', name: 'Welcome', component: Welcome },
  { path: '/yes', name: 'Yes', component: Yes },
  { path: '/start', name: 'Start', component: Start },
  { path: '/proceed', name: 'Proceed', component: Proceed }
];

export default createRouter({
  history: createWebHistory(),
  routes
});