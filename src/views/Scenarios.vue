<template>
  <div :style="pageStyle">
    <img :src="menuSrc" alt="Menu" :style="menuIconStyle" />

    <div v-if="showPopup" :style="popupOverlayStyle">
      <div :style="popupContainerStyle" class="popup-enter-active">
        <div :style="popupTextStyle">
          Before you start, explore the <br> menu bar's features.
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

  <div :style="cardStyle">
      <div :style="scenarioTextStyle">
        You find a wallet on the street with $500 in cash and an ID.<br>
        The owner is nowhere in sight.

      </div>

      <div :style="dividerStyle" aria-hidden="true"></div>

      <div :style="optionSubtextStyle">
        Return the wallet to the owner or turn it in to the police.
      </div>

      <div :style="orStyle">OR</div>

      <div :style="optionSubtextStyle">
        Keep the cash and throw the wallet away.
      </div>

      <div :style="buttonsRowStyle">
        <button :style="choiceBtnStyle" @click="onChoose('down')" aria-label="Choose down">
          <img :src="downSrc" alt="Down" :style="arrowIconStyle" />
        </button>
        <button :style="choiceBtnStyle" @click="onChoose('up')" aria-label="Choose up">
          <img :src="upSrc" alt="Up" :style="arrowIconStyle" />
        </button>
      </div>
  </div>

    <div :style="logoContainerStyle">
      <img :src="logoSrc" :style="logoStyle" alt="Karma Tracker Logo" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScenarioPage',
  data() {
    return {
      upSrc: require('@/assets/up-arrow.png'),
      downSrc: require('@/assets/down-arrow.png'),
      menuSrc: require('@/assets/menu.png'),
      logoSrc: require('@/assets/karma_tracker_logo.png'),
      showPopup: false,
      hasSeenPopup: false,
      okHovered: false
    }
  },
  computed: {
    pageStyle() {
      return {
        width: '100vw',
        height: '100vh',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1.5rem',
        fontFamily: "'MedievalSharp', system-ui, sans-serif",
        color: '#1d1d1f',
        position: 'relative',
        overflow: 'hidden'
      }
    },
    menuIconStyle() {
      return { 
        width: '84px', 
        height: '84px', 
        objectFit: 'contain', 
        marginTop: '4rem' 
      }
    },
    cardStyle() {
      return {
        width: 'min(88vw, 300px)',
        background: '#ffffff',
        borderRadius: '15px',
        border: '3px solid #000',
        boxShadow: '0 8px 18px rgba(0,0,0,0.12)',
        padding: '1.25rem 1.25rem 1rem',
        marginTop: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        gap: '0.75rem'
      }
    },
    scenarioTextStyle() {
      return {
        fontSize: '1.4rem',
        lineHeight: '1.4',
        color: '#222',
        textAlign: 'center',
        padding: '0 0.25rem',
        fontWeight: 600
      }
    },
    dividerStyle() {
      return { 
        height: '0', 
        borderTop: '5px dotted #4a4a4a', 
        margin: '0.25rem 1rem 0.5rem' 
      }
    },
    optionSubtextStyle() {
      return { 
        fontSize: '1rem', 
        color: '#6b6b6b', 
        textAlign: 'center', fontStyle: 'italic', padding: '0 0.5rem' 
      }
    },
    orStyle() {
      return { 
        textAlign: 'center', 
        fontSize: '1.2rem', 
        color: '#4a4a4a', 
        fontWeight: 600, 
        margin: '0.1rem 0' 
      }
    },
    buttonsRowStyle() {
      return { 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '2.25rem', 
        marginTop: '0.5rem' 
      }
    },
    choiceBtnStyle() {
      return {
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        border: '3px solid #000',
        background: '#fff',
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer',
        boxShadow: '0 6px 12px rgba(0,0,0,0.18)',
        transition: 'transform 0.15s ease, box-shadow 0.2s ease'
      }
    },
    arrowIconStyle() { return { width: '28px', height: '28px', objectFit: 'contain' } },
    logoContainerStyle() { return { display: 'flex', alignItems: 'center', justifyContent: 'center' } },
    logoStyle() { return { width: '200px', height: 'auto', filter: 'brightness(0) saturate(100%)' } },
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
    }
  },
  methods: {
    onChoose(direction) {
      if (!this.hasSeenPopup) {
        this.showPopup = true;
        this.hasSeenPopup = true;
        return;
      }
      console.log('Choice selected:', direction)
    },
    handleOkClick() { this.showPopup = false }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap');

button[aria-label='Choose up']:hover,
button[aria-label='Choose down']:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 28px rgba(0,0,0,0.25) !important;
}

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