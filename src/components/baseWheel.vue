<template>
  <div class="wheel-overlay" :style="overlayStyle">
    <div class="wheel-container" :style="[themeVars, containerStyle]" @click.stop>
      <div :style="headerStyle">
        <h2 :style="titleStyle">{{ title }}</h2>
      </div>

      <div :style="wrapperStyle">
        <div :style="outerStyle">
          <div :style="rimStyle"></div>
          <div :style="wheelInnerStyle" ref="wheelInner">
            <div
              v-for="(segment, index) in segments"
              :key="index"
              :style="getSegmentStyle(index)"
            >
              <span :style="getTextStyle(index, segment)">
                {{ segment.text }}
              </span>
            </div>
          </div>
          <div :style="dividerOverlayStyle"></div>
          <div :style="pointerStyle"></div>
          <button
            class="spin-button"
            :style="spinButtonStyle"
            @click="spinWheel"
            :disabled="spinDisabled"
          >
            SPIN
          </button>
        </div>
        <div class="wheel-stand" :style="standStyle"></div>
      </div>

      <div :style="footerStyle">
        <button class="exit-button" :style="exitButtonStyle" @click="emitClose" :disabled="isSpinning">Exit</button>
      </div>
    </div>
  </div>
</template>

<script>
import { addCredits } from '@/services/credits'
export default {
  name: 'BaseWheel',
  emits: ['wheel-result', 'close'],
  props: {
    title: { type: String, required: true },
    segments: { type: Array, required: true },
    variant: { type: String, default: 'lucky' },
  },
  data() {
    return {
      isSpinning: false,
      hasSpun: false,
      wheelRotation: 0,
      canRespin: false
    };
  },
  computed: {
    overlayStyle() {
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
        zIndex: 1000,
      };
    },
    len() { return this.segments.length; },
    segmentAngle() { return 360 / this.len; },
    isIdle() { return !this.hasSpun && !this.isSpinning; },
    spinDisabled() { return this.isSpinning || (this.hasSpun && !this.canRespin); },
    themeVars() {
      if (this.variant === 'unlucky') {
        return {
          '--container-bg': '#2d1b3d',
          '--rim-border-color': '#444',
          '--pointer-color': '#666',
          '--button-grad-1': '#666',
          '--button-grad-2': '#444',
          '--stand-grad-1': '#1a1a1a',
          '--stand-grad-2': '#333',
          '--stand-base-grad-1': '#0a0a0a',
          '--stand-base-grad-2': '#1a1a1a',
          '--accent-color': '#ff6b6b'
        };
      }
      return {
        '--container-bg': '#4A2C6B',
        '--rim-border-color': '#C82A4D',
        '--pointer-color': '#FFD700',
        '--button-grad-1': '#FFD700',
        '--button-grad-2': '#FFA500',
        '--stand-grad-1': '#1e3a8a',
        '--stand-grad-2': '#3b82f6',
        '--stand-base-grad-1': '#0f1f4a',
        '--stand-base-grad-2': '#1e3a8a',
        '--accent-color': '#FFD700'
      };
    },
    containerStyle() {
      return {
        borderRadius: '20px',
        padding: '2rem',
        textAlign: 'center',
        maxWidth: '500px',
        width: '90%',
        position: 'relative',
        background: this.themeVars['--container-bg'],
      };
    },
    headerStyle() {
      return {
        marginBottom: '3rem',
      };
    },
    titleStyle() {
      return {
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        margin: 0,
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
      };
    },
    wrapperStyle() {
      return {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '1.5rem',
      };
    },
    outerStyle() {
      return {
        position: 'relative',
        width: '320px',
        height: '320px',
        marginBottom: '1rem',
      };
    },
    rimStyle() {
      return {
        position: 'absolute',
        top: '-10px',
        left: '-10px',
        width: '340px',
        height: '340px',
        border: `8px solid ${this.themeVars['--rim-border-color']}`,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
      };
    },
    wheelGradient() {
      const seg = this.segmentAngle;
      const stops = [];
      for (let i = 0; i < this.len; i++) {
        const start = i * seg;
        const end = (i + 1) * seg;
        const color = this.variant === 'unlucky'
          ? (i % 2 === 0 ? '#000000' : '#F5F5F5')
          : (i % 2 === 0 ? '#B01E3F' : '#F5F5F5');
        stops.push(`${color} ${start}deg ${end}deg`);
      }
      return `conic-gradient(from -90deg, ${stops.join(', ')})`;
    },
    wheelInnerStyle() {
      return {
        position: 'absolute',
        top: '10px',
        left: '10px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        overflow: 'hidden',
        background: this.wheelGradient,
        transform: `rotate(${this.wheelRotation}deg)`,
        transition: this.isIdle
          ? 'none'
          : 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        backgroundSize: 'cover',
      };
    },
    dividerStyle() {
      const seg = this.segmentAngle;
      const len = this.len;
      const thick = 1;
      const darkColor = this.variant === 'unlucky' ? '#000000' : '#B01E3F';
      const parts = [];
      let cursor = 0;
      for (let i = 0; i < len; i++) {
        const center = (i + 0.5) * seg;
        const start = center - thick / 2;
        const end = center + thick / 2;
        const color = (i % 2 === 0) ? darkColor : '#ffffff';
        if (start > cursor) parts.push(`transparent ${cursor}deg ${start}deg`);
        parts.push(`${color} ${start}deg ${end}deg`);
        cursor = end;
      }
      if (cursor < 360) parts.push(`transparent ${cursor}deg 360deg`);
      return {
        transform: `rotate(${this.wheelRotation}deg)`,
        background: `conic-gradient(from -90deg, ${parts.join(', ')})`
      };
    },
    dividerOverlayStyle() {
      return Object.assign(
        {
          position: 'absolute',
          top: '10px',
          left: '10px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          pointerEvents: 'none',
          opacity: 0,
        },
        this.dividerStyle,
      );
    },
    pointerStyle() {
      return {
        position: 'absolute',
        top: '-15px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '15px solid transparent',
        borderRight: '15px solid transparent',
        borderTop: `25px solid ${this.themeVars['--pointer-color']}`,
        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
        zIndex: 10,
      };
    },
    spinButtonStyle() {
      return {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: `linear-gradient(145deg, ${this.themeVars['--button-grad-1']}, ${this.themeVars['--button-grad-2']})`,
        border: 'none',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '1rem',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
        zIndex: 15,
      };
    },
    standStyle() {
      return {
        width: '200px',
        height: '40px',
        background: `linear-gradient(145deg, ${this.themeVars['--stand-grad-1']}, ${this.themeVars['--stand-grad-2']})`,
        borderRadius: '20px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        margin: '0 auto',
      };
    },
    footerStyle() {
      return {
        marginTop: '1rem',
      };
    },
    exitButtonStyle() {
      return {
        background: 'none',
        border: 'none',
        color: 'white',
        textDecoration: 'underline',
        fontSize: '1rem',
        cursor: 'pointer',
        padding: '0.5rem 1rem',
      };
    }
  },
  methods: {
    emitClose() {
  if (this.isSpinning) return;
  this.$emit('close');
    },
    spinWheel() {
      if (this.isSpinning || (this.hasSpun && !this.canRespin)) return;
      this.canRespin = false;
  this.stopIdle();
      this.isSpinning = true;
      this.hasSpun = true;
      const segmentAngle = this.segmentAngle;
      const fullRotations = Math.floor(Math.random() * 3) + 3;
      let normalized = this.wheelRotation % 360;
      if (normalized < 0) normalized += 360;
      const toNextBoundary = (segmentAngle - (normalized % segmentAngle)) % segmentAngle;
      const boundarySteps = Math.floor(Math.random() * this.len);
      const extraAngle = toNextBoundary + boundarySteps * segmentAngle;
      const finalRotation = this.wheelRotation + (fullRotations * 360) + extraAngle;
      this.wheelRotation = finalRotation;
      const onEnd = () => {
        this.isSpinning = false;
        const winningSegment = this.getWinningSegment();
        this.showResult(winningSegment);
      };
      this.$refs.wheelInner.addEventListener('transitionend', onEnd, { once: true });
    },
    startIdle() {
      if (!this.isIdle) return;
      if (this.idleRaf) return;
      this._idleLastTs = null;
      const step = (ts) => {
        if (!this.isIdle) { this.stopIdle(); return; }
        if (this._idleLastTs == null) this._idleLastTs = ts;
        const dt = ts - this._idleLastTs;
        this._idleLastTs = ts;
        const speed = 6 / 1000; 
        this.wheelRotation = (this.wheelRotation + speed * dt) % 360;
        this.idleRaf = requestAnimationFrame(step);
      };
      this.idleRaf = requestAnimationFrame(step);
    },
    stopIdle() {
      if (this.idleRaf) cancelAnimationFrame(this.idleRaf);
      this.idleRaf = null;
      this._idleLastTs = null;
    },
    showResult(segment) {
      this.$emit('wheel-result', segment);
      
      
      try {
        const { markWheelSpun, addUserCredits } = require('@/services/userState.js');
        markWheelSpun(segment);
        
        
        setTimeout(() => {
          if (segment.value === 'crown') {
            // Promote user to winner status like admin would
            (async () => {
              try {
                const { promoteToWinner } = require('@/services/userState.js');
                const success = await promoteToWinner('Wheel of Fortune');
                if (success) {
                  alert(`🎉 ${segment.text}! You are now a winner!`);
                } else {
                  alert(`You won: ${segment.text}! (Already a winner)`);
                }
              } catch (error) {
                console.error('Error promoting to winner:', error);
                alert(`You won: ${segment.text}!`);
              }
            })();
          } else if (segment.value === 'no-karma') {
            // Set karma points to 0 and karma level to 5
            try {
              const { setUserKarmaPoints } = require('@/services/userState.js');
              setUserKarmaPoints(0);
              alert(`🎉 ${segment.text}! Your karma is now at level 5!`);
            } catch (error) {
              console.error('Error setting karma to 0:', error);
              alert(`You won: ${segment.text}!`);
            }
          } else if (segment.value === 'instant-karma') {
            // Demote user to loser status
            (async () => {
              try {
                const { demoteToLoser } = require('@/services/userState.js');
                const success = await demoteToLoser('Wheel of Misfortune');
                if (success) {
                  alert(`💀 ${segment.text}! You are now a loser!`);
                } else {
                  alert(`You got: ${segment.text}! (Already a loser or admin)`);
                }
              } catch (error) {
                console.error('Error demoting to loser:', error);
                alert(`You got: ${segment.text}!`);
              }
            })();
          } else if (segment.value === 'spin-again') {
            alert(`You won: ${segment.text}!`);
          } else if (segment.value > 0) {
            alert(`You gained ${segment.value} credits!`);
            addUserCredits(segment.value);
          } else {
            alert(`You lost ${Math.abs(segment.value)} credits!`);
            addUserCredits(segment.value); 
          }
          if (this.variant === 'unlucky' && segment.value === 'spin-again') {
            this.canRespin = true;
          }
        }, 500);
      } catch (error) {
        console.debug('Failed to save wheel progress, using fallback', error);
        
        setTimeout(() => {
          if (segment.value === 'crown') {
            // Promote user to winner status like admin would
            (async () => {
              try {
                const { promoteToWinner } = require('@/services/userState.js');
                const success = await promoteToWinner('Wheel of Fortune');
                if (success) {
                  alert(`🎉 ${segment.text}! You are now a winner!`);
                } else {
                  alert(`You won: ${segment.text}! (Already a winner)`);
                }
              } catch (error) {
                console.error('Error promoting to winner:', error);
                alert(`You won: ${segment.text}!`);
              }
            })();
          } else if (segment.value === 'no-karma') {
            // Set karma points to 0 and karma level to 5
            try {
              const { setUserKarmaPoints } = require('@/services/userState.js');
              setUserKarmaPoints(0);
              alert(`🎉 ${segment.text}! Your karma is now at level 5!`);
            } catch (error) {
              console.error('Error setting karma to 0:', error);
              alert(`You won: ${segment.text}!`);
            }
          } else if (segment.value === 'instant-karma') {
            // Demote user to loser status
            (async () => {
              try {
                const { demoteToLoser } = require('@/services/userState.js');
                const success = await demoteToLoser('Wheel of Misfortune');
                if (success) {
                  alert(`💀 ${segment.text}! You are now a loser!`);
                } else {
                  alert(`You got: ${segment.text}! (Already a loser or admin)`);
                }
              } catch (error) {
                console.error('Error demoting to loser:', error);
                alert(`You got: ${segment.text}!`);
              }
            })();
          } else if (segment.value === 'spin-again') {
            alert(`You won: ${segment.text}!`);
          } else if (segment.value > 0) {
            alert(`You gained ${segment.value} credits!`);
            addCredits(segment.value);
          } else {
            alert(`You lost ${Math.abs(segment.value)} credits!`);
            addCredits(segment.value); 
          }
          if (this.variant === 'unlucky' && segment.value === 'spin-again') {
            this.canRespin = true;
          }
        }, 500);
      }
    },
    getSegmentStyle(index) {
      const angle = (index + 0.5) * this.segmentAngle;
      return {
        position: 'absolute',
        inset: 0,
        transformOrigin: '50% 50%',
        transform: `rotate(${angle}deg)`,
      };
    },
    getTextStyle(index, segment) {
      const isLucky = this.variant === 'lucky';
      const txt = (segment.text || '').toUpperCase();
      const isDarkSlice = index % 2 === 0;
      let color = '#000000';
      let textShadow = '0 0 3px rgba(255,255,255,0.95), 0 0 6px rgba(255,255,255,0.7)';
      let top = 14;
      let scale = 1;

      if (segment.special) {
        if (isLucky) {
          color = '#FFD700';
          textShadow = '0 1px 2px rgba(0,0,0,0.95), 0 0 6px rgba(0,0,0,0.6)';
          const len = (segment.text || '').length;
          scale = len > 12 ? 0.8 : len > 9 ? 0.85 : len > 7 ? 0.9 : 1;
          top = len > 10 ? 30 : 26;
          if (txt === 'NO KARMA') top = 32;
        } else {
          color = '#ff6b6b';
          textShadow = '0 1px 2px rgba(0,0,0,0.95), 0 0 6px rgba(0,0,0,0.6)';
          const len = txt.length;
          scale = len > 13 ? 0.75 : len > 11 ? 0.8 : len > 9 ? 0.85 : len > 7 ? 0.9 : 1;
          if (txt.includes('INSTANT KARMA')) top = 36; else if (txt.includes('SPIN AGAIN')) top = 32; else top = 28;
        }
      } else {
        const len = (segment.text || '').length;
        scale = len > 12 ? 0.8 : len > 9 ? 0.85 : len > 7 ? 0.9 : 1;
        if (isDarkSlice) {
          color = '#ffffff';
          textShadow = 'none';
        }
      }

      return {
        position: 'absolute',
        top: `${top}px`,
        left: '50%',
        transformOrigin: '50% 0',
        fontSize: '0.8rem',
        fontWeight: segment.special ? 900 : 'bold',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        maxWidth: '90px',
        lineHeight: 1.2,
        color,
        textShadow,
        transform: `translate(-50%, 0) rotate(90deg) scale(${scale})`,
      };
    },
    getWinningSegment() {
      const segmentAngle = this.segmentAngle;
      let normalized = this.wheelRotation % 360;
      if (normalized < 0) normalized += 360;
      const indexAtTop = Math.floor((360 - normalized) / segmentAngle) % this.len;
      return this.segments[indexAtTop];
    }
  },
  watch: {
    isIdle(val) { if (val) this.startIdle(); else this.stopIdle(); }
  },
  mounted() { this.startIdle(); },
  beforeUnmount() { this.stopIdle(); }
};
</script>

<style scoped>
.spin-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--button-grad-1), var(--button-grad-2));
  border: none;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  z-index: 15;
}

.spin-button:hover:not(:disabled) {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.spin-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.wheel-stand::before {
  content: '';
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 20px;
  background: linear-gradient(145deg, var(--stand-grad-1), var(--stand-grad-2));
  border-radius: 10px;
}

.wheel-stand::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  height: 20px;
  background: linear-gradient(145deg, var(--stand-base-grad-1), var(--stand-base-grad-2));
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.exit-button:hover { color: var(--accent-color); text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }

.exit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  text-shadow: none;
}

</style>
