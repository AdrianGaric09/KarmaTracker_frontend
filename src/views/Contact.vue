<template>
  <div :style="pageStyle">
    <button :style="closeStyle" aria-label="Close" @click="emitClose">×</button>
    
    <div :style="containerStyle">
      <div :style="formTitleStyle">
        CONTACT<br>
        FORM
      </div>
      
      <div v-if="isUserLoser" :style="loserMessageStyle">
        <div :style="loserTitleStyle">⚠️ ACCOUNT RESTRICTED ⚠️</div>
        <div :style="loserTextStyle">
          Your account has been restricted due to excessive karma points or depleted credits.<br>
          You can only access this contact form and the login page.
        </div>
      </div>
      
      <form @submit.prevent="handleSubmit" :style="formStyle">
        <div :style="fieldContainerStyle">
          <input
            type="text"
            v-model="formData.fullName"
            :style="getInputStyle('fullName')"
            @focus="setFocused('fullName', true)"
            @blur="setFocused('fullName', false)"
            required
          />
          <label 
            :style="getLabelStyle('fullName')"
            class="field-label"
          >
            Full Name
          </label>
        </div>

        <div :style="fieldContainerStyle">
          <input
            type="email"
            v-model="formData.email"
            :style="getInputStyle('email')"
            :readonly="isUserLoser"
            @focus="setFocused('email', true)"
            @blur="setFocused('email', false)"
            required
          />
          <label 
            :style="getLabelStyle('email')"
            class="field-label"
          >
            Email
          </label>
          <div v-if="isUserLoser" :style="emailNoteStyle">
            (Locked to your account email)
          </div>
        </div>

        <div :style="fieldContainerStyle">
          <textarea
            v-model="formData.message"
            :style="textareaStyle"
            @focus="setFocused('message', true)"
            @blur="setFocused('message', false)"
            rows="4"
            required
          ></textarea>
          <label 
            :style="getLabelStyle('message')"
            class="field-label"
          >
            Message
          </label>
        </div>

        <div v-if="errorMessage" :style="errorMessageStyle">
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          :style="sendButtonStyle"
          :disabled="isSubmitting"
          @mouseenter="isFormComplete && !isSubmitting ? sendHovered = true : null"
          @mouseleave="sendHovered = false"
        >
          {{ isSubmitting ? 'SENDING...' : 'SEND' }}
        </button>
      </form>

      <div :style="footerTextStyle">
        <span v-if="isUserLoser">
          *Actions have consequences...<br>
          This is your only way to reach out<br>
          and perhaps find redemption.*
        </span>
        <span v-else>
          *Your message might just<br>
          balance the universe...<br>
          or at least our app.*
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'ContactPage',
  emits: ['close'],
  
  data() {
    return {
      formData: {
        fullName: '',
        email: '',
        message: ''
      },
      focusedFields: {
        fullName: false,
        email: false,
        message: false
      },
      sendHovered: false,
      isSubmitting: false,
      errorMessage: '',
      isUserLoser: false
    };
  },

  computed: {
    isFormComplete() {
      return this.isFullNameValid && 
             this.isEmailValid && 
             this.isMessageValid;
    },

    isFullNameValid() {
      const name = this.formData.fullName.trim();
      return name.length >= 3 && name.length <= 30;
    },

    isEmailValid() {
      const email = this.formData.email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    isMessageValid() {
      const message = this.formData.message.trim();
      return message.length >= 10 && message.length <= 1000;
    },

    pageStyle() {
      return {
        width: '100vw',
        height: '100vh',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#666',
        padding: '24px',
        boxSizing: 'border-box'
      };
    },

    closeStyle() {
      return {
        position: 'fixed',
        top: '16px',
        right: '16px',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        border: '3px solid #111',
        background: '#fff',
        color: '#111',
        fontSize: '28px',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 10,
        transition: 'all 0.2s ease'
      };
    },

    containerStyle() {
      return {
        width: 'min(85vw, 380px)',
        minHeight: '400px',
        border: '4px solid #666',
        borderRadius: '20px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#fff',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      };
    },

    formTitleStyle() {
      return {
        fontSize: '1.6rem',
        fontWeight: '700',
        color: '#666',
        textAlign: 'center',
        marginBottom: '1.5rem',
        lineHeight: '1.2',
        letterSpacing: '1px'
      };
    },

    formStyle() {
      return {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
        marginBottom: '1.5rem'
      };
    },

    fieldContainerStyle() {
      return {
        position: 'relative',
        width: '100%'
      };
    },


    textareaStyle() {
      return {
        width: '100%',
        minHeight: '80px',
        border: '2px solid #FFD400',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '15px',
        color: '#333',
        background: 'transparent',
        outline: 'none',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box',
        fontFamily: "'Inter', system-ui, sans-serif",
        resize: 'vertical'
      };
    },

    sendButtonStyle() {
      const canHover = this.isFormComplete && !this.isSubmitting;
      const shouldShowHover = this.sendHovered && canHover;
      
      return {
        width: '150px',
        height: '48px',
        border: '2px solid #666',
        borderRadius: '25px',
        background: shouldShowHover ? '#666' : 'transparent',
        color: shouldShowHover ? '#fff' : '#666',
        fontSize: '16px',
        fontWeight: '600',
        cursor: this.isSubmitting ? 'not-allowed' : (canHover ? 'pointer' : 'default'),
        transition: 'all 0.3s ease',
        alignSelf: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
        opacity: this.isSubmitting ? 0.7 : (canHover ? 1 : 0.6),
        transform: shouldShowHover ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: shouldShowHover ? '0 8px 20px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)'
      };
    },

    errorMessageStyle() {
      return {
        color: '#ff2a2a',
        fontSize: '14px',
        fontWeight: '500',
        textAlign: 'center',
        marginTop: '10px',
        marginBottom: '10px',
        padding: '8px 12px',
        background: 'rgba(255, 42, 42, 0.1)',
        border: '1px solid rgba(255, 42, 42, 0.3)',
        borderRadius: '6px',
        fontFamily: "'Inter', system-ui, sans-serif",
        lineHeight: '1.4'
      };
    },

    footerTextStyle() {
      return {
        fontSize: '14px',
        color: '#999',
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: '1.4',
        marginTop: 'auto'
      };
    },

    loserMessageStyle() {
      return {
        width: '100%',
        background: '#fff3cd',
        border: '2px solid #ffc107',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        textAlign: 'center'
      };
    },

    loserTitleStyle() {
      return {
        fontSize: '16px',
        fontWeight: '700',
        color: '#856404',
        marginBottom: '8px'
      };
    },

    loserTextStyle() {
      return {
        fontSize: '14px',
        color: '#856404',
        lineHeight: '1.4'
      };
    },

    emailNoteStyle() {
      return {
        fontSize: '12px',
        color: '#666',
        fontStyle: 'italic',
        marginTop: '4px',
        textAlign: 'left'
      };
    }
  },

  mounted() {
    this.checkLoserStatus();
  },

  methods: {
    setFocused(fieldName, focused) {
      this.focusedFields[fieldName] = focused;
    },

    getLabelStyle(fieldName) {
      const isFocused = this.focusedFields[fieldName];
      const hasValue = this.formData[fieldName] && this.formData[fieldName].length > 0;
      const shouldFloat = isFocused || hasValue;

      return {
        position: 'absolute',
        left: '16px',
        top: shouldFloat ? '-10px' : '50%',
        transform: shouldFloat ? 'translateY(0)' : 'translateY(-50%)',
        fontSize: shouldFloat ? '12px' : '16px',
        color: shouldFloat ? '#FFD400' : '#999',
        background: '#fff',
        padding: shouldFloat ? '0 4px' : '0',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none',
        zIndex: 1,
        fontWeight: shouldFloat ? '500' : '400',
        opacity: shouldFloat ? 1 : 0.8
      };
    },

    getInputStyle(fieldType) {
      const baseStyle = {
        width: '100%',
        height: '42px',
        border: '2px solid #FFD400',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '15px',
        color: '#333',
        background: 'transparent',
        outline: 'none',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box',
        fontFamily: "'Inter', system-ui, sans-serif",
        cursor: 'text'
      };

      if (fieldType === 'email' && this.isUserLoser) {
        return {
          ...baseStyle,
          background: '#f5f5f5',
          cursor: 'not-allowed'
        };
      }

      return baseStyle;
    },

    async handleSubmit() {
      if (this.isSubmitting) return;
      
      this.errorMessage = '';
      
      if (!this.formData.fullName.trim()) {
        this.errorMessage = 'Full name is required';
        return;
      }
      
      if (!this.isFullNameValid) {
        this.errorMessage = 'Full name must be between 3 and 30 characters';
        return;
      }
      
      if (!this.formData.email.trim()) {
        this.errorMessage = 'Email address is required';
        return;
      }
      
      if (!this.isEmailValid) {
        this.errorMessage = 'Please enter a valid email address';
        return;
      }
      
      if (!this.formData.message.trim()) {
        this.errorMessage = 'Message is required';
        return;
      }
      
      if (!this.isMessageValid) {
        this.errorMessage = 'Message must be between 10 and 1000 characters';
        return;
      }
      
      this.isSubmitting = true;
      
      try {
        await api.post('/api/contact', {
          fullName: this.formData.fullName.trim(),
          email: this.formData.email.trim(),
          message: this.formData.message.trim()
        });

        alert('Message sent successfully! Thank you for reaching out.');
        
        this.formData = {
          fullName: '',
          email: '',
          message: ''
        };
        
        this.focusedFields = {
          fullName: false,
          email: false,
          message: false
        };

      } catch (error) {
        console.error('Error sending message:', error);
        const message = error.response?.data?.message || error.message || 'Failed to send message. Please try again.';
        this.errorMessage = message;
        
        setTimeout(() => {
          this.errorMessage = '';
        }, 8000);
      } finally {
        this.isSubmitting = false;
      }
    },

    emitClose() {
      this.$emit('close');
    },

    checkLoserStatus() {
      try {
        const userData = localStorage.getItem("kt_user");
        if (!userData) {
          this.isUserLoser = false;
          return;
        }
        const user = JSON.parse(userData);
        if (!user || !user.email) {
          this.isUserLoser = false;
          return;
        }

        this.isUserLoser = user.isLoser === true;
        
        if (this.isUserLoser) {
          this.formData.email = user.email;
        }
      } catch (error) {
        console.error("Error checking loser status:", error);
        this.isUserLoser = false;
      }
    }
  }
};
</script>

<style scoped>
.field-label {
  user-select: none;
}

input:focus,
textarea:focus {
  border-color: #FFD400 !important;
  box-shadow: 0 0 0 3px rgba(255, 212, 0, 0.1);
}

button[aria-label="Close"]:hover {
  transform: scale(1.1);
  background: #111;
  color: #fff;
}

* {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>