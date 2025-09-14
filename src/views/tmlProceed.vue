<template>
  <div :style="proceedBgStyle">
    <div :style="proceedContainerStyle">
      <div :style="textContainerStyle">
        <div :style="mainTextStyle">
          Welcome to the<br>
          "Test My Luck"
          section!<br>
          <br>
          Here, you will
          encounter a <br> selection
          of games centered
          around chance,<br>
          designed to put your
          fortune to the test.<br>
          <br>
          I wish you the<br>
          best of
          luck!
        </div>
      </div>
      
      <button 
        :style="proceedButtonStyle"
        @mouseenter="buttonHovered = true"
        @mouseleave="buttonHovered = false"
        @click="handleProceed"
      >
        PROCEED
      </button>
      
      <div :style="logoContainerStyle">
        <img :src="logoSrc" :style="logoStyle" alt="Karma Tracker Logo" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TmlProceedPage',
  data() {
    return {
      buttonHovered: false,
      logoSrc: require('@/assets/karma_tracker_logo.png')
    };
  },
  
  mounted() {
    try {
      const userData = localStorage.getItem('kt_user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user && user.email) {
          const safeEmail = user.email.toLowerCase().replace(/[^a-z0-9@._-]/g, '');
          const hasProceeded = localStorage.getItem(`kt_tml_proceed_${safeEmail}`);
          const hasReachedHome = localStorage.getItem(`kt_has_reached_home_${safeEmail}`) === 'true';
          
          if (hasProceeded === 'true' && hasReachedHome) {
            this.$router.replace('/games');
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error checking proceed state: ', error);
    }
  },
  
  computed: {
    proceedBgStyle() {
      return {
        width: '100vw',
        height: '100vh',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'MedievalSharp', system-ui, sans-serif"
      };
    },
    
    proceedContainerStyle() {
      return {
        width: '100%',
        height: '100%',
        border: '4px solid #FFD400',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '3rem 8rem',
        position: 'relative',
        margin: '0 -8rem',
        minHeight: '600px'
      };
    },
    
    textContainerStyle() {
      return {
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      };
    },
    
    mainTextStyle() {
      return {
        fontSize: '1.9rem',
        color: '#4A4441',
        fontWeight: '600',
        lineHeight: '1.4',
        letterSpacing: '1px',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
      };
    },
    
    proceedButtonStyle() {
      return {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        fontFamily: "'MedievalSharp', system-ui, sans-serif",
        color: '#4A4441',
        background: 'transparent',
        border: '3px solid #4A4441',
        borderRadius: '20px',
        padding: '1rem 3rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textShadow: this.buttonHovered ? '5px 5px 5px #000000' : 'none',
        boxShadow: this.buttonHovered ? '0 5px 10px #000000' : 'none',
        transform: this.buttonHovered ? 'translateY(-2px)' : 'translateY(0)'
      };
    },
    
    logoContainerStyle() {
      return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      };
    },
    
    logoStyle() {
      return {
        width: '200px',
        height: 'auto',
        filter: 'brightness(0) saturate(100%)'
      };
    }
  },
  
  methods: {
    handleProceed() {
      try {
        const userData = localStorage.getItem('kt_user');
        if (userData) {
          const user = JSON.parse(userData);
          if (user && user.email) {
            const safeEmail = user.email.toLowerCase().replace(/[^a-z0-9@._-]/g, '');
            localStorage.setItem(`kt_tml_proceed_${safeEmail}`, 'true');
          }
        }
      } catch (error) {
        console.error('Error saving proceed state: ', error);
      }
      
      this.$router.push('/games');
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap');
</style>
