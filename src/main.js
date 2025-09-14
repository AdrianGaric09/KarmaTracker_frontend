import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/mobile-only.css'

function disableBackButton() {
  const handlePopState = (event) => {
    console.log('Back button disabled - preventing navigation');
    event.preventDefault();
    window.history.pushState(null, '', window.location.href);
  };
  
  window.addEventListener('popstate', handlePopState);
  window.history.pushState(null, '', window.location.href);
}

disableBackButton();

createApp(App).use(router).mount('#app')
