<template>
  <div :style="loginBgStyle">
    <div :style="loginFlexStyle">
      <img
        :src="logoSrc"
        alt="Karma Tracker Logo"
        :style="logoLeftStyle"
      />
      <div :style="loginContainerStyle">
        <form @submit.prevent="handleLogin">
          <div :style="inputGroupStyle">
            <label :style="inputLabelStyle">Email:</label>
            <input
              type="email"
              v-model="formData.email"
              required
              class="form-input"
              :style="formInputStyle"
            />
            <span v-if="errors.email" :style="errorStyle">{{ errors.email }}</span>
          </div>
          <div :style="inputGroupStyle">
            <label :style="inputLabelStyle">Password:</label>
            <input
              type="password"
              v-model="formData.password"
              required
              class="form-input"
              :style="formInputStyle"
            />
            <span v-if="errors.password" :style="errorStyle"> {{ errors.password }}</span>
          </div>
          <button
            type="submit"
            :disabled="isLoading"
            class="login-button"
            :style="loginButtonStyle"
          > {{ isLoading ? 'Logging in...': 'Login' }}
          </button>
        </form>
        <div :style="signupPromptStyle">
          <span>Don't have an account?</span>
          <a @click="handleSignUp" class="signup-link" :style="signupLinkStyle">Sign Up</a>
        </div>
      </div>
      <img
        :src="logoSrc"
        alt="Karma Tracker Logo"
        :style="logoRightStyle"
      />
    </div>
    <img :src="bgSrc" alt="background" :style="backgroundImgStyle" />
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'LoginPage',
  emits: ['login-success', 'login-error', 'navigate-signup'],
  data(){ return{ formData:{ email: '', password: '' },
     errors: { email: '', password: '' },
      isLoading: false,
      logoSrc: require('@/assets/karma_tracker_logo.png'),
      bgSrc: require('@/assets/login_theme_kt.png')
    }
  },
  computed: {
   loginBgStyle(){ return{ position: 'relative', width: '100vw', height: '100vh', minHeight: '100vh', overflow: 'hidden', fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222' } },
   backgroundImgStyle() { return{ position: 'absolute', inset: 1, width: '90vw', height: '100vh', objectFit: 'cover', zIndex: 0, pointerEvents: 'none', userSelect: 'none' } },
   loginFlexStyle() { return{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 } },
   logoLeftStyle() { return{ width: '260px', maxWidth: '60vw', filter: 'grayscale(1) drop-shadow(0 5px 5px rgba(0,0,0,0.25))', mixBlendMode: 'luminosity', opacity: 0.95, userSelect: 'none', pointerEvents: 'none', transition: 'width 0.3s, filter 0.3s', transform: 'rotate(270deg)', marginRight: '2vw' } },
   logoRightStyle() { return{ width: '260px', maxWidth: '60vw', filter: 'grayscale(1) drop-shadow(0 5px 5px rgba(0,0,0,0.25))', mixBlendMode: 'luminosity', opacity: 0.95, userSelect: 'none', pointerEvents: 'none', transition: 'width 0.3s, filter 0.3s', transform: 'rotate(90deg)', marginLeft: '2vw' } },
   loginContainerStyle() { return{ maxWidth: '350px', margin: 0, padding: '4rem', background: '#4A4441', border: '3px solid #FFD400', borderRadius: '10px', boxShadow: '10px 10px 5px rgba(0,0,0,0.25)', color: 'white', fontFamily: "'Inter', system-ui, sans-serif", position: 'relative', zIndex: 1 } },
   inputGroupStyle() { return{ marginBottom: '1.5rem' } },
   inputLabelStyle() { return{ display: 'block', marginBottom: '0.5rem', textAlign: 'center' } },
   formInputStyle() { return{ width: '100%', padding: '0.5rem', background: 'transparent', color: 'white', fontSize: '1rem' } },
   errorStyle() { return{ color: '#FF4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' } },
   loginButtonStyle() { return{ width: '100%', padding: '0.75rem', borderRadius: '25px', border: '2px solid #FFD400', fontWeight: 500, fontSize: '1rem', cursor: 'pointer', marginTop: '1rem', transition: 'all 0.2s' } },
   signupPromptStyle() { return{ textAlign: 'center', marginTop: '1.5rem' } },
   signupLinkStyle() { return{ color: '#FFD400', cursor: 'pointer', marginLeft: '0.25rem' } }
  },
  methods: {
    validateForm() {
      this.errors.email = '';
      this.errors.password = '';
      
      if (!this.formData.email) {
        this.errors.email = 'Email is required';
      }
      if (!this.formData.password) {
        this.errors.password = 'Password is required';
      }
      
      return !this.errors.email && !this.errors.password;
    },
    
    validateEmailRealtime() {
      const email = this.formData.email;
      
      if (!email) {
        this.errors.email = 'Email is required';
      } else if (!email.includes('@')) {
        this.errors.email = 'Please enter a valid email address';
      } else if (email.length < 5) {
        this.errors.email = 'Email must be at least 5 characters long';
      } else if (email.length > 50) {
        this.errors.email = 'Email must be less than 50 characters';
      } else {
        this.errors.email = '';
      }
    },
    
    validatePasswordRealtime() {
      const password = this.formData.password;
      
      if (!password) {
        this.errors.password = 'Password is required';
      } else if (password.length < 8) {
        this.errors.password = 'Password must be at least 8 characters long';
      } else if (password.length > 50) {
        this.errors.password = 'Password must be less than 50 characters';
      } else {
        this.errors.password = '';
      }
    },
    
    async handleLogin() {
      if (!this.validateForm()) return;
      
      this.isLoading = true;
      
      try {
        const { data } = await api.post('/api/login', {
          email: this.formData.email,
          password: this.formData.password
        });
        
        try {
          localStorage.setItem('kt_user', JSON.stringify(data));
        } catch(e) {
          console.debug('localStorage unavailable', e);
        }
        
        this.$emit('login-success', data);
        
        try {
          const userEmail = data.email;
          const safeEmail = userEmail.toLowerCase().replace(/[^a-z0-9@._-]/g, "");
          
          // Check if user is a loser - check the user data returned from login API
          if (data.isLoser === true) {
            console.log(`Loser user ${userEmail} redirected to contact page`);
            this.$router.push('/contact');
            return;
          }
          
          const userStateKey = `kt_state_${safeEmail}`;
          const userState = localStorage.getItem(userStateKey);
          const userLastRouteKey = `kt_last_route_${safeEmail}`;
          const userLastRoute = localStorage.getItem(userLastRouteKey);
          const hasReachedHome = localStorage.getItem(`kt_has_reached_home_${safeEmail}`) === 'true';
          const hasMeaningfulProgress = userLastRoute && userLastRoute !== '/welcome' && userLastRoute !== '/' && userLastRoute !== '/signup';
          
          if (userState && hasMeaningfulProgress) {
            if (hasReachedHome) {
              console.log(`Returning user ${userEmail} to home (default after reaching home)`);
              this.$router.push('/home');
            } else {
              console.log(`Returning user ${userEmail} to their last route: ${userLastRoute}`);
              this.$router.push(userLastRoute);
            }
          } else {
            localStorage.removeItem(`kt_mi_proceed_${safeEmail}`);
            localStorage.removeItem(`kt_tml_proceed_${safeEmail}`);
            console.log(`New user ${userEmail} starting at welcome with fresh experience`);
            this.$router.push('/welcome');
          }
        } catch (error) {
          console.error('Error checking user progress:', error);
          this.$router.push('/welcome');
        }
      } catch (error) {
        const status = error.response?.status;
        const msg = error.response?.data?.message || 'Login failed';
        
        if (status === 401 || /credential|password/i.test(msg)) {
          this.errors.password = 'Invalid email or password';
        } else if (/email/i.test(msg)) {
          this.errors.email = msg;
        } else if (/password/i.test(msg)) {
          this.errors.password = msg;
        } else {
          this.errors.password = 'Login failed';
        }
        
        this.$emit('login-error', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    handleSignUp() {
      this.$emit('navigate-signup');
      this.$router.push('/signup');
    },
    
    checkIfUserIsLoser(userEmail) {
      try {
        if (!userEmail) return false;

        // Check if user is explicitly marked as loser in user data
        const userData = localStorage.getItem("kt_user");
        
        if (userData) {
          const user = JSON.parse(userData);
          
          if (user && user.isLoser === true) {
            return true;
          }
        }

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
  .form-input { border: none; border-bottom: 2px solid white; transition: border-color 0.2s; }
  .form-input:focus { border-bottom-color: #FFD400; outline: none; }
  .login-button { background: transparent; color: #FFD400; border: 2px solid #FFD400; border-radius: 25px; transition: background 0.2s, color 0.2s; }
  .login-button:disabled { opacity: 0.7; cursor: not-allowed; }
  .login-button:hover:enabled { background: #FFD400; color: #4A4441; }
  .signup-link { color: #FFD400; text-decoration: none; cursor: pointer; margin-left: 0.25rem; position: relative; transition: color 0.2s; display: inline-block; padding-bottom: 2px; }
  .signup-link::after { content: ""; display: block; position: absolute; left: 0; right: 0; height: 1px; background: #FFD400; bottom: 0; transform: translateY(0); transition: transform 0.2s cubic-bezier(.4,2,.6,1); }
  .signup-link:hover::after { transform: translateY(2px); }
</style>