<template>
  <router-view v-slot="{ Component }">
    <transition :name="routeTransitionName" mode="out-in">
      <component
        :is="Component"
        class="route-view"
        @login-success="onLoginSuccess"
        @login-error="onLoginError"
        @navigate-signup="onNavigateSignup"
      />
    </transition>
  </router-view>
</template>

<script>
export default {
  name: 'App',
  data() {
    return { previousRouteName: null }
  },
  computed: {
    routeTransitionName() {
      const to = this.$route?.name || null
      const from = this.previousRouteName || null
      const key = `${from || 'null'}->${to}`
      const animatedPairs = new Set([
        'null->Login',
        'Login->Welcome',
        'Welcome->Yes',
        'Yes->Start',
        'Start->Proceed',
        'Start->Scenario',
        'Proceed->Scenario'
      ])
      return animatedPairs.has(key) ? 'route-fade' : ''
    }
  },
  watch: {
    $route(to, from) {
      this.previousRouteName = from?.name || null
    }
  },
  methods: {
    onLoginSuccess(payload) { console.log('Login success:', payload) },
    onLoginError(error) { console.log('Login error:', error) },
    onNavigateSignup() { this.$router.push('/signup') }
  }
}
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  background: #0b0b0f;
}

.route-view {
  position: fixed;
  inset: 0;
}

.route-fade-enter-active, .route-fade-leave-active {
  transition: opacity .3s ease, filter .4s ease;
}
.route-fade-enter-from, .route-fade-leave-to {
  opacity: 0;
  filter: blur(6px) saturate(120%);
}
</style>