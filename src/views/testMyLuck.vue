<template>
  <div :style="pageStyle">
    <button :style="closeStyle" aria-label="Close" @click="emitClose">×</button>

    <div :style="contentStyle">
      <div :style="titleStyle">Choose wisely !</div>
      <div :style="cardStyle">
        <button :style="linkStyle" class="tml-link" @click="onChoose('color')">
          <span class="tml-text">Color prediction</span>
          <span class="tml-underline"></span>
        </button>
        <button :style="linkStyle" class="tml-link" @click="onChoose('coin')">
          <span class="tml-text">Coin Flip</span>
          <span class="tml-underline"></span>
        </button>
        <button :style="linkStyle" class="tml-link" @click="onChoose('random')">
          <span class="tml-text">Random prize</span>
          <span class="tml-underline"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestMyLuck',
  emits: ['close'],
  data() {
    return {
      avatarIndex: 1,
      uiOff: false
    }
  },
  mounted() {
    try {
      const ui = localStorage.getItem('kt_ui_off');
      this.uiOff = ui === '1';
      const raw = localStorage.getItem('kt_user');
      if (raw) {
        const u = JSON.parse(raw);
        if (u && u.avatarIndex) {
          this.avatarIndex = Number(u.avatarIndex) || 1;
        }
      }
    } catch (e) {
      console.debug('TML init: failed to read kt_user', e);
    }
  },
  computed: {
    ringColor() { switch (this.avatarIndex || 1) { case 2: return '#FFEE56'; case 3: return '#FF7A56'; case 4: return '#FF94FB'; case 5: return '#7E3F8D'; case 6: return '#994BFF'; case 7: return '#6FFF56'; default: return '#56C4FF'; } },
    cardBorderColor() { return this.uiOff ? this.ringColor: '#000' },
    pageStyle() { return{ width: '100vw', height: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '0', boxSizing: 'border-box', overflow: 'hidden', fontFamily: "'MedievalSharp', system-ui, sans-serif", color: '#4A4441', position: 'relative', border: '4px solid #FFD400' } },
    closeStyle() { return{ position: 'fixed', top: '16px', right: '16px', width: '44px', height: '44px', borderRadius: '50%', border: '3px solid #111', background: '#fff', color: '#111', fontSize: '28px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } },
    contentStyle() { return{ width: 'min(92vw, 460px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' } },
    titleStyle() { return{ fontSize: '3rem', fontWeight: 800, fontFamily: "Inter, sans-serif", color: '#6a625f', textShadow: '0 4px 8px rgba(0,0,0,0.25)', marginTop: '6px', marginBottom: '16px' } },
    cardStyle() { return{ width: '100%', height: '50vh', border: `4px solid ${ this.cardBorderColor }`, borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '36px', padding: '24px', boxShadow: '0 6px 14px rgba(0,0,0,0.08)' } },
    linkStyle() { return{ width: '100%', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: '#5a524f', fontSize: '2.2rem', fontWeight: 600, letterSpacing: '0.5px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' } }
  },
  methods: { 
    emitClose() {
      this.$emit('close');
    },
    onChoose(kind) {
      if (!this.$router) return;
      if (kind === 'color') {
        this.$router.push('/games/color');
      } else if (kind === 'coin') {
        this.$router.push('/games/coin');
      } else if (kind === 'random') {
        this.$router.push('/games/random');
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap');

/* Menu-like underline from center + subtle hover emphasis */
.tml-link { position: relative; transition: color 0.2s ease, text-shadow 0.2s ease; cursor: pointer; }
.tml-text { line-height: 1.2; display: inline-block; }
.tml-underline { content: ''; position: relative; display: block; width: 86%; height: 4px; margin-top: 8px; background: #111; opacity: 0; transform-origin: center; transform: scaleX(0); will-change: transform; transition: transform 300ms ease, opacity 300ms ease; }
.tml-link:hover .tml-text { font-weight: 800; text-shadow: 0 1px 0 rgba(0,0,0,0.25); }
.tml-link:hover .tml-underline { opacity: 1; transform: scaleX(1); box-shadow: 0 2px 0 rgba(0,0,0,0.25); }
.tml-link:focus-visible .tml-underline { opacity: 1; transform: scaleX(1); }
</style>
