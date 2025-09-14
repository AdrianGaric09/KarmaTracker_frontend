<template>
  <div :style="welcomeBgStyle">
    <div :style="welcomeFlexStyle">
      <div :style="welcomeTextWrapStyle">
        <span :style="welcomeTitleStyle">WELCOME</span>
  <span :style="welcomeUserStyle">{{ displayedUsername }}</span>
      </div>
      <div :style="questionOrbitStyle">
        <div :style="questionStyle">DO YOU<br>BELIEVE IN<br>KARMA?</div>
      </div>
      <div :style="buttonRowStyle">
        <button
          :style="[buttonBaseStyle, yesButtonStyle]"
          @mouseover="hovered = 'yes'"
          @mouseleave="hovered = ''"
          @click="goToYes"
        >YES</button>
        <button
          :style="[buttonBaseStyle, noButtonStyle]"
          @mouseover="hovered = 'no'"
          @mouseleave="hovered = ''"
          @click="goToNo"
        >NO</button>
      </div>
      <button
        :style="exitButtonStyle"
        @mouseover="exitHover = true"
        @mouseleave="exitHover = false"
      >Exit</button>
    </div>
    <img :src="bgSrc" alt="background" :style="backgroundImgStyle" />
  </div>
</template>

<script>
export default {
  name: 'WelcomeUser',
  data(){ return{ username: '', email: '', isAdmin: false, hovered: '', exitHover: false, bgSrc: require('@/assets/welcome_user.jpg'), orbitAngle: 0, orbitActive: false, orbitRadius: 18 }; },
 mounted(){ try { const raw = localStorage.getItem('kt_user'); if (raw) { const user = JSON.parse(raw); if (user && user.username) this.username = user.username; if (user && user.email) this.email = user.email; if (user && user.isAdmin) this.isAdmin = user.isAdmin; } } catch(e) { console.debug('No stored user available', e); } setTimeout(() => { this.orbitActive = true; this.animateOrbit(); }, 1000); },
  methods: { 
    animateOrbit(){ if (!this.orbitActive) return; this.orbitAngle += 0.3; if (this.orbitAngle > 360) this.orbitAngle -= 360; requestAnimationFrame(this.animateOrbit); },
    goToYes(){ this.$router.push('/yes'); },
    goToNo(){ this.$router.push('/no'); }
  },
 computed: { 
   displayedUsername(){ if (this.isAdmin) return 'admin'; if (this.username) return this.username; if (this.email && this.email.includes('@')) return this.email.split('@')[0]; return ''; },
   welcomeBgStyle(){ return{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', minHeight: '100vh', overflow: 'hidden', fontFamily: "'MedievalSharp', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222', zIndex: 10 }; },
   backgroundImgStyle(){ return{ position: 'absolute', inset: 1, width: '90vw', height: '100vh', objectFit: 'cover', zIndex: 0, pointerEvents: 'none', userSelect: 'none' }; },
   welcomeFlexStyle(){ return{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100vh', position: 'relative', zIndex: 1 }; },
   welcomeTextWrapStyle(){ return{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '5rem' }; },
   welcomeTitleStyle(){ return{ fontFamily: "'MedievalSharp', system-ui, sans-serif", fontSize: '50px', color: '#fff', WebkitTextStroke: '2px #FFD400', filter: 'drop-shadow(0 10px 10px #000)', fontWeight: 700, letterSpacing: '2px', textShadow: '0 0 10px #FFD400, 0 0 2px #000, 0 0 2px #FFD400, 2px 2px 0 #0000006e' }; },
   welcomeUserStyle(){ return{ fontFamily: "'MedievalSharp', system-ui, sans-serif", fontSize: '40px', color: '#fff', WebkitTextStroke: '1px #FFD400', filter: 'drop-shadow(0 10px 10px #000)', fontWeight: 600, letterSpacing: '3px', textShadow: '0 0 10px #FFD400, 0 0 2px #000, 0 0 2px #FFD400, 2px 2px 0 #0000006e' }; },
   questionOrbitStyle(){ const angleRad = (this.orbitAngle * Math.PI) / 180; const x = Math.cos(angleRad) * this.orbitRadius; const y = Math.sin(angleRad) * this.orbitRadius; return { display: 'flex', justifyContent: 'center', alignItems: 'center', transform: `translate(${x}px, ${y}px)`, transition: 'transform 0.1s linear' }; },
   questionStyle(){ return{ color: '#fff', fontFamily: "'MedievalSharp', system-ui, sans-serif", fontSize: '75px', textAlign: 'center', marginBottom: '5rem', WebkitTextStroke: '1px #fff', filter: 'drop-shadow(0 5px 5px #000)', fontWeight: 700, letterSpacing: '3px' }; },
   buttonRowStyle(){ return{ display: 'flex', flexDirection: 'row', gap: '2.5rem', marginBottom: '5rem' }; },
   buttonBaseStyle(){ return{ fontFamily: "'MedievalSharp', system-ui, sans-serif", fontSize: '3rem', color: '#fff', background: 'transparent', border: '3px solid #fff', borderRadius: '20px', padding: '0.5rem 2.5rem', boxShadow: '0 0 6px #fff', cursor: 'pointer', transition: 'all 0.8s', textShadow: '0 0 10px #fff, 0 0 2px #FFD400', outline: 'none' }; },
   yesButtonStyle(){ return this.hovered === 'yes' ? { background: 'rgba(255,212,0,0.5)', boxShadow: '5px 5px 0 0 #fff' } : {}; },
   noButtonStyle(){ return this.hovered === 'no' ? { background: 'rgba(255,0,0,0.5)', boxShadow: '5px 5px 0 0 #fff' } : {}; },
   exitButtonStyle(){ return{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', background: 'transparent', color: '#fff', border: 'none', fontSize: '1.2rem', textDecoration: 'underline', cursor: 'none', opacity: this.exitHover ? 0: 0.8, transition: 'opacity 0.2s', filter: 'drop-shadow(0 5px 5px #000)', fontFamily: "'MedievalSharp', system-ui, sans-serif" }; }
 } }
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap');
</style>