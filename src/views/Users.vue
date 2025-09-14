<template>
  <div :style="containerStyle">
    <div :style="headerStyle">
      <h1 :style="titleStyle">ADMIN PANEL</h1>
      <div :style="headerButtonsStyle">
        <button 
          :style="cleanupButtonStyle"
          @click="cleanupOrphanedRecords"
          @mouseenter="cleanupHovered = true"
          @mouseleave="cleanupHovered = false"
        >
          CLEANUP
        </button>
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
      <div :style="topRowStyle">
        <div :style="compactSectionStyle">
          <h2 :style="compactSectionTitleStyle">USERS</h2>
          <div :style="compactListContainerStyle">
            <div 
              v-if="users.length === 0" 
              :style="emptyStateStyle"
            >
              No users found
            </div>
            <div 
              v-for="user in users" 
              :key="user._id"
              :style="[userItemStyle, { cursor: 'pointer' }]"
              @click="selectUser(user, 'user')"
            >
              <div :style="userEmailStyle">{{user.email}}</div>
              <div :style="userInfoStyle">
                <span><strong>Username:</strong> {{user.username}}</span>
                <span><strong>Created:</strong> {{formatDate(user.createdAt)}}</span>
                <span><strong>User ID:</strong> {{user._id}}</span>
              </div>
              
              <div v-if="selectedUser && selectedUser._id === user._id" :style="actionButtonsStyle">
                <button :style="promoteButtonStyle" @click.stop="promoteUser(user)">
                  PROMOTE
                </button>
                <button :style="demoteButtonStyle" @click.stop="demoteUser(user)">
                  DEMOTE
                </button>
                <button :style="deleteButtonStyle" @click.stop="deleteUser(user)">
                  DELETE
                </button>
              </div>
            </div>
          </div>
        </div>

        <div :style="compactSectionStyle">
          <h2 :style="compactSectionTitleStyle">WINNERS</h2>
          <div :style="compactListContainerStyle">
            <div 
              v-if="winners.length === 0" 
              :style="emptyStateStyle"
            >
              No winners yet
            </div>
            <div 
              v-for="winner in winners" 
              :key="winner._id"
              :style="[winnerItemStyle, { cursor: 'pointer' }]"
              @click="selectUser(winner, 'winner')"
            >
              <div :style="userEmailStyle">{{winner.email}}</div>
              <div :style="prizeInfoStyle">
                <span><strong>Username:</strong> {{winner.username}}</span>
                <span><strong>Promoted:</strong> {{formatDate(winner.promotedAt)}}</span>
                <span><strong>Promoted by:</strong> {{winner.promotedBy || 'System'}}</span>
                <span v-if="winner.reason"><strong>Reason:</strong> {{winner.reason}}</span>
              </div>
              
              <div v-if="selectedUser && selectedUser._id === winner._id" :style="actionButtonsStyle">
                <button :style="demoteButtonStyle" @click.stop="demoteToUser(winner)">
                  DEMOTE
                </button>
                <button :style="deleteButtonStyle" @click.stop="deleteUser(winner)">
                  DELETE
                </button>
                <button :style="promoteButtonStyle" @click.stop="promoteToAdmin(winner)">
                  PROMOTE TO ADMIN
                </button>
              </div>
            </div>
          </div>
        </div>

        <div :style="compactSectionStyle">
          <h2 :style="compactSectionTitleStyle">LOSERS</h2>
          <div :style="compactListContainerStyle">
            <div 
              v-if="losers.length === 0" 
              :style="emptyStateStyle"
            >
              No losers yet
            </div>
            <div 
              v-for="loser in losers" 
              :key="loser._id"
              :style="[loserItemStyle, { cursor: 'pointer' }]"
              @click="selectUser(loser, 'loser')"
            >
              <div :style="userEmailStyle">{{loser.email}}</div>
              <div :style="lossInfoStyle">
                <span><strong>Username:</strong> {{loser.username}}</span>
                <span><strong>Became loser:</strong> {{formatDate(loser.loserTimestamp)}}</span>
                <span><strong>Reason:</strong> {{loser.loserReason || 'System'}}</span>
                <span v-if="loser.karmaPoints"><strong>Karma:</strong> {{loser.karmaPoints}}</span>
                <span v-if="loser.credits"><strong>Credits:</strong> {{loser.credits}}</span>
              </div>
              
              <div v-if="selectedUser && selectedUser._id === loser._id" :style="actionButtonsStyle">
                <button :style="promoteButtonStyle" @click.stop="promoteToUser(loser)">
                  PROMOTE
                </button>
                <button :style="deleteButtonStyle" @click.stop="deleteUser(loser)">
                  DELETE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div :style="bottomRowStyle">
        <div :style="leaderboardSectionStyle">
          <h2 :style="leaderboardTitleStyle">🏆 LEADERBOARD</h2>
          <div :style="leaderboardContainerStyle">
            <div 
              v-if="leaderboard.length === 0" 
              :style="emptyStateStyle"
            >
              No leaderboard data yet
            </div>
            <div 
              v-for="entry in leaderboard" 
              :key="entry._id"
              :style="leaderboardItemStyle"
            >
              <div :style="rankStyle">
                #{{ entry.rank }}
              </div>
              <div :style="leaderboardUserInfoStyle">
                <div :style="userEmailStyle"> {{ entry.email }}</div>
                <div :style="leaderboardStatsStyle">
                  <span><strong>Username:</strong> {{ entry.username }}</span>
                  <span><strong>Credits:</strong> {{ entry.credits }}</span>
                  <span><strong>Promoted:</strong> {{ formatDate(entry.promotedAt) }}</span>
                  <span><strong>By:</strong> {{ entry.promotedBy || 'System' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" :style="loadingOverlayStyle">
      <div :style="loadingTextStyle">Loading...</div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'AdminUsers',
  emits: ['close'],
  data() {
    return {
      users: [],
      winners: [],
      losers: [],
      leaderboard: [],
      loading: true,
      backHovered: false,
      cleanupHovered: false,
      selectedUser: null,
      selectedType: null
    }
  },
  async mounted() {
    await this.loadAllData();
    
    this.handleCreditsUpdate = () => {
      console.log('Credits updated, refreshing admin leaderboard...');
      this.createLeaderboard();
    };
    
    window.addEventListener('creditsUpdated', this.handleCreditsUpdate);
  },

  beforeUnmount() {
    // Clean up event listener
    if (this.handleCreditsUpdate) {
      window.removeEventListener('creditsUpdated', this.handleCreditsUpdate);
    }
  },
  methods: {
    async loadAllData() {
      try {
        this.loading = true;
        console.log('Loading admin data...');
        const [usersResponse, winnersResponse] = await Promise.all([
          api.get('/api/admin/users'),
          api.get('/api/admin/winners')
        ]);
        console.log('Users response: ', usersResponse.data);
        console.log('Winners response: ', winnersResponse.data);
        
        const allUsers = usersResponse.data || [];
        
        this.users = allUsers;
        
        this.losers = allUsers.filter(user => user.isLoser === true);
        this.winners = winnersResponse.data || [];
        
        this.createLeaderboard();
        console.log('Final data loaded: ', {
          users: this.users.length,
          winners: this.winners.length,
          losers: this.losers.length,
          leaderboard: this.leaderboard.length
        });
      } catch (error) {
        console.error('Error loading admin data: ', error);
        console.error('Full error details: ', error.response?.data || error.message);
      } finally {
        this.loading = false;
      }
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
    },
    emitClose() {
      this.$emit('close');
    },
    selectUser(user, type) {
      if (this.selectedUser && this.selectedUser._id === user._id) {
        this.selectedUser = null;
        this.selectedType = null;
      } else {
        this.selectedUser = user;
        this.selectedType = type;
      }
    },
    async promoteUser(user) {
      if (!confirm(`Are you sure you want to promote ${user.email} to winner? This will move them from users to winners.`)) {
        return;
      }
      
      try {
        await api.post('/api/admin/promote-winner', {
          email: user.email,
          adminEmail: 'admin@gmail.com',
          reason: 'Promoted via admin panel'
        });
        
        await this.loadAllData();
        this.selectedUser = null;
        console.log('User promoted successfully');
      } catch (error) {
        console.error('Error promoting user: ', error);
        alert('Error promoting user: ' + (error.response?.data?.message || error.message));
      }
    },
    async demoteUser(user) {
      if (!confirm(`Are you sure you want to demote ${user.email} to loser? This will move them from users to losers.`)) {
        return;
      }
      
      try {
        await api.post('/api/admin/demote-loser', {
          email: user.email,
          adminEmail: 'admin@gmail.com',
          reason: 'Demoted via admin panel'
        });
        
        await this.loadAllData();
        this.selectedUser = null;
        console.log('User demoted successfully');
      } catch (error) {
        console.error('Error demoting user: ', error);
        alert('Error demoting user: ' + (error.response?.data?.message || error.message));
      }
    },
    async demoteToUser(winner) {
      if (!confirm(`Are you sure you want to demote ${winner.email} from winner to regular user? This will move them from winners to users.`)) {
        return;
      }
      
      try {
        await api.post('/api/admin/demote-to-user', {
          email: winner.email,
          adminEmail: 'admin@gmail.com',
          reason: 'Demoted to regular user via admin panel'
        });
        
        await this.loadAllData();
        this.selectedUser = null;
        console.log('Winner demoted to user successfully');
      } catch (error) {
        console.error('Error demoting winner to user: ', error);
        alert('Error demoting winner: ' + (error.response?.data?.message || error.message));
      }
    },
    async promoteToUser(loser) {
      if (!confirm(`Are you sure you want to promote ${loser.email} from loser to regular user? This will move them from losers to users.`)) {
        return;
      }
      
      try {
        await api.post('/api/admin/promote-to-user', {
          email: loser.email,
          adminEmail: 'admin@gmail.com',
          reason: 'Promoted to regular user via admin panel'
        });
        
        await this.loadAllData();
        this.selectedUser = null;
        console.log('Loser promoted to user successfully');
      } catch (error) {
        console.error('Error promoting loser to user: ', error);
        alert('Error promoting loser: ' + (error.response?.data?.message || error.message));
      }
    },
    async deleteUser(user) {
      if (!confirm(`Are you sure you want to delete user ${user.email}? This action cannot be undone.`)) {
        return;
      }
      
      try {
        await api.delete('/api/admin/delete-user', {
          data: {
            email: user.email,
            adminEmail: 'admin@gmail.com'
          }
        });
        
        await this.loadAllData();
        this.selectedUser = null;
        console.log('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user: ', error);
        alert('Error deleting user: ' + (error.response?.data?.message || error.message));
      }
    },
    async promoteToAdmin(winner) {
      if (!confirm(`Are you sure you want to promote ${winner.email} to admin? This will give them administrative privileges.`)) {
        return;
      }
      
      try {
        await api.post('/api/admin/promote-to-admin', {
          email: winner.email,
          adminEmail: 'admin@gmail.com',
          reason: 'Promoted to admin via admin panel'
        });
        
        await this.loadAllData();
        this.selectedUser = null;
        console.log('Winner promoted to admin successfully');
      } catch (error) {
        console.error('Error promoting to admin: ', error);
        alert('Error promoting to admin: ' + (error.response?.data?.message || error.message));
      }
    },
    async cleanupOrphanedRecords() {
      if (!confirm('Are you sure you want to cleanup orphaned records? This will remove winners and losers that no longer have corresponding user accounts. This action cannot be undone.')) {
        return;
      }
      
      try {
        this.loading = true;
        const response = await api.post('/api/admin/cleanup-all-orphaned');
        await this.loadAllData();
        alert(`Cleanup completed successfully!\n\n${response.data.message}\n\nRemoved Winners: ${response.data.report.winners.removed}\nRemoved Losers: ${response.data.report.losers.removed}`);
        
        console.log('Cleanup completed:', response.data);
      } catch (error) {
        console.error('Error during cleanup: ', error);
        alert('Error during cleanup: ' + (error.response?.data?.message || error.message));
      } finally {
        this.loading = false;
      }
    },
    createLeaderboard() {
      const leaderboardData = this.winners.map(winner => {
        const safeEmail = winner.email.toLowerCase().replace(/[^a-z0-9@._-]/g, "");
        const stateKey = `kt_state_${safeEmail}`;
        
        let credits = 1100;
        
        try {
          const userState = localStorage.getItem(stateKey);
          if (userState) {
            const parsedState = JSON.parse(userState);
            credits = parsedState.credits || 1100;
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
        
        return { ...winner, credits: credits, rank: 0 };
      });
      
      this.leaderboard = leaderboardData
        .sort((a, b) => b.credits - a.credits)
        .map((winner, index) => ({ ...winner, rank: index + 1 }));
        
      console.log('Leaderboard created with winners and real credits:', this.leaderboard);
    }
  },
  computed: { containerStyle(){ return{ minHeight: '100vh', width: '100vw', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', boxSizing: 'border-box', fontFamily: "'Inter', system-ui, sans-serif" } },
   headerStyle() { return{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '0 10px' } },
   headerButtonsStyle() { return{ display: 'flex', gap: '10px', alignItems: 'center' } },
   titleStyle() { return{ color: '#fff', fontSize: '32px', fontWeight: '800', margin: '0', textShadow: '0 2px 4px rgba(0,0,0,0.3)' } },
   backButtonStyle() { return{ background: this.backHovered ? '#fff': 'rgba(255,255,255,0.9)', color: this.backHovered ? '#667eea': '#333', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', transform: this.backHovered ? 'translateY(-2px)': 'translateY(0)', boxShadow: this.backHovered ? '0 6px 20px rgba(0,0,0,0.25)': '0 2px 10px rgba(0,0,0,0.15)' } },
   cleanupButtonStyle() { return{ background: this.cleanupHovered ? '#ff6b6b': 'rgba(255, 107, 107, 0.9)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', transform: this.cleanupHovered ? 'translateY(-2px)': 'translateY(0)', boxShadow: this.cleanupHovered ? '0 6px 20px rgba(255, 107, 107, 0.4)': '0 2px 10px rgba(255, 107, 107, 0.2)', textTransform: 'uppercase', letterSpacing: '0.5px' } },
   contentStyle() { return{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '1600px', margin: '0 auto', height: 'calc(100vh - 160px)', padding: '10px 20px 20px 20px' } },
   topRowStyle() { return{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', height: '35vh', minHeight: '250px', maxHeight: '300px' } },
   bottomRowStyle() { return{ display: 'flex', justifyContent: 'center', height: 'calc(60vh - 160px)', minHeight: '250px', maxHeight: '400px', marginTop: '20px' } },
   compactSectionStyle() { return{ background: 'rgba(255,255,255,0.95)', borderRadius: '12px', padding: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '100%', overflow: 'hidden' } },
   compactSectionTitleStyle() { return{ color: '#333', fontSize: '14px', fontWeight: '700', margin: '0 0 10px 0', textAlign: 'center', borderBottom: '2px solid #667eea', paddingBottom: '6px', flexShrink: 0 } },
   compactListContainerStyle() { return{ flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'thin', scrollbarColor: '#667eea rgba(0,0,0,0.1)', paddingRight: '5px', minHeight: 0 } },
   leaderboardSectionStyle() { return{ background: 'rgba(255,255,255,0.95)', borderRadius: '12px', padding: '15px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', width: '70%', maxWidth: '800px', height: '100%', maxHeight: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' } },
   leaderboardTitleStyle() { return{ color: '#333', fontSize: '16px', fontWeight: '700', margin: '0 0 12px 0', textAlign: 'center', borderBottom: '2px solid #ffc107', paddingBottom: '8px', flexShrink: 0 } },
   leaderboardContainerStyle() { return{ flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'thin', scrollbarColor: '#ffc107 rgba(0,0,0,0.1)', paddingRight: '5px', minHeight: 0 } },
   sectionStyle() { return{ background: 'rgba(255,255,255,0.95)', borderRadius: '12px', padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' } },
   sectionTitleStyle() { return{ color: '#333', fontSize: '20px', fontWeight: '700', margin: '0 0 20px 0', textAlign: 'center', borderBottom: '2px solid #667eea', paddingBottom: '10px' } },
   listContainerStyle() { return{ maxHeight: '400px', overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'thin', scrollbarColor: '#667eea rgba(0,0,0,0.1)' } },
   emptyStateStyle() { return{ textAlign: 'center', color: '#666', padding: '40px 20px', fontSize: '16px', fontStyle: 'italic' } },
   userItemStyle() { return{ background: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '8px', padding: '12px', marginBottom: '8px', transition: 'all 0.2s ease', fontSize: '13px' } },
   winnerItemStyle() { return{ background: 'rgba(46, 160, 67, 0.05)', border: '1px solid rgba(46, 160, 67, 0.2)', borderRadius: '8px', padding: '12px', marginBottom: '8px', transition: 'all 0.2s ease', fontSize: '13px' } },
   loserItemStyle() { return{ background: 'rgba(220, 53, 69, 0.05)', border: '1px solid rgba(220, 53, 69, 0.2)', borderRadius: '8px', padding: '12px', marginBottom: '8px', transition: 'all 0.2s ease', fontSize: '13px' } },
   userEmailStyle() { return{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '4px' } },
   userInfoStyle() { return{ fontSize: '12px', color: '#666', display: 'flex', flexDirection: 'column', gap: '2px' } },
   prizeInfoStyle() { return{ fontSize: '12px', color: '#2ea043', display: 'flex', flexDirection: 'column', gap: '2px', fontWeight: '500' } },
   lossInfoStyle() { return{ fontSize: '12px', color: '#dc3545', display: 'flex', flexDirection: 'column', gap: '2px', fontWeight: '500' } },
   loadingOverlayStyle() { return{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 } },
   loadingTextStyle() { return{ color: '#fff', fontSize: '20px', fontWeight: '600' } },
   actionButtonsStyle() { return{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' } },
   promoteButtonStyle() { return{ background: 'linear-gradient(135deg, #2ea043, #28a745)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '5px', fontSize: '10px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', textTransform: 'uppercase', letterSpacing: '0.5px' } },
   demoteButtonStyle() { return{ background: 'linear-gradient(135deg, #ffc107, #fd7e14)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '5px', fontSize: '10px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', textTransform: 'uppercase', letterSpacing: '0.5px' } },
   deleteButtonStyle() { return{ background: 'linear-gradient(135deg, #dc3545, #c82333)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '5px', fontSize: '10px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', textTransform: 'uppercase', letterSpacing: '0.5px' } },
   leaderboardItemStyle() { return{ background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08), rgba(255, 193, 7, 0.03))', border: '1px solid rgba(255, 193, 7, 0.3)', borderRadius: '10px', padding: '12px 15px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.3s ease', boxShadow: '0 3px 10px rgba(255, 193, 7, 0.1)', color: '#333' } },
   rankStyle() { return{ background: 'linear-gradient(135deg, #ffc107, #fd7e14)', color: '#fff', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', flexShrink: 0, boxShadow: '0 4px 12px rgba(255, 193, 7, 0.4)' } },
   leaderboardUserInfoStyle() { return{ flex: 1 } },
   leaderboardStatsStyle() { return{ fontSize: '14px', color: '#666', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' } } } }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.listContainerStyle::-webkit-scrollbar,
.compactListContainerStyle::-webkit-scrollbar,
.leaderboardContainerStyle::-webkit-scrollbar {
  width: 6px;
}

.listContainerStyle::-webkit-scrollbar-track,
.compactListContainerStyle::-webkit-scrollbar-track,
.leaderboardContainerStyle::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 3px; }

.listContainerStyle::-webkit-scrollbar-thumb,
.compactListContainerStyle::-webkit-scrollbar-thumb { background: #667eea; border-radius: 3px; }

.leaderboardContainerStyle::-webkit-scrollbar-thumb { background: #ffc107; border-radius: 3px; }

.listContainerStyle::-webkit-scrollbar-thumb:hover,
.compactListContainerStyle::-webkit-scrollbar-thumb:hover { background: #5a67d8; }

.leaderboardContainerStyle::-webkit-scrollbar-thumb:hover { background: #e0a800; }

.userItemStyle:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2); }

.winnerItemStyle:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(46, 160, 67, 0.2); }

.loserItemStyle:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2); }

.leaderboardItemStyle:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3); }

button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
</style>