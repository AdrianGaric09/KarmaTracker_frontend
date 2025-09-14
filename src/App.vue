<template>
  <div class="app-container" :style="appContainerStyle">
    <router-view v-slot="{ Component }">
      <transition :name="routeTransitionName" mode="out-in">
        <component
          :is="Component"
          class="route-view"
          @login-success="onLoginSuccess"
          @login-error="onLoginError"
          @navigate-signup="onNavigateSignup"
          @close="onClose"
          @toggle-updated="onToggleUpdated"
        />
      </transition>
    </router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      previousRouteName: null,
      avatarTintColor: 'rgba(219, 180, 12, 0.08)',
      isUiOn: false
    }
  },
  computed: {
    appContainerStyle() {
      const currentRoute = this.$route?.name;
      const earlyPages = ['Login', 'Signup', 'Welcome', 'Yes', 'No', 'Start', 'Proceed'];
      
      if (earlyPages.includes(currentRoute)) {
        return {
          background: '#0b0b0f',
          minHeight: '100vh',
          position: 'relative'
        };
      }
      
      const baseStyle = {
        minHeight: '100vh',
        position: 'relative'
      };
      
      if (!this.isUiOn) {
        return {
          ...baseStyle,
          backgroundColor: 'white'
        };
      } else {
        const fullColor = this.avatarTintColor.replace(/0\.\d+/, '1.0');
        return {
          ...baseStyle,
          backgroundColor: fullColor
        };
      }
    },
    routeTransitionName() {
      if (!this.$route) return 'route-fade'
      
      const to = this.$route.name || null
      const from = this.previousRouteName || null
      
      if (to === 'Profile' || to === 'TmlProceed' || to === 'MiProceed' || to === 'MyItems' || to === 'MyPoints' || 
          to === 'Users' || to === 'TestMyLuck' || to === 'CoinFlip' || to === 'ColorPrediction' || to === 'RandomPrize') {
        return 'route-fade'
      }
      
      const key = (from || 'null') + '->' + to
      const animatedPairs = new Set([
        'null->Login', 'null->Welcome', 'null->Signup',
        'Login->Welcome', 'Login->Signup', 'Signup->Login', 'Signup->Welcome',
        'Welcome->Yes', 'Welcome->No', 
        'Yes->Welcome', 'No->Welcome',
        'Yes->Start', 'No->Start',
        'Start->Proceed', 'Proceed->Start',
        'Start->Home', 'Proceed->Home',
        'null->Home', 'Welcome->Home', 'Login->Home', 'Signup->Home',
        'Home->TmlProceed', 'TmlProceed->TestMyLuck', 'TestMyLuck->Home',
        'Home->MiProceed', 'MiProceed->MyItems', 'MyItems->Home',
        'Home->CoinFlip', 'CoinFlip->Home',
        'Home->ColorPrediction', 'ColorPrediction->Home',
        'Home->RandomPrize', 'RandomPrize->Home',
        'Home->Profile', 'Profile->Home',
        'Home->Users', 'Users->Home'
      ])
      const hasAnimation = animatedPairs.has(key)
      return hasAnimation ? 'route-fade' : 'route-fade'
    }
  },
  mounted() {
    this.updateAvatarTint();
    
    if (window) {
      window.updateAppBackground = () => this.updateAvatarTint();
    }
    
    
    try {
      const { resetToDefaults, getCurrentUser, initializeUserState } = require('@/services/userState.js');
      
      const currentUser = getCurrentUser();
      if (currentUser) {
        initializeUserState();
        
        setTimeout(async () => {
          try {
            const { syncUserStatus } = require('@/services/userState.js');
            const { checkKarmaOnLoad } = await import('@/services/karmaTracker.js');
            
            await syncUserStatus();
            await checkKarmaOnLoad();
          } catch (error) {
            console.error('Error checking user status and karma on app load:', error);
          }
        }, 100);
      } else {
        resetToDefaults();
      }
    } catch (error) { 
      try {
        const { setCredits } = require('@/services/credits.js');
        setCredits(1100);
      } catch (fallbackError) {
        console.debug('Failed to set default credits:', fallbackError);
      }
    }
    
    if (this.$router && this.$router.afterEach) {
      this.$router.afterEach(() => {
        const vm = this.$root?.$children?.find?.(c => c.$options?.name === 'ScenarioPage')
        if (vm && vm.menuOpen) vm.menuOpen = false
        this.updateAvatarTint();
      })
    }
  },
  beforeUnmount() {
  },
  watch: {
    $route(to) {
      if (to) {
        this.previousRouteName = to.name || null
        this.updateAvatarTint()
        
        
        setTimeout(async () => {
          try {
            const { getCurrentUser, syncUserStatus } = require('@/services/userState.js');
            const currentUser = getCurrentUser();
            
            if (currentUser) {
              await syncUserStatus();
              
              const { checkKarmaOnLoad } = await import('@/services/karmaTracker.js');
              await checkKarmaOnLoad();
            }
          } catch (error) {
            console.debug('Error checking user status and karma on route change:', error);
          }
        }, 100);
      }
    }
  },
  methods: {
    
    
    async updateAvatarTint() {
      try {
        const { getAvatarColor, getUserSwitchState } = await import('@/services/userState.js');
        const avatarColor = getAvatarColor();
        const newUiState = getUserSwitchState();
        
        this.avatarTintColor = avatarColor.tint;
        this.isUiOn = newUiState;
        
        this.updateGlobalCrownStatus();
      } catch (error) {
        console.debug('Could not update avatar tint:', error);
      }
    },
    updateGlobalCrownStatus() {
      try {
        window.dispatchEvent(new CustomEvent('crownStatusUpdate'));
      } catch (error) {
        console.debug('Could not update global crown status:', error);
      }
    },
    onLoginSuccess(payload) { 
      console.log('Login success:', payload);
      try {
        const { initializeUserState } = require('@/services/userState.js');
        initializeUserState();
      } catch (error) {
        console.warn('Failed to initialize user state:', error);
      }
      this.updateAvatarTint();
    },
    onLoginError(error) { console.log('Login error:', error) },
    onNavigateSignup() { this.$router.push('/signup') },
    onClose() {
      const currentRoute = this.$route?.name;
      
      const isUserLoser = this.checkIfUserIsLoser();
      
      if (isUserLoser) {
        // Losers can only go to contact or login
        if (currentRoute === 'Contact') {
          this.$router.push('/');
        } else {
          this.$router.push('/contact');
        }
        return;
      }
      
      const navigationMap = {
        'Profile': () => this.$router.push('/home'),
        'Users': () => this.$router.push('/home'),
        'Leaderboard': () => this.$router.push('/home'),
        'MyPoints': () => this.$router.push('/home'),
        'MyItems': () => this.$router.push('/home'),
        'Contact': () => this.$router.push('/home'),
        'TestMyLuck': () => this.$router.push('/home'),
        'ColorPrediction': () => this.$router.push('/games'),
        'CoinFlip': () => this.$router.push('/games'),
        'RandomPrize': () => this.$router.push('/games')
      };
      
      const navigate = navigationMap[currentRoute] || (() => this.$router.push('/home'));
      navigate();
    },
    onToggleUpdated(creditsOnHomescreen) {
      window.dispatchEvent(new CustomEvent('creditsToggleUpdated', { 
        detail: { creditsOnHomescreen } 
      }));
    },
    checkIfUserIsLoser() {
      try {
        const userData = localStorage.getItem("kt_user");
        if (!userData) {
          console.log("No user data found for loser check");
          return false;
        }
        const user = JSON.parse(userData);
        if (!user || !user.email) {
          console.log("Invalid user data for loser check");
          return false;
        }

        if (user.isLoser === true) {
          console.log("User is marked as loser in user data:", user.email);
          return true;
        }

        console.log("User is not a loser:", user.email, "isLoser:", user.isLoser);
        return false;
      } catch (error) {
        console.error("Error checking loser status:", error);
        return false;
      }
    }
  }
}
</script>

<style>
html, body, #app { height: 100%; margin: 0; padding: 0; background: #0b0b0f; }
.app-container { min-height: 100vh; position: relative; }
.route-view { position: fixed; inset: 0; }
.route-fade-enter-active, .route-fade-leave-active { 
  transition: opacity .3s ease, filter .4s ease; 
}
.route-fade-enter-from, .route-fade-leave-to { 
  opacity: 0; 
  filter: blur(6px) saturate(120%); 
}
</style>