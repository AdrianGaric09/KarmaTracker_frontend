<template>
  <div :style="pageStyle">
    <button :style="closeStyle" aria-label="Close" @click="emitClose">×</button>

    <div :style="contentStyle">
      <div :style="hintStyle">HINT: If you win, you will receive double the amount of your initial investment.</div>

      <div :style="circleSlotStyle">
        <div :style="circle" @mouseenter="hoverBlack = true" @mouseleave="hoverBlack = false" @click="selectColor('black')" />
      </div>

      <div :style="titleStyle">PICK A COLOR</div>
      <div :style="subtitleStyle">50% chance to win ;)</div>

      <div :style="circleSlotStyle">
        <div :style="circleRed" @mouseenter="hoverRed = true" @mouseleave="hoverRed = false" @click="selectColor('red')" />
      </div>

      <div :style="stakeWrapStyle">
  <button :style="stakeBtnStyle" :disabled="!isStakeEnabled" @click="placeStake">Place a bet</button>
        <div :style="stakeControlsStyle">
          <button :style="roundBtnStyle" aria-label="Decrease" @click="decBet">
            <img :src="minusSrc" :style="minusIconStyle" alt="-" />
          </button>
          <div :style="amountWrapStyle">
            <div :style="amountStyle">{{ amount }}</div>
            <div :style="betLabelStyle">BET AMOUNT</div>
          </div>
          <button :style="roundBtnStyle" aria-label="Increase" @click="incBet">
            <img :src="plusSrc" :style="plusIconStyle" alt="+" />
          </button>
        </div>
      </div>
  </div>
  <div v-if="overlayVisible" :style="overlayStyle"></div>
  </div>
</template>

<script>
import { getCredits, setCredits, clampBet } from '@/services/credits'
export default {
  name: 'ColorPrediction',
  emits: ['close'],
  data(){ return{ minusSrc: require('@/assets/minus.png'), plusSrc: require('@/assets/plus.png'), amount: 50, minBet: 50, maxBet: 500, credits: getCredits(), hoverBlack: false, hoverRed: false, selectedColor: null, overlayVisible: false, animActive: false, phase: 'idle', winner: null, celebrateY: 0, celebrateScale: 1 } },
  mounted() {
    try {
      const { getUserState } = require('@/services/userState.js');
      const userState = getUserState();
      if (userState.preferences && userState.preferences.selectedColor) {
        this.selectedColor = userState.preferences.selectedColor;
      }
    } catch (_) {
      // Ignore errors loading user preferences
    }
  },
  computed: {
    circleSlotStyle() { return{ width: '150px', height: '150px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
    pageStyle() { return{ width: '100vw', height: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', fontFamily: "'Inter', system-ui, sans-serif", color: '#4A4441', border: '4px solid #FFD400', boxSizing: 'border-box' } },
    closeStyle() { return{ position: 'fixed', top: '16px', right: '16px', width: '44px', height: '44px', borderRadius: '50%', border: '3px solid #111', background: '#fff', color: '#111', fontSize: '28px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } },
    contentStyle() { return{ width: 'min(92vw, 480px)', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center' } },
    hintStyle() { return{ fontStyle: 'italic', fontWeight: 800, color: '#000', marginTop: '6px', fontSize: '24px' } },
    titleStyle() { return{ fontWeight: 900, fontSize: '34px', letterSpacing: '0.6px', color: '#6a625f', marginTop: '4px' } },
    subtitleStyle() { return{ fontStyle: 'italic', color: '#6b6b6b', fontSize: '18px' } },
    circle() {
      const selected = this.selectedColor === 'black'
      const activeHover = this.hoverBlack || selected
      if (this.animActive) {
        const base = { width: '140px', height: '140px', borderRadius: '50%', background: '#1a1a1a', position: 'fixed', top: '50%', left: '50%', zIndex: 3101, transition: 'transform 420ms cubic-bezier(.2,.8,.2,1), box-shadow 220ms ease, opacity 300ms ease' }
        if (this.phase === 'approach') return { ...base, transform: 'translate(-50%, -50%) translateX(-130px)', boxShadow: '0 16px 28px rgba(0,0,0,0.26)' }
        if (this.phase === 'clash') return { ...base, transform: 'translate(-50%, -50%) translateX(-60px) scale(1.08)', boxShadow: '0 22px 40px rgba(0,0,0,0.30)' }
        if (this.phase === 'push') {
          if (this.winner === 'black') return { ...base, transform: 'translate(-50%, -50%) translateX(-10px) scale(1.06)', boxShadow: '0 24px 44px rgba(0,0,0,0.32)' }
          return { ...base, transform: 'translate(-50%, -50%) translateX(-820px)', boxShadow: '0 10px 16px rgba(0,0,0,0.18)', opacity: 0.15 }
        }
        if (this.phase === 'celebrate') {
          if (this.winner === 'black') return { ...base, transform: `translate(-50%, calc(-50% + ${this.celebrateY}px)) translateX(0) scale(${this.celebrateScale})`, boxShadow: '0 26px 50px rgba(0,0,0,0.34)' }
          return { ...base, transform: 'translate(-50%, -50%) translateX(-820px)', opacity: 0 }
        }
        return base
      }
      return { width: '130px', height: '130px', borderRadius: '50%', background: '#1a1a1a', boxShadow: activeHover ? '0 16px 28px rgba(0,0,0,0.26)': '0 12px 22px rgba(0,0,0,0.20)', marginTop: '8px', cursor: 'pointer', transform: activeHover ? 'translateY(-6px) scale(1.04)': 'none', transition: 'transform 200ms ease, box-shadow 200ms ease' }
    },
    circleRed() {
      const selected = this.selectedColor === 'red'
      const activeHover = this.hoverRed || selected
      if (this.animActive) {
        const base = { width: '140px', height: '140px', borderRadius: '50%', background: '#e72323', position: 'fixed', top: '50%', left: '50%', zIndex: 3101, transition: 'transform 420ms cubic-bezier(.2,.8,.2,1), box-shadow 220ms ease, opacity 300ms ease' }
        if (this.phase === 'approach') return { ...base, transform: 'translate(-50%, -50%) translateX(130px)', boxShadow: '0 16px 28px rgba(0,0,0,0.26)' }
        if (this.phase === 'clash') return { ...base, transform: 'translate(-50%, -50%) translateX(60px) scale(1.08)', boxShadow: '0 22px 40px rgba(0,0,0,0.30)' }
        if (this.phase === 'push') {
          if (this.winner === 'red') return { ...base, transform: 'translate(-50%, -50%) translateX(10px) scale(1.06)', boxShadow: '0 24px 44px rgba(0,0,0,0.32)' }
          return { ...base, transform: 'translate(-50%, -50%) translateX(820px)', boxShadow: '0 10px 16px rgba(0,0,0,0.18)', opacity: 0.15 }
        }
        if (this.phase === 'celebrate') {
          if (this.winner === 'red') return { ...base, transform: `translate(-50%, calc(-50% + ${this.celebrateY}px)) translateX(0) scale(${this.celebrateScale})`, boxShadow: '0 26px 50px rgba(0,0,0,0.34)' }
          return { ...base, transform: 'translate(-50%, -50%) translateX(820px)', opacity: 0 }
        }
        return base
      }
      return { width: '130px', height: '130px', borderRadius: '50%', background: '#e72323', boxShadow: activeHover ? '0 16px 28px rgba(0,0,0,0.26)': '0 12px 22px rgba(0,0,0,0.20)', marginTop: '8px', cursor: 'pointer', transform: activeHover ? 'translateY(-6px) scale(1.04)': 'none', transition: 'transform 200ms ease, box-shadow 200ms ease' }
    },
    stakeWrapStyle() { return{ marginTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' } },
    stakeBtnStyle() {
      const enabled = this.isStakeEnabled
      return { background: '#fff', border: '3px solid #4a4441', borderRadius: '14px', padding: '10px 18px', fontWeight: 900, fontSize: '18px', boxShadow: '0 6px 14px rgba(0,0,0,0.16)', color: enabled ? '#000': '#9a9a9a', cursor: enabled ? 'pointer': 'not-allowed', opacity: enabled ? 1: 0.7 }
    },
    stakeControlsStyle() { return{ display: 'flex', alignItems: 'center', gap: '22px', marginTop: '6px' } },
    roundBtnStyle() { return{ background: 'transparent', border: 'none', padding: '8px', display: 'grid', placeItems: 'center', cursor: 'pointer' } },
    minusIconStyle() { return{ width: '30px', height: '30px', objectFit: 'contain', opacity: this.isAtMin ? 0.5: 1 } },
    plusIconStyle() { return{ width: '30px', height: '30px', objectFit: 'contain', opacity: this.isAtMax ? 0.5: 1 } },
    amountWrapStyle() { return{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '100px' } },
    amountStyle() { return{ fontSize: '24px', fontWeight: 800, minWidth: '52px', textAlign: 'center' } },
    betLabelStyle() { return{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.8px', color: '#777', textAlign: 'center' } },
    isAtMin() { return this.amount <= this.minBet },
    isAtMax() { return this.amount >= clampBet(this.maxBet) },
    isStakeEnabled() { return !!this.selectedColor && !this.animActive },
    overlayStyle() { return{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 3000 } },
  },
  methods: {
    emitClose() {
      if (!this.animActive) {
        this.$emit('close');
      }
    },
    selectColor(color) {
      if (!this.animActive) {
        this.selectedColor = color;
        try {
          const { updateUserState } = require('@/services/userState.js');
          updateUserState({ 
            preferences: { 
              selectedColor: color,
              lastVisitedPage: 'colorPrediction'
            }
          });
        } catch (_) {
          // Ignore errors saving user state
        }
      }
    },
    decBet() {
      if (this.amount > this.minBet) this.amount -= 50
    },
    incBet() {
      const cap = clampBet(this.maxBet)
      if (this.amount < cap) this.amount += 50
    },
    placeStake() {
      if (!this.isStakeEnabled) return
      
      this.winner = Math.random() < 0.5 ? 'black' : 'red'
      this.animActive = true
      this.overlayVisible = true
      this.phase = 'approach'
      
      setTimeout(() => {
        this.phase = 'clash'
        setTimeout(() => {
          this.phase = 'push'
          setTimeout(() => {
            this.phase = 'celebrate'
            this.startCelebrate(() => {
              const pickedWins = this.selectedColor === this.winner
              const winAmount = this.amount * 2
              const msg = pickedWins 
                ? `You picked ${this.selectedColor.toUpperCase()} — you win ${winAmount} credits!`
                : `You picked ${this.selectedColor?.toUpperCase()} — you lose ${this.amount} credits.`
              
              alert(msg)
              
              try {
                const { addUserCredits, updateGameProgress } = require('@/services/userState.js');
                const { trackTestMyLuckPlay } = require('@/services/karmaTracker.js');
                
                const creditChange = pickedWins ? winAmount : -this.amount;
                addUserCredits(creditChange);
                this.credits = addUserCredits(0);
                
                // Track karma points for playing test my luck
                trackTestMyLuckPlay(this.amount);
                
                updateGameProgress({
                  gameHistory: [{
                    game: 'colorPrediction',
                    timestamp: new Date().toISOString(),
                    selectedColor: this.selectedColor,
                    winner: this.winner,
                    betAmount: this.amount,
                    won: pickedWins,
                    creditChange: creditChange
                  }]
                });
              } catch (error) {
                console.debug('Failed to save via user state, using fallback', error);
                const cur = getCredits();
                const next = pickedWins ? cur + winAmount : Math.max(0, cur - this.amount);
                setCredits(next);
                this.credits = next;
              }
              
              this.resetState()
            })
          }, 700)
        }, 220)
      }, 380)
    },
    startCelebrate(done) {
      const steps = [-16, 0, -12, 0, -8, 0]
      const scales = [1.08, 1.02, 1.06, 1.02, 1.04, 1.02]
      let i = 0
      
      const tick = () => {
        if (i >= steps.length) {
          setTimeout(done, 140)
          return
        }
        
        this.celebrateY = steps[i]
        this.celebrateScale = scales[i]
        i++
        setTimeout(tick, 110)
      }
      
      tick()
    },
    resetState() {
      this.overlayVisible = false
      this.animActive = false
      this.phase = 'idle'
      this.winner = null
      this.selectedColor = null
      this.hoverBlack = false
      this.hoverRed = false
      this.celebrateY = 0
      this.celebrateScale = 1
    }
  }
}
</script>

