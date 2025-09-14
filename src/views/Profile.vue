<template>
  <div :style="pageStyle">
    <button :style="closeStyle" aria-label="Close" @click="emitClose">×</button>

    <div :style="contentStyle">
      <div :style="avatarWrapStyle">
        <div 
          :style="avatarRingStyle"
          ref="avatarRingEl"
          @click="openAvatarPopup"
        >
          <img 
            :src="avatarSrc" 
            alt="Avatar" 
            :style="[avatarImgStyle, avatarHoverStyle]" 
            :class="['avatar-img', 'hoverable']"
            ref="avatarImgEl"
            @mouseenter="avatarHovered = true"
            @mouseleave="avatarHovered = false"
          />
                 <div v-if="crownStatus.isWinner" :style="winnerCrownStyle" class="winner-crown">
                   👑
                 </div>
        </div>
      </div>

  <div :style="nameStyle" class="username" @click="openNamePopup">{{ displayedUsername }}</div>

      <div v-if="crownStatus.isEligible && !crownStatus.hasPurchasedCrown" :style="crownPurchaseCardStyle">
        <div :style="crownPurchaseTitleStyle">👑 CROWN AVAILABLE 👑</div>
        <div :style="crownPurchaseDescStyle">You're eligible to become a winner!</div>
        <button :style="crownPurchaseButtonStyle" @click="purchaseCrown" :disabled="!crownStatus.canPurchase">
          {{ crownStatus.canPurchase ? 'PURCHASE CROWN (5000C)' : 'NOT ENOUGH CREDITS' }}
        </button>
      </div>

      <div v-else :style="tipsCardStyle">
        <div :style="tipsTitleStyle">Useful tips:</div>
        <div :style="tipsTextStyle">Click the avatar<br/>to change it</div>
        <div :style="tipsSpacer"></div>
        <div :style="tipsTextStyle">Click the username<br/>to change it</div>
      </div>

      <div :style="hsTextStyle">Add profile to homescreen</div>
      <div :style="toggleWrapStyle" @click="onToggleClick">
        <img :src="toggleOnSrc" :style="[toggleImgStyle, { opacity: isSwitchOn ? 0 : 1 }]" @load="onToggleLoaded" />
        <img :src="toggleOffSrc" :style="[toggleImgStyle, { opacity: isSwitchOn ? 1: 0 }]" @load="onToggleLoaded" />
      </div>


      <div v-if="showCrownCelebration" :style="celebrationOverlayStyle">
        <div :style="celebrationContainerStyle">
          <div :style="celebrationCrownStyle">👑</div>
          <div :style="celebrationTextStyle">Congratulations!</div>
          <div :style="celebrationSubtextStyle">You are the winner!</div>
        </div>
      </div>

      <div v-if="showNamePopup" :style="overlayStyle" @click.self="closeNamePopup">
        <div :style="popupCardStyle" class="popup-enter-active">
          <div :style="popupTitleStyle">Change username</div>
          
          
          <div v-if="usernameChangeInfo.maxChangesReached" :style="maxChangesStyle">
            Maximum username changes reached (2/2). No more changes allowed.
          </div>
          
          
          <div v-else-if="usernameChangeInfo.needsToPay" :style="costInfoStyle">
            Additional username changes cost 500 credits (1/2 changes used)
          </div>
          
          
          <div v-if="!usernameChangeInfo.maxChangesReached && usernameChangeInfo.needsToPay && !usernameChangeInfo.hasFreeChange" :style="buyWrapStyle">
            <div :style="priceStyle">500C</div>
            <button 
              :style="buyBtnStyle" 
              :disabled="credits < 500" 
              @click="buyUsernameChange"
            >
              BUY USERNAME CHANGE
            </button>
            <div v-if="credits < 500" :style="insufficientStyle">Not enough credits</div>
          </div>
          
          
          <input
            type="text"
            :placeholder="displayedUsername"
            v-model="nameInput"
            :style="nameInputStyle"
            :disabled="usernameChangeInfo.maxChangesReached || (usernameChangeInfo.needsToPay && !usernameChangeInfo.hasFreeChange)"
            @input="validateName"
          />
          <div v-if="nameError" :style="errorTextStyle">{{ nameError }}</div>
          <button 
            :style="confirmBtnStyle" 
            :disabled="!canSubmit || usernameChangeInfo.maxChangesReached" 
            @click="submitName"
          >
            Change username
          </button>
        </div>
      </div>

      <div v-if="showAvatarPicker" :style="overlayStyle" @click.self="closeAvatarPopup">
        <div :style="avatarPickerCardStyle" class="popup-enter-active">
          <button :style="avatarPickerCloseStyle" aria-label="Close" @click="closeAvatarPopup">×</button>
          <div :style="avatarPreviewWrapStyle" ref="avatarPreviewEl">
            <img :src="avatarImages[selectedAvatarTemp-1]" alt="Preview" :style="avatarPreviewImgStyle" />
          </div>
          <div :style="avatarDividerStyle" aria-hidden="true"></div>
          <div :style="avatarGridStyle">
            <div v-for="(idx, i) in avatarChoicesList" :key="i" :style="avatarThumbWrapStyle" @click="selectAvatar(idx, i, $event)" class="avt-thumb">
              <img :src="avatarImages[idx-1]" alt="Avatar choice" :style="avatarThumbImgStyle" />
            </div>
          </div>
          <button :style="avatarConfirmBtnStyle" :disabled="!canConfirmAvatarChange" @click="confirmAvatarSelection">CONFIRM</button>
        </div>
      </div>
      <div v-if="anim.running" :style="animOverlayStyle">
        <img :src="anim.src" :style="animStyle" @transitionend="onAnimEnd" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'userProfile',
  emits: ['close'],
  data(){ return{ username: '', email: '', avatarSrc: require('@/assets/avatar 1.png'), toggleOnSrc: require('@/assets/turn_on.png'), toggleOffSrc: require('@/assets/turn_off.png'), isSwitchOn: false, toggleHeight: 0, isAvatar1: true, avatarHovered: false, showNamePopup: false, nameInput: '', nameError: '', usernameChangeInfo:{ count: 0, hasFreeChange: true, needsToPay: false },
  credits: 0,
  showAvatarPicker: false,
  currentAvatarIndex: 1,
  selectedAvatarTemp: 1,
  avatarChoicesList: [],
  crownStatus: {
    isWinner: false,
    hasPurchasedCrown: false,
    isEligible: false,
    canPurchase: false
  },
  showCrownCelebration: false,
  avatarImages: [
    require('@/assets/avatar 1.png'),
    require('@/assets/avatar 2.png'),
    require('@/assets/avatar 3.png'),
    require('@/assets/avatar 4.png'),
    require('@/assets/avatar 5.png'),
    require('@/assets/avatar 6.png'),
    require('@/assets/avatar 7.png')
  ],
  lastClickedRect: null,
  anim: { running: false, src: '', toTarget: false, start: { top: 0, left: 0, width: 0, height: 0 },end: { top: 0, left: 0, width: 0, height: 0 } },
    };
  },
  mounted() { try { const { getCurrentUser, getUserAvatar, getUserSwitchState, getUsernameChangeInfo, getUserCredits, getCrownStatus } = require('@/services/userState.js');
      
      const user = getCurrentUser();
      if (user) {
        if (user.username) this.username = user.username;
        if (user.email) this.email = user.email;
      }
      
     const avatar = getUserAvatar();
      
      this.currentAvatarIndex = avatar.avatarIndex;
      this.avatarSrc = this.avatarImages[this.currentAvatarIndex - 1];
      this.isAvatar1 = avatar.isAvatar1;
      this.isSwitchOn = getUserSwitchState();
      
      this.usernameChangeInfo = getUsernameChangeInfo();
      this.credits = getUserCredits();
      
      this.crownStatus = getCrownStatus();
    } catch (e) { console.debug('Failed to load user state, using fallback', e); try { const raw = localStorage.getItem('kt_user'); if (raw) { const user = JSON.parse(raw); if (user && user.username) this.username = user.username; if (user && user.email) this.email = user.email; if (user && user.avatarIndex) { this.currentAvatarIndex = Number(user.avatarIndex) || 1; this.avatarSrc = this.avatarImages[this.currentAvatarIndex-1]; this.isAvatar1 = this.currentAvatarIndex === 1; }
        }
       const toggleRaw = localStorage.getItem('kt_ui_off');
        if (toggleRaw === '1') this.isSwitchOn = true;
        else if (toggleRaw === '0') this.isSwitchOn = false;
        
        this.usernameChangeInfo = { count: 0, hasFreeChange: true, needsToPay: false };
       this.credits = 1100;
       this.crownStatus = { isWinner: false, hasPurchasedCrown: false, isEligible: false, canPurchase: false };
      } catch (fallbackError) { console.debug('No stored user available', fallbackError); }
    }
    
    window.addEventListener('crownStatusUpdate', this.updateCrownStatus);
  },
  beforeUnmount() {
    // Clean up event listener
    window.removeEventListener('crownStatusUpdate', this.updateCrownStatus);
  },
  computed: {
    avatarChoices() { return [1,2,3,4,5,6,7].filter(i => i !== this.currentAvatarIndex); },
    displayedUsername() { if (this.username) return this.username; if (this.email && this.email.includes('@')) return this.email.split('@')[0]; return 'User'; },
    isWinner() { return this.crownStatus.isWinner; },
    ringColor() { switch (this.currentAvatarIndex) { case 2: return '#FFEE56'; case 3: return '#FF7A56'; case 4: return '#FF94FB'; case 5: return '#7E3F8D'; case 6: return '#994BFF'; case 7: return '#6FFF56'; default: return '#56C4FF'; } },
    pageStyle() { return { minHeight: '100vh', width: '100%', background: '#fff', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px 48px', boxSizing: 'border-box', fontFamily: "'Inter', system-ui, sans-serif", color: '#111', border: '4px solid #FFD400' }; },
    contentStyle() { return { width: 'min(92vw, 360px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px' }; },
    closeStyle() { return { position: 'fixed', top: '16px', right: '16px', width: '44px', height: '44px', borderRadius: '50%', border: '3px solid #111', background: '#fff', color: '#111', fontSize: '28px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }; },
    avatarWrapStyle() { return { marginTop: '12px' }; },
    avatarRingStyle() { return { width: '132px', height: '132px', borderRadius: '50%', background: '#fff', boxSizing: 'border-box', border: `6px solid ${this.ringColor}`, display: 'grid', placeItems: 'center', overflow: 'visible' }; },
    avatarImgStyle() { return { width: '108px', height: '108px', objectFit: 'cover', objectPosition: '50% 56%', transform: 'translateY(2px) scale(1)', transition: 'transform 0.5s cubic-bezier(.4,2,.6,1)', willChange: 'transform', borderRadius: '50%', display: 'block', cursor: 'pointer' }; },
    avatarHoverStyle() { return { transform: this.avatarHovered ? 'translateY(-2px) scale(1.112)': 'translateY(2px) scale(1)' }; },
    nameStyle() { return { fontSize: '28px', fontWeight: 700, letterSpacing: '0.2px', marginBottom: '20px', cursor: 'pointer' }; },
    tipsCardStyle() { const borderColor = this.isSwitchOn ? this.ringColor: '#000'; return { width: 'min(92vw, 360px)', minHeight: '230px', border: `3px dotted ${borderColor}`, borderRadius: '6px', padding: '15px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', textAlign: 'center' }; },
    tipsTitleStyle() { return { fontWeight: 800, fontSize: '22px' }; },
    tipsTextStyle() { return { fontStyle: 'italic', color: '#333', lineHeight: 1.5, fontSize: '17px' }; },
    tipsSpacer() { return { height: '6px' }; },
    hsTextStyle() { return { marginTop: '26px', marginBottom: '-28px', fontSize: '17px', fontStyle: 'italic', color: '#444' }; },
    toggleWrapStyle() { return { position: 'relative', width: '88px', height: this.toggleHeight ? this.toggleHeight + 'px': 'auto', marginTop: '28px' }; },
    toggleImgStyle() { return { position: 'absolute', left: 0, top: 0, width: '88px', height: 'auto', display: 'block', userSelect: 'none', transition: 'opacity 280ms ease' }; },
    crownPurchaseButtonStyle() { 
      return { 
        background: this.crownStatus.canPurchase ? '#8B4513' : '#ccc', 
        color: this.crownStatus.canPurchase ? '#FFD700' : '#666', 
        border: '2px solid #8B4513', 
        borderRadius: '8px', 
        padding: '12px 20px', 
        fontSize: '16px', 
        fontWeight: '800', 
        cursor: this.crownStatus.canPurchase ? 'pointer' : 'not-allowed', 
        transition: 'all 0.2s ease', 
        opacity: this.crownStatus.canPurchase ? 1 : 0.6,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        boxShadow: this.crownStatus.canPurchase ? '0 4px 8px rgba(0,0,0,0.2)' : 'none'
      }; 
    },
    overlayStyle() { return { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }; },
    popupCardStyle() { return { background: '#fff', border: '3px solid #111', borderRadius: '12px', padding: '18px 20px', width: 'min(90vw, 320px)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }; },
    popupTitleStyle() { return { fontFamily: "'Inter', system-ui, sans-serif", fontSize: '22px', fontWeight: 800, textAlign: 'center', marginBottom: '12px' }; },
    nameInputStyle() { return { width: '100%', boxSizing: 'border-box', display: 'block', padding: '10px 12px', border: '2px solid #111', borderRadius: '8px', fontSize: '16px', outline: 'none' }; },
    errorTextStyle() { return { color: '#FF4444', fontSize: '14px', marginTop: '8px', textAlign: 'center' }; },
    confirmBtnStyle() { return { marginTop: '14px', width: '100%', background: '#fff', border: '3px solid #000', borderRadius: '12px', padding: '12px', fontSize: '20px', fontWeight: 800, color: this.canSubmit ? '#000': '#777', cursor: this.canSubmit ? 'pointer': 'not-allowed', filter: this.canSubmit ? 'drop-shadow(0 8px 14px rgba(0,0,0,0.2))': 'none', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }; },
    costInfoStyle() { return { fontSize: '14px', color: '#666', textAlign: 'center', marginBottom: '16px', fontStyle: 'italic' }; },
    maxChangesStyle() { return { fontSize: '14px', color: '#FF4444', textAlign: 'center', marginBottom: '16px', fontWeight: 600, padding: '12px', border: '2px solid #FF4444', borderRadius: '8px', background: '#FFF5F5' }; },
    buyWrapStyle() { return { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '20px', padding: '16px', border: `2px dotted ${this.ringColor}`, borderRadius: '8px', background: '#fafafa' }; },
    priceStyle() { return { fontSize: '18px', fontWeight: 800, color: '#4A4441', letterSpacing: '0.5px' }; },
    buyBtnStyle() { const enabled = this.credits >= 500; return { background: enabled ? '#FFD400': '#ccc', color: enabled ? '#4A4441': '#666', border: `3px solid ${enabled ? '#4A4441': '#999'}`, borderRadius: '12px', padding: '8px 16px', fontSize: '14px', fontWeight: 800, cursor: enabled ? 'pointer' : 'not-allowed', boxShadow: enabled ? '0 4px 8px rgba(0,0,0,0.2)' : 'none', transition: 'all 0.2s ease' }; },
    insufficientStyle() { return { fontSize: '12px', color: '#FF4444', textAlign: 'center' }; },
    avatarPickerCardStyle() { return { position: 'relative', background: '#fff', border: '3px solid #111', borderRadius: '16px', padding: '16px 18px 92px', width: 'min(92vw, 330px)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', overflow: 'hidden' }; },
    avatarPickerCloseStyle() { return { position: 'absolute', top: '10px', right: '12px', width: '36px', height: '36px', borderRadius: '50%', border: '3px solid #111', background: '#fff', fontSize: '22px', fontWeight: 800, lineHeight: 1, display: 'grid', placeItems: 'center', cursor: 'pointer' }; },
    avatarPreviewWrapStyle() { return { display: 'grid', placeItems: 'center', padding: '8px 0 10px' }; },
    avatarPreviewImgStyle() { return { width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 56%' }; },
    avatarDividerStyle() { return { height: 0, borderTop: '4px dotted #000', margin: '14px 30px 16px' }; },
    avatarGridStyle() { return { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '28px 26px', justifyItems: 'center', alignItems: 'center', padding: '0 18px 8px' }; },
    avatarThumbWrapStyle() { return { width: '88px', height: '88px', borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer' }; },
    avatarThumbImgStyle() { return { width: '88px', height: '88px', borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 56%', boxShadow: '0 0 0 rgba(0,0,0,0)' }; },
    avatarConfirmBtnStyle() { return { position: 'absolute', left: '50%', bottom: '12px', transform: 'translateX(-50%)', background: '#fff', color: this.canConfirmAvatarChange ? '#000': '#777', border: '3px solid #111', borderRadius: '12px', padding: '10px 18px', fontSize: '18px', fontWeight: 800, cursor: this.canConfirmAvatarChange ? 'pointer': 'not-allowed' }; },
    animOverlayStyle() { return { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 3000 }; },
    animStyle() {
      const s = this.anim.start, e = this.anim.end;
      const t = this.anim.toTarget;
      const base = { position: 'fixed', borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 56%', transition: 'all 380ms cubic-bezier(.4,1.6,.4,1)', boxShadow: '0 16px 36px rgba(0,0,0,0.3)' };
      if (!t) return { ...base, top: s.top + 'px', left: s.left + 'px', width: s.width + 'px', height: s.height + 'px' };
      return { ...base, top: e.top + 'px', left: e.left + 'px', width: e.width + 'px', height: e.height + 'px' };
    },
    canSubmit() {
      const u = String(this.nameInput || '').trim();
      if (!u) return false;
      if (u.length < 3 || u.length > 12) return false;
      if (!/^[A-Za-z0-9_]+$/.test(u)) return false;
      if (this.nameError) return false;
      if (this.usernameChangeInfo.needsToPay && !this.usernameChangeInfo.hasFreeChange) {
        return false;
      }
      return true;
    },
    canConfirmAvatarChange() { return this.selectedAvatarTemp !== this.currentAvatarIndex; },
    celebrationOverlayStyle() {
      return {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: 'celebrationFadeIn 0.5s ease-in-out'
      };
    },
    celebrationContainerStyle() {
      return {
        textAlign: 'center',
        color: '#FFD700',
        animation: 'celebrationBounce 2s ease-in-out infinite'
      };
    },
    celebrationCrownStyle() {
      return {
        fontSize: '120px',
        marginBottom: '20px',
        animation: 'crownGlow 1.5s ease-in-out infinite alternate'
      };
    },
    celebrationTextStyle() {
      return {
        fontSize: '48px',
        fontWeight: '900',
        marginBottom: '10px',
        textShadow: '0 0 20px rgba(255, 215, 0, 0.8)'
      };
    },
    celebrationSubtextStyle() {
      return {
        fontSize: '24px',
        fontWeight: '600',
        opacity: 0.9
      };
    },
    crownPurchaseCardStyle() {
      const borderColor = this.isSwitchOn ? this.ringColor: '#000';
      return {
        width: 'min(92vw, 360px)',
        minHeight: '230px',
        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
        border: `3px dotted ${borderColor}`,
        borderRadius: '6px',
        padding: '15px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        textAlign: 'center',
        boxShadow: '0 8px 20px rgba(255, 215, 0, 0.3)'
      };
    },
    crownPurchaseTitleStyle() {
      return {
        fontSize: '20px',
        fontWeight: '900',
        color: '#8B4513',
        marginBottom: '8px',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
      };
    },
    crownPurchaseDescStyle() {
      return {
        fontSize: '14px',
        color: '#8B4513',
        marginBottom: '12px',
        fontStyle: 'italic'
      };
    },
    winnerCrownStyle() {
      return {
        position: 'absolute',
        top: '15px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '28px',
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
        animation: 'crownGlow 2s ease-in-out infinite alternate',
        pointerEvents: 'none',
        zIndex: 10
      };
    },
  },
  methods: { 
    emitClose() {
      this.$emit('close');
    },
    async purchaseCrown() {
      try {
        const { purchaseCrown } = require('@/services/userState.js');
        const success = await purchaseCrown();
        if (success) {
          this.updateCrownStatus();
          this.credits = require('@/services/credits.js').getCredits();
          
          this.showCrownCelebration = true;
          
          setTimeout(() => {
            // Clear user data and redirect to login
            localStorage.removeItem('kt_user');
            this.$router.push('/');
          }, 3000);
        } else {
          alert('Unable to purchase crown. Check your credits and karma.');
        }
      } catch (error) {
        console.error('Error purchasing crown:', error);
        alert('Error purchasing crown. Please try again.');
      }
    },
    updateCrownStatus() {
      try {
        const { getCrownStatus } = require('@/services/userState.js');
        this.crownStatus = getCrownStatus();
      } catch (error) {
        console.error('Error updating crown status:', error);
      }
    },
    openNamePopup() {
      this.nameInput = '';
      this.nameError = '';
      this.showNamePopup = true;
    },
    openAvatarPopup() {
      this.selectedAvatarTemp = this.currentAvatarIndex;
      this.avatarChoicesList = [1,2,3,4,5,6,7].filter(i => i !== this.selectedAvatarTemp);
      this.showAvatarPicker = true;
      this.lastClickedRect = null;
    },
    closeAvatarPopup() {
      this.showAvatarPicker = false;
    },
    selectAvatar(n, i, e) {
      const prevSelected = this.selectedAvatarTemp;
      if (n === prevSelected) return;
      this.selectedAvatarTemp = n;
      const list = this.avatarChoicesList.slice();
      list[i] = prevSelected;
      this.avatarChoicesList = list;
      this.lastClickedRect = e?.currentTarget?.getBoundingClientRect?.() || null;
    },
    confirmAvatarSelection() {
      if (!this.canConfirmAvatarChange) {
        return;
      }
      const targetImg = this.$refs.avatarImgEl;
      if (!targetImg) {
        this.applyAvatarSelection();
        this.showAvatarPicker = false;
        return;
      }
      const targetRect = targetImg.getBoundingClientRect();
      let startRect = this.lastClickedRect;
      if (!startRect) {
        const prev = this.$refs.avatarPreviewEl;
        startRect = prev ? prev.getBoundingClientRect(): targetRect;
      }
      
      this.anim.src = this.avatarImages[this.selectedAvatarTemp-1];
      this.anim.start = { top: startRect.top, left: startRect.left, width: startRect.width, height: startRect.height };
      this.anim.end = { top: targetRect.top, left: targetRect.left, width: targetRect.width, height: targetRect.height };
      this.anim.running = true;
      this.anim.toTarget = false;
      this.showAvatarPicker = false;
      this.$nextTick(() => requestAnimationFrame(() => { this.anim.toTarget = true; }));
    },
    onAnimEnd() {
      this.applyAvatarSelection();
      this.anim.running = false;
      this.anim.toTarget = false;
    },
   applyAvatarSelection() { this.currentAvatarIndex = this.selectedAvatarTemp; this.avatarSrc = this.avatarImages[this.currentAvatarIndex-1]; this.isAvatar1 = this.currentAvatarIndex === 1; this.isSwitchOn = false; try { const { setUserAvatar, setUserSwitchState } = require('@/services/userState.js');
        setUserAvatar(this.currentAvatarIndex);
        setUserSwitchState(false);
        
        setTimeout(() => {
          if (window && window.updateAppBackground) {
            window.updateAppBackground(false);
          }
        },100);
      } catch (e) { console.debug('Failed to save avatar via user state, using fallback', e); localStorage.setItem('kt_ui_off', '0'); const storedRaw = localStorage.getItem('kt_user'); if (storedRaw) { try { const obj = JSON.parse(storedRaw); obj.avatarIndex = this.currentAvatarIndex; localStorage.setItem('kt_user', JSON.stringify(obj)); }catch (fallbackError) { console.debug('Failed to persist avatarIndex', fallbackError); }
        }
        
        
       setTimeout(() => { if (window && window.updateAppBackground) { window.updateAppBackground(false); }
        },100);
      }
    },
    closeNamePopup() {
      this.showNamePopup = false;
    },
    async buyUsernameChange() {
      if (this.buyingUsernameChange) return;
      this.buyingUsernameChange = true;
      try {
        const { getCredits } = await import('@/services/credits.js');
        const currentCredits = await getCredits();
        if (currentCredits < 500) {
          alert('Not enough credits! You need 500 credits to change your username.');
          return;
        }
        const { purchaseUsernameChange } = require('@/services/userState.js');
        await purchaseUsernameChange();
        
        this.credits = await getCredits();
        const { getUsernameChangeInfo } = require('@/services/userState.js');
        const changeInfo = getUsernameChangeInfo();
        this.usernameChangeInfo = changeInfo;
        alert('Username change purchased! You can now change your username.');
      } catch (error) {
        console.error('Failed to purchase username change:', error);
        alert('Failed to purchase username change. Please try again.');
      } finally {
        this.buyingUsernameChange = false;
      }
    },
    validateName() {
      this.nameError = '';
      const u = String(this.nameInput || '').trim();
      if (!u) return;
      if (u.length < 3 || u.length > 12) this.nameError = 'Username must be 3-12 characters long';
      else if (!/^[A-Za-z0-9_]+$/.test(u)) this.nameError = 'Username can only contain letters, numbers, and underscores';
    },
    async submitName() {
      this.validateName();
      if (this.nameError) return;
      const u = String(this.nameInput || '').trim();
      if (!u) return;
      try {
        const { canChangeUsername, getUsernameChangeInfo } = require('@/services/userState.js');
        const info = getUsernameChangeInfo();
        
        if (info.maxChangesReached) {
          this.nameError = 'Maximum username changes reached (2/2). No more changes allowed.';
          return;
        }
        
        if (!canChangeUsername()) {
          this.nameError = 'You need to purchase a username change to change your name again.';
          return;
        }
      } catch (error) {
        console.debug('Failed to check username change permission: ', error);
      }

      try {
        const api = (await import('@/services/api')).default;
        const email = this.email || (JSON.parse(localStorage.getItem('kt_user')||'{}').email || '');
        await api.post('/api/update-username', { email, newUsername: u });
        
        try {
          const { markUsernameChanged, getUsernameChangeInfo } = require('@/services/userState.js');
          markUsernameChanged();
          
          const changeInfo = getUsernameChangeInfo();
          this.usernameChangeInfo = changeInfo;
        } catch (error) {
          console.debug('Failed to mark username change:', error);
        }

        const storedRaw = localStorage.getItem('kt_user');
        if (storedRaw) {
          const obj = JSON.parse(storedRaw);
          obj.username = u;
          localStorage.setItem('kt_user', JSON.stringify(obj));
        }
        this.username = u;
        this.showNamePopup = false;
        
        try {
          const { trackUsernameChange } = require('@/services/karmaTracker.js');
          trackUsernameChange();
        } catch (karmaError) {
          console.debug('Failed to track karma for username change:', karmaError);
        }
      } catch (error) {
        const msg = error.response?.data?.message || 'Failed to update username';
        this.nameError = msg;
      }
    },
   onToggleClick(e) { const rect = e.currentTarget.getBoundingClientRect(); const x = e.clientX - rect.left; const rightHalf = x >= rect.width / 2; const leftHalf = x < rect.width / 2; if (!this.isSwitchOn && leftHalf) { this.isSwitchOn = true; try { const { setUserSwitchState } = require('@/services/userState.js');
          setUserSwitchState(true);
        } catch (e) {
          localStorage.setItem('kt_ui_off', '1');
        }
        
        
       setTimeout(() => { if (window && window.updateAppBackground) { window.updateAppBackground(false); }
        },100);
        
      } else if (this.isSwitchOn && rightHalf) { this.isSwitchOn = false; try { const { setUserSwitchState } = require('@/services/userState.js');
          setUserSwitchState(false);
        } catch (e) {
          localStorage.setItem('kt_ui_off', '0');
        }
        
        
       setTimeout(() => { if (window && window.updateAppBackground) { window.updateAppBackground(false); }
        },100);
      }
    },
    onToggleLoaded(e) {
      if (!this.toggleHeight) {
        const h = Math.round(e.target.getBoundingClientRect().height);
        if (h > 0) this.toggleHeight = h;
      }
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@600;700;800&display=swap');
.popup-enter-active { animation: popupJump 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes popupJump { 0%{ transform: scale(0.2) translateY(-30px); opacity: 0; }
 50% { transform: scale(1.1) translateY(8px); opacity: 0.9; }
 70% { transform: scale(0.98) translateY(-3px); opacity: 1; }
 100% { transform: scale(1) translateY(0); opacity: 1; }
}
.avt-thumb { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.avt-thumb:hover { transform: translateY(-4px) scale(1.05); box-shadow: 0 10px 24px rgba(0,0,0,0.25); }

.winner-crown {
  animation: crownGlow 2s ease-in-out infinite alternate;
}

.winner-crown:hover {
  animation: crownSparkle 0.6s ease-in-out;
}

@keyframes crownGlow {
  0% { 
    filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3)) drop-shadow(0 0 8px rgba(255,215,0,0.4));
  }
  100% { 
    filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3)) drop-shadow(0 0 12px rgba(255,215,0,0.8));
  }
}

@keyframes crownSparkle {
  0% { transform: translateX(-70%) rotate(-15deg) scale(1); }
  25% { transform: translateX(-70%) rotate(-20deg) scale(1.15); }
  50% { transform: translateX(-70%) rotate(-10deg) scale(1.2); }
  75% { transform: translateX(-70%) rotate(-20deg) scale(1.15); }
  100% { transform: translateX(-70%) rotate(-15deg) scale(1.1); }
}

@keyframes celebrationFadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes celebrationBounce {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes crownGlow {
  0% { 
    filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));
    transform: scale(1);
  }
  100% { 
    filter: drop-shadow(0 0 30px rgba(255, 215, 0, 1));
    transform: scale(1.1);
  }
}
</style>
