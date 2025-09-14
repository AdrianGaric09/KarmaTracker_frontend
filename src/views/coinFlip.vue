<template>
  <div :style="pageStyle">
    <button :style="closeStyle" aria-label="Close" @click="emitClose">×</button>

    <div :style="contentStyle">
      <div :style="rulesWrap">
        <div :style="winText">HEADS = YOU WIN</div>
        <div :style="loseText">TAILS = YOU LOSE</div>
      </div>
      <div :style="bestStyle">Best of luck !</div>

      <div :style="coinWrapStyle">
        <div
          :style="coin3dStyle"
          @mouseenter="coinHovered = true"
          @mouseleave="coinHovered = false"
          @click="flipCoin"
        >
          <img :src="headsSrc" :style="coinFaceFrontStyle" alt="Heads" />
          <img :src="tailsSrc" :style="coinFaceBackStyle" alt="Tails" />
        </div>
        <div :style="coinShadowStyle"></div>
      </div>

      <div :style="titleStyle">FLIP A COIN</div>

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
  <div v-if="anim.running" :style="overlayStyle"></div>
  </div>
</template>

<script>
import { getCredits, setCredits, clampBet } from '@/services/credits'
import headsPng from '@/assets/heads.png'
import tailsPng from '@/assets/tails.png'
import minusPng from '@/assets/minus.png'
import plusPng from '@/assets/plus.png'

export default {
  name: 'CoinFlip',
  emits: ['close'],
  data(){ return{ headsSrc: headsPng, tailsSrc: tailsPng, minusSrc: minusPng, plusSrc: plusPng, amount: 50, minBet: 50, maxBet: 500, credits: getCredits(), coinHovered: false, anim:{ running: false, y: 0, vy: 0, rotX: 0, rotZ: 0, wX: 0, wZ: 0, bounceCount: 0, settle: false, settleTarget: 0, settleHold: 0 },
     rafId: 0,
      result: null
    }
  },
  computed: {
    pageStyle() { return{ width: '100vw', height: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', fontFamily: "'Inter', system-ui, sans-serif", color: '#4A4441', border: '4px solid #FFD400', boxSizing: 'border-box' } },
    closeStyle() { return{ position: 'fixed', top: '16px', right: '16px', width: '44px', height: '44px', borderRadius: '50%', border: '3px solid #111', background: '#fff', color: '#111', fontSize: '28px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3001 } },
    contentStyle() { return{ width: 'min(94vw, 560px)', minHeight: '86vh', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' } },
    overlayStyle() { return{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, transition: 'opacity 200ms ease' } },
    rulesWrap() { return{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '12px', marginBottom: '26px' } },
    winText() { return{ color: '#0bd400', fontWeight: 900, letterSpacing: '0.6px', fontSize: '36px' } },
    loseText() { return{ color: '#ff2a2a', fontWeight: 900, letterSpacing: '0.6px', fontSize: '36px' } },
    bestStyle() { return{ color: '#6b6b6b', fontStyle: 'italic', marginTop: '8px', marginBottom: '38px', fontSize: '22px' } },
    coinWrapStyle() { return{ perspective: '1100px', margin: '6px 0 34px', zIndex: 2601, position: 'relative', width: '220px', height: '220px', overflow: 'visible' } },
    coin3dStyle() { const base = { width: '220px', height: '220px', position: 'absolute', left: '50%', bottom: '0', transformStyle: 'preserve-3d', willChange: 'transform', cursor: this.anim.running ? 'default': 'pointer', zIndex: 2601, transformOrigin: '50% 50%' }
      const y = this.anim.y
      const rx = this.anim.rotX
      const hoverLift = this.coinHovered && !this.anim.running ? -8 : 0
      return { ...base, transform: `translate3d(-50%, ${-y + hoverLift}px, 0) rotateX(${rx}deg)` }
    },
    coinFaceFrontStyle() { return{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', backfaceVisibility: 'hidden', transform: 'translateZ(1.4px) rotateX(0deg)' } },
    coinFaceBackStyle() { return{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', backfaceVisibility: 'hidden', transform: 'translateZ(-1.4px) rotateX(180deg)' } },
    coinShadowStyle() { const base = { position: 'absolute', left: '50%', bottom: '0', width: '170px', height: '34px', transform: 'translateX(-50%)', borderRadius: '50%', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0) 70%)', filter: 'blur(2px)', zIndex: 1, transition: 'opacity 120ms ease, transform 120ms ease' }
      const y = this.anim.y
      const t = Math.max(0, Math.min(1, 1 - y / 280))
      const scaleX = 0.85 + 0.35 * t
      const opacity = 0.25 + 0.4 * t
      return { ...base, opacity, transform: `translateX(-50%) scaleX(${scaleX })` }
    },
    titleStyle() { return{ fontWeight: 900, fontSize: '40px', letterSpacing: '0.6px', color: '#6a625f', marginTop: '4px', marginBottom: '28px' } },
    stakeControlsStyle() { return{ display: 'flex', alignItems: 'center', gap: '28px', marginTop: '8px' } },
    roundBtnStyle() { return{ background: 'transparent', border: 'none', padding: '8px', display: 'grid', placeItems: 'center', cursor: 'pointer' } },
    minusIconStyle() { return{ width: '36px', height: '36px', objectFit: 'contain', opacity: this.isAtMin ? 0.5: 1 } },
    plusIconStyle() { return{ width: '36px', height: '36px', objectFit: 'contain', opacity: this.isAtMax ? 0.5: 1 } },
    amountWrapStyle() { return{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '100px' } },
    amountStyle() { return{ fontSize: '28px', fontWeight: 800, minWidth: '56px', textAlign: 'center' } },
    betLabelStyle() { return{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.8px', color: '#777', textAlign: 'center' } },
    isAtMin() { return this.amount <= this.minBet },
    isAtMax() { return this.amount >= clampBet(this.maxBet) }
  },
 methods: {
   emitClose() {
     this.$emit('close');
   },
   decBet() {
     if (this.amount > this.minBet) this.amount -= 50
   },
   incBet() {
     const cap = clampBet(this.maxBet)
     if (this.amount < cap) this.amount += 50
   },
  flipCoin() {
    if (this.anim.running) return
    
    const headsWins = Math.random() < 0.5
    this.result = headsWins ? 'heads' : 'tails'
    this.anim.settleTarget = headsWins ? 0 : 180
    
    const rand = (a, b) => a + Math.random() * (b - a)
    
    this.anim.running = true
    this.anim.y = 0
    this.anim.vy = rand(1050, 1300)
    this.anim.rotX = 0
    this.anim.rotZ = 0
    this.anim.wX = rand(1500, 2400)
    this.anim.wZ = 0
    this.anim.bounceCount = 0
    this.anim.settle = false
    this.anim.settleHold = 0
    this.coinHovered = false
    
    this.runLoop()
  },
  runLoop() {
    const g = 2600
    const restitution = 0.28
    const maxDt = 0.032
    let prev = performance.now()
    
    const step = (now) => {
      if (!this.anim.running) return
      
      let dt = (now - prev) / 1000
      prev = now
      if (dt > maxDt) dt = maxDt
      
      this.anim.vy -= g * dt
      this.anim.y += this.anim.vy * dt
      
      if (this.anim.y <= 0) {
        this.anim.y = 0
        if (this.anim.vy < 0) {
          this.anim.vy = -this.anim.vy * restitution
          this.anim.bounceCount += 1
          this.anim.wX *= 0.88
          this.anim.wZ *= 0.85
        }
      }
      
      this.anim.rotX += this.anim.wX * dt
      this.anim.rotZ += 0
      
      const nearGround = this.anim.y === 0 && Math.abs(this.anim.vy) < 40
      const lowSpin = Math.abs(this.anim.wX) < 220
      if (!this.anim.settle && (this.anim.bounceCount >= 2 || (nearGround && lowSpin))) {
        this.anim.settle = true
        this.anim.wX *= 0.5
        this.anim.wZ = 0
      }
      
      if (this.anim.settle) {
        const rx = ((this.anim.rotX % 360) + 360) % 360
        let d = this.anim.settleTarget - rx
        if (d > 180) d -= 360
        if (d < -180) d += 360
        
        const maxStep = 420 * dt
        const stepDeg = Math.max(-maxStep, Math.min(maxStep, d))
        this.anim.rotX += stepDeg
        
        if (Math.abs(d) < 1.2 && nearGround) {
          this.anim.settleHold += dt * 1000
          if (this.anim.settleHold > 140) {
            this.finishFlip()
            return
          }
        } else {
          this.anim.settleHold = 0
        }
        
        this.anim.wX *= 0.96
        this.anim.wZ = 0
      }
      
      this.rafId = requestAnimationFrame(step)
    }
    
    this.rafId = requestAnimationFrame(step)
  },
  finishFlip() {
    this.anim.rotX = this.anim.settleTarget
    this.anim.wX = 0
    this.anim.wZ = 0
    this.anim.vy = 0
    this.anim.y = 0
    this.anim.running = false
    
    const winAmount = this.amount * 2
    const msg = this.result === 'heads' 
      ? `It's HEADS — you win ${winAmount} credits!`
      : `It's TAILS — you lose ${this.amount} credits.`
    
    alert(msg)
    
    try {
      const { trackTestMyLuckPlay } = require('@/services/karmaTracker.js');
      // Track karma points for playing test my luck
      trackTestMyLuckPlay(this.amount);
    } catch (error) {
      console.debug('Failed to track karma for coin flip', error);
    }
    
    const cur = getCredits()
    const next = this.result === 'heads' ? cur + winAmount : Math.max(0, cur - this.amount)
    setCredits(next)
    this.credits = next
    
    this.result = null
    this.anim.rotX = 0
    this.anim.rotZ = 0
    this.anim.y = 0
  }
  }
}
</script>
