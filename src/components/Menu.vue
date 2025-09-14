<template>
  <div class="menu-overlay" :style="overlayStyle" @click.stop>
    <button class="close-btn" :style="closeBtnStyle" @click="emitClose" aria-label="Close">×</button>

  <div class="menu-panel menu-bounce" :style="panelStyle" @click.stop>
      <ul :style="listStyle">
        <li v-for="(item, idx) in items" :key="idx" class="menu-item">
          <button 
            class="menu-link" 
            :class="{ 'special-link': item.special }"
            :style="item.special ? specialLinkStyle : linkStyle" 
            @click="onSelect(item)"
          >
            <span class="menu-text">{{ item.label }}</span>
            <span class="menu-underline" :style="item.special ? specialUnderlineStyle : {}"></span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MenuPopup',
  emits: ['close', 'select'],
  props: {
    anchorLeft: { type: Number, default: null },
    anchorTop: { type: Number, default: null },
    anchorSize: { type: Number, default: 84 },
  },
  computed: {
    items() {
      const isAdmin = this.checkAdminStatus();
      const isLoser = this.checkLoserStatus();
      const isWinner = this.checkWinnerStatus();
      const karmaPoints = this.checkKarmaPoints();
      
      if (isLoser) {
        return [
          { label: 'CONTACT', to: '/contact' }
        ];
      }
      
      const baseItems = [
        { label: 'PROFILE', to: '/profile' },
        { label: 'TEST MY LUCK', to: '/tml-intro' },
        { label: 'MY ITEMS', to: '/items-intro' },
        { label: 'MY POINTS', to: '/points' },
      ];
      
      if (isAdmin) {
        baseItems.push({ label: 'USERS', to: '/users' });
      } else if (isWinner) {
        baseItems.push({ label: 'LEADERBOARD', to: '/leaderboard' });
      } else {
        baseItems.push({ label: 'CONTACT', to: '/contact' });
      }
      
      if (karmaPoints < 500 && !isWinner) {
        baseItems.push({ label: 'RESET PROGRESS', action: 'reset', special: true });
      }
      
      return baseItems;
    },
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
    panelStyle() {
      return {
  width: 'min(88vw, 300px)',
        background: '#ffd200',
        border: '3px solid #111',
        borderRadius: '14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
  padding: '0 20px',
  minHeight: '200px',
  height: 'min(70vh, 520px)'
      };
    },
    listStyle() {
      return {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        height: '100%',
      };
    },
    linkStyle() {
      return {
        width: '100%',
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        color: '#222',
        fontSize: '25px',
        fontWeight: 600,
        letterSpacing: '0.5px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      };
    },
    specialLinkStyle() {
      return {
        ...this.linkStyle,
        color: '#d32f2f',
        fontSize: '22px',
        fontWeight: 700,
      };
    },
    specialUnderlineStyle() {
      return {
        background: '#d32f2f !important',
      };
    },
    closeBtnStyle() {
      const size = Math.max(32, Math.round((this.anchorSize || 44) * 0.85));
      const left = this.anchorLeft == null ? '50%' : `${this.anchorLeft}px`;
      const top = this.anchorTop == null ? 'calc(50% - 170px)' : `${this.anchorTop}px`;
      return {
        position: 'fixed',
        top,
        left,
        transform: this.anchorLeft == null ? 'translate(-50%, -50%)' : 'translate(-50%, -50%)',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        border: '3px solid #111',
        background: '#fff',
        color: '#111',
        fontSize: `${Math.round(size * 0.6)}px`,
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 1001,
      };
    },
  },
  methods: {
    checkAdminStatus() {
      try {
        const userData = localStorage.getItem('kt_user');
        if (!userData) return false;
        
        const user = JSON.parse(userData);
        return user.isAdmin === true;
      } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
    },
    checkLoserStatus() {
      try {
        const userData = localStorage.getItem("kt_user");
        if (!userData) return false;
        const user = JSON.parse(userData);
        if (!user || !user.email) return false;

        if (user.isLoser === true) {
          console.log("User is marked as loser in user data");
          return true;
        }

        return false;
      } catch (error) {
        console.error("Error checking loser status:", error);
        return false;
      }
    },
    checkKarmaPoints() {
      try {
        const userData = localStorage.getItem("kt_user");
        if (!userData) return 0;
        const user = JSON.parse(userData);
        if (!user || !user.email) return 0;

        const safeEmail = user.email.toLowerCase().replace(/[^a-z0-9@._-]/g, "");
        const stateKey = `kt_state_${safeEmail}`;
        const stateData = localStorage.getItem(stateKey);
        
        if (!stateData) return 0;
        
        const userState = JSON.parse(stateData);
        return userState.karmaPoints || 0;
      } catch (error) {
        console.error("Error checking karma points:", error);
        return 0;
      }
    },
    checkWinnerStatus() {
      try {
        const userData = localStorage.getItem('kt_user');
        if (!userData) return false;
        
        const user = JSON.parse(userData);
        return user.isWinner === true;
      } catch (error) {
        console.error('Error checking winner status:', error);
        return false;
      }
    },
    emitClose() { this.$emit('close'); },
    onSelect(item) { this.$emit('select', item); },
  },
  mounted() {
    this.handleStatusUpdate = () => {
      // Force reactivity update by triggering a re-render
      this.$forceUpdate();
    };
    
    window.addEventListener('userStatusUpdated', this.handleStatusUpdate);
  },
  beforeUnmount() {
    // Clean up event listener
    if (this.handleStatusUpdate) {
      window.removeEventListener('userStatusUpdated', this.handleStatusUpdate);
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=swap');

.menu-link { position: relative; transition: color 0.2s ease, text-shadow 0.2s ease; cursor: pointer; }
.menu-text { text-transform: uppercase; font-family: 'Inter', system-ui, sans-serif; line-height: 1.2; display: inline-block; }
.menu-underline {
  content: '';
  position: relative;
  display: block;
  width: 86%;
  height: 4px; 
  margin-top: 8px;
  background: #111;
  opacity: 0;
  transform-origin: center;
  transform: scaleX(0);
  will-change: transform;
  transition: transform 300ms ease, opacity 300ms ease;
}
.menu-link:hover .menu-text {
  font-weight: 800;
  text-shadow: 0 1px 0 rgba(0,0,0,0.25);
}
.menu-link:hover .menu-underline {
  opacity: 1;
  transform: scaleX(1);
  box-shadow: 0 2px 0 rgba(0,0,0,0.25);
}
.menu-link:focus-visible .menu-underline { opacity: 1; transform: scaleX(1); }
.close-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; }
.close-btn:hover { transform: translate(-50%, -50%) scale(1.05); box-shadow: 0 2px 10px rgba(0,0,0,0.2); }

.menu-link.special-link {
  color: #d32f2f !important;
  font-size: 22px !important;
  font-weight: 700 !important;
}

.menu-link.special-link .menu-underline {
  background: #d32f2f !important;
}

.menu-link.special-link:hover .menu-text {
  color: #b71c1c !important;
  text-shadow: 0 1px 0 rgba(183, 28, 28, 0.25) !important;
}

.menu-bounce { animation: menuBounceIn 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes menuBounceIn {
  0%   { transform: scale(0.85); opacity: 0; }
  60%  { transform: scale(1.05); opacity: 1; }
  80%  { transform: scale(0.98); }
  100% { transform: scale(1); }
}
</style>
