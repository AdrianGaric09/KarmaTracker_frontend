<template>
  <div :style="pageStyle">
    <button :style="closeStyle" aria-label="Close" @click="emitClose">×</button>

    <div :style="containerStyle">
      <div :style="leftColStyle">
        
        <section :style="sectionStyle">
          <div :style="headingStyle">CREDITS:</div>
          <div :style="valueBoxStyle">
            <span :style="valueTextStyle">{{ credits }}</span>
          </div>
          <div :style="hintStyle">*HINT: Credits can be spent in test my luck menu feature*</div>
        </section>

        <section :style="sectionStyle">
          <div :style="hsTextStyle">Show credits on homescreen</div>
          <div :style="toggleWrapStyle" @click="onToggleClick">
            <img :src="toggleOnSrc" :style="[toggleImgStyle, { opacity: isCreditsOnHomescreen ? 0 : 1 }]" @load="onToggleLoaded" />
            <img :src="toggleOffSrc" :style="[toggleImgStyle, { opacity: isCreditsOnHomescreen ? 1: 0 }]" @load="onToggleLoaded" />
          </div>
        </section>

        <section :style="sectionStyle">
          <div :style="headingStyle">KARMA POINTS:</div>
          <div :style="valueBoxStyle">
            <span :style="valueTextStyle">{{ karmaPoints }}</span>
          </div>
          <div :style="hintStyle">*HINT: This number is an indicator of how well you are doing*</div>
        </section>
      </div>

      <div :style="rightColStyle">
        
        <section :style="sectionStyle">
          <div :style="headingStyle">KARMA LEVEL:</div>
          <div :style="levelRowStyle">
            <span v-for="n in 5" :key="n" :style="getLevelNumStyle(n)">{{ n }}</span>
          </div>
          <div :style="hintStyle">*You are doing great just keep going*</div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { getCredits } from '@/services/credits'

export default {
  name: 'MyPoints',
  emits: ['close'],
  data() {
  
  let credits = getCredits()
    let points = 0
    let creditsOnHomescreen = false
    
    try {
      const { getUserKarmaPoints } = require('@/services/userState.js');
      points = getUserKarmaPoints();
    } catch (e) {
      try {
        const raw = localStorage.getItem('kt_user')
        if (raw) {
          const u = JSON.parse(raw)
          if (typeof u?.karmaPoints === 'number') points = u.karmaPoints
        }
      } catch (e2) { /* ignore parse errors */ }
    }
    
    try {
      const { getUserCreditsHomescreenState } = require('@/services/userState.js');
      creditsOnHomescreen = getUserCreditsHomescreenState();
    } catch (e) {
      try {
        const creditsToggleRaw = localStorage.getItem('creditsOnHomescreen');
        if (creditsToggleRaw === 'true') creditsOnHomescreen = true;
        else if (creditsToggleRaw === 'false') creditsOnHomescreen = false;
      } catch (e2) { /* ignore parse errors */ }
    }
    
   return { 
     credits, 
     karmaPoints: points,
     isCreditsOnHomescreen: creditsOnHomescreen,
     toggleOnSrc: require('@/assets/turn_on.png'),
     toggleOffSrc: require('@/assets/turn_off.png'),
     toggleHeight: 0
   }
  },
 computed: { karmaLevel() { 
   const p = Number(this.karmaPoints) || 0; 
   if (p >= 1000) return 1; 
   if (p >= 800) return 2; 
   if (p >= 600) return 3; 
   if (p >= 300) return 4; 
   return 5; 
 },
   pageStyle() { return{ width: '100vw', height: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', fontFamily: "'Inter', system-ui, sans-serif", color: '#4A4441', border: '4px solid #FFD400', boxSizing: 'border-box', padding: '24px' } },
   closeStyle() { return{ position: 'fixed', top: '16px', right: '16px', width: '44px', height: '44px', borderRadius: '50%', border: '3px solid #111', background: '#fff', color: '#111', fontSize: '28px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 } },
   containerStyle() { return{ width: 'min(92vw, 980px)', minHeight: '86vh', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center', justifyItems: 'center' } },
   leftColStyle() { return{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '54px', width: '100%' } },
   rightColStyle() { return{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '54px', width: '100%' } },
   sectionStyle() { return{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center' } },
   headingStyle() { return{ fontWeight: 900, letterSpacing: '0.6px', color: '#6a625f', fontSize: 'clamp(22px, 3.2vw, 34px)' } },
   valueBoxStyle() { return{ display: 'grid', placeItems: 'center', width: 'clamp(140px, 18vw, 220px)', height: 'clamp(64px, 8vw, 86px)', border: '3px dashed #c9c9c9', borderRadius: '14px', padding: '6px 12px', boxSizing: 'border-box' } },
   valueTextStyle() { return{ fontWeight: 900, fontSize: 'clamp(24px, 4.4vw, 40px)', color: '#3a3330' } },
   hintStyle() { return{ color: '#6b6b6b', fontStyle: 'italic', fontSize: 'clamp(12px, 1.6vw, 16px)' } },
   levelRowStyle() { return{ display: 'flex', alignItems: 'center', gap: 'clamp(16px, 3.4vw, 38px)' } },
   hsTextStyle() { return { marginTop: '26px', marginBottom: '-28px', fontSize: '17px', fontStyle: 'italic', color: '#444' }; },
   toggleWrapStyle() { return { position: 'relative', width: '88px', height: this.toggleHeight ? this.toggleHeight + 'px': 'auto', marginTop: '28px' }; },
   toggleImgStyle() { return { position: 'absolute', left: 0, top: 0, width: '88px', height: 'auto', display: 'block', userSelect: 'none', transition: 'opacity 280ms ease' }; } },
  methods: {
    getLevelNumStyle(n) {
      const active = n === this.karmaLevel;
      return {
        fontWeight: active ? 900 : 700,
        color: active ? '#3a3330' : '#b3b3b3',
        fontSize: 'clamp(22px, 3.2vw, 34px)',
        borderBottom: active ? '4px solid #3a3330' : '2px solid #d9d9d9',
        paddingBottom: active ? '2px' : '0'
      };
    },
    
    onToggleClick(e) { 
      const rect = e.currentTarget.getBoundingClientRect(); 
      const x = e.clientX - rect.left; 
      const rightHalf = x >= rect.width / 2; 
      const leftHalf = x < rect.width / 2; 
      
      if (!this.isCreditsOnHomescreen && leftHalf) { 
        this.isCreditsOnHomescreen = true;
        try { 
          const { setUserCreditsHomescreenState } = require('@/services/userState.js');
          setUserCreditsHomescreenState(true);
        } catch (e) {
          localStorage.setItem('creditsOnHomescreen', 'true');
        }
      } else if (this.isCreditsOnHomescreen && rightHalf) { 
        this.isCreditsOnHomescreen = false;
        try { 
          const { setUserCreditsHomescreenState } = require('@/services/userState.js');
          setUserCreditsHomescreenState(false);
        } catch (e) {
          localStorage.setItem('creditsOnHomescreen', 'false');
        }
      }
      
      this.$emit('toggle-updated', this.isCreditsOnHomescreen);
    },
    
    onToggleLoaded(e) {
      if (!this.toggleHeight) {
        const h = Math.round(e.target.getBoundingClientRect().height);
        if (h > 0) this.toggleHeight = h;
      }
    },
    
    emitClose() {
      this.$emit('close');
    }
  }
}
</script>

