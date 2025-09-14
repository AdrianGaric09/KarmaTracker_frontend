<template>
  <div :style="signupBgStyle">
    <div :style="signupFlexStyle">
      <img
        :src="logoSrc"
        alt="Karma Tracker Logo"
        :style="logoLeftStyle"
      />
      <div :style="signupContainerStyle">
        <form @submit.prevent="handleSignUp">
          <div :style="inputGroupStyle">
            <label :style="inputLabelStyle">Username:</label>
            <input
              type="text"
              v-model="formData.username"
              required
              class="form-input"
              :style="formInputStyle"
            />
            <span v-if="errors.username" :style="errorStyle">{{ errors.username }}</span>
          </div>
          <div :style="inputGroupStyle">
            <label :style="inputLabelStyle">Email:</label>
            <input
              type="email"
              v-model="formData.email"
              required
              minlength="6"
              maxlength="30"
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
              :minlength="minPasswordLength"
              :maxlength="maxPasswordLength"
              class="form-input"
              :style="formInputStyle"
            />
            <span v-if="errors.password" :style="errorStyle">{{ errors.password }}</span>
          </div>
          <button
            type="submit"
            :disabled="isLoading"
            class="signup-button"
            :style="signupButtonStyle"
          >{{ isLoading ? 'Signing up...' : 'Sign Up' }}
          </button>
        </form>
        <div :style="signupPromptStyle">
          <span>Already have an account?</span>
          <a @click="handleLogin" class="login-link" :style="loginLinkStyle">Login</a>
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
  name: 'SignupPage',
  emits: ['signup-success', 'signup-error', 'navigate-login'],
  data() {
    return {
      formData: {
        username: '',
        email: '',
        password: ''
      },
      minPasswordLength: 8,
      maxPasswordLength: 20,
      errors: {
        username: '',
        email: '',
        password: ''
      },
      isLoading: false,
      logoSrc: require('@/assets/karma_tracker_logo.png'),
      bgSrc: require('@/assets/login_theme_kt.png')
    }
  },
  computed: {
    signupBgStyle() { return{ position: 'relative', width: '100vw', height: '100vh', minHeight: '100vh', overflow: 'hidden', fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222' } },
    backgroundImgStyle() { return{ position: 'absolute', inset: 1, width: '90vw', height: '100vh', objectFit: 'cover', zIndex: 0, pointerEvents: 'none', userSelect: 'none' } },
    signupFlexStyle() { return{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 } },
    logoLeftStyle() { return{ width: '260px', maxWidth: '60vw', filter: 'grayscale(1) drop-shadow(0 5px 5px rgba(0,0,0,0.25))', mixBlendMode: 'luminosity', opacity: 0.95, userSelect: 'none', pointerEvents: 'none', transition: 'width 0.3s, filter 0.3s', transform: 'rotate(270deg)', marginRight: '2vw' } },
    logoRightStyle() { return{ width: '260px', maxWidth: '60vw', filter: 'grayscale(1) drop-shadow(0 5px 5px rgba(0,0,0,0.25))', mixBlendMode: 'luminosity', opacity: 0.95, userSelect: 'none', pointerEvents: 'none', transition: 'width 0.3s, filter 0.3s', transform: 'rotate(90deg)', marginLeft: '2vw' } },
    signupContainerStyle() { return{ maxWidth: '350px', margin: 0, padding: '4rem', background: '#4A4441', border: '3px solid #FFD400', borderRadius: '10px', boxShadow: '10px 10px 5px rgba(0,0,0,0.25)', color: 'white', fontFamily: "'Inter', system-ui, sans-serif", position: 'relative', zIndex: 1 } },
    inputGroupStyle() { return{ marginBottom: '1.5rem' } },
    inputLabelStyle() { return{ display: 'block', marginBottom: '0.5rem', textAlign: 'center' } },
    formInputStyle() { return{ width: '100%', padding: '0.5rem', background: 'transparent', color: 'white', fontSize: '1rem' } },
    errorStyle() { return{ color: '#FF4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' } },
    signupButtonStyle() { return{ width: '100%', padding: '0.75rem', borderRadius: '25px', border: '2px solid #FFD400', fontWeight: 500, fontSize: '1rem', cursor: 'pointer', marginTop: '1rem', transition: 'all 0.2s' } },
    signupPromptStyle() { return{ textAlign: 'center', marginTop: '1.5rem' } },
    loginLinkStyle() { return{ color: '#FFD400', cursor: 'pointer', marginLeft: '0.25rem' } }
  },
  methods: {
    validateForm() {
      this.errors.username = '';
      this.errors.email = '';
      this.errors.password = '';
      
      if (!this.formData.username) {
        this.errors.username = 'Username is required';
      } else {
        const u = this.formData.username.trim();
        if (u.length < 3 || u.length > 12) {
          this.errors.username = 'Username must be 3-12 characters long';
        } else if (!/^[A-Za-z0-9_]+$/.test(u)) {
          this.errors.username = 'Username can only contain letters, numbers, and underscores';
        }
      }
      
      if (!this.formData.email) {
        this.errors.email = 'Email is required';
      } else {
        const e = String(this.formData.email).trim();
        if (e.length < 6 || e.length > 30) {
          this.errors.email = 'Email may consist of up to 30 characters';
        } else if (!/.+@.+\..+/.test(e)) {
          this.errors.email = 'Enter a valid email address';
        }
      }
      
      if (!this.formData.password) {
        this.errors.password = 'Password is required';
      } else {
        const pLen = String(this.formData.password).length;
        if (pLen < this.minPasswordLength) {
          this.errors.password = `Password must be at least ${this.minPasswordLength} characters long`;
        } else if (pLen > this.maxPasswordLength) {
          this.errors.password = `Password must be at most ${this.maxPasswordLength} characters long`;
        }
      }
      
      return !this.errors.username && !this.errors.email && !this.errors.password;
    },
    validateUsernameRealtime() {
      const username = this.formData.username.trim();
      if (!username) {
        this.errors.username = 'Username is required';
      } else if (username.length < 3) {
        this.errors.username = 'Username must be at least 3 characters long';
      } else if (username.length > 12) {
        this.errors.username = 'Username must be 12 characters or less';
      } else if (!/^[A-Za-z0-9_]+$/.test(username)) {
        this.errors.username = 'Username can only contain letters, numbers, and underscores';
      } else {
        this.errors.username = '';
      }
    },
    
    validateEmailRealtime() {
      const email = String(this.formData.email).trim();
      if (!email) {
        this.errors.email = 'Email is required';
      } else if (email.length < 6) {
        this.errors.email = 'Email must be at least 6 characters long';
      } else if (email.length > 30) {
        this.errors.email = 'Email must be 30 characters or less';
      } else if (!/.+@.+\..+/.test(email)) {
        this.errors.email = 'Enter a valid email address';
      } else {
        this.errors.email = '';
      }
    },
    
    validatePasswordRealtime() {
      const password = String(this.formData.password);
      if (!password) {
        this.errors.password = 'Password is required';
      } else if (password.length < this.minPasswordLength) {
        this.errors.password = `Password must be at least ${this.minPasswordLength} characters long`;
      } else if (password.length > this.maxPasswordLength) {
        this.errors.password = `Password must be at most ${this.maxPasswordLength} characters long`;
      } else {
        this.errors.password = '';
      }
    },
    async handleSignUp() {
      if (!this.validateForm()) return;
      
      this.isLoading = true;
      try {
        await api.post('/api/signup', {
          username: this.formData.username,
          email: this.formData.email,
          password: this.formData.password
        });
        
        this.$emit('signup-success', { ...this.formData });
        alert('Registration successful! Please log in.');
        this.$router.push('/');
      } catch (error) {
        const msg = error.response?.data?.message || 'Signup failed';
        if (/username/i.test(msg)) {
          this.errors.username = msg;
        } else if (/email/i.test(msg)) {
          this.errors.email = msg;
        } else if (/password/i.test(msg)) {
          this.errors.password = msg;
        } else {
          this.errors.email = msg;
        }
        this.$emit('signup-error', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    handleLogin() {
      this.$emit('navigate-login');
      this.$router.push('/');
    }
  }
}
</script>

<style>
.form-input { border: none; border-bottom: 2px solid white; transition: border-color 0.2s; }
.form-input:focus { border-bottom-color: #FFD400; outline: none; }
.signup-button { background: transparent; color: #FFD400; border: 2px solid #FFD400; border-radius: 25px; transition: background 0.2s, color 0.2s; }
.signup-button:disabled { opacity: 0.7; cursor: not-allowed; }
.signup-button:hover:enabled { background: #FFD400; color: #4A4441; }
.login-link { color: #FFD400; text-decoration: none; cursor: pointer; margin-left: 0.25rem; position: relative; transition: color 0.2s; display: inline-block; padding-bottom: 2px; }
.login-link::after { content: ""; display: block; position: absolute; left: 0; right: 0; height: 1px; background: #FFD400; bottom: 0; transform: translateY(0); transition: transform 0.2s cubic-bezier(.4,2,.6,1); }
.login-link:hover::after { transform: translateY(2px); }
</style>