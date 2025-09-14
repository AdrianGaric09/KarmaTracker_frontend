<template>
  <div :style="pageStyle">
    <div :style="frameStyle">
      <button :style="closeStyle" aria-label="Close" @click="emitClose">×</button>
      <div :style="headerRowStyle">
        <div :style="titleStyle">MY ITEMS</div>
      </div>

      <div :style="cardStyle">
        <div :style="rowsWrapStyle">
          <div :style="rowStyle()">
            <div v-for="it in rows[0]" :key="'r1-'+it.key" :style="itemWrapStyle()" @mouseenter="onEnter(it)" @mouseleave="onLeave">
              <img :src="it.src" :alt="it.display" :style="itemImgStyle(it)" />
              <div v-if="unlocked.has(it.key) && hoverKey === it.key" :style="itemLabelStyle(it)">{{ itemHoverLabel(it) }}</div>
              <div v-else-if="hoverKey === it.key && canBuy(it) && credits >= 500" :style="lockedHoverWrapStyle()">
                <div :style="lockedPriceStyle()">500C</div>
                <button :style="buyBtnStyle(it)" @click="buy(it)">BUY</button>
              </div>
              <div v-if="confettiKey === it.key" :style="confettiWrapStyle()">
                <span v-for="(st,i) in confettiPieces(it)" :key="i" class="confetti-piece" :style="st"></span>
              </div>
            </div>
          </div>
          <div :style="rowStyle()">
            <div v-for="it in rows[1]" :key="'r2-'+it.key" :style="itemWrapStyle()" @mouseenter="onEnter(it)" @mouseleave="onLeave">
              <img :src="it.src" :alt="it.display" :style="itemImgStyle(it)" />
              <div v-if="unlocked.has(it.key) && hoverKey === it.key" :style="itemLabelStyle(it)">{{ itemHoverLabel(it) }}</div>
              <div v-else-if="hoverKey === it.key && canBuy(it) && credits >= 500" :style="lockedHoverWrapStyle()">
                <div :style="lockedPriceStyle()">500C</div>
                <button :style="buyBtnStyle(it)" @click="buy(it)">BUY</button>
              </div>
              <div v-if="confettiKey === it.key" :style="confettiWrapStyle()">
                <span v-for="(st,i) in confettiPieces(it)" :key="i" class="confetti-piece" :style="st"></span>
              </div>
            </div>
          </div>
          <div :style="rowStyle()">
            <div v-for="it in rows[2]" :key="'r3-'+it.key" :style="itemWrapStyle()" @mouseenter="onEnter(it)" @mouseleave="onLeave">
              <img :src="it.src" :alt="it.display" :style="itemImgStyle(it)" />
              <div v-if="unlocked.has(it.key) && hoverKey === it.key" :style="itemLabelStyle(it)">{{ itemHoverLabel(it) }}</div>
              <div v-else-if="hoverKey === it.key && canBuy(it) && credits >= 500" :style="lockedHoverWrapStyle()">
                <div :style="lockedPriceStyle()">500C</div>
                <button :style="buyBtnStyle(it)" @click="buy(it)">BUY</button>
              </div>
              <div v-if="confettiKey === it.key" :style="confettiWrapStyle()">
                <span v-for="(st,i) in confettiPieces(it)" :key="i" class="confetti-piece" :style="st"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div :style="taglineStyle">
        These items don’t mean<br>
        what you think they do.<br>
        Or maybe they do.<br>
        Who knows?
      </div>
    </div>
  </div>
</template>

<script>
import { getCredits, addCredits } from '@/services/credits.js'
export default {
  name: 'MyItems',
  emits: ['close'],
  data(){ return{ items: [{ key: 'honesty', display: 'Honesty', color: '#3498DB', src: require('@/assets/honesty.png') },
  { key: 'bandit', display: 'Bandit', color: '#F1C40F', src: require('@/assets/bandit.png') },
        { key: 'guitarist', display: 'Guitarist', color: '#1ABC9C', src: require('@/assets/guitarist.png') },
  { key: 'gourmet', display: 'Gourmet', color: '#A84343', src: require('@/assets/gourmet.png') },
  { key: 'hero', display: 'Hero', color: '#E74C3C', src: require('@/assets/hero.png') },
  { key: 'blood-donation', display: 'Donation', color: '#BDC3C7', src: require('@/assets/blood-donation.png') },
        { key: 'gone', display: 'Gone', color: '#7F8C8D', src: require('@/assets/gone.png') },
  { key: 'sheep', display: 'Sheep', color: '#9B59B6', src: require('@/assets/sheep.png') },
        { key: 'disappear', display: 'Disappear', color: '#34495E', src: require('@/assets/disappear.png') },
        { key: 'alone', display: 'Alone', color: '#F39C12', src: require('@/assets/alone.png') },
      ]
    ,
  unlocked: new Set(),
  credits: 0,
  confettiKey: null,
  scenariosCompleted: 0,
      hoverKey: null
    }
  },
  mounted() {
    
    try {
      const userData = localStorage.getItem('kt_user');
      let unlocked = new Set();
      let scenariosCompleted = 0;
      
      if (userData) {
        const user = JSON.parse(userData);
        if (user && user.email) {
          const safeEmail = user.email.toLowerCase().replace(/[^a-z0-9@._-]/g, '');
          
          
          const userItemsKey = `kt_unlocked_items_${safeEmail}`;
         const userItemsRaw = localStorage.getItem(userItemsKey);
          if (userItemsRaw) { const arr = JSON.parse(userItemsRaw); if (Array.isArray(arr)) unlocked = new Set(arr); }
          
          
         const userScenariosKey = `kt_scenarios_completed_$ { safeEmail }`;
         const userScenariosRaw = localStorage.getItem(userScenariosKey);
          scenariosCompleted = parseInt(userScenariosRaw || '0', 10) || 0;
        }
      }
      
      
      if (unlocked.size === 0) { const raw = localStorage.getItem('kt_unlocked_items'); if (raw) { const arr = JSON.parse(raw); if (Array.isArray(arr)) unlocked = new Set(arr); }
      }
      
     if (scenariosCompleted === 0) { const doneRaw = localStorage.getItem('kt_scenarios_completed'); scenariosCompleted = parseInt(doneRaw || '0', 10) || 0; }
      
     this.unlocked = unlocked;
      this.scenariosCompleted = scenariosCompleted;
      this.credits = getCredits();
    } catch (e) { /* no-op */ }
  },
  computed: {
    frameStyle() { return{ width: '100%', height: '100%', border: '4px solid #FFD400', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '20px 24px', } },
    pageStyle() { return{ width: '100vw', height: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 0, boxSizing: 'border-box', fontFamily: "Inter, 'MedievalSharp', system-ui, sans-serif", color: '#1d1d1f', position: 'relative', } },
    headerRowStyle() { return{ width: 'min(92vw, 520px)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '4px', marginBottom: '12px' } },
    titleStyle() { return{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '1px', color: '#4A4441', textShadow: '0 4px 8px rgba(0,0,0,0.15)', marginBottom: '20px' } },
    closeStyle() { return{ position: 'fixed', top: '16px', right: '16px', width: '44px', height: '44px', borderRadius: '50%', border: '3px solid #111', background: '#fff', color: '#111', fontSize: '28px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } },
    cardStyle() { return{ width: 'min(92vw, 360px)', height: 'min(60vh, 420px)', background: '#fff', border: '3px solid #000', borderRadius: '18px', boxShadow: '0 12px 30px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px', } },
    rowsWrapStyle() { return{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly', gap: '0px' } },
    rows() { const list = this.items.slice(0, 10); return [ [list[0], list[1], list[2]], [list[3], list[4], list[5], list[6]], [list[7], list[8], list[9]], ]; },
    taglineStyle() { return{ marginTop: '50px', textAlign: 'center', color: '#4A4441', fontWeight: 700, fontSize: '1.3rem', lineHeight: 1.5, opacity: 0.5 } }
  },
  methods: {
    scenarioItemMap() {
      return {
        0: ['honesty','bandit'],
        1: ['guitarist','gourmet'],
        2: ['hero','alone'],
        3: ['gone','blood-donation'],
        4: ['disappear','sheep']
      }
    },
    
    canBuy(it) {
      const map = this.scenarioItemMap()
      for (let i = 0; i < this.scenariosCompleted; i++) {
        const pair = map[i]
        if (pair && pair.includes(it.key)) return !this.unlocked.has(it.key)
      }
      return false
    },
    itemHoverLabel(it) {
      return it.key === 'honesty' ? 'HONESTY' : (it.key === 'bandit' ? 'BANDIT' : it.display.toUpperCase())
    },
    rowStyle() {
      return{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', gap: '0px', width: '100%' }
    },
    itemWrapStyle() {
      const size = 65
      return { position: 'relative', width: size + 'px', height: (size + 40) + 'px', display: 'grid', placeItems: 'center' }
    },
    
    itemImgStyle(it) {
      const size = '60px'
      const isUnlocked = this.unlocked.has(it.key)
      const shadow = isUnlocked ? `drop-shadow(2px 5px 3px ${this.toRgba(it.color, 1)})` : 'none'
      const allowHoverScale = isUnlocked || this.canBuy(it)
      const scale = (this.hoverKey === it.key && allowHoverScale) ? 'scale(1.2)' : 'scale(1)'
      return {
        width: size,
        height: size,
        objectFit: 'contain',
        filter: `grayscale(100%) brightness(1.02) ${shadow}`,
        opacity: isUnlocked ? 1 : 0.5,
        transition: 'transform .2s ease',
        transform: scale,
        position: 'relative',
        zIndex: 1
      }
    },
    itemLabelStyle(it) {
      const color = it.color;
      return {
        position: 'absolute',
        bottom: '-10px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 900,
        fontSize: '13px',
        letterSpacing: '0.8px',
        color: '#4A4441',
        textShadow: `2px 3px 0 ${this.toRgba(color, 0.35)}`
      };
    },
    lockedHoverWrapStyle() {
      return {
        position: 'absolute',
        bottom: '-28px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        zIndex: 2
      };
    },
    lockedPriceStyle() {
      return {
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 900,
        fontSize: '13px',
        letterSpacing: '0.8px',
        color: this.credits >= 500 ? '#4A4441': '#999',
        textShadow: '0 2px 6px rgba(0,0,0,0.2)'
      };
    },
    buyBtnStyle(it) {
      const c = it.color || '#111';
      return {
        background: '#fff',
        color: '#222',
        border: `3px solid ${c}`,
        borderRadius: '15px',
        padding: '4px 12px',
        fontWeight: 900,
        fontSize: '10px',
        boxShadow: `6px 6px 0 ${this.toRgba(c, 0.5)}`,
        cursor: 'pointer'
      };
    },
    confettiWrapStyle() {
      return {
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      };
    },
    confettiPieces(it) {
      const pieces = 14;
      const styles = [];
      for (let i = 0; i < pieces; i++) {
        const dx = (Math.random() * 60 - 30).toFixed(1);
        const dy = (Math.random() * -40 - 40).toFixed(1);
        const size = Math.random() * 4 + 3;
        const rot = Math.floor(Math.random() * 360);
        const delay = (Math.random() * 0.08).toFixed(2);
        styles.push({
          width: `${size}px`,
          height: `${size}px`,
          left: `${50 + (Math.random() * 20 - 10)}%`,
          top: `${50 + (Math.random() * 10 - 5)}%`,
          background: this.toRgba(it.color, 0.9),
          '--dx': `${dx}px`,
          '--dy': `${dy}px`,
          transform: `translate(0,0) rotate(${rot}deg)`,
          animationDelay: `${delay}s`
        });
      }
      return styles;
    },
    toRgba(hex, alpha = 0.9) {
      const h = hex.replace('#','');
      const r = parseInt(h.slice(0,2), 16);
      const g = parseInt(h.slice(2,4), 16);
      const b = parseInt(h.slice(4,6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
    emitClose() {
      this.$emit('close');
    },
    onEnter(it) {
      this.hoverKey = it.key;
    },
    onLeave() {
      this.hoverKey = null;
    },
    buy(it) {
      const COST = 500;
      if (!this.canBuy(it)) return;
      const current = getCredits();
      if (current < COST) return;
      addCredits(-COST);
      this.credits = getCredits();
      try {
        const userData = localStorage.getItem('kt_user');
        if (userData) {
          const user = JSON.parse(userData);
          if (user && user.email) {
            const safeEmail = user.email.toLowerCase().replace(/[^a-z0-9@._-]/g, '');
            const userItemsKey = `kt_unlocked_items_${safeEmail}`;
            
            const raw = localStorage.getItem(userItemsKey);
            let arr = [];
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) arr = parsed;
            }
            if (!arr.includes(it.key)) {
              arr.push(it.key);
              localStorage.setItem(userItemsKey, JSON.stringify(arr));
            }
            
            const globalRaw = localStorage.getItem('kt_unlocked_items');
            let globalArr = [];
            if (globalRaw) {
              const globalParsed = JSON.parse(globalRaw);
              if (Array.isArray(globalParsed)) globalArr = globalParsed;
            }
            if (!globalArr.includes(it.key)) {
              globalArr.push(it.key);
              localStorage.setItem('kt_unlocked_items', JSON.stringify(globalArr));
            }
          }
        }
      } catch (_) {
        /* ignore */
      }
      const setCopy = new Set(this.unlocked);
      setCopy.add(it.key);
      this.unlocked = setCopy;
      
      this.confettiKey = it.key;
      setTimeout(() => {
        this.confettiKey = null;
      }, 800);
      this.hoverKey = null;
      
      // Track karma for item purchase
      try {
        const { trackItemPurchase } = require('@/services/karmaTracker.js');
        trackItemPurchase();
      } catch (karmaError) {
        console.debug('Failed to track karma for item purchase:', karmaError);
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800&display=swap');

.confetti-piece{
  position: absolute;
  border-radius: 1px;
  animation: confettiPop 700ms ease-out forwards;
}

@keyframes confettiPop { 0% { opacity: 1; transform: translate(0,0) scale(0.8) rotate(0deg); }
 70% { opacity: 1; }
 100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1) rotate(360deg); }
}
</style>
