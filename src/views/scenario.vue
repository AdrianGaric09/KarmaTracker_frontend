<template>
  <div :style="pageStyle">
    <div :style="borderFrameStyle" aria-hidden="true"></div>
    <img
      :src="menuSrc"
      alt="Menu"
      :style="menuIconStyle"
      class="menu-icon"
      ref="menuBtn"
      @click="openMenu"
      @keydown.enter.prevent="openMenu"
      @keydown.space.prevent="openMenu"
      role="button"
      tabindex="0"
      aria-label="Open menu"
    />

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

    <div v-if="showSecondPopup" :style="popupOverlayStyle">
      <div :style="popupContainerStyle" class="popup-enter-active">
        <div :style="popupTextStyle">
          In case you missed it, the menu has a fun <br> 'Test My Luck' section.
        </div>
        <button 
          :style="okButtonStyle"
          @click="handleSecondOkClick"
          @mouseenter="okHovered = true"
          @mouseleave="okHovered = false" 
        > 
          OK!
        </button>
      </div>
    </div>
    <div :style="cardStyle">
      <div v-if="uiOff" :style="avatarEmbedWrapStyle" class="avatar-embed" @mouseenter="avatarHovered = true" @mouseleave="avatarHovered = false">
        <img :src="activeAvatarSrc" alt="Avatar" :style="avatarEmbedImgStyle" class="avatar-img" />
        <span class="avatar-gliss" aria-hidden="true"></span>
        <!-- Crown Hint (subtle) -->
        <div v-if="(crownStatus.isEligible && !crownStatus.hasPurchasedCrown && avatarHovered) || crownStatus.isWinner" :style="crownHintStyle" class="crown-hint">
          👑
        </div>
      </div>
      <div :style="scenarioTextStyle" v-html="scenarioTextHtml"></div>
      <div :style="dividerStyle" aria-hidden="true"></div>
      <div :style="optionSubtextStyle">{{ optionTopText }}</div>
      <div :style="orStyle">OR</div>
      <div :style="optionSubtextStyle">{{ optionBottomText }}</div>
      <div :style="buttonsRowStyle">
        <button :style="choiceBtnStyle" @click="onChoose('down')" aria-label="Choose down">
          <img :src="downSrc" alt="Down" :style="arrowIconStyle" />
        </button>
        <button :style="choiceBtnStyle" @click="onChoose('up')" aria-label="Choose up">
          <img :src="upSrc" alt="Up" :style="arrowIconStyle" />
        </button>
      </div>
      <div v-if="uiOff" :style="cardUsernameStyle">{{ displayedUsername }}</div>
      <div v-if="uiOff && shouldShowCreditsOnHomescreen" :style="cardCreditsStyle">{{ creditsUnderUsername }}</div>
      <div v-if="!uiOff && shouldShowCreditsOnHomescreen" :style="cardUsernameStyle">{{ credits }} Credits</div>
    </div>

    <div :style="logoContainerStyle">
      <img :src="logoSrc" :style="logoStyle" alt="Karma Tracker Logo" />
    </div>

    <MenuPopup
      v-if="menuOpen"
      :anchorLeft="menuAnchor.left"
      :anchorTop="menuAnchor.top"
      :anchorSize="menuAnchor.size"
      @close="menuOpen = false"
      @select="onMenuSelect"
    />

    
    <div v-if="itemPopupVisible" :style="itemOverlayStyle">
      <div :style="itemContainerStyle" class="popup-enter-active" @animationend="onPopupEnterEnd">
        <div :style="itemTitleStyle">
          <div>{{ itemTitleLines[0] }}</div>
          <div>{{ itemTitleLines[1] }}</div>
        </div>
        <div :style="itemImgWrapStyle">
          <img :src="itemImgSrc" :style="itemImgStyle" :class="itemAnimImgClass" alt="Unlocked item" />
          
          <template v-if="itemAnimReady && itemPopupKind === 'bandit'">
            <span class="lens-glow left"></span>
            <span class="lens-glow right"></span>
            <span class="shine-sweep" aria-hidden="true"></span>
          </template>
          
          <template v-if="itemAnimReady && itemPopupKind === 'hero'">
            <span class="wind w1"></span>
            <span class="wind w2"></span>
            <span class="wind w3"></span>
          </template>
          
          <template v-if="itemAnimReady && itemPopupKind === 'gourmet'">
            <span class="star t1">✦</span>
            <span class="star t2">✦</span>
            <span class="star t3">✦</span>
          </template>
          
          <template v-if="itemAnimReady && itemPopupKind === 'street'">
            <span class="note n1">♪</span>
            <span class="note n2">♫</span>
            <span class="note n3">♪</span>
          </template>
          
          <template v-if="itemAnimReady && itemPopupKind === 'alone'">
            <span class="gloom g1"></span>
            <span class="gloom g2"></span>
            <span class="gloom g3"></span>
          </template>
          
          <template v-if="itemAnimReady && itemPopupKind === 'savior'">
            <span class="heart">❤</span>
          </template>
          
          <template v-if="itemAnimReady && itemPopupKind === 'sacrifice'">
            <span class="knife-glint"></span>
          </template>
        </div>
        <button :style="niceBtnStyle" @click="onNiceClick">NICE</button>
        <div :style="itemNoteStyle">
          Sweet! You just unlocked an item.<br/>
          Go check it out in "My Items".
        </div>
      </div>
    </div>
  </div>
</template>

<script>

let __tmlInitiatedOnce = false
let __itemsInitiatedOnce = false
import MenuPopup from '@/components/Menu.vue';
import { addCredits, getCredits } from '@/services/credits.js'
export default {
  name: 'ScenarioPage',
  components: { MenuPopup },
 data() { return{ upSrc: require('@/assets/up-arrow.png'), downSrc: require('@/assets/down-arrow.png'), menuSrc: require('@/assets/menu.png'), logoSrc: require('@/assets/karma_tracker_logo.png'), showPopup: false, hasSeenPopup: false, showSecondPopup: false, hasSeenSecondPopup: false, okHovered: false, menuOpen: false, menuAnchor: { left: null, top: null },
  uiOff: false,
  avatarSrc: require('@/assets/avatar 1.png'),
  username: '',
  avatarIndex: 1,
  hasOpenedMenuOnce: false,
  itemPopupVisible: false,
  itemPopupKind: null,
  itemAnimReady: false,
  credits: 0,
  creditsOnHomescreen: false,
  avatarHovered: false,
  crownStatus: {
    isWinner: false,
    hasPurchasedCrown: false,
    isEligible: false,
    canPurchase: false
  },
  
  scenarioIndex: 0
    }
  },
  mounted() {
    try {
      
      const ui = localStorage.getItem('kt_ui_off')
      this.uiOff = ui === '1'
      const raw = localStorage.getItem('kt_user')
      if (raw) {
        const u = JSON.parse(raw)
        if (u && u.username) this.username = u.username
        if (u && u.avatarIndex) {
          this.avatarIndex = Number(u.avatarIndex) || 1
        }
      }
      
      this.credits = getCredits()
      
      try {
        const { getCrownStatus } = require('@/services/userState.js');
        this.crownStatus = getCrownStatus();
      } catch (e) {
        console.debug('Could not load crown status:', e);
        this.crownStatus = { isWinner: false, hasPurchasedCrown: false, isEligible: false, canPurchase: false };
      }
      
      try {
        const { getUserCreditsHomescreenState } = require('@/services/userState.js');
        this.creditsOnHomescreen = getUserCreditsHomescreenState();
      } catch (e) {
        // Fallback to localStorage
        const creditsToggle = localStorage.getItem('creditsOnHomescreen')
        this.creditsOnHomescreen = creditsToggle === 'true'
      }
      
      
      try {
        const userData = localStorage.getItem('kt_user');
        let completedScenarios = 0;
        if (userData) {
          const user = JSON.parse(userData);
          if (user && user.email) {
            const safeEmail = user.email.toLowerCase().replace(/[^a-z0-9@._-]/g, '');
            const userScenariosKey = `kt_scenarios_completed_${safeEmail}`;
            completedScenarios = parseInt(localStorage.getItem(userScenariosKey) || '0', 10);
          }
        }

        if (completedScenarios === 0) {
          completedScenarios = parseInt(localStorage.getItem('kt_scenarios_completed') || '0', 10);
        }

        this.scenarioIndex = Math.min(completedScenarios, 5);
        console.log(`Restored scenario progress: completed=${completedScenarios},current=${this.scenarioIndex}`);
      } catch (e) {
        console.debug('Could not restore scenario progress, starting from beginning', e);
        this.scenarioIndex = 0;
      }

      this.loadOnboardingState();
      
      try {
        const { getCrownStatus } = require('@/services/userState.js');
        this.crownStatus = getCrownStatus();
      } catch (e) {
        console.debug('Could not load crown status:', e);
        this.crownStatus = { isWinner: false, hasPurchasedCrown: false, isEligible: false, canPurchase: false };
      }
      
      window.addEventListener('crownStatusUpdate', this.updateCrownStatus);
    } catch (e) {
      console.debug('Scenario init state restore failed', e);
    }
    
    this.handleToggleUpdate = (event) => {
      this.creditsOnHomescreen = event.detail.creditsOnHomescreen;
    };
    window.addEventListener('creditsToggleUpdated', this.handleToggleUpdate);
    
    this.handleCreditUpdate = () => {
      this.credits = getCredits();
    };
    window.addEventListener('creditsUpdated', this.handleCreditUpdate);
  },
 computed: { scenarioTextHtml() { if (this.scenarioIndex === 1) { return `A street musician is playing beautifully,<br/>but their guitar case is empty. You have $100 in your pocket.` }
     if (this.scenarioIndex === 2) { return `After a disaster, you can save either your pet or two strangers trapped under rubble.<br/>Save your pet or save the strangers.` }
     if (this.scenarioIndex === 3) { return `You’re the only one immune to a zombie virus. Scientists can use your blood to create a cure, but the process will kill you.<br/>Sacrifice yourself to save humanity, or refuse and survive the apocalypse alone.` }
     if (this.scenarioIndex === 4) { return `A hostage-taker offers to release everyone if you take their place.<br/>Take their place and let the others go, or refuse and let the situation play out.` }
     if (this.scenarioIndex === 5) { return `🎉 Congratulations! 🎉<br/>You've completed all scenarios and collected valuable items too.<br/>What would you like to do next?` }
      
     return `You find a wallet on the street with $500 in cash and an ID.<br/>The owner is nowhere in sight.`
    },
    optionTopText() { if (this.scenarioIndex === 1) return 'Keep the money and treat yourself to a fancy dinner.'; if (this.scenarioIndex === 2) return 'Save your pet.'; if (this.scenarioIndex === 3) return 'Sacrifice yourself to save humanity.'; if (this.scenarioIndex === 4) return 'Take their place and let the others go.'; if (this.scenarioIndex === 5) return 'Check out your items you\'ve acquired.'; return 'Return the wallet to the owner or turn it in to the police.'; },
    optionBottomText() { if (this.scenarioIndex === 1) return 'Give the musician $100 to support their art.'; if (this.scenarioIndex === 2) return 'Save the two strangers trapped under the rubble.'; if (this.scenarioIndex === 3) return 'Refuse and survive the apocalypse alone.'; if (this.scenarioIndex === 4) return 'Refuse and let the situation play out.'; if (this.scenarioIndex === 5) return 'Try my luck with games and wheels.'; return 'Keep the cash and throw the wallet away.'; },
    pageStyle() { return{ width: '100vw', height: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem', fontFamily: "'MedievalSharp', system-ui, sans-serif", color: '#1d1d1f', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' } },
    borderFrameStyle() { return{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, border: '4px solid #FFD400', pointerEvents: 'none', boxSizing: 'border-box', zIndex: 2000 } },
    menuIconStyle() { return{ width: '84px', height: '84px', objectFit: 'contain', marginTop: '4rem' } },
    cardStyle() { return{ width: 'min(88vw, 300px)', background: '#ffffff', borderRadius: '15px', border: `3px solid ${ this.uiOff ? this.ringColor: '#000' }`,
      boxShadow: '0 8px 18px rgba(0,0,0,0.12)',
      padding: '1.25rem 1.25rem 1rem',
      marginTop: '2rem',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      gap: '0.75rem'
    } },
    ringColor() { switch (this.avatarIndex || 1) { case 2: return '#FFEE56'; case 3: return '#FF7A56'; case 4: return '#FF94FB'; case 5: return '#7E3F8D'; case 6: return '#994BFF'; case 7: return '#6FFF56'; default: return '#56C4FF'; } },
    activeAvatarSrc() { switch (this.avatarIndex || 1) { case 2: return require('@/assets/avatar 2.png'); case 3: return require('@/assets/avatar 3.png'); case 4: return require('@/assets/avatar 4.png'); case 5: return require('@/assets/avatar 5.png'); case 6: return require('@/assets/avatar 6.png'); case 7: return require('@/assets/avatar 7.png'); default: return require('@/assets/avatar 1.png'); } },
    displayedUsername() { return this.username || 'User' },
    shouldShowCreditsOnHomescreen() { return this.creditsOnHomescreen },
    creditsUnderUsername() { return `${this.credits} Credits` },
    avatarEmbedWrapStyle() { return{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', width: '50px', height: '50px', cursor: 'default' } },
    avatarEmbedImgStyle() { return{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 56%' } },
    cardUsernameStyle() { return{ position: 'absolute', left: 0, right: 0, bottom: '-22px', textAlign: 'center', fontWeight: 700, fontStyle: 'italic', color: '#111' } },
    cardCreditsStyle() { return{ position: 'absolute', left: 0, right: 0, bottom: '-42px', textAlign: 'center', fontWeight: 600, fontStyle: 'italic', color: '#666', fontSize: '14px' } },
    crownHintStyle() { return{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', fontSize: '16px', opacity: 0.8, animation: 'crownHintPulse 1.5s ease-in-out infinite', pointerEvents: 'none' } },
    scenarioTextStyle() { const isZombieScenario = this.scenarioIndex === 3; return { fontSize: isZombieScenario ? '1.2rem': '1.4rem', lineHeight: '1.4', color: '#222', textAlign: 'center', padding: '0 0.25rem', fontWeight: 600 }; },
    dividerStyle() { return{ height: '0', borderTop: '5px dotted #4a4a4a', margin: '0.25rem 1rem 0.5rem' } },
    optionSubtextStyle() { return{ fontSize: '1rem', color: '#6b6b6b', textAlign: 'center', fontStyle: 'italic', padding: '0 0.5rem' } },
    orStyle() { return{ textAlign: 'center', fontSize: '1.2rem', color: '#4a4a4a', fontWeight: 600, margin: '0.1rem 0' } },
    buttonsRowStyle() { return{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2.25rem', marginTop: '0.5rem' } },
    choiceBtnStyle() { return{ width: '72px', height: '72px', borderRadius: '50%', border: '3px solid #000', background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 6px 12px rgba(0,0,0,0.18)', transition: 'transform 0.15s ease, box-shadow 0.2s ease' } },
    arrowIconStyle() { return{ width: '28px', height: '28px', objectFit: 'contain' } },
    logoContainerStyle() { return{ display: 'flex', alignItems: 'center', justifyContent: 'center' } },
    logoStyle() { return{ width: '200px', height: 'auto', filter: 'brightness(0) saturate(100%)' } },
    itemOverlayStyle() { return{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1400 } },
    itemContainerStyle() { return{ width: 'min(92vw, 420px)', background: '#fff', border: '3px solid #111', borderRadius: '18px', padding: '22px 24px', textAlign: 'center', boxShadow: '0 16px 40px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' } },
    itemTitleStyle() { const color = this.itemColor; return { fontFamily: "Inter, system-ui, sans-serif", fontWeight: 900, fontSize: '38px', letterSpacing: '1px', color: '#222', textShadow: `3px 6px 0 ${color}CC, 0 2px 8px rgba(0,0,0,0.25)` }; },
    itemImgStyle() { const color = this.itemColor; return { width: '180px', height: '180px', objectFit: 'contain', filter: `grayscale(100%) drop-shadow(12px 8px 12px ${color}CC)`, margin: '6px 0 8px' }; },
    itemImgWrapStyle() { return{ position: 'relative', width: '180px', height: '180px' } },
    itemAnimImgClass() {
      switch (this.itemPopupKind) {
        case 'honesty': return this.itemAnimReady ? 'anim-handshake' : '';
        case 'street': return this.itemAnimReady ? 'anim-guitar' : '';
        case 'bandit': return this.itemAnimReady ? 'anim-nod' : '';
        case 'alone': return this.itemAnimReady ? 'anim-sad-dip' : '';
        case 'houdini': return this.itemAnimReady ? 'anim-vanish-pop' : '';
        case 'gone': return this.itemAnimReady ? 'anim-fade-only' : '';
        default: return '';
      }
    },
    niceBtnStyle() { const color = this.itemColor; return { background: '#fff', color: '#222', border: `4px solid ${color}`, borderRadius: '14px', padding: '8px 22px', fontWeight: 900, fontSize: '22px', boxShadow: `8px 8px 0 ${color}99`, cursor: 'pointer' }; },
    itemNoteStyle() { return{ fontFamily: "Inter, system-ui, sans-serif", color: '#4A4441', fontSize: '16px', lineHeight: 1.35 } },
   itemTitleLines() {
      if (this.itemPopupKind === 'bandit') return ['DOLLAR', 'BANDIT'];
      if (this.itemPopupKind === 'honesty') return ['HONESTY', 'MVP'];
      if (this.itemPopupKind === 'street') return ['STREET ART', 'LEGEND'];
      if (this.itemPopupKind === 'gourmet') return ['GOURMET', 'GOBLIN'];
      if (this.itemPopupKind === 'hero') return ['HERO MODE', 'ACTIVATED'];
      if (this.itemPopupKind === 'alone') return ['LOYAL BUT', 'LONELY'];
      if (this.itemPopupKind === 'gone') return ["HUMANITY'S GONE,", "I'M JUST HERE"];
      if (this.itemPopupKind === 'savior') return ["HUMANITY'S SAVIOR,", 'NO BIG DEAL'];
      if (this.itemPopupKind === 'houdini') return ['HOSTAGE', 'HOUDINI'];
      if (this.itemPopupKind === 'sacrifice') return ['ULTIMATE', 'SACRIFICE'];
      return ['', ''];
    },
   itemImgSrc() {
      if (this.itemPopupKind === 'bandit') return require('@/assets/bandit.png');
      if (this.itemPopupKind === 'honesty') return require('@/assets/honesty.png');
      if (this.itemPopupKind === 'street') return require('@/assets/guitarist.png');
      if (this.itemPopupKind === 'gourmet') return require('@/assets/gourmet.png');
      if (this.itemPopupKind === 'hero') return require('@/assets/hero.png');
      if (this.itemPopupKind === 'alone') return require('@/assets/alone.png');
      if (this.itemPopupKind === 'gone') return require('@/assets/gone.png');
      if (this.itemPopupKind === 'savior') return require('@/assets/blood-donation.png');
      if (this.itemPopupKind === 'houdini') return require('@/assets/disappear.png');
      if (this.itemPopupKind === 'sacrifice') return require('@/assets/sheep.png');
      return '';
    },
   itemColor() {
      switch (this.itemPopupKind) {
        case 'bandit': return '#F1C40F';
        case 'honesty': return '#56C4FF';
        case 'street': return '#1ABC9C';
        case 'gourmet': return '#A84343';
        case 'hero': return '#E74C3C';
        case 'alone': return '#F39C12';
        case 'gone': return '#7F8C8D';
        case 'savior': return '#BDC3C7';
        case 'houdini': return '#34495E';
        case 'sacrifice': return '#9B59B6';
        default: return '#56C4FF';
      }
    },
    popupOverlayStyle() { return{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 } },
    popupContainerStyle() { return{ background: 'white', border: '2px solid black', borderRadius: '15px', padding: '2rem', textAlign: 'center', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)' } },
    popupTextStyle() { return{ color: 'red', fontSize: '1.5rem', fontWeight: 'bold', lineHeight: '1.4', marginBottom: '1.5rem', fontFamily: "'Inter', system-ui, sans-serif" } },
    okButtonStyle() { return{ background: 'white', color: 'black', border: '2px solid black', borderRadius: '15px', padding: '0.75rem 2rem', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: "'Inter', system-ui, sans-serif", ...(this.okHovered &&{ background: 'black', color: 'white', transform: 'scale(1.05)' })
      }
    }
  },
  beforeUnmount() {
    // Clean up event listeners
    window.removeEventListener('crownStatusUpdate', this.updateCrownStatus);
    if (this.handleToggleUpdate) {
      window.removeEventListener('creditsToggleUpdated', this.handleToggleUpdate);
    }
    if (this.handleCreditUpdate) {
      window.removeEventListener('creditsUpdated', this.handleCreditUpdate);
    }
  },
  methods: {
    updateCrownStatus() {
      try {
        const { getCrownStatus } = require('@/services/userState.js');
        this.crownStatus = getCrownStatus();
      } catch (e) {
        console.debug('Could not update crown status:', e);
      }
    },
    async loadOnboardingState() {
      try {
        const { getUserOnboardingState } = await import('@/services/userState.js');
        const onboardingState = getUserOnboardingState();
        this.hasOpenedMenuOnce = onboardingState.hasOpenedMenuOnce;
        this.hasSeenPopup = onboardingState.hasSeenOnboardingPopup;
        this.hasSeenSecondPopup = onboardingState.hasSeenSecondPopup || false;
      } catch (e) {
        console.debug('Could not load onboarding state', e);
      }
    },
    
    async saveOnboardingState(data) {
      try {
        const { updateOnboardingState } = await import('@/services/userState.js');
        updateOnboardingState(data);
      } catch (e) {
        console.debug('Could not save onboarding state', e);
      }
    },
    openMenu() {
      const el = this.$refs.menuBtn;
      if (el) {
        const rect = el.getBoundingClientRect();
        this.menuAnchor = {
          left: Math.round(rect.left + rect.width / 2),
          top: Math.round(rect.top + rect.height / 2),
          size: Math.round(Math.max(rect.width, rect.height)),
        };
      } else {
        this.menuAnchor = { left: null, top: null, size: 84 };
      }
      this.menuOpen = true;
      this.hasOpenedMenuOnce = true;
      this.saveOnboardingState({ hasOpenedMenuOnce: true });
    },
   onMenuSelect(item) { if (item.action === 'reset') { this.handleResetProgress(); return; }
      
     if (!item || !item.to || !this.$router) return;
      
      if (item.to === '/tml-intro') { if (__tmlInitiatedOnce) { this.$router.push('/games'); }else { __tmlInitiatedOnce = true; this.$router.push('/tml-intro'); }
       return;
      }
      
      if (item.to === '/items-intro') { if (__itemsInitiatedOnce) { this.$router.push('/items'); }else { __itemsInitiatedOnce = true; this.$router.push('/items-intro'); }
       return;
      }
      this.$router.push(item.to);
    },
    onChoose(direction) { 
      if (!this.hasOpenedMenuOnce && !this.hasSeenPopup) { 
        this.showPopup = true; 
        this.hasSeenPopup = true; 
        return; 
      }
      
      if (this.scenarioIndex === 1 && !this.hasSeenSecondPopup) {
        this.showSecondPopup = true;
        this.hasSeenSecondPopup = true;
        this.saveOnboardingState({ hasSeenSecondPopup: true });
        return;
      }
      
      if (this.scenarioIndex === 5) {
        if (direction === 'up') {
          // "Check out your items you've acquired" - go to items
          this.$router.push('/items-intro');
        } else {
          // "Try my luck with games and wheels" - go to test my luck
          this.$router.push('/tml-intro');
        }
        return;
      }
      
     if (this.scenarioIndex === 0) { this.itemPopupKind = direction === 'up' ? 'honesty': 'bandit' }else if (this.scenarioIndex === 1) { this.itemPopupKind = direction === 'up' ? 'gourmet': 'street' }else if (this.scenarioIndex === 2) { this.itemPopupKind = direction === 'up' ? 'alone': 'hero' }else if (this.scenarioIndex === 3) { this.itemPopupKind = direction === 'up' ? 'savior': 'gone' }else if (this.scenarioIndex === 4) { this.itemPopupKind = direction === 'up' ? 'sacrifice': 'houdini' }
     this.itemAnimReady = false
      this.itemPopupVisible = true
      
      this.updateCrownStatus();
    },
    handleOkClick() { this.showPopup = false; this.hasSeenPopup = true; this.saveOnboardingState({ hasSeenOnboardingPopup: true });
    },

    handleSecondOkClick() { 
      this.showSecondPopup = false; 
      this.hasSeenSecondPopup = true; 
      this.saveOnboardingState({ hasSeenSecondPopup: true });
    },
   onPopupEnterEnd() {
      this.itemAnimReady = true;
      clearTimeout(this._animT);
      this._animT = setTimeout(() => {
        this.itemAnimReady = false;
      }, 1200);
    },
    async onNiceClick() {
      let key = null;
      if (this.itemPopupKind === 'bandit') key = 'bandit';
      else if (this.itemPopupKind === 'honesty') key = 'honesty';
      else if (this.itemPopupKind === 'street') key = 'guitarist';
      else if (this.itemPopupKind === 'gourmet') key = 'gourmet';
      else if (this.itemPopupKind === 'hero') key = 'hero';
      else if (this.itemPopupKind === 'alone') key = 'alone';
      else if (this.itemPopupKind === 'gone') key = 'gone';
      else if (this.itemPopupKind === 'savior') key = 'blood-donation';
      else if (this.itemPopupKind === 'houdini') key = 'disappear';
      else if (this.itemPopupKind === 'sacrifice') key = 'sheep';
      
      if (key) {
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
              
              if (!arr.includes(key)) {
                arr.push(key);
                localStorage.setItem(userItemsKey, JSON.stringify(arr));
              }
              
              const globalRaw = localStorage.getItem('kt_unlocked_items');
              let globalArr = [];
              if (globalRaw) {
                const globalParsed = JSON.parse(globalRaw);
                if (Array.isArray(globalParsed)) globalArr = globalParsed;
              }
              if (!globalArr.includes(key)) {
                globalArr.push(key);
                localStorage.setItem('kt_unlocked_items', JSON.stringify(globalArr));
              }
            }
          }
        } catch (e) { /* no-op */ }
      }
      
      try {
        const good = new Set(['honesty', 'street', 'hero', 'savior', 'sacrifice']);
        const kind = this.itemPopupKind;
        if (kind) {
          const isGoodChoice = good.has(kind);
          const creditAmount = isGoodChoice ? 500 : 1000;
          addCredits(creditAmount);
          
          this.credits = getCredits();
          
          window.dispatchEvent(new CustomEvent('creditsUpdated'));
          
          // Track karma for bad choices
          if (!isGoodChoice) {
            try {
              const { trackBadScenarioChoice } = await import('@/services/karmaTracker.js');
              await trackBadScenarioChoice();
            } catch (karmaError) {
              console.debug('Failed to track karma for bad choice:', karmaError);
            }
          }
        }
      } catch (_) { /* ignore */ }
      
      this.itemPopupVisible = false;
      
      this.updateCrownStatus();
      
      try {
        const completed = this.scenarioIndex;
        const count = completed + 1;
        const userData = localStorage.getItem('kt_user');
        if (userData) {
          const user = JSON.parse(userData);
          if (user && user.email) {
            const safeEmail = user.email.toLowerCase().replace(/[^a-z0-9@._-]/g, '');
            const userScenariosKey = `kt_scenarios_completed_${safeEmail}`;
            const prev = parseInt(localStorage.getItem(userScenariosKey) || '0', 10);
            
            if (!Number.isNaN(count) && count > prev) {
              localStorage.setItem(userScenariosKey, String(count));
            }
          }
        }
        
        const globalPrev = parseInt(localStorage.getItem('kt_scenarios_completed') || '0', 10);
        if (!Number.isNaN(count) && count > globalPrev) {
          localStorage.setItem('kt_scenarios_completed', String(count));
        }
      } catch (e) { /* no-op */ }
     const maxIndex = 5
      if (this.scenarioIndex < maxIndex) this.scenarioIndex += 1
    },
    async handleResetProgress() { const confirmed = confirm( 'Are you sure you want to reset all your progress? This will: \n\n' + '• Clear all completed scenarios\n' + '• Reset your credits to default\n' + '• Remove all unlocked items\n' + '• Take you back to the welcome screen\n\n' + 'This action cannot be undone!' ); if (!confirmed) return; try { const { resetAllProgress } = await import('@/services/userState.js');
        
        
        const success = resetAllProgress();
        
        if (success) {
          
          this.menuOpen = false;
          
          
          alert('Progress reset successfully! Returning to welcome screen...');
          
          
          this.$router.push('/welcome');
        }else { alert('Failed to reset progress. Please try again.'); }
      }catch (error) { console.error('Error resetting progress: ', error); alert('Error occurred while resetting progress. Please try again.'); }
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap');

.menu-icon { cursor: pointer; transition: transform 0.2s ease, filter 0.2s ease; }
.menu-icon:hover { transform: translateY(-2px) scale(1.05); filter: drop-shadow(0 4px 12px rgba(0,0,0,0.18)); }
.menu-icon:focus-visible { outline: 3px solid #000; border-radius: 8px; }

/*Avatar hover gliss effect (only visible when uiOff shows avatar) */
.avatar-embed { position: relative; border-radius: 50%; }
.avatar-embed .avatar-img { display: block; border-radius: 50%; }
.avatar-embed .avatar-gliss { position: absolute; inset: 0; border-radius: 50%; overflow: hidden; pointer-events: none; }
.avatar-embed .avatar-gliss::before { content: ''; position: absolute; top: -20%; bottom: -20%; left: -120%; width: 60%; background: linear-gradient(75deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%); transform: skewX(-20deg); filter: blur(0.5px); opacity: 0; }
.avatar-embed:hover .avatar-gliss::before { animation: avatarGliss 800ms ease-out 1 both; }
@keyframes avatarGliss { 0% { left: -120%; opacity: 0; }
 25% { opacity: 1; }
 100% { left: 140%; opacity: 0; }
}

button[aria-label='Choose up']:hover,
button[aria-label='Choose down']:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(0,0,0,0.25) !important; }

.popup-enter-active { animation: popupJump 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

@keyframes popupJump { 0%{ transform: scale(0.2) translateY(-30px); opacity: 0; }
 50% { transform: scale(1.15) translateY(8px); opacity: 0.9; }
 70% { transform: scale(0.95) translateY(-3px); opacity: 1; }
 100% { transform: scale(1) translateY(0); opacity: 1; }
}

.anim-handshake { animation: handshakeY 700ms ease-in-out 100ms 1; transform-origin: 50% 62%; }
.anim-guitar { animation: guitarTilt 550ms ease-in-out 100ms 1; transform-origin: 46% 72%; }
.anim-nod { animation: nodSubtle 600ms ease-in-out 100ms 1; transform-origin: 50% 28%; }

.lens-glow { position: absolute; top: 33%; width: 22px; height: 10px; border-radius: 10px; background: radial-gradient(closest-side, rgba(255,255,255,0.95), rgba(255,255,255,0.08)); filter: drop-shadow(0 0 5px rgba(255,255,255,0.8)); opacity: 0; animation: lensPulse 420ms ease-out 1 both; pointer-events: none; will-change: transform, opacity; }
.lens-glow.left { left: 39%; }
.lens-glow.right { left: 58%; }
.shine-sweep { position: absolute; top: 25%; left: 34%; width: 26%; height: 16%; background: linear-gradient(75deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 40%, rgba(255,255,255,0) 85%); transform: skewX(-15deg); filter: blur(0.6px); pointer-events: none; opacity: 0; animation: shineSweep 360ms ease-out 1 both; will-change: transform, opacity; }

.star { position: absolute; left: 68%; bottom: 32%; color: #fff; text-shadow: 0 0 10px rgba(255,255,255,0.9), 0 0 16px rgba(255,255,255,0.5); font-size: 12px; opacity: 0; animation: starTwinkle 520ms ease-out 1 both; pointer-events: none; will-change: transform, opacity; }
.star.t2 { left: 71%; bottom: 34%; font-size: 10px; animation-delay: 80ms; }
.star.t3 { left: 66%; bottom: 30%; font-size: 9px; animation-delay: 140ms; }

.note { position: absolute; left: 61%; top: 61%; color: #111; font-weight: 900; text-shadow: 0 2px 3px rgba(0,0,0,0.25); animation: noteArc1 820ms cubic-bezier(0.22, 0.61, 0.36, 1) 1 both; pointer-events: none; will-change: transform, opacity; }
.note.n2 { left: 59%; top: 63%; animation: noteArc2 880ms cubic-bezier(0.22, 0.61, 0.36, 1) 1 70ms both; }
.note.n3 { left: 63%; top: 59%; animation: noteArc3 920ms cubic-bezier(0.22, 0.61, 0.36, 1) 1 120ms both; }

@keyframes handshakeY { 0% { transform: translateY(0) rotate(0deg); }
 25% { transform: translateY(4px) rotate(0.2deg); }
 50% { transform: translateY(-4px) rotate(-0.2deg); }
 75% { transform: translateY(3px) rotate(0.15deg); }
 100% { transform: translateY(0) rotate(0deg); }
}
@keyframes guitarTilt { 0% { transform: rotate(0deg); }
 35% { transform: rotate(-2.4deg); }
 70% { transform: rotate(1.8deg); }
 100% { transform: rotate(0deg); }
}
@keyframes nodSubtle { 0% { transform: rotate(0deg) translateY(0); }
 45% { transform: rotate(-2.2deg) translateY(1px); }
 85% { transform: rotate(1.6deg) translateY(-1px); }
 100% { transform: rotate(0deg) translateY(0); }
}
@keyframes lensPulse { 0% { opacity: 0; transform: scale(0.7); }
 35% { opacity: 1; transform: scale(1.02); }
 70% { opacity: 0; transform: scale(1.04); }
 100% { opacity: 0; transform: scale(1.04); }
}
@keyframes shineSweep { 0% { opacity: 0; transform: translateX(-40%) skewX(-15deg); }
 30% { opacity: 1; }
 60% { opacity: 0; }
 100% { opacity: 0; transform: translateX(85%) skewX(-15deg); }
}
@keyframes starTwinkle { 0% { opacity: 0; transform: scale(0.6) rotate(0deg); }
 45% { opacity: 1; transform: scale(1) rotate(12deg); }
 80% { opacity: 0.6; transform: scale(0.92) rotate(-8deg); }
 100% { opacity: 0; transform: scale(0.88) rotate(0deg); }
}
@keyframes noteArc1 { 0% { opacity: 0; transform: translate(0px, 6px) rotate(0deg) scale(0.9); }
 50% { opacity: 1; }
 100% { opacity: 0; transform: translate(12px, -24px) rotate(-8deg) scale(1.02); }
}
@keyframes noteArc2 { 0% { opacity: 0; transform: translate(0px, 6px) rotate(0deg) scale(0.9); }
 50% { opacity: 1; }
 100% { opacity: 0; transform: translate(-8px, -22px) rotate(8deg) scale(1.01); }
}
@keyframes noteArc3 { 0% { opacity: 0; transform: translate(0px, 6px) rotate(0deg) scale(0.9); }
 50% { opacity: 1; }
 100% { opacity: 0; transform: translate(10px, -28px) rotate(-6deg) scale(1.03); }
}

.anim-sad-dip { animation: sadDip 620ms ease 1; transform-origin: 50% 60%; }
.anim-hide-dip { animation: hideDip 480ms ease 1; transform-origin: 50% 70%; }
.anim-fade-swipe { animation: imgFadeSwipe 520ms ease-out 1 both; transform-origin: 70% 50%; }
@keyframes sadDip { 0% { transform: translateY(0); }
 40% { transform: translateY(3px); }
 100% { transform: translateY(0); }
}
@keyframes hideDip { 0% { transform: translateY(0) scale(1); }
 60% { transform: translateY(4px) scale(0.985); }
 100% { transform: translateY(0) scale(1); }
}

.wind { position: absolute; left: 30%; top: 35%; width: 50px; height: 12px; border-radius: 12px; background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(180,220,255,0.85) 40%, rgba(255,255,255,0) 100%); filter: blur(1px); opacity: 0; animation: windSweep 520ms ease-out 1 both; pointer-events: none; }
.wind.w2 { top: 48%; left: 26%; width: 60px; animation-delay: 60ms; }
.wind.w3 { top: 58%; left: 34%; width: 46px; animation-delay: 120ms; }
@keyframes windSweep { 0% { opacity: 0; transform: translateX(-24px) scaleX(0.7); }
 40% { opacity: 1; }
 100% { opacity: 0; transform: translateX(40px) scaleX(1); }
}

.gloom { position: absolute; left: 44%; top: 24%; width: 4px; height: 26px; background: linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0)); border-radius: 2px; opacity: 0; animation: gloomFall 540ms ease-out 1 both; pointer-events: none; }
.gloom.g2 { left: 48%; height: 22px; animation-delay: 70ms; }
.gloom.g3 { left: 52%; height: 24px; animation-delay: 120ms; }
@keyframes gloomFall { 0% { opacity: 0; transform: translateY(-8px); }
 40% { opacity: 1; }
 100% { opacity: 0; transform: translateY(6px); }
}

.heart { position: absolute; left: 48%; top: 58%; color: #E74C3C; text-shadow: 0 0 10px rgba(231,76,60,0.7); font-size: 12px; opacity: 0; animation: heartBeat 700ms ease-out 1 both; pointer-events: none; }
@keyframes heartBeat { 0% { opacity: 0; transform: scale(0.6); }
 30% { opacity: 1; transform: scale(1.15); }
 60% { opacity: 0.7; transform: scale(0.95); }
 100% { opacity: 0; transform: scale(0.9); }
}

.anim-fade-only { animation: imgFadeOnly 1400ms ease-out 1 both; }
@keyframes imgFadeOnly { 0% { opacity: 1; }
 50% { opacity: 0.6; }
 100% { opacity: 1; }
}

.knife-glint { position: absolute; right: 14%; bottom: 24%; width: 32px; height: 12px; background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.95), rgba(255,255,255,0)); filter: blur(0.5px); transform: rotate(10deg); opacity: 0; animation: knifeGlint 600ms ease-out 1 both; pointer-events: none; box-shadow: 0 0 15px rgba(255,255,255,0.7); }
@keyframes knifeGlint { 0% { opacity: 0; transform: translateX(-16px) rotate(10deg) scaleX(0.7); }
 40% { opacity: 1; }
 100% { opacity: 0; transform: translateX(18px) rotate(10deg) scaleX(1); }
}

.anim-vanish-pop { animation: vanishThenPop 850ms ease-out 1 both; }
@keyframes vanishThenPop { 0% { opacity: 1; transform: translateY(0) scale(1); }
 35% { opacity: 0; transform: translateY(2px) scale(0.985); }
 75% { opacity: 0; transform: translateY(-2px) scale(1.02); }
 100% { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes crownHintPulse { 
  0% { opacity: 0.6; transform: translateX(-50%) scale(1); }
  50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
  100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
}
</style>