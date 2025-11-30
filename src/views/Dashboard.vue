<template>
  <div class="dashboard">
    <!-- Animated Background -->
    <AnimatedBackground />

    <!-- Header Animado -->
    <AppHeader />

    <!-- Main Content -->
    <main class="dashboard-main">
      <!-- Hero Section -->
      <section class="hero-section glass-panel">
        <div class="hero-content">
          <p class="chip">ZIKABET</p>
          <h2>Aposte nos lobbies entre amigos</h2>
          <p class="hero-description">
            Apostas de até R$10 e múltipla limitada em 2 jogos para manter a disputa saudável.
          </p>
          <div v-if="!isAuthenticated" class="auth-prompt">
            <RouterLink to="/register">Cadastre-se</RouterLink> ou
            <RouterLink to="/login">entre</RouterLink> para começar a apostar!
          </div>
        </div>
        <div class="wallet-card">
          <p class="wallet-label">Saldo disponível</p>
          <strong class="wallet-amount">R$ {{ walletBalance.toFixed(2) }}</strong>
          <RouterLink v-if="!isAuthenticated" class="cta-btn" to="/login">Entrar para apostar</RouterLink>
        </div>
      </section>

      <!-- Stats Bar -->
      <section class="stats-bar glass-panel">
        <div class="stat-block">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="stat-content">
            <strong class="stat-value">{{ activeGames }}</strong>
          <p class="stat-label">Jogos ativos</p>
          </div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-block">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <strong class="stat-value">{{ pendingBets }}</strong>
          <p class="stat-label">Apostas pendentes</p>
          </div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-block">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="stat-content">
            <strong class="stat-value">R$ {{ potentialReturn.toFixed(2) }}</strong>
          <p class="stat-label">Retorno potencial</p>
          </div>
        </div>
      </section>

      <!-- Featured Games -->
      <section class="games-section">
        <h3 class="section-title">Jogos em destaque</h3>
        <div v-if="featuredGames.length > 0" class="games-grid">
          <div v-for="game in featuredGames" :key="game.id" class="game-card glass-panel">
            <div class="game-header">
              <div class="teams">
                <span class="team-name">{{ game.teamA }}</span>
                <span class="vs">vs</span>
                <span class="team-name">{{ game.teamB }}</span>
              </div>
            </div>
            <div class="game-info">
              <p class="game-time">{{ game.startTime }}</p>
              <div class="game-odds">
                <span>Odds: {{ game.odds }}</span>
              </div>
            </div>
            <button v-if="isAuthenticated" class="bet-btn" @click="openBetSlip(game)">
              Apostar
            </button>
            <RouterLink v-else to="/login" class="bet-btn">Entrar para apostar</RouterLink>
          </div>
        </div>
        <div v-else class="empty-games glass-panel">
          <p>Nenhum jogo disponível no momento.</p>
          <p>Os jogos cadastrados pelo admin aparecerão aqui quando estiverem abertos para apostas.</p>
        </div>
        <RouterLink to="/games" class="view-all-btn">Ver todos os jogos →</RouterLink>
      </section>
    </main>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useUserStore } from '@/store/useUserStore';
import { useGameStore } from '@/store/useGameStore';
// @ts-ignore - Vue component with script setup
import AppHeader from '@/components/AppHeader.vue';
// @ts-ignore - Vue component with script setup
import AnimatedBackground from '@/components/AnimatedBackground.vue';

const router = useRouter();
const userStore = useUserStore();
const gameStore = useGameStore();


const isAuthenticated = computed(() => userStore.isAuthenticated);
const walletBalance = computed(() => userStore.balance);

const activeGames = computed(() => gameStore.upcomingGames.length);
const pendingBets = computed(() => {
  return gameStore.bets.filter((bet) => bet.status === 'PENDING').length;
});
const potentialReturn = computed(() => {
  return gameStore.bets
    .filter((bet) => bet.status === 'PENDING')
    .reduce((sum, bet) => sum + bet.amount * bet.odds, 0);
});

const featuredGames = computed(() => {
  return gameStore.upcomingGames.slice(0, 3).map((game) => ({
    id: game.id,
    teamA: game.teamA.name,
    teamB: game.teamB.name,
    startTime: new Date(game.startTime).toLocaleString('pt-BR'),
    odds: `${game.odds?.teamAOdds || 1.5}x / ${game.odds?.teamBOdds || 1.5}x`,
    game,
  }));
});

const openBetSlip = (game: any) => {
  router.push(`/games?game=${game.id}`);
};

onMounted(async () => {
  if (userStore.token) {
    await userStore.fetchProfile();
  }
  await gameStore.fetchGames('SCHEDULED');
  if (userStore.isAuthenticated) {
    await gameStore.fetchBets('PENDING');
  }
});
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: var(--gradient-bg), var(--bg-primary);
  color: var(--text-primary);
}

/* Header removido - usando AppHeader component */

/* Main Content */
.dashboard-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Hero Section */
.hero-section {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  padding: 2rem;
  align-items: start;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chip {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  background: rgba(14, 255, 224, 0.15);
  border: 1px solid rgba(14, 255, 224, 0.3);
  border-radius: 8px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent-primary);
  width: fit-content;
}

.hero-content h2 {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  line-height: 1.2;
  margin: 0;
}

.hero-description {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
}

.auth-prompt {
  margin-top: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.auth-prompt a {
  color: var(--accent-primary);
  text-decoration: underline;
  font-weight: 500;
}

.wallet-card {
  min-width: 280px;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wallet-label {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
  margin: 0;
}

.wallet-amount {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--accent-primary);
  margin: 0;
}

.cta-btn {
  padding: 0.9rem 1.2rem;
  border: none;
  border-radius: 12px;
  background: var(--gradient-button);
  color: var(--gradient-button-text);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(45, 212, 166, 0.4);
}

/* Stats Bar */
.stats-bar {
  display: flex;
  align-items: center;
  padding: 2rem 2.5rem;
  background: rgba(30, 37, 66, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  gap: 0;
}

.stat-block {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1.5rem;
}

.stat-block:first-child {
  padding-left: 0;
}

.stat-block:last-child {
  padding-right: 0;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--accent-primary);
  opacity: 0.8;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1;
  letter-spacing: -0.02em;
}

.stat-label {
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  color: var(--text-tertiary);
  margin: 0;
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 60px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(255, 255, 255, 0.15),
    transparent
  );
  flex-shrink: 0;
}

/* Games Section */
.games-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.game-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.game-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.teams {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-weight: 600;
}

.team-name {
  font-size: 1.1rem;
}

.vs {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

.game-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.game-time {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.game-odds {
  color: var(--accent-primary);
  font-size: 0.85rem;
  font-weight: 500;
}

.bet-btn {
  padding: 0.9rem;
  border: none;
  border-radius: 12px;
  background: var(--gradient-button);
  color: var(--gradient-button-text);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.bet-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(45, 212, 166, 0.4);
}

.empty-games {
  padding: 3rem 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.empty-games p {
  margin: 0.5rem 0;
}

.view-all-btn {
  align-self: flex-start;
  padding: 1rem 2rem;
  background: linear-gradient(120deg, rgba(14, 255, 224, 0.2), rgba(147, 61, 255, 0.2));
  border: 1px solid rgba(14, 255, 224, 0.4);
  border-radius: 12px;
  color: var(--accent-primary);
  text-decoration: none;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  transition: all 0.2s;
}

.view-all-btn:hover {
  background: linear-gradient(120deg, rgba(14, 255, 224, 0.3), rgba(147, 61, 255, 0.3));
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-nav {
    width: 100%;
    justify-content: space-around;
  }

  .hero-section {
    grid-template-columns: 1fr;
  }

  .wallet-card {
    min-width: 100%;
  }

  .stats-bar {
    flex-direction: column;
    padding: 1.5rem;
    gap: 1rem;
  }

  .stat-block {
    width: 100%;
    padding: 1rem 0 !important;
    justify-content: flex-start;
  }

  .stat-divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(
      to right,
      transparent,
      rgba(255, 255, 255, 0.15),
      transparent
    );
  }

  .stat-value {
    font-size: 2rem;
  }

  .games-grid {
    grid-template-columns: 1fr;
  }
}

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  max-width: 500px;
  width: 100%;
  padding: 2rem;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  font-size: 1.5rem;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  color: var(--text-secondary);
}

</style>
