<template>
  <div :style="pageStyle">
    <button :style="closeStyle" aria-label="Close" @click="emitClose">×</button>

    <div :style="contentStyle">
      <div v-if="titleText" :style="titleTop">{{ titleText }}</div>

      <div :style="giftContainerStyle" @click="onTapGift">
        
        <img :src="giftClosedSrc" :style="giftClosedStyle" alt="Gift" />
        
        <img :src="giftOpenSrc" :style="giftOpenStyle" alt="Open Gift" />

        
    <div v-if="showPrizeChip" :style="prizeChipStyle">{{ currentPrizeText }}</div>
      </div>

  <div v-if="subtitleText" :style="subtitle"> {{ subtitleText }}</div>
    </div>
  </div>
</template>

<script>
import { getCredits, setCredits } from '@/services/credits'
export default {
  name: 'RandomPrize',
  emits: ['close'],
  data(){ return{ giftClosedSrc: require('@/assets/gift-box.png'), giftOpenSrc: require('@/assets/open-box.png'), tapCount: 0, shaking: false, isOpening: false, isOpen: false, overlayVisible: false, prizePool: [], showPrizeChip: false, prizePhase: 'idle', prizeY: 0, prizeScale: 1, shuffleIndex: 0, shuffleTimeoutId: 0, selectedPrize: null, credits: getCredits() } },
 computed: { pageStyle(){ return{ width: '100vw', height: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', fontFamily: "'Inter', system-ui, sans-serif", color: '#4A4441', border: '4px solid #FFD400', boxSizing: 'border-box' } },
 closeStyle() { return{ position: 'fixed', top: '16px', right: '16px', width: '44px', height: '44px', borderRadius: '50%', border: '3px solid #111', background: '#fff', color: '#111', fontSize: '28px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } },
 contentStyle() { return{ width: 'min(92vw, 480px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '50px', textAlign: 'center' } },
 titleTop() { return{ fontWeight: 800, fontSize: '34px', letterSpacing: '0.6px', color: '#4a4441' } },
 giftContainerStyle() { return{ position: 'relative', width: '280px', height: '280px', display: 'grid', placeItems: 'center', cursor: this.isOpen ? 'default': 'pointer', zIndex: 3101 } },
 giftClosedStyle() { const base = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', transition: 'opacity 300ms ease, transform 300ms ease', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.22))' }
   const opacity = this.isOpen || this.isOpening ? 0 : 1
    const anim = this.shaking && !this.isOpening ? 'shakeBox 420ms ease' : 'none'
    return { ...base, opacity, animation: anim }
  },
 giftOpenStyle() { const base = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', transition: 'opacity 360ms ease, transform 360ms ease', transform: this.isOpening ? 'translateY(8px) scale(0.98)': 'none' }
   const opacity = this.isOpen || this.isOpening ? 1 : 0
    return { ...base, opacity }
  },
 subtitle() { return{ color: '#6b6b6b', fontStyle: 'italic', fontSize: '18px' } },
 prizeChipStyle() { const txt = (this.currentPrizeText || '').toString(); const lower = txt.toLowerCase(); const good = lower.includes('+1000') || lower.includes('crown') || lower.includes('no karma'); const bad = lower.includes('-1000') || lower.includes('instant karma'); const base = { position: 'absolute', left: '50%', top: '50%', background: (good || bad) ? '#ffffff': 'linear-gradient(135deg, #ffffff, #f3f3f3)', color: good ? '#0bd400': (bad ? '#ff2a2a': '#111'), borderRadius: '16px', padding: '12px 18px', fontWeight: 900, fontSize: '26px', boxShadow: '0 10px 22px rgba(0,0,0,0.26)', border: good ? '2px solid #f0c342': (bad ? '2px solid #9a9a9a': '1px solid #e6e6e6'), transition: 'opacity 220ms ease' };
 const visible = this.prizePhase !== 'idle';
  return { ...base, transform: `translate(-50%, calc(-50% - ${this.prizeY}px)) scale(1)`, opacity: visible ? 1 : 0 };
  },
  titleText() { if (this.isOpen || this.isOpening) return ''; if (this.tapCount >= 5) return 'Keep tapping...'; if (this.tapCount >= 3) return 'More...'; if (this.tapCount >= 1) return 'Tap it more'; return 'Go on, tap it. You know you want to.'; },
 subtitleText() { if (this.isOpen || this.isOpening) return ''; return "You're on the right path."; },
 currentPrizeText() { if (this.prizePhase === 'done' && this.selectedPrize) return this.selectedPrize.text; if (!this.prizePool.length) return ''; const idx = ((this.shuffleIndex % this.prizePool.length) + this.prizePool.length) % this.prizePool.length; return this.prizePool[idx].text; }
  },
 created() { const lucky = [ { text: '+50', value: 50, special: false },
      {text: '+100', value: 100, special: false }, { text: '+200', value: 200, special: false },
      {text: '-100', value: -100, special: false }, { text: '+1000', value: 1000, special: true },
      {text: '-50', value: -50, special: false }, { text: '+100', value: 100, special: false },
      {text: '+50', value: 50, special: false }, { text: '+200', value: 200, special: false },
      {text: '-50', value: -50, special: false }, { text: '+200', value: 200, special: false },
      {text: '+100', value: 100, special: false }, { text: 'NO KARMA', value: 'no-karma', special: true },
      {text: '-100', value: -100, special: false }, { text: '+50', value: 50, special: false },
      {text: '-50', value: -50, special: false }, { text: 'CROWN', value: 'crown', special: true },
      {text: '-100', value: -100, special: false }
    ]
    const unlucky = [ { text: '-50', value: -50, special: false },
      {text: '-100', value: -100, special: false }, { text: '-200', value: -200, special: false },
      {text: '+100', value: 100, special: false }, { text: '-1000', value: -1000, special: true },
      {text: '+50', value: 50, special: false }, { text: '-100', value: -100, special: false },
      {text: '-50', value: -50, special: false }, { text: '-200', value: -200, special: false },
      {text: '+50', value: 50, special: false }, { text: '-200', value: -200, special: false },
      {text: '-100', value: -100, special: false }, { text: '+100', value: 100, special: false },
      {text: '-50', value: -50, special: false }, { text: '+50', value: 50, special: false },
      {text: 'INSTANT KARMA', value: 'instant-karma', special: true }, { text: '+100', value: 100, special: false }
    ]
   this.prizePool = [...lucky, ...unlucky]
  },
  methods: { emitClose() { if (!this.isOpening && !this.isOpen) { this.$emit('close'); } },
   onTapGift() { if (this.isOpening || this.isOpen) return; this.tapCount += 1; this.shaking = true; setTimeout(() => { this.shaking = false; },420);

      if (this.tapCount >= 7) { this.startOpening(); }
    },
   startOpening() { if (this.isOpening || this.isOpen) return; this.isOpening = true; setTimeout(() => { this.isOpen = true; this.isOpening = false; this.launchPrize(); },420);
    },
    launchPrize() { this.showPrizeChip = true; this.prizePhase = 'shoot'; this.prizeY = 0; let vy = 1100; const g = 2800; const maxDt = 0.032; let prev = performance.now(); const loop = (now) => { if (this.prizePhase !== 'shoot') return; let dt = (now - prev) / 1000; prev = now; if (dt > maxDt) dt = maxDt; vy -= g * dt; this.prizeY += vy * dt; if (vy <= 0) { this.prizePhase = 'shuffle'; this.beginShuffle(); return; }
       requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    },
    beginShuffle() { const total = this.prizePool.length; if (!total) return this.finishPrize(); const cycles = 28 + Math.floor(Math.random() * 16); const finalIndex = Math.floor(Math.random() * total); let step = 0; const tick = () => { if (step >= cycles) { this.shuffleIndex = finalIndex; this.selectedPrize = this.prizePool[finalIndex]; this.prizePhase = 'done'; setTimeout(() => this.finishPrize(), 260); return; }
        
       this.shuffleIndex = (this.shuffleIndex + 1) % total;
        step++;
        const remain = cycles - step;
        const delay = remain > 10 ? 60 : 120 + Math.max(0, (10 - remain)) * 40;
        this.shuffleTimeoutId = setTimeout(tick, delay);
      };
      tick();
    },
    finishPrize() { const text = this.selectedPrize?.text || 'Unknown'; const val = this.selectedPrize?.value; const suffix = typeof val === 'number' ? ' credits': ''; alert(`You got: ${text}${suffix}`);
    
    try {
      const { trackTestMyLuckPlay } = require('@/services/karmaTracker.js');
      // Track karma points for playing free test my luck game (50 points since no bet)
      trackTestMyLuckPlay(50);
    } catch (error) {
      console.debug('Failed to track karma for random prize', error);
    }
    
    if (typeof val === 'number') { const cur = getCredits(); const next = Math.max(0, cur + val); setCredits(next); this.credits = next; }
     this.reset();
    },
    reset() { if (this.shuffleTimeoutId) clearTimeout(this.shuffleTimeoutId); this.tapCount = 0; this.shaking = false; this.isOpening = false; this.isOpen = false; this.overlayVisible = false; this.showPrizeChip = false; this.prizePhase = 'idle'; this.prizeY = 0; this.prizeScale = 1; this.shuffleIndex = 0; this.selectedPrize = null; }
  }
}
</script>

<style>
@keyframes shakeBox {
  0% { transform: translateX(0) rotate(0deg); }
 20% { transform: translateX(-6px) rotate(-2deg); }
 40% { transform: translateX(6px) rotate(2deg); }
 60% { transform: translateX(-4px) rotate(-1.5deg); }
 80% { transform: translateX(4px) rotate(1.5deg); }
 100% { transform: translateX(0) rotate(0deg); }
}
</style>
