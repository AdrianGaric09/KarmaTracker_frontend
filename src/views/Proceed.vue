<template>
    <div :style="proceedBgStyle">
      <div :style="proceedContainerStyle">
        <div :style="textContainerStyle">
          <div :style="mainTextStyle">
            Every decision<br>
            shapes your journey.<br>
            Answer<br>
            the following<br>
            questions honestly.<br>
            Where will your<br>
            choices take you?<br>
            Let's find out.<br>
            _ _ _ _ _ _ _ _
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
    name: 'ProceedPage',
    data(){ return{ buttonHovered: false, logoSrc: require('@/assets/karma_tracker_logo.png') }; },
   computed: { 
     proceedBgStyle(){ return{ width: '100vw', height: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'MedievalSharp', system-ui, sans-serif" }; },
     proceedContainerStyle(){ return{ width: '100%', height: '100%', border: '4px solid #FFD400', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: '3rem 8rem', position: 'relative', margin: '0 -8rem', minHeight: '600px' }; },
     textContainerStyle(){ return{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }; },
     mainTextStyle(){ return{ fontSize: '2.2rem', color: '#4A4441', fontWeight: '600', lineHeight: '1.4', letterSpacing: '1px', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }; },
     proceedButtonStyle(){ return{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: "'MedievalSharp', system-ui, sans-serif", color: '#4A4441', background: 'transparent', border: '3px solid #4A4441', borderRadius: '20px', padding: '1rem 3rem', cursor: 'pointer', transition: 'all 0.3s ease', textShadow: this.buttonHovered ? '5px 5px 5px #000000': 'none', boxShadow: this.buttonHovered ? '0 5px 10px #000000': 'none', transform: this.buttonHovered ? 'translateY(-2px)': 'translateY(0)' }; },
     logoContainerStyle(){ return{ display: 'flex', alignItems: 'center', justifyContent: 'center' }; },
     logoStyle(){ return{ width: '200px', height: 'auto', filter: 'brightness(0) saturate(100%)' }; }
   },
   methods: 
   { handleProceed(){ this.$router.push('/home'); } }
  }
  </script>
  
  <style>
  @import url('https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap');
  </style>