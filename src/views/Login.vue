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
            <span v-if="errors.password" :style="errorStyle">{{ errors.password }}</span>
          </div>
          <button
            type="submit"
            :disabled="isLoading"
            class="login-button"
            :style="loginButtonStyle"
          >
            {{ isLoading ? 'Logging in...' : 'Login' }}
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
  data() {
    return {
      formData: {
        email: '',
        password: ''
      },
      errors: {
        email: '',
        password: ''
      },
      isLoading: false,
      logoSrc: require('@/assets/karma_tracker_logo.png'),
      bgSrc: require('@/assets/login_theme_kt.png')
    }
  },
  computed: {
    loginBgStyle() {
      return {
        position: 'relative',
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#222'
      }
    },
    backgroundImgStyle() {
      return {
        position: 'absolute',
        inset: 1,
        width: '90vw',
        height: '100vh',
        objectFit: 'cover',
        zIndex: 0,
        pointerEvents: 'none',
        userSelect: 'none'
      }
    },
    loginFlexStyle() {
      return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1
      }
    },
    logoLeftStyle() {
      return {
        width: '260px',
        maxWidth: '60vw',
        filter: 'grayscale(1) drop-shadow(0 5px 5px rgba(0,0,0,0.25))',
        mixBlendMode: 'luminosity',
        opacity: 0.95,
        userSelect: 'none',
        pointerEvents: 'none',
        transition: 'width 0.3s, filter 0.3s',
        transform: 'rotate(270deg)',
        marginRight: '2vw'
      }
    },
    logoRightStyle() {
      return {
        width: '260px',
        maxWidth: '60vw',
        filter: 'grayscale(1) drop-shadow(0 5px 5px rgba(0,0,0,0.25))',
        mixBlendMode: 'luminosity',
        opacity: 0.95,
        userSelect: 'none',
        pointerEvents: 'none',
        transition: 'width 0.3s, filter 0.3s',
        transform: 'rotate(90deg)',
        marginLeft: '2vw'
      }
    },
    loginContainerStyle() {
      return {
        maxWidth: '350px',
        margin: 0,
        padding: '4rem',
        background: '#4A4441',
        border: '3px solid #FFD400',
        borderRadius: '10px',
        boxShadow: '10px 10px 5px rgba(0,0,0,0.25)',
        color: 'white',
        fontFamily: "'Inter', system-ui, sans-serif",
        position: 'relative',
        zIndex: 1
      }
    },
    inputGroupStyle() {
      return {
        marginBottom: '1.5rem'
      }
    },
    inputLabelStyle() {
      return {
        display: 'block',
        marginBottom: '0.5rem',
        textAlign: 'center'
      }
    },
    formInputStyle() {
      return {
        width: '100%',
        padding: '0.5rem',
        background: 'transparent',
        color: 'white',
        fontSize: '1rem'
      }
    },
    errorStyle() {
      return {
        color: '#FF4444',
        fontSize: '0.8rem',
        marginTop: '0.25rem',
        display: 'block'
      }
    },
    loginButtonStyle() {
      return {
        width: '100%',
        padding: '0.75rem',
        borderRadius: '25px',
        border: '2px solid #FFD400',
        fontWeight: 500,
        fontSize: '1rem',
        cursor: 'pointer',
        marginTop: '1rem',
        transition: 'all 0.2s'
      }
    },
    signupPromptStyle() {
      return {
        textAlign: 'center',
        marginTop: '1.5rem'
      }
    },
    signupLinkStyle() {
      return {
        color: '#FFD400',
        cursor: 'pointer',
        marginLeft: '0.25rem'
      }
    }
  },
  methods: {
    validateForm() {
  this.errors.email = ''
  this.errors.password = ''
      if (!this.formData.email) this.errors.email = 'Email is required'
      if (!this.formData.password) this.errors.password = 'Password is required'
      return !this.errors.email && !this.errors.password
    },
    async handleLogin() {
  if (!this.validateForm()) return
      this.isLoading = true
      try {
  const { data } = await api.post('/api/login', {
          email: this.formData.email,
          password: this.formData.password
        });
  try { localStorage.setItem('kt_user', JSON.stringify(data)); } catch(e) { console.debug('localStorage unavailable', e); }
  this.$emit('login-success', data);
        this.$router.push('/welcome');
      } catch (error) {
        const status = error.response?.status
        const msg = error.response?.data?.message || 'Login failed'
        if (status === 401 || /credential|password/i.test(msg)) {
          this.errors.password = 'Invalid email or password'
        } else if (/email/i.test(msg)) {
          this.errors.email = msg
        } else if (/password/i.test(msg)) {
          this.errors.password = msg
        } else {
          this.errors.password = 'Login failed'
        }
        this.$emit('login-error', error);
      } finally {
        this.isLoading = false
      }
    },
    handleSignUp() {
      this.$emit('navigate-signup')
      this.$router.push('/signup');
    }
  }
}
</script>

<style>
.form-input {
  border: none;
  border-bottom: 2px solid white;
  transition: border-color 0.2s;
}
.form-input:focus {
  border-bottom-color: #FFD400;
  outline: none;
}
.login-button {
  background: transparent;
  color: #FFD400;
  border: 2px solid #FFD400;
  border-radius: 25px;
  transition: background 0.2s, color 0.2s;
}
.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.login-button:hover:enabled {
  background: #FFD400;
  color: #4A4441;
}
.signup-link {
  color: #FFD400;
  text-decoration: none;
  cursor: pointer;
  margin-left: 0.25rem;
  position: relative;
  transition: color 0.2s;
  display: inline-block;
  padding-bottom: 2px;
}
.signup-link::after {
  content: "";
  display: block;
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: #FFD400;
  bottom: 0;
  transform: translateY(0);
  transition: transform 0.2s cubic-bezier(.4,2,.6,1);
}
.signup-link:hover::after {
  transform: translateY(2px);
}
</style>