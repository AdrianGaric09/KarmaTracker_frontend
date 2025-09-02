<template>
  <div :style="bgStyle">
     <LuckyWheel 
       v-if="showLuckyWheel" 
       @close="handleWheelClose"
       @wheel-result="handleLuckyWheelResult"
     />
     
     <UnluckyWheel 
       v-if="showUnluckyWheel" 
       @close="handleWheelClose"
       @wheel-result="handleUnluckyWheelResult"
     />
    
    <div v-if="showPopup" :style="popupOverlayStyle">
      <div :style="popupContainerStyle" class="popup-enter-active">
        <div :style="popupTextStyle">
          Don't rush off just yet.<br>
          There's more here than<br>
          meets the eye.
        </div>
        <button 
          :style="okButtonStyle"
          @click="handleOkClick"
          @mouseenter="okHovered = true"
          @mouseleave="okHovered = false" 
        > 
          OK!
        </button>
      </div>
    </div>
    <div :style="diamondGlowStyle"></div>
    <div :style="diamondWrapStyle">
      <div :style="diamondStyle"></div>
      <div
        v-if="!hasTriggeredWheel"
        :style="fortuneTellerTopZoneStyle"
        @mouseenter="handleTopFortuneTellerEnter"
        @mouseleave="handleTopFortuneTellerLeave"
        @click="showUnluckyWheel = true"
      >
        <img
          :src="fortuneTellerSrc"
          :style="[
            fortuneTellerTopImgStyle, 
            { 
              opacity: showFortuneTop ? 1 : 0, 
              transition: 'opacity 0.3s, transform 0.3s ease',
              transform: fortuneTopHovered ? 'scale(1.1)' : 'scale(1)'
            }
          ]"
          alt="fortune teller top"
        />
      </div>
      <div
        v-if="!hasTriggeredWheel"
        :style="fortuneTellerBottomZoneStyle"
        @mouseenter="handleBottomFortuneTellerEnter"
        @mouseleave="handleBottomFortuneTellerLeave"
        @click="showLuckyWheel = true"
      >
        <img
          :src="fortuneTellerSrc"
          :style="[
            fortuneTellerBottomImgStyle, 
            { 
              opacity: showFortuneBottom ? 1 : 0, 
              transition: 'opacity 0.3s, transform 0.3s ease',
              transform: fortuneBottomHovered ? 'scale(1.1)' : 'scale(1)'
            }
          ]"
          alt="fortune teller bottom"
        />
      </div>
      
      
      <svg
        :style="centerSvgStyle"
        @mouseover="menuHover = true"
        @mouseleave="menuHover = false"
        @click="handleMenuClick"
        width="90"
        height="90"
        viewBox="0 0 90 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="45" cy="45" r="28" stroke="#BD0FDB" stroke-width="4"/>
        <rect :y="menuHover ? 36 : 36" x="30" width="30" height="4" rx="2" :fill="'#BD0FDB'"/>
        <rect :y="menuHover ? 44 : 44" x="30" width="30" height="4" rx="2" :fill="'#BD0FDB'"/>
        <rect :y="menuHover ? 52 : 52" x="30" width="30" height="4" rx="2" :fill="'#BD0FDB'"/>
      </svg>
    </div>
  <img :src="tarotSrc" :style="topLeftTarotStyle" alt="tarot" @mouseenter="topLeftTarotHover = true" @mouseleave="topLeftTarotHover = false" />
  <img :src="sunSrc" :style="topLeftSunStyle" alt="sun" @mouseenter="topLeftSunHover = true" @mouseleave="topLeftSunHover = false" />
  <img :src="tarotSrc" :style="bottomRightTarotStyle" alt="tarot" @mouseenter="bottomRightTarotHover = true" @mouseleave="bottomRightTarotHover = false" />
  <img :src="moonSrc" :style="bottomRightMoonStyle" alt="moon" @mouseenter="bottomRightMoonHover = true" @mouseleave="bottomRightMoonHover = false" />
  </div>
</template>

<script>
import LuckyWheel from '@/components/luckyWheel.vue'
import UnluckyWheel from '@/components/unluckyWheel.vue'

export default {
  name: 'YesIntro',
  components: {
    LuckyWheel,
    UnluckyWheel
  },
  data() {
    return {
      tarotSrc: require('@/assets/tarot.png'),
      sunSrc: require('@/assets/sun.png'),
      moonSrc: require('@/assets/moon.png'),
      fortuneTellerSrc: require('@/assets/fortune-teller.png'),
      menuHover: false,
      showFortuneTop: false,
      showFortuneBottom: false,
      showPopup: false,
      okHovered: false,
      hasSeenPopup: false,
      showLuckyWheel: false,
      showUnluckyWheel: false,
      fortuneTopHovered: false,
      fortuneBottomHovered: false,
      hasTriggeredWheel: false,
      topLeftTarotHover: false,
      topLeftSunHover: false,
      bottomRightTarotHover: false,
      bottomRightMoonHover: false
    }
  },
  mounted() {
    this.hasSeenPopup = false;
    this.showPopup = false;
  },
  methods:{
    handleMenuClick(){
      if (this.hasTriggeredWheel) {
        this.goToStart();
        return;
      }
      if (!this.hasSeenPopup) {
        this.showPopup = true;
        this.hasSeenPopup = true;
      } else {
        this.goToStart();
      }
    },
    handleOkClick() {
      this.showPopup = false;
    },
    goToStart(){
      this.$router.push('/start');
    },
    handleLuckyWheelResult(result) {
      console.log('Lucky wheel result:', result);
      this.hasTriggeredWheel = true;
    },
    handleUnluckyWheelResult(result) {
      console.log('Unlucky wheel result:', result);
      this.hasTriggeredWheel = true;
    },
    handleWheelClose() {
      if (this.showLuckyWheel || this.showUnluckyWheel) {
        this.hasTriggeredWheel = true;
      }
      this.showLuckyWheel = false;
      this.showUnluckyWheel = false;
    },
    handleTopFortuneTellerEnter() {
      this.showFortuneTop = true;
      this.fortuneTopHovered = true;
    },
    handleTopFortuneTellerLeave() {
      this.showFortuneTop = false;
      this.fortuneTopHovered = false;
    },
    handleBottomFortuneTellerEnter() {
      this.showFortuneBottom = true;
      this.fortuneBottomHovered = true;
    },
    handleBottomFortuneTellerLeave() {
      this.showFortuneBottom = false;
      this.fortuneBottomHovered = false;
    }
  },
  computed: {
    bgStyle() {
      return {
        minHeight: '100vh',
        minWidth: '100vw',
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: '#8400FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    },
    diamondGlowStyle() {
      return {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '600px',
        height: '600px',
        background: '#fff',
        opacity: 0.85,
        transform: 'translate(-50%, -50%) rotate(45deg)',
        filter: 'blur(60px)',
        zIndex: 0,
        pointerEvents: 'none'
      }
    },
    diamondWrapStyle() {
      return {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '200px',
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    },
    diamondStyle() {
      return {
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: '#fff',
        transform: 'rotate(45deg)',
        zIndex: 1,
        boxShadow: '0 0 40px #fff8',
        borderRadius: '20px'
      }
    },
    centerSvgStyle() {
      return {
        position: 'relative',
        width: '90px',
        height: '90px',
        zIndex: 2,
        filter: 'invert(75%) sepia(85%) saturate(7492%) hue-rotate(266deg) brightness(93%) contrast(101%)',
        transition: 'transform 0.5s cubic-bezier(.4,2,.6,1)',
        transform: this.menuHover ? 'scale(1.4)' : 'scale(1)',
        cursor: 'pointer'
      }
    },
    fortuneTellerTopZoneStyle() {
      return {
        position: 'absolute',
        left: '50%',
        top: '-260px',
        transform: 'translateX(-50%)',
        width: '60px',
        height: '60px',
        zIndex: 20,
        cursor: 'pointer',
        transition: 'transform 0.3s ease',
        borderRadius: '50%',
        padding: '5px'
      }
    },
    fortuneTellerBottomZoneStyle() {
      return {
        position: 'absolute',
        left: '50%',
        bottom: '-260px',
        transform: 'translateX(-50%)',
        width: '60px',
        height: '60px',
        zIndex: 20,
        cursor: 'pointer',
        transition: 'transform 0.3s ease',
        borderRadius: '50%',
        padding: '5px'
      }
    },
    fortuneTellerTopImgStyle() {
      return {
        width: '100%',
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0,
        pointerEvents: 'none',
        filter: 'brightness(0.7) contrast(1.6) blur(0.5px)'
      }
    },
    fortuneTellerBottomImgStyle() {
      return {
        width: '100%',
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0,
        pointerEvents: 'none',
        filter: 'brightness(1.5) contrast(0.8) blur(0.5px)',
        transform: 'rotate(180deg)'
      }
    },
    topLeftTarotStyle() {
      return {
        position: 'absolute',
        top: '50px',
        left: '50px',
        width: '120px',
        height: '120px',
        opacity: this.topLeftTarotHover ? 1 : 0.4,
        pointerEvents: 'auto',
        cursor: 'pointer',
        transition: 'transform 0.5s cubic-bezier(.4,2,.6,1), opacity 0.2s ease, filter 0.2s ease',
        transform: this.topLeftTarotHover ? 'scale(1.2)' : 'scale(1)',
        filter: this.topLeftTarotHover ? 'drop-shadow(0 8px 12px rgba(0,0,0,0.4))' : 'none'
      }
    },
    topLeftSunStyle() {
      return {
        position: 'absolute',
        top: '30px',
        left: '180px',
        width: '50px',
        height: '50px',
        opacity: this.topLeftSunHover ? 1 : 0.5,
        pointerEvents: 'auto',
        cursor: 'pointer',
        transition: 'transform 0.5s cubic-bezier(.4,2,.6,1), opacity 0.2s ease, filter 0.2s ease',
        transform: this.topLeftSunHover ? 'scale(1.4)' : 'scale(1)',
        filter: this.topLeftSunHover ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.4))' : 'none'
      }
    },
    bottomRightTarotStyle() {
      return {
        position: 'absolute',
        bottom: '40px',
        right: '50px',
        width: '120px',
        height: '120px',
        opacity: this.bottomRightTarotHover ? 1 : 0.5,
        pointerEvents: 'auto',
        cursor: 'pointer',
        transition: 'transform 0.5s cubic-bezier(.4,2,.6,1), opacity 0.2s ease, filter 0.2s ease',
        transform: this.bottomRightTarotHover ? 'scale(1.2)' : 'scale(1)',
        filter: this.bottomRightTarotHover ? 'drop-shadow(0 8px 12px rgba(0,0,0,0.4))' : 'none'
      }
    },
    bottomRightMoonStyle() {
      return {
        position: 'absolute',
        bottom: '130px',
        right: '180px',
        width: '50px',
        height: '50px',
        opacity: this.bottomRightMoonHover ? 1 : 0.5,
        pointerEvents: 'auto',
        cursor: 'pointer',
        transition: 'transform 0.5s cubic-bezier(.4,2,.6,1), opacity 0.2s ease, filter 0.2s ease',
        transform: this.bottomRightMoonHover ? 'scale(1.4)' : 'scale(1)',
        filter: this.bottomRightMoonHover ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.4))' : 'none'
      }
    },
    popupOverlayStyle() {
      return {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }
    },
    popupContainerStyle() {
      return {
        background: 'white',
        border: '2px solid black',
        borderRadius: '15px',
        padding: '2rem',
        textAlign: 'center',
        maxWidth: '400px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }
    },
    popupTextStyle() {
      return {
        color: 'red',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        lineHeight: '1.4',
        marginBottom: '1.5rem',
        fontFamily: "'Inter', system-ui, sans-serif"
      }
    },
    okButtonStyle() {
      return {
        background: 'white',
        color: 'black',
        border: '2px solid black',
        borderRadius: '15px',
        padding: '0.75rem 2rem',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontFamily: "'Inter', system-ui, sans-serif",
        ...(this.okHovered && {
          background: 'black',
          color: 'white',
          transform: 'scale(1.05)'
        })
      }
    },

  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap');

.popup-enter-active {
  animation: popupJump 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popupJump {
  0%{
    transform: scale(0.2) translateY(-30px);
    opacity: 0;
  }
  50%{
    transform: scale(1.15) translateY(8px);
    opacity: 0.9;
  }
  70% {
    transform: scale(0.95) translateY(-3px);
    opacity: 1;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
</style>