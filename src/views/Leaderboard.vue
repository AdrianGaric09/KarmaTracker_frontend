<template>
  <div :style="containerStyle">
    <div :style="headerStyle">
      <h1 :style="titleStyle">🏆 LEADERBOARD</h1>
      <div :style="headerButtonsStyle">
        <button 
          :style="backButtonStyle"
          @click="emitClose"
          @mouseenter="backHovered = true"
          @mouseleave="backHovered = false"
        >
          BACK
        </button>
      </div>
    </div>

    <div :style="contentStyle">
      <div :style="leaderboardSectionStyle">
        <div :style="leaderboardContainerStyle">
          <div 
            v-if="loading" 
            :style="emptyStateStyle"
          >
            Loading leaderboard...
          </div>
          
          <div 
            v-else-if="leaderboard.length === 0" 
            :style="emptyStateStyle"
          >
            No users found
          </div>
          
          <div 
            v-else
            v-for="(user, index) in leaderboard" 
            :key="user._id"
            :style="leaderboardItemStyle"
          >
            <div :style="rankStyle">
              #{{ index + 1 }}
            </div>
            <div :style="leaderboardUserInfoStyle">
              <div :style="userEmailStyle">{{ user.email }}</div>
              <div :style="leaderboardStatsStyle">
                <span><strong>Username:</strong> {{ user.username || 'Anonymous' }}</span>
                <span><strong>Credits:</strong> {{ user.credits || 0 }}</span>
                <span><strong>Karma:</strong> {{ user.karmaPoints || 0 }}</span>
                <span><strong>Promoted:</strong> {{ formatDate(user.promotedAt) }}</span>
                <span><strong>By:</strong> {{ user.promotedBy || 'System' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'LeaderboardPage',
  emits: ['close'],
  
  data() {
    return {
      leaderboard: [],
      loading: true,
      backHovered: false
    };
  },

  computed: {
    containerStyle() { 
      return { 
        minHeight: '100vh', 
        width: '100vw', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '20px', 
        boxSizing: 'border-box', 
        fontFamily: "'Inter', system-ui, sans-serif" 
      } 
    },
    headerStyle() { 
      return { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px', 
        padding: '0 10px' 
      } 
    },
    headerButtonsStyle() { 
      return { 
        display: 'flex', 
        gap: '10px', 
        alignItems: 'center' 
      } 
    },
    titleStyle() { 
      return { 
        color: '#fff', 
        fontSize: '32px', 
        fontWeight: '800', 
        margin: '0', 
        textShadow: '0 2px 4px rgba(0,0,0,0.3)' 
      } 
    },
    backButtonStyle() { 
      return { 
        background: this.backHovered ? '#fff': 'rgba(255,255,255,0.9)', 
        color: this.backHovered ? '#667eea': '#333', 
        border: 'none', 
        padding: '12px 24px', 
        borderRadius: '8px', 
        fontSize: '16px', 
        fontWeight: '600', 
        cursor: 'pointer', 
        transition: 'all 0.2s ease', 
        transform: this.backHovered ? 'translateY(-2px)': 'translateY(0)', 
        boxShadow: this.backHovered ? '0 6px 20px rgba(0,0,0,0.25)': '0 2px 10px rgba(0,0,0,0.15)' 
      } 
    },
    contentStyle() { 
      return { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '15px', 
        maxWidth: '1600px', 
        margin: '0 auto', 
        height: 'calc(100vh - 160px)', 
        padding: '10px 20px 20px 20px' 
      } 
    },
    leaderboardSectionStyle() { 
      return { 
        background: 'rgba(255,255,255,0.95)', 
        borderRadius: '12px', 
        padding: '15px', 
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)', 
        backdropFilter: 'blur(10px)', 
        border: '1px solid rgba(255,255,255,0.2)', 
        width: '70%', 
        maxWidth: '800px', 
        height: '100%', 
        maxHeight: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        margin: '0 auto'
      } 
    },
    leaderboardContainerStyle() { 
      return { 
        flex: 1, 
        overflowY: 'auto', 
        overflowX: 'hidden', 
        scrollbarWidth: 'thin', 
        scrollbarColor: '#ffc107 rgba(0,0,0,0.1)', 
        paddingRight: '5px', 
        minHeight: 0 
      } 
    },
    emptyStateStyle() { 
      return { 
        textAlign: 'center', 
        color: '#666', 
        padding: '40px 20px', 
        fontSize: '16px', 
        fontStyle: 'italic' 
      } 
    },
    leaderboardItemStyle() { 
      return { 
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08), rgba(255, 193, 7, 0.03))', 
        border: '1px solid rgba(255, 193, 7, 0.3)', 
        borderRadius: '10px', 
        padding: '12px 15px', 
        marginBottom: '8px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        transition: 'all 0.3s ease', 
        boxShadow: '0 3px 10px rgba(255, 193, 7, 0.1)', 
        color: '#333' 
      } 
    },
    rankStyle() { 
      return { 
        background: 'linear-gradient(135deg, #ffc107, #fd7e14)', 
        color: '#fff', 
        width: '50px', 
        height: '50px', 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: '18px', 
        fontWeight: '800', 
        flexShrink: 0, 
        boxShadow: '0 4px 12px rgba(255, 193, 7, 0.4)' 
      } 
    },
    leaderboardUserInfoStyle() { 
      return { 
        flex: 1 
      } 
    },
    userEmailStyle() { 
      return { 
        fontSize: '14px', 
        fontWeight: '600', 
        color: '#333', 
        marginBottom: '4px' 
      } 
    },
    leaderboardStatsStyle() { 
      return { 
        fontSize: '14px', 
        color: '#666', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '4px', 
        marginTop: '6px' 
      } 
    }
  },

  methods: {
    async loadLeaderboard() {
      try {
        this.loading = true;
        console.log('Loading leaderboard...');
        
        const response = await api.get('/api/admin/winners');
        const winners = response.data || [];
        
        const eligibleUsers = winners.map(winner => {
            const safeEmail = winner.email.toLowerCase().replace(/[^a-z0-9@._-]/g, "");
            const stateKey = `kt_state_${safeEmail}`;
            
            let credits = winner.credits || 1100;
            
            try {
              const userState = localStorage.getItem(stateKey);
              if (userState) {
                const parsedState = JSON.parse(userState);
                credits = parsedState.credits || winner.credits || 1100;
              } else {
                const currentUser = localStorage.getItem('kt_user');
                if (currentUser) {
                  const parsedUser = JSON.parse(currentUser);
                  if (parsedUser.email === winner.email && typeof parsedUser.credits === 'number') {
                    credits = parsedUser.credits;
                  }
                }
              }
            } catch (error) {
              console.error('Error reading credits for', winner.email, error);
            }
            
            return { ...winner, credits: credits };
          })
          .sort((a, b) => (b.credits || 0) - (a.credits || 0));
        
        this.leaderboard = eligibleUsers;
        console.log('Leaderboard loaded with real-time credits:', this.leaderboard.length, 'users');
        
      } catch (error) {
        console.error('Error loading leaderboard:', error);
        this.leaderboard = [];
      } finally {
        this.loading = false;
      }
    },

    refreshLeaderboard() {
      this.loadLeaderboard();
    },

    emitClose() {
      this.$emit('close');
    },

    formatDate(timestamp) {
      if (!timestamp) return 'Unknown';
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  },

  mounted() {
    this.loadLeaderboard();
    
    this.handleCreditsUpdate = () => {
      console.log('Credits updated, refreshing leaderboard...');
      this.refreshLeaderboard();
    };
    
    window.addEventListener('creditsUpdated', this.handleCreditsUpdate);
  },

  beforeUnmount() {
    if (this.handleCreditsUpdate) {
      window.removeEventListener('creditsUpdated', this.handleCreditsUpdate);
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.leaderboardContainerStyle::-webkit-scrollbar {
  width: 6px;
}

.leaderboardContainerStyle::-webkit-scrollbar-track { 
  background: rgba(0,0,0,0.1); 
  border-radius: 3px; 
}

.leaderboardContainerStyle::-webkit-scrollbar-thumb { 
  background: #ffc107; 
  border-radius: 3px; 
}

.leaderboardContainerStyle::-webkit-scrollbar-thumb:hover { 
  background: #e0a800; 
}

.leaderboardItemStyle:hover { 
  transform: translateY(-3px); 
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3); 
}

button:hover { 
  transform: translateY(-2px); 
  box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
}
</style>
