<template>
  <div class="admin-dashboard">
    <AdminHeader />

    <main class="admin-main">
      <div class="page-header">
        <h2>Dashboard Administrativo</h2>
        <p>Gerencie times, jogadores, jogos e apostas</p>
      </div>

      <!-- Stats Bar -->
      <div class="stats-bar-premium">
        <div class="stat-block-premium">
          <div class="stat-icon-premium">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="stat-content-premium">
            <strong class="stat-value-premium">{{ stats.teams }}</strong>
            <p class="stat-label-premium">Times Cadastrados</p>
          </div>
        </div>
        <div class="stat-divider-premium"></div>
        <div class="stat-block-premium">
          <div class="stat-icon-premium">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="stat-content-premium">
            <strong class="stat-value-premium">{{ stats.players }}</strong>
            <p class="stat-label-premium">Jogadores</p>
          </div>
        </div>
        <div class="stat-divider-premium"></div>
        <div class="stat-block-premium">
          <div class="stat-icon-premium">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="stat-content-premium">
            <strong class="stat-value-premium">{{ stats.scheduledGames }}</strong>
            <p class="stat-label-premium">Jogos Agendados</p>
          </div>
        </div>
        <div class="stat-divider-premium"></div>
        <div class="stat-block-premium">
          <div class="stat-icon-premium" style="color: var(--accent-secondary);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="stat-content-premium">
            <strong class="stat-value-premium" style="color: var(--accent-secondary);">{{ stats.pendingBets }}</strong>
            <p class="stat-label-premium">Apostas Pendentes</p>
          </div>
        </div>
        <div class="stat-divider-premium"></div>
        <div class="stat-block-premium">
          <div class="stat-icon-premium" :style="{ color: stats.houseProfit >= 0 ? '#00ff88' : '#ff7b9a' }">
            <svg v-if="stats.houseProfit >= 0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </div>
          <div class="stat-content-premium">
            <strong 
              class="stat-value-premium" 
              :style="{ color: stats.houseProfit >= 0 ? '#00ff88' : '#ff7b9a' }"
            >
              {{ formatCurrency(stats.houseProfit) }}
            </strong>
            <p class="stat-label-premium">
              {{ stats.houseProfit >= 0 ? 'Lucro da Casa' : 'Prejuízo da Casa' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Actions Premium -->
      <div class="quick-actions-premium">
        <div class="section-header">
          <h3>Ações Rápidas</h3>
          <p>Acesso rápido às principais funcionalidades</p>
        </div>
        <div class="actions-grid-premium">
          <RouterLink to="/panel/games" class="action-card-premium action-card-large"
            style="--action-color: #00ff88; grid-column: 1 / 3; grid-row: 1 / 3;">
            <div class="action-icon-wrapper">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <div class="action-content">
              <span class="action-label-premium">Criar Jogo</span>
            </div>
          </RouterLink>

          <RouterLink to="/panel/teams" class="action-card-premium"
            style="--action-color: var(--accent-primary); grid-column: 3; grid-row: 1;">
            <div class="action-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div class="action-content">
              <span class="action-label-premium">Criar Time</span>
            </div>
          </RouterLink>

          <RouterLink to="/panel/players" class="action-card-premium action-card-small"
            style="--action-color: #0F4F3F; grid-column: 4; grid-row: 1;">
            <div class="action-icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="action-content">
              <span class="action-label-premium">Adicionar Jogador</span>
            </div>
          </RouterLink>

          <RouterLink to="/panel/odds" class="action-card-premium"
            style="--action-color: #ff7b9a; grid-column: 3; grid-row: 2;">
            <div class="action-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="2" x2="12" y2="22"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div class="action-content">
              <span class="action-label-premium">Configurar Odds</span>
            </div>
          </RouterLink>

          <RouterLink to="/panel/close-game" class="action-card-premium"
            style="--action-color: #ffc107; grid-column: 4; grid-row: 2;">
            <div class="action-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="action-content">
              <span class="action-label-premium">Fechar Jogo</span>
            </div>
          </RouterLink>

          <RouterLink to="/panel/championship" class="action-card-premium"
            style="--action-color: #ff6b9d; grid-column: 3 / 5; grid-row: 3;">
            <div class="action-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"></path>
                <path d="M6 5H18M6 19H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2m16 4v-2a2 2 0 0 0-2-2H6m12 4H6m12 0v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2"></path>
              </svg>
            </div>
            <div class="action-content">
              <span class="action-label-premium">Campeonato Zika</span>
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section">
        <div class="section-header">
          <h3>Atividade Recente</h3>
          <p>Últimas ações e atualizações</p>
        </div>
        <div class="activity-grid">
          <div class="activity-card glass-panel">
            <h4>Jogos Recentes</h4>
            <div v-if="recentGames.length > 0" class="activity-list">
              <div v-for="game in recentGames" :key="game.id" class="activity-item">
                <div class="activity-icon">🎮</div>
                <div class="activity-info">
                  <span class="activity-title">{{ game.teamA.name }} vs {{ game.teamB.name }}</span>
                  <span class="activity-time">{{ formatTime(game.createdAt) }}</span>
                </div>
                <span class="activity-status" :class="game.status.toLowerCase()">
                  {{ getStatusLabel(game.status) }}
                </span>
              </div>
            </div>
            <div v-else class="activity-empty">
              <p>Nenhum jogo recente</p>
            </div>
          </div>

          <div class="activity-card glass-panel">
            <h4>Apostas Pendentes</h4>
            <div v-if="loadingBets" class="activity-empty">
              <p>Carregando apostas...</p>
            </div>
            <div v-else-if="recentBets.length > 0" class="activity-list">
              <div v-for="bet in recentBets" :key="bet.id" class="activity-item">
                <div class="activity-icon">💰</div>
                <div class="activity-info">
                  <span class="activity-title">
                    {{ bet.user?.name || 'Usuário' }} - R$ {{ bet.amount?.toFixed(2) || '0.00' }}
                  </span>
                  <span class="activity-subtitle" v-if="bet.game && bet.game.teamA && bet.game.teamB">
                    {{ bet.game.teamA.name }} vs {{ bet.game.teamB.name }}
                  </span>
                  <span class="activity-time" v-if="bet.createdAt">{{ formatTime(bet.createdAt) }}</span>
                </div>
                <span class="activity-odds" v-if="bet.odds">{{ bet.odds }}x</span>
              </div>
            </div>
            <div v-else class="activity-empty">
              <p>Nenhuma aposta pendente</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <AdminFooter />
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Vue module resolution
import { ref, computed, onMounted } from 'vue';
// @ts-ignore - Vue Router module resolution
import { useRouter, RouterLink } from 'vue-router';
import { useUserStore } from '@/store/useUserStore';
import { useGameStore } from '@/store/useGameStore';
import api from '@/services/api';
import { routes } from '@/utils/routes';
// @ts-ignore - Vue component with script setup
import AdminHeader from '@/components/AdminHeader.vue';
// @ts-ignore - Vue component with script setup
import AdminFooter from '@/components/AdminFooter.vue';

const router = useRouter();
const userStore = useUserStore();
const gameStore = useGameStore();

const stats = ref({
  teams: 0,
  players: 0,
  scheduledGames: 0,
  pendingBets: 0,
  houseProfit: 0,
  totalBetsAmount: 0,
  totalPayouts: 0,
});

const allBets = ref<any[]>([]);
const loadingBets = ref(false);

const recentGames = computed(() => {
  if (!gameStore.games || gameStore.games.length === 0) {
    return [];
  }
  return gameStore.games
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
});

const recentBets = computed(() => {
  if (!allBets.value || allBets.value.length === 0) {
    return [];
  }
  return allBets.value
    .filter((bet) => bet && bet.status === 'PENDING')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
});

onMounted(async () => {
  if (!userStore.isAuthenticated || userStore.user?.role !== 'ADMIN') {
    router.push('/panel/login');
    return;
  }

  await loadStats();
});

const loadStats = async () => {
  try {
    await gameStore.fetchTeams();
    await gameStore.fetchGames();

    // Buscar todas as apostas (admin) - apenas dados reais da API
    loadingBets.value = true;
    try {
      // Buscar todas as apostas (sem filtro de status)
      const betsResponse = await api.get(routes.admin.bets.list());
      // Garantir que apenas dados reais sejam armazenados
      allBets.value = Array.isArray(betsResponse?.data?.bets)
        ? betsResponse.data.bets
        : [];
    } catch (betsError) {
      console.error('Erro ao carregar apostas:', betsError);
      // Em caso de erro, garantir array vazio (sem dados mockados)
      allBets.value = [];
    } finally {
      loadingBets.value = false;
    }

    // Calcular lucro/prejuízo da casa
    const totalBetsAmount = allBets.value.reduce((sum, bet) => {
      return sum + (bet.amount || 0);
    }, 0);

    const totalPayouts = allBets.value
      .filter((bet) => bet.status === 'WON')
      .reduce((sum, bet) => {
        return sum + (bet.returnAmount || 0);
      }, 0);

    const houseProfit = totalBetsAmount - totalPayouts;

    stats.value = {
      teams: gameStore.teams?.length || 0,
      players: gameStore.teams?.reduce((sum, team) => sum + (team.players?.length || 0), 0) || 0,
      scheduledGames: gameStore.upcomingGames?.length || 0,
      pendingBets: allBets.value.filter((bet) => bet && bet.status === 'PENDING').length,
      houseProfit,
      totalBetsAmount,
      totalPayouts,
    };
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
    // Garantir que em caso de erro, os arrays estejam vazios
    allBets.value = [];
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    SCHEDULED: 'Agendado',
    LIVE: 'Ao Vivo',
    CLOSED: 'Encerrado',
  };
  return labels[status] || status;
};

const formatTime = (date: string) => {
  const now = new Date();
  const gameDate = new Date(date);
  const diffMs = now.getTime() - gameDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return gameDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: var(--gradient-bg), var(--bg-primary);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
}


.admin-main {
  width: 80%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
  flex: 1;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h2 {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
}

.page-header p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* Stats Bar Premium */
.stats-bar-premium {
  display: flex;
  align-items: center;
  padding: 2.5rem 3rem;
  background: rgba(30, 37, 66, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  gap: 0;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.stat-block-premium {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0 2rem;
}

.stat-block-premium:first-child {
  padding-left: 0;
}

.stat-block-premium:last-child {
  padding-right: 0;
}

.stat-icon-premium {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: var(--accent-primary);
  opacity: 0.9;
  flex-shrink: 0;
  transition: all 0.3s;
}

.stat-icon-premium svg {
  width: 24px;
  height: 24px;
}

.stat-content-premium {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
}

.stat-value-premium {
  font-size: 2.75rem;
  font-weight: 700;
  color: var(--accent-primary);
  margin: 0;
  line-height: 1;
  letter-spacing: -0.03em;
}

.stat-label-premium {
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  font-weight: 500;
}

.stat-divider-premium {
  width: 1px;
  height: 70px;
  background: linear-gradient(to bottom,
      transparent,
      rgba(255, 255, 255, 0.12),
      transparent);
  flex-shrink: 0;
}

/* Quick Actions Premium */
.quick-actions-premium {
  margin-bottom: 3rem;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-header h3 {
  font-size: 1.75rem;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
}

.section-header p {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-size: 0.9rem;
}

.actions-grid-premium {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, auto);
  gap: 1rem;
  grid-auto-flow: dense;
}

@media (max-width: 1200px) {
  .actions-grid-premium {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(4, auto);
  }

  .action-card-large {
    grid-column: 1 / 3 !important;
    grid-row: 1 / 3 !important;
  }

  .action-card-small[style*="grid-column: 4"] {
    grid-column: 3 !important;
  }

  .action-card-small[style*="grid-column: 3 / 5"] {
    grid-column: 1 / 4 !important;
  }
}

@media (max-width: 768px) {
  .actions-grid-premium {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }

  .action-card-large,
  .action-card-premium {
    grid-column: 1 !important;
    grid-row: auto !important;
    min-height: 140px;
  }
}

.action-card-premium {
  position: relative;
  padding: 1.5rem;
  background: rgba(30, 37, 66, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  min-height: 140px;
  cursor: pointer;
}

.action-card-large {
  grid-column: span 2;
  grid-row: span 2;
  min-height: 300px;
  padding: 2.5rem;
}

.action-card-small {
  min-height: 120px;
  padding: 1.25rem;
}

.action-card-premium::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--action-color, var(--accent-primary))08, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s;
}

.action-card-premium:hover::before {
  opacity: 1;
}

.action-card-premium:hover {
  transform: translateY(-4px);
  border-color: var(--action-color, var(--accent-primary))40;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--action-color, var(--accent-primary))20;
  background: rgba(30, 37, 66, 0.6);
}

.action-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--action-color, var(--accent-primary));
  flex-shrink: 0;
  transition: all 0.3s;
  position: relative;
  z-index: 1;
}

.action-icon-wrapper svg {
  width: 24px;
  height: 24px;
}

.action-card-large .action-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 16px;
}

.action-card-large .action-icon-wrapper svg {
  width: 32px;
  height: 32px;
}

.action-card-small .action-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

.action-card-small .action-icon-wrapper svg {
  width: 20px;
  height: 20px;
}

.action-card-premium:hover .action-icon-wrapper {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--action-color, var(--accent-primary))40;
  box-shadow: 0 8px 24px var(--action-color, var(--accent-primary))25;
}

.action-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
  z-index: 1;
}

.action-label-premium {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  transition: color 0.3s;
  line-height: 1.3;
}

.action-card-large .action-label-premium {
  font-size: 1.5rem;
  font-weight: 700;
}

.action-card-small .action-label-premium {
  font-size: 0.9rem;
}

.action-card-premium:hover .action-label-premium {
  color: var(--action-color, var(--accent-primary));
}

/* Activity Section */
.activity-section {
  margin-top: 3rem;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.activity-card {
  padding: 2rem;
}

.activity-card h4 {
  margin: 0 0 1.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s;
}

.activity-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.activity-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(31, 163, 122, 0.1);
  border-radius: 10px;
  flex-shrink: 0;
}

.activity-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.activity-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.activity-subtitle {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.25rem;
}

.activity-time {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.activity-status {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.activity-status.scheduled {
  background: rgba(31, 163, 122, 0.15);
  color: var(--accent-primary);
  border: 1px solid rgba(31, 163, 122, 0.3);
}

.activity-status.live {
  background: rgba(255, 123, 154, 0.15);
  color: #ff7b9a;
  border: 1px solid rgba(255, 123, 154, 0.3);
}

.activity-status.closed {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.activity-odds {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0F4F3F;
  padding: 0.4rem 0.8rem;
  background: rgba(15, 79, 63, 0.15);
  border: 1px solid rgba(15, 79, 63, 0.3);
  border-radius: 8px;
}

.activity-empty {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 1400px) {
  .stats-bar-premium {
    padding: 2rem 2.5rem;
  }

  .stat-block-premium {
    padding: 0 1.5rem;
  }

  .stat-value-premium {
    font-size: 2.25rem;
  }
}

@media (max-width: 1200px) {
  .stats-bar-premium {
    padding: 2rem 2rem;
  }

  .stat-block-premium {
    padding: 0 1rem;
  }

  .stat-value-premium {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .stats-bar-premium {
    flex-direction: column;
    padding: 2rem 1.5rem;
    gap: 1rem;
  }

  .stat-block-premium {
    width: 100%;
    padding: 1rem 0 !important;
    justify-content: flex-start;
  }

  .stat-divider-premium {
    width: 100%;
    height: 1px;
    background: linear-gradient(to right,
        transparent,
        rgba(255, 255, 255, 0.12),
        transparent);
  }

  .stat-value-premium {
    font-size: 2rem;
  }
}
</style>
