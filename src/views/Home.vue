<template>
  <div class="home-page">
    <!-- Animated Background -->
    <AnimatedBackground :show-image="true" image-url="/home.png" />

    <!-- Header -->
    <AppHeader />

    <!-- Main Content -->
    <main class="home-main">
      <!-- Hero Section -->
      <section class="hero-section" ref="heroSection">
        <div class="hero-content" :class="{ 'animate-in': !loading }">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            <span>A Plataforma Nº1 de Apostas para Dota 1</span>
          </div>
          <h1 class="hero-title">
            <span class="title-line">ZIKA</span>
            <span class="title-line accent">GAMES</span>
          </h1>
          <p class="hero-subtitle">
            Aposte em partidas reais, acompanhe estatísticas ao vivo<br>
            e receba pagamentos instantâneos
          </p>
          <p class="hero-tagline">
            <span class="tagline-item">Competitivo.</span>
            <span class="tagline-item">Seguro.</span>
            <span class="tagline-item accent">100% Dota 1.</span>
          </p>

          <!-- Prize & Limits Info Cards -->
          <div class="hero-prize-info">
            <div class="prize-info-card">
              <div class="prize-info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"></path>
                  <path
                    d="M6 5H18M6 19H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2m16 4v-2a2 2 0 0 0-2-2H6m12 4H6m12 0v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2">
                  </path>
                </svg>
              </div>
              <div class="prize-info-content">
                <div class="prize-info-label">Prêmio do Campeonato</div>
                <div class="prize-info-value">R$ 100,00</div>
                <div class="prize-info-desc">1º lugar ao fim do campeonato</div>
              </div>
            </div>
            <div class="limits-info-card">
              <div class="limits-info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div class="limits-info-content">
                <div class="limits-info-label">Limites de Aposta</div>
                <div class="limits-info-range">
                  <span class="limit-min">R$ 1,00</span>
                  <span class="limit-separator">-</span>
                  <span class="limit-max">R$ 10,00</span>
                </div>
                <div class="limits-info-desc">Acessível para todos</div>
              </div>
            </div>
          </div>

          <div class="hero-actions">
            <RouterLink to="/games" class="cta-primary">
              <span>Ver Jogos</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </RouterLink>
            <RouterLink v-if="!isAuthenticated" to="/register" class="cta-secondary">
              <span>Criar Conta</span>
            </RouterLink>
            <RouterLink v-if="!isAuthenticated" to="/login" class="cta-tertiary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Entrar com Discord</span>
            </RouterLink>
            <RouterLink v-if="isAuthenticated" to="/ranking" class="cta-ranking">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"></path>
                <path
                  d="M6 5H18M6 19H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2m16 4v-2a2 2 0 0 0-2-2H6m12 4H6m12 0v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2">
                </path>
              </svg>
              <span>Ver Ranking</span>
            </RouterLink>
          </div>
          <!-- Live Metrics Section - HUD Futurista -->
          <div class="hero-metrics-section">
            <div class="metrics-header-hud">
              <div class="hud-badge">
                <span class="hud-pulse-dot"></span>
                <span class="hud-badge-text">LIVE DATA STREAM</span>
              </div>
              <h3 class="hud-title">Sua Arena de Dados em Tempo Real</h3>
              <p class="hud-subtitle">Monitoramento contínuo • Atualização instantânea • Análise em tempo real</p>
            </div>
            <div class="metrics-grid-premium hud-container">
              <div class="hud-glow-effect"></div>
              <div class="metric-item-hud">
                <div class="hud-item-header">
                  <div class="hud-icon-wrapper">
                    <div class="hud-icon-bg"></div>
                    <svg class="hud-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2.5">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div class="hud-trend-indicator up">
                    <div class="trend-arrow">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path d="M8 4L12 8H9V12H7V8H4L8 4Z" fill="currentColor" />
                      </svg>
                    </div>
                    <span class="trend-value">+12.5%</span>
                    <span class="trend-label">vs. ontem</span>
                  </div>
                </div>
                <div class="hud-value-section">
                  <div class="hud-value-main">
                    <span class="hud-number" :data-target="stats.totalUsers">{{ animatedStats.totalUsers }}</span>
                    <span class="hud-suffix">+</span>
                  </div>
                  <div class="hud-sparkline">
                    <svg viewBox="0 0 100 24" preserveAspectRatio="none" class="sparkline-svg">
                      <polyline :points="generateSparkline('users')" fill="none" stroke="url(#sparklineGradient1)"
                        stroke-width="2" stroke-linecap="round" />
                      <defs>
                        <linearGradient id="sparklineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" style="stop-color:#00ff88;stop-opacity:0.8" />
                          <stop offset="100%" style="stop-color:#00ff88;stop-opacity:0.2" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
                <div class="hud-label-section">
                  <span class="hud-label-main">Apostadores Ativos</span>
                  <span class="hud-label-micro">Última sincronização: <span class="hud-time">agora</span></span>
                </div>
              </div>
              <div class="hud-divider"></div>
              <div class="metric-item-hud">
                <div class="hud-item-header">
                  <div class="hud-icon-wrapper live-pulse">
                    <div class="hud-icon-bg live"></div>
                    <svg class="hud-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </div>
                  <div class="hud-trend-indicator neutral">
                    <div class="trend-arrow">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path d="M4 8H12M8 4V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                      </svg>
                    </div>
                    <span class="trend-value">0%</span>
                    <span class="trend-label">estável</span>
                  </div>
                </div>
                <div class="hud-value-section">
                  <div class="hud-value-main">
                    <span class="hud-number" :data-target="stats.activeGames">{{ animatedStats.activeGames }}</span>
                  </div>
                  <div class="hud-sparkline">
                    <svg viewBox="0 0 100 24" preserveAspectRatio="none" class="sparkline-svg">
                      <polyline :points="generateSparkline('games')" fill="none" stroke="url(#sparklineGradient2)"
                        stroke-width="2" stroke-linecap="round" />
                      <defs>
                        <linearGradient id="sparklineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" style="stop-color:#ff4757;stop-opacity:0.8" />
                          <stop offset="100%" style="stop-color:#ff4757;stop-opacity:0.2" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
                <div class="hud-label-section">
                  <span class="hud-label-main">Partidas ao Vivo</span>
                  <span class="hud-label-micro">Monitoramento <span class="hud-status-live">ATIVO</span></span>
                </div>
              </div>
              <div class="hud-divider"></div>
              <div class="metric-item-hud">
                <div class="hud-item-header">
                  <div class="hud-icon-wrapper">
                    <div class="hud-icon-bg"></div>
                    <svg class="hud-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2.5">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                  </div>
                  <div class="hud-trend-indicator up">
                    <div class="trend-arrow">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path d="M8 4L12 8H9V12H7V8H4L8 4Z" fill="currentColor" />
                      </svg>
                    </div>
                    <span class="trend-value">+8.3%</span>
                    <span class="trend-label">vs. ontem</span>
                  </div>
                </div>
                <div class="hud-value-section">
                  <div class="hud-value-main">
                    <span class="hud-currency">R$</span>
                    <span class="hud-number" :data-target="stats.todayVolume">{{
                      formatCurrency(animatedStats.todayVolume) }}</span>
                  </div>
                  <div class="hud-sparkline">
                    <svg viewBox="0 0 100 24" preserveAspectRatio="none" class="sparkline-svg">
                      <polyline :points="generateSparkline('volume')" fill="none" stroke="url(#sparklineGradient3)"
                        stroke-width="2" stroke-linecap="round" />
                      <defs>
                        <linearGradient id="sparklineGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:0.8" />
                          <stop offset="100%" style="stop-color:#00d4ff;stop-opacity:0.2" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
                <div class="hud-label-section">
                  <span class="hud-label-main">Volume do Dia</span>
                  <span class="hud-label-micro">Crescimento <span class="hud-trend-positive">ascendente</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-image-container">
            <div class="hero-image-wrapper image-2">
              <img src="/hero2.png" alt="Hero 2" class="hero-image" />
              <div class="image-glow"></div>
            </div>
            <div class="hero-image-wrapper image-3">
              <img src="/hero3.png" alt="Hero 3" class="hero-image" />
              <div class="image-glow"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Bets Section -->
      <section class="recent-bets-section-modern" ref="betsSection">
        <div class="section-header-modern">
          <div>
            <h2 class="section-title-modern">
              <span class="title-icon">⚡</span>
              Últimas Apostas
            </h2>
            <p class="section-subtitle">Atividade recente da plataforma</p>
          </div>
          <div style="display: flex; gap: 1rem; align-items: center;">
            <button @click="loadData" class="refresh-btn" :disabled="loading" title="Atualizar">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" :class="{ 'spinning': loading }">
                <path
                  d="M8 1V3M8 13V15M3 8H1M15 8H13M12.364 3.636L10.95 5.05M5.05 10.95L3.636 12.364M12.364 12.364L10.95 10.95M5.05 5.05L3.636 3.636"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
            <RouterLink v-if="isAuthenticated" to="/bets" class="view-all-btn">
              <span>Ver Todas</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </RouterLink>
          </div>
        </div>
        <div v-if="loading" class="loading-state-modern glass-panel">
          <div class="loading-spinner"></div>
          <p>Carregando apostas...</p>
        </div>
        <div v-else-if="recentBets.length === 0" class="empty-state-modern glass-panel">
          <div class="empty-icon">📭</div>
          <p>Nenhuma aposta ainda</p>
          <p class="empty-subtitle">Seja o primeiro a apostar!</p>
        </div>
        <div v-else class="bets-list-container">
          <div class="bets-list">
            <div v-for="bet in recentBets" :key="bet.id" class="bet-item glass-panel"
              :class="[bet.status.toLowerCase(), { 'is-expanded': expandedBetId === bet.id }]">
              <!-- Main Row (Always Visible) -->
              <div class="bet-item-content" @click="toggleBet(bet.id)">
                <!-- Left: User Info -->
                <div class="bet-user-info">
                  <div class="user-avatar-bet">
                    <span>{{ bet.user.name.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="user-info-bet">
                    <span class="user-name-bet">{{ bet.user.name }}</span>
                    <span class="bet-time-bet">{{ formatTime(bet.createdAt) }}</span>
                  </div>
                </div>

                <!-- Center: Game Info -->
                <div class="bet-game-info">
                  <div class="game-teams-bet">
                    <span class="team-name-bet">{{ bet.game.teamA }}</span>
                    <span class="vs-divider-bet">VS</span>
                    <span class="team-name-bet">{{ bet.game.teamB }}</span>
                  </div>
                </div>

                <!-- Center-Right: Market Info -->
                <div class="bet-market-info">
                  <div class="market-type-bet">
                    <span class="market-label-bet">{{ getBetTypeLabel(bet.type) }}</span>
                    <span class="market-value-bet">{{ formatBetSelection(bet) }}</span>
                  </div>
                  <div class="market-odds-bet">
                    <span class="odds-label-bet">Odds:</span>
                    <span class="odds-value-bet">{{ bet.odds }}x</span>
                  </div>
                </div>

                <!-- Right: Status & Expand -->
                <div class="bet-status-section">
                  <span class="status-badge-bet" :class="bet.status.toLowerCase()">
                    {{ getStatusLabel(bet.status) }}
                  </span>
                  <span class="expand-icon-bet" :class="{ 'expanded': expandedBetId === bet.id }">
                    ▼
                  </span>
                </div>
              </div>

              <!-- Expanded Details (Accordion Content) -->
              <transition name="expand">
                <div v-if="expandedBetId === bet.id" class="bet-expanded-content">
                  <!-- Game Info Section -->
                  <div class="expanded-section">
                    <div class="section-header">
                      <span class="section-icon">🎮</span>
                      <h4 class="section-title-expanded">Informações do Jogo</h4>
                    </div>
                    <div class="section-content">
                      <div class="game-info-expanded">
                        <div class="game-matchup-expanded">
                          <span class="team-name-expanded">{{ bet.game.teamA }}</span>
                          <span class="vs-expanded">VS</span>
                          <span class="team-name-expanded">{{ bet.game.teamB }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Market Section -->
                  <div class="expanded-section">
                    <div class="section-header">
                      <span class="section-icon">📊</span>
                      <h4 class="section-title-expanded">Mercado</h4>
                    </div>
                    <div class="section-content">
                      <div class="market-grid-expanded">
                        <div class="market-card">
                          <div class="market-card-header">
                            <span class="market-type-label">{{ getBetTypeLabel(bet.type) }}</span>
                            <span class="market-badge-expanded">{{ bet.odds }}x</span>
                          </div>
                          <div class="market-selection-expanded">
                            <span class="selection-label">Seleção:</span>
                            <span class="selection-value">{{ formatBetSelection(bet) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Games Section -->
      <section class="featured-games-section-modern" ref="gamesSection">
        <div class="section-header-modern">
          <div>
            <h2 class="section-title-modern">
              <span class="title-icon">🎮</span>
              Jogos em Destaque
            </h2>
            <p class="section-subtitle">Partidas mais aguardadas</p>
          </div>
          <RouterLink to="/games" class="view-all-btn">
            <span>Ver Todos</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </RouterLink>
        </div>
        <div v-if="loading" class="loading-state-modern glass-panel">
          <div class="loading-spinner"></div>
          <p>Carregando jogos...</p>
        </div>
        <div v-else-if="featuredGames.length === 0" class="empty-state-modern glass-panel">
          <div class="empty-icon">🎯</div>
          <p>Nenhum jogo disponível</p>
          <p class="empty-subtitle">Novos jogos em breve!</p>
        </div>
        <div v-else class="games-grid-modern">
          <div v-for="(game, index) in featuredGames" :key="game.id" class="game-card-modern glass-panel"
            :style="{ '--delay': index * 0.1 + 's' }"
            :class="{ 'animate-in': !loading, 'live': game.status === 'LIVE' }">
            <div class="game-card-glow"></div>
            <div class="game-header-modern">
              <div class="game-teams-modern">
                <div class="team-display">
                  <span class="team-name-large">{{ game.teamA.name }}</span>
                </div>
                <div class="vs-display">
                  <span class="vs-text">VS</span>
                </div>
                <div class="team-display">
                  <span class="team-name-large">{{ game.teamB.name }}</span>
                </div>
              </div>
              <span class="game-status-modern" :class="game.status.toLowerCase()">
                <span class="status-dot"></span>
                {{ getStatusLabel(game.status) }}
              </span>
            </div>
            <div class="game-info-modern">
              <div class="info-row">
                <span class="info-icon">🕐</span>
                <span class="info-text">{{ formatDateTime(game.startTime) }}</span>
              </div>
              <div class="game-odds-modern" v-if="game.odds">
                <div class="odds-display">
                  <div class="odds-card">
                    <span class="odds-label">{{ game.teamA.name }}</span>
                    <span class="odds-value">{{ game.odds.teamAOdds }}x</span>
                  </div>
                  <div class="odds-card">
                    <span class="odds-label">{{ game.teamB.name }}</span>
                    <span class="odds-value">{{ game.odds.teamBOdds }}x</span>
                  </div>
                </div>
              </div>
            </div>
            <RouterLink :to="`/games`" class="game-link-modern">
              <span>Ver Detalhes</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </RouterLink>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Vue module resolution
import { ref, computed, watch, onMounted, onUnmounted, onActivated } from 'vue';
// @ts-ignore - Vue Router module resolution
import { RouterLink, useRoute } from 'vue-router';
import { useUserStore } from '@/store/useUserStore';
import { useGameStore } from '@/store/useGameStore';
// @ts-ignore - Vue component with script setup
import AppHeader from '@/components/AppHeader.vue';
// @ts-ignore - Vue component with script setup
import AnimatedBackground from '@/components/AnimatedBackground.vue';
import api from '@/services/api';
import { routes } from '@/utils/routes';

const userStore = useUserStore();
const gameStore = useGameStore();
const route = useRoute();

const loading = ref(false);
const stats = ref({
  totalGames: 0,
  activeGames: 0,
  totalBets: 0,
  totalUsers: 0,
  totalVolume: 0,
  todayVolume: 0,
  gamesByStatus: {} as Record<string, number>,
  betsByStatus: {} as Record<string, { count: number; volume: number }>,
  betsByType: {} as Record<string, number>,
  volumeByDay: {} as Record<string, { amount: number; count: number }>,
});

const recentBets = ref<any[]>([]);
const featuredGames = ref<any[]>([]);

const heroSection = ref<HTMLElement | null>(null);
const betsSection = ref<HTMLElement | null>(null);
const gamesSection = ref<HTMLElement | null>(null);

let observer: IntersectionObserver | null = null;

const isAuthenticated = computed(() => userStore.isAuthenticated);
const expandedBetId = ref<string | null>(null);

// Animated stats for counting animation
const animatedStats = ref({
  totalUsers: 0,
  activeGames: 0,
  todayVolume: 0,
});

// Bet expansion function
const toggleBet = (betId: string) => {
  expandedBetId.value = expandedBetId.value === betId ? null : betId;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatTime = (date: string) => {
  const now = new Date();
  const betDate = new Date(date);
  const diffMs = now.getTime() - betDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return betDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'Pendente',
    WON: 'Ganhou',
    LOST: 'Perdeu',
    SCHEDULED: 'Agendado',
    LIVE: 'Ao Vivo',
    CLOSED: 'Encerrado',
  };
  return labels[status] || status;
};

const getBetTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    WINNER: 'Vencedor',
    DURATION: 'Duração',
    TOP_KILLER: 'Top Killer',
    TOP_DEAD: 'Menor Mortes',
    LOWEST_DEATHS: 'Menor Mortes',
    ROSHAN_TOTAL: 'Total Roshan',
    FIRST_ROSHAN: 'Primeiro Roshan',
    FIRST_FF: 'Primeiro !ff',
  };
  return labels[type] || type;
};

const formatBetSelection = (bet: any): string => {
  if (!bet.selection) return '';

  if (bet.type === 'WINNER') {
    // bet.selection pode ser o ID do time ou o nome
    if (bet.selection === bet.game.teamAId || bet.selection === bet.game.teamA) {
      return bet.game.teamA;
    } else if (bet.selection === bet.game.teamBId || bet.selection === bet.game.teamB) {
      return bet.game.teamB;
    }
    return bet.selectionName || bet.selection;
  } else if (bet.type === 'DURATION') {
    return `${bet.selection} min`;
  } else if (bet.type === 'TOP_KILLER' || bet.type === 'TOP_DEAD' || bet.type === 'LOWEST_DEATHS') {
    // Para jogadores, mostra o nome se disponível
    return bet.selectionName || bet.selection;
  } else if (bet.type === 'ROSHAN_TOTAL') {
    // Formatar Over/Under
    if (bet.selection.startsWith('over_')) {
      const value = bet.selection.replace('over_', '');
      return `Acima de ${value}`;
    } else if (bet.selection.startsWith('under_')) {
      const value = bet.selection.replace('under_', '');
      return `Abaixo de ${value}`;
    }
    return bet.selection;
  } else if (bet.type === 'FIRST_ROSHAN' || bet.type === 'FIRST_FF') {
    // bet.selection pode ser o ID do time ou o nome
    if (bet.selection === bet.game.teamAId || bet.selection === bet.game.teamA) {
      return bet.game.teamA;
    } else if (bet.selection === bet.game.teamBId || bet.selection === bet.game.teamB) {
      return bet.game.teamB;
    }
    return bet.selectionName || bet.selection;
  }
  return bet.selectionName || bet.selection;
};

// Funções removidas - não utilizadas após remoção da seção de dashboard

const generateSparkline = (type: string) => {
  const points: string[] = [];
  const count = 30;
  const baseHeight = 20;

  for (let i = 0; i < count; i++) {
    const x = (i / (count - 1)) * 100;
    let y;

    if (type === 'users') {
      // Tendência crescente
      y = baseHeight - (Math.random() * 8 + (i / count) * 8);
    } else if (type === 'games') {
      // Flutuação estável
      y = baseHeight - (Math.random() * 6 + 4);
    } else {
      // Volume com crescimento
      y = baseHeight - (Math.random() * 10 + (i / count) * 6);
    }

    points.push(`${x},${y}`);
  }

  return points.join(' ');
};

// Função removida - não utilizada

// Animate numbers when they change
watch(() => stats.value.totalVolume, (newVal: number, oldVal: number) => {
  if (oldVal && newVal !== oldVal) {
    animateValue('totalVolume', oldVal, newVal);
  }
});

const animateValue = (_metric: string, _start: number, end: number) => {
  // This would trigger CSS animation
  const element = document.querySelector(`[data-value="${end}"]`);
  if (element) {
    element.classList.add('value-updated');
    setTimeout(() => {
      element.classList.remove('value-updated');
    }, 1000);
  }
};

// Animate number counting
const animateNumber = (start: number, end: number, duration: number, callback: (value: number) => void) => {
  const startTime = performance.now();
  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.floor(start + (end - start) * progress);
    callback(current);
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  requestAnimationFrame(animate);
};

const loadData = async () => {
  loading.value = true;
  try {
    // Carregar estatísticas
    const statsResponse = await api.get(routes.games.stats());
    stats.value = statsResponse.data.stats;
    recentBets.value = statsResponse.data.recentBets || [];

    // Animate stats
    animateNumber(0, stats.value.totalUsers, 1500, (value) => {
      animatedStats.value.totalUsers = value;
    });
    animateNumber(0, stats.value.activeGames, 1500, (value) => {
      animatedStats.value.activeGames = value;
    });
    animateNumber(0, stats.value.todayVolume, 1500, (value) => {
      animatedStats.value.todayVolume = value;
    });

    // Carregar jogos em destaque
    await gameStore.fetchGames();
    featuredGames.value = gameStore.games
      .filter((g: any) => g.status === 'LIVE' || g.status === 'SCHEDULED')
      .slice(0, 3);

  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  } finally {
    loading.value = false;
  }
};


const setupIntersectionObserver = () => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  [betsSection, gamesSection].forEach((section) => {
    if (section?.value) {
      observer?.observe(section.value);
    }
  });
};

onMounted(async () => {
  await loadData();
  setTimeout(() => {
    setupIntersectionObserver();
  }, 100);
});

// Recarregar dados quando a rota for acessada novamente
onActivated(async () => {
  await loadData();
});

// Observar mudanças na rota para recarregar quando voltar para /home
watch(() => route.path, async (newPath: string) => {
  if (newPath === '/home') {
    await loadData();
  }
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});
</script>

<style scoped>

.home-page {
  min-height: 100vh;
  background: var(--gradient-bg), var(--bg-primary);
  color: var(--text-primary);
  position: relative;
  z-index: 1;
  overflow-x: hidden;
}

/* Background particles and Dota 1 theme elements */
.home-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(0, 255, 136, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(135, 206, 250, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(147, 61, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
  animation: nebulaFloat 20s ease-in-out infinite;
}

@keyframes nebulaFloat {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  50% {
    transform: translate(-20px, 20px) scale(1.1);
  }
}

/* Floating runes (Dota 1 theme) */
.home-page::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(2px 2px at 20% 30%, rgba(0, 255, 136, 0.3), transparent),
    radial-gradient(2px 2px at 60% 70%, rgba(135, 206, 250, 0.3), transparent),
    radial-gradient(1px 1px at 50% 50%, rgba(147, 61, 255, 0.3), transparent),
    radial-gradient(1px 1px at 80% 10%, rgba(0, 255, 136, 0.2), transparent),
    radial-gradient(2px 2px at 90% 60%, rgba(135, 206, 250, 0.2), transparent),
    radial-gradient(1px 1px at 33% 80%, rgba(147, 61, 255, 0.2), transparent);
  background-size: 200% 200%;
  background-position: 0% 0%;
  pointer-events: none;
  z-index: 0;
  animation: particlesMove 30s linear infinite;
  opacity: 0.6;
}

@keyframes particlesMove {
  0% {
    background-position: 0% 0%;
  }

  100% {
    background-position: 100% 100%;
  }
}

.home-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 1;
}

/* Hero Section */
.hero-section {
  position: relative;
  min-height: auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 4rem 0 6rem 0;
  margin-bottom: 6rem;
  overflow: visible;
}

.hero-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  z-index: 2;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
}


.hero-content.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 50px;
  font-size: 0.85rem;
  color: var(--accent-primary);
  margin-bottom: 2rem;
  animation: pulse 2s ease-in-out infinite;
  width: 34%;
  max-width: 340px;
  text-align: center;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: var(--accent-primary);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

.hero-title {
  font-size: 5.5rem;
  font-weight: 900;
  line-height: 1.1;
  margin: 0 0 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.title-line {
  display: block;
  background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.title-line.accent {
  background: var(--gradient-button);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 40px rgba(0, 255, 136, 0.5);
  animation: glow 3s ease-in-out infinite;
}

@keyframes glow {

  0%,
  100% {
    filter: drop-shadow(0 0 10px rgba(0, 255, 136, 0.5));
  }

  50% {
    filter: drop-shadow(0 0 20px rgba(0, 255, 136, 0.8));
  }
}

.hero-subtitle {
  font-size: 1.5rem;
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.hero-description {
  font-size: 1.1rem;
  color: var(--text-tertiary);
  margin: 0 0 2.5rem 0;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: var(--gradient-button);
  color: var(--gradient-button-text);
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
  position: relative;
  overflow: hidden;
}

.cta-primary::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.cta-primary:hover::before {
  width: 300px;
  height: 300px;
}

.cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 255, 136, 0.4);
}

.cta-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s;
}

.cta-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

.cta-tertiary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: rgba(88, 101, 242, 0.1);
  border: 1px solid rgba(88, 101, 242, 0.3);
  color: #5865f2;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.cta-tertiary:hover {
  background: rgba(88, 101, 242, 0.2);
  border-color: #5865f2;
  transform: translateY(-2px);
}

.cta-ranking {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: var(--accent-primary);
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.2);
}

.cta-ranking:hover {
  background: rgba(0, 255, 136, 0.2);
  border-color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 255, 136, 0.3);
}

.hero-tagline {
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0 2rem 0;
  flex-wrap: wrap;
}

.tagline-item {
  font-size: 1.1rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.tagline-item.accent {
  color: var(--accent-primary);
  font-weight: 600;
}

/* Hero Prize Info Cards */
.hero-prize-info {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.prize-info-card {
  flex: 1;
  min-width: 280px;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.08) 0%, rgba(30, 37, 66, 0.3) 100%);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.limits-info-card {
  flex: 1;
  min-width: 340px;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.08) 0%, rgba(30, 37, 66, 0.3) 100%);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.prize-info-card::before,
.limits-info-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 16px;
}

.prize-info-card:hover::before,
.limits-info-card:hover::before {
  opacity: 1;
}

.prize-info-card:hover,
.limits-info-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 255, 136, 0.4);
  box-shadow: 0 8px 24px rgba(0, 255, 136, 0.2);
}

.prize-info-icon,
.limits-info-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 255, 136, 0.15);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 12px;
  color: var(--accent-primary);
  flex-shrink: 0;
  filter: drop-shadow(0 0 8px rgba(0, 255, 136, 0.3));
  transition: all 0.3s;
}

.prize-info-card:hover .prize-info-icon,
.limits-info-card:hover .limits-info-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.4);
}

.prize-info-content,
.limits-info-content {
  flex: 1;
  min-width: 0;
}

.prize-info-label,
.limits-info-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.prize-info-value {
  font-size: 1.75rem;
  font-weight: 900;
  color: var(--accent-primary);
  line-height: 1;
  margin-bottom: 0.25rem;
  text-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
  animation: valueGlow 2s ease-in-out infinite;
}

@keyframes valueGlow {

  0%,
  100% {
    text-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
  }

  50% {
    text-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
  }
}

.prize-info-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.limits-info-range {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.limit-min,
.limit-max {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--accent-primary);
  line-height: 1;
}

.limit-separator {
  font-size: 1rem;
  color: var(--text-tertiary);
  font-weight: 600;
}

.limits-info-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Hero Metrics Section */
.hero-metrics-section {
  width: 100%;
  max-width: 100%;
  margin: 3rem 0 0 0;
  padding-top: 2.5rem;
  border-top: 1px solid rgba(0, 255, 136, 0.2);
  position: relative;
  z-index: 3;
  box-sizing: border-box;
}

.metrics-header-hud {
  width: 100%;
  max-width: 100%;
  margin: 0 auto 2.5rem auto;
  padding: 0;
  box-sizing: border-box;
}

.metrics-header {
  margin-bottom: 2rem;
  text-align: left;
}

.metrics-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 71, 87, 0.15);
  border: 1px solid rgba(255, 71, 87, 0.3);
  border-radius: 50px;
  font-size: 0.75rem;
  color: var(--accent-error);
  margin-bottom: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.live-dot {
  width: 8px;
  height: 8px;
  background: var(--accent-error);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 71, 87, 0.8);
  animation: livePulse 2s ease-in-out infinite;
}

@keyframes livePulse {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.7;
    transform: scale(1.2);
  }
}

.metrics-title {
  font-size: 1.75rem;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #ffffff 0%, rgba(0, 255, 136, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.metrics-subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 500;
}

/* Hero Stats Preview - Removed, now using metrics-grid-premium */

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
}

.stat-icon-premium {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 255, 136, 0.12);
  border: 1px solid rgba(0, 255, 136, 0.25);
  border-radius: 12px;
  color: var(--accent-primary);
  flex-shrink: 0;
  filter: drop-shadow(0 0 8px rgba(0, 255, 136, 0.3));
  transition: all 0.3s;
}

.stat-icon-premium.live {
  background: rgba(255, 71, 87, 0.12);
  border-color: rgba(255, 71, 87, 0.25);
  color: var(--accent-error);
  filter: drop-shadow(0 0 8px rgba(255, 71, 87, 0.3));
  animation: liveIconPulse 2s ease-in-out infinite;
}

@keyframes liveIconPulse {

  0%,
  100% {
    box-shadow: 0 0 8px rgba(255, 71, 87, 0.3);
  }

  50% {
    box-shadow: 0 0 16px rgba(255, 71, 87, 0.6);
  }
}

.metrics-grid-premium:hover .stat-icon-premium {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s;
}

.stat-trend.up {
  background: rgba(0, 255, 136, 0.15);
  color: var(--accent-primary);
  border: 1px solid rgba(0, 255, 136, 0.3);
}

.stat-trend.down {
  background: rgba(255, 71, 87, 0.15);
  color: var(--accent-error);
  border: 1px solid rgba(255, 71, 87, 0.3);
}

.stat-trend.neutral {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.stat-trend svg {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.stat-trend.down svg {
  transform: rotate(180deg);
}

.stat-value-container {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-bottom: 0.25rem;
}

.preview-value {
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--accent-primary);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  transition: all 0.3s;
  text-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
}

.preview-value.currency {
  font-size: 1.5rem;
  font-weight: 700;
  margin-right: 0.25rem;
}

.value-suffix {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--accent-primary);
  line-height: 1;
  opacity: 0.8;
}

.metrics-grid-premium:hover .preview-value {
  text-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
  transform: scale(1.02);
}

.preview-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  margin-top: 0.5rem;
}

.preview-time {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  font-weight: 500;
  opacity: 0.7;
  margin-top: -0.25rem;
}

.hero-visual {
  position: absolute;
  right: 0;
  top: 0;
  width: 600px;
  height: 600px;
  pointer-events: none;
  z-index: 1;
  overflow: visible;
}

@media (max-width: 1400px) {
  .hero-visual {
    right: -50px;
    width: 550px;
    height: 550px;
  }
}

@media (max-width: 1200px) {
  .hero-visual {
    display: none;
  }
}

.hero-image-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.hero-image-wrapper {
  position: absolute;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(0, 255, 136, 0.2);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: floatImage 8s ease-in-out infinite;
}

.hero-image-wrapper.image-2 {
  width: 280px;
  height: 280px;
  top: 40px;
  left: 200px;
  animation-delay: 2.5s;
  z-index: 2;
}

.hero-image-wrapper.image-2::before {
  content: '';
  position: absolute;
  inset: -12px;
  background: radial-gradient(circle, rgba(255, 71, 87, 0.8) 0%, transparent 70%);
  border-radius: 20px;
  z-index: -1;
  animation: glowPulseRed 2s ease-in-out infinite;
  filter: blur(20px);
  box-shadow: 0 0 40px rgba(255, 71, 87, 0.6);
}

.hero-image-wrapper.image-3 {
  width: 260px;
  height: 260px;
  top: 200px;
  left: 50px;
  animation-delay: 5s;
  z-index: 1;
}

.hero-image-wrapper.image-3::before {
  content: '';
  position: absolute;
  inset: -12px;
  background: radial-gradient(circle, rgba(147, 61, 255, 0.8) 0%, transparent 70%);
  border-radius: 20px;
  z-index: -1;
  animation: glowPulsePurple 2s ease-in-out infinite;
  filter: blur(20px);
  box-shadow: 0 0 40px rgba(147, 61, 255, 0.6);
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.hero-image-wrapper:hover .hero-image {
  transform: scale(1.1);
}

.image-glow {
  position: absolute;
  inset: -4px;
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.3), rgba(255, 71, 87, 0.2));
  border-radius: 20px;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: -1;
  filter: blur(20px);
}

.hero-image-wrapper:hover .image-glow {
  opacity: 1;
  animation: pulseGlow 2s ease-in-out infinite;
}

@keyframes floatImage {

  0%,
  100% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }

  33% {
    transform: translate(15px, -15px) rotate(2deg) scale(1.02);
  }

  66% {
    transform: translate(-10px, 10px) rotate(-2deg) scale(0.98);
  }
}

@keyframes pulseGlow {

  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }

  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

@keyframes glowPulseBlue {

  0%,
  100% {
    opacity: 0.4;
    transform: scale(1);
  }

  50% {
    opacity: 0.8;
    transform: scale(1.15);
  }
}

@keyframes glowPulseRed {

  0%,
  100% {
    opacity: 0.4;
    transform: scale(1);
  }

  50% {
    opacity: 0.8;
    transform: scale(1.15);
  }
}

@keyframes glowPulsePurple {

  0%,
  100% {
    opacity: 0.4;
    transform: scale(1);
  }

  50% {
    opacity: 0.8;
    transform: scale(1.15);
  }
}

/* Section Headers */
.section-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 3rem;
  gap: 2rem;
}

.section-title-modern {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  font-size: 2rem;
  filter: drop-shadow(0 0 10px rgba(0, 255, 136, 0.5));
}

.section-subtitle {
  font-size: 1rem;
  color: var(--text-tertiary);
  margin-top: 0.5rem;
}

.view-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  color: var(--accent-primary);
  text-decoration: none;
  font-weight: 600;
  border: 1px solid var(--accent-primary);
  border-radius: 8px;
  transition: all 0.3s;
  white-space: nowrap;
}

.view-all-btn:hover {
  background: rgba(0, 255, 136, 0.1);
  transform: translateX(4px);
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--accent-primary);
  cursor: pointer;
  transition: all 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(0, 255, 136, 0.1);
  border-color: var(--accent-primary);
  transform: rotate(180deg);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-btn svg.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}


/* Modern Stats Dashboard */
.stats-dashboard {
  margin-bottom: 6rem;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.stats-dashboard.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.dashboard-header {
  margin-bottom: 3rem;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dashboard-subtitle {
  font-size: 1rem;
  color: var(--text-tertiary);
  margin-top: 0.5rem;
}

/* HUD Futurista - Metrics Grid Premium */
.metrics-header-hud {
  margin-bottom: 2.5rem;
  text-align: left;
}

.hud-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 1.25rem;
  background: rgba(255, 71, 87, 0.12);
  border: 1px solid rgba(255, 71, 87, 0.4);
  border-radius: 6px;
  font-size: 0.7rem;
  color: #ff4757;
  margin-bottom: 1.25rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-family: 'Courier New', monospace;
  box-shadow: 0 0 20px rgba(255, 71, 87, 0.3);
}

.hud-pulse-dot {
  width: 8px;
  height: 8px;
  background: #ff4757;
  border-radius: 50%;
  box-shadow: 0 0 12px rgba(255, 71, 87, 0.8);
  animation: hudPulse 2s ease-in-out infinite;
}

@keyframes hudPulse {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 12px rgba(255, 71, 87, 0.8);
  }

  50% {
    opacity: 0.7;
    transform: scale(1.3);
    box-shadow: 0 0 20px rgba(255, 71, 87, 1);
  }
}

.hud-badge-text {
  font-family: 'Courier New', monospace;
  letter-spacing: 0.2em;
}

.hud-title {
  font-size: 2rem;
  font-weight: 900;
  margin: 0 0 0.75rem 0;
  background: linear-gradient(135deg, #ffffff 0%, #00ff88 50%, #00d4ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
  text-shadow: 0 0 40px rgba(0, 255, 136, 0.3);
  line-height: 1.2;
}

.hud-subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.02em;
  opacity: 0.9;
}

.metrics-grid-premium.hud-container {
  display: flex;
  align-items: stretch;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 2.5rem;
  background: rgba(20, 25, 45, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
}

.hud-glow-effect {
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 212, 255, 0.1) 50%, transparent 100%);
  opacity: 0;
  transition: opacity 0.5s;
  border-radius: 24px;
  z-index: 0;
  filter: blur(20px);
  pointer-events: none;
}

.metrics-grid-premium.hud-container:hover {
  border-color: rgba(0, 255, 136, 0.5);
  box-shadow:
    0 16px 60px rgba(0, 255, 136, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 0 0 1px rgba(0, 255, 136, 0.2);
  transform: translateY(-2px);
}

.metrics-grid-premium.hud-container:hover .hud-glow-effect {
  opacity: 0.8;
}

.metric-item-hud {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0 2.5rem;
  position: relative;
  z-index: 1;
}

.metric-item-hud:first-child {
  padding-left: 0;
}

.metric-item-hud:last-child {
  padding-right: 0;
}

.hud-divider {
  width: 1px;
  background: linear-gradient(to bottom,
      transparent 0%,
      rgba(0, 255, 136, 0.2) 20%,
      rgba(0, 255, 136, 0.4) 50%,
      rgba(0, 255, 136, 0.2) 80%,
      transparent 100%);
  margin: 1.5rem 0;
  flex-shrink: 0;
  opacity: 0.7;
  box-shadow: 0 0 8px rgba(0, 255, 136, 0.3);
}

.hud-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.hud-icon-wrapper {
  position: relative;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hud-icon-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 255, 136, 0.05) 100%);
  border: 1.5px solid rgba(0, 255, 136, 0.3);
  border-radius: 14px;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
  box-shadow:
    0 4px 16px rgba(0, 255, 136, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.hud-icon-bg.live {
  background: linear-gradient(135deg, rgba(255, 71, 87, 0.15) 0%, rgba(255, 71, 87, 0.05) 100%);
  border-color: rgba(255, 71, 87, 0.4);
  box-shadow:
    0 4px 16px rgba(255, 71, 87, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.hud-icon-wrapper.live-pulse .hud-icon-bg {
  animation: iconPulseGlow 2s ease-in-out infinite;
}

@keyframes iconPulseGlow {

  0%,
  100% {
    box-shadow:
      0 4px 16px rgba(255, 71, 87, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  50% {
    box-shadow:
      0 8px 24px rgba(255, 71, 87, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
}

.hud-icon {
  position: relative;
  z-index: 1;
  color: var(--accent-primary);
  filter: drop-shadow(0 0 8px rgba(0, 255, 136, 0.4));
  transition: all 0.3s;
}

.hud-icon-wrapper.live-pulse .hud-icon {
  color: #ff4757;
  filter: drop-shadow(0 0 12px rgba(255, 71, 87, 0.6));
}

.metrics-grid-premium.hud-container:hover .hud-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 0 16px rgba(0, 255, 136, 0.6));
}

.hud-trend-indicator {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.trend-arrow {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.hud-trend-indicator.up .trend-arrow {
  background: rgba(0, 255, 136, 0.15);
  color: var(--accent-primary);
}

.hud-trend-indicator.neutral .trend-arrow {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
}

.trend-value {
  font-size: 0.85rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.hud-trend-indicator.up .trend-value {
  color: var(--accent-primary);
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.4);
}

.hud-trend-indicator.neutral .trend-value {
  color: var(--text-secondary);
}

.trend-label {
  font-size: 0.65rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  opacity: 0.8;
}

.hud-value-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 0;
}

.hud-value-main {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  line-height: 1;
}

.hud-currency {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--accent-primary);
  opacity: 0.9;
  margin-right: 0.25rem;
}

.hud-number {
  font-size: 3.5rem;
  font-weight: 900;
  color: var(--accent-primary);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.03em;
  text-shadow:
    0 0 30px rgba(0, 255, 136, 0.4),
    0 0 60px rgba(0, 255, 136, 0.2);
  transition: all 0.3s;
  animation: numberGlow 3s ease-in-out infinite;
}

@keyframes numberGlow {

  0%,
  100% {
    text-shadow:
      0 0 30px rgba(0, 255, 136, 0.4),
      0 0 60px rgba(0, 255, 136, 0.2);
  }

  50% {
    text-shadow:
      0 0 40px rgba(0, 255, 136, 0.6),
      0 0 80px rgba(0, 255, 136, 0.3);
  }
}

.hud-suffix {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--accent-primary);
  opacity: 0.8;
  line-height: 1;
}

.hud-sparkline {
  height: 32px;
  width: 100%;
  opacity: 0.7;
  transition: opacity 0.3s;
  margin-top: 0.5rem;
}

.sparkline-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 4px rgba(0, 255, 136, 0.3));
  animation: sparklinePulse 4s ease-in-out infinite;
}

@keyframes sparklinePulse {

  0%,
  100% {
    opacity: 0.7;
  }

  50% {
    opacity: 1;
  }
}

.metrics-grid-premium.hud-container:hover .hud-sparkline {
  opacity: 1;
}

.hud-label-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.hud-label-main {
  font-size: 0.9rem;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
  opacity: 0.95;
}

.hud-label-micro {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  font-weight: 500;
  letter-spacing: 0.02em;
  opacity: 0.8;
  font-family: 'Courier New', monospace;
}

.hud-time {
  color: var(--accent-primary);
  font-weight: 600;
  text-shadow: 0 0 8px rgba(0, 255, 136, 0.3);
}

.hud-status-live {
  color: #ff4757;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(255, 71, 87, 0.4);
  animation: statusBlink 2s ease-in-out infinite;
}

@keyframes statusBlink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

.hud-trend-positive {
  color: var(--accent-primary);
  font-weight: 600;
}

/* Premium Metric Card */
.metric-card-premium {
  position: relative;
  padding: 2.5rem 2rem;
  background: linear-gradient(135deg, rgba(30, 37, 66, 0.4) 0%, rgba(21, 24, 41, 0.6) 100%);
  border: 1px solid rgba(0, 255, 136, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);
  animation: metricFadeIn 0.6s ease-out forwards;
  animation-delay: var(--delay, 0s);
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.metric-card-premium.animate-in {
  opacity: 1;
  transform: translateY(0);
}

@keyframes metricFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.metric-card-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.4s;
  border-radius: 16px;
  z-index: 0;
  filter: blur(8px);
}

.metric-card-premium:hover {
  transform: translateY(-6px);
  border-color: rgba(0, 255, 136, 0.3);
  box-shadow:
    0 12px 40px rgba(0, 255, 136, 0.15),
    0 0 0 1px rgba(0, 255, 136, 0.1) inset;
}

.metric-card-premium:hover .metric-card-glow {
  opacity: 1;
}

.metric-card-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1.25rem;
}

/* Combined Card Styles */
.metric-card-premium.combined .metric-card-content {
  flex-direction: row;
  align-items: stretch;
  gap: 2rem;
}

.combined-metric {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metric-divider {
  width: 1px;
  background: linear-gradient(to bottom,
      transparent,
      rgba(0, 255, 136, 0.3),
      transparent);
  margin: 0.5rem 0;
  flex-shrink: 0;
}

.combined-metric .metric-icon-premium {
  width: 40px;
  height: 40px;
}

.combined-metric .metric-icon-premium svg {
  width: 20px;
  height: 20px;
}

.combined-metric .metric-value-premium {
  font-size: 2.25rem;
}

.combined-metric .metric-label-premium {
  font-size: 0.8rem;
}

.combined-metric .metric-description {
  font-size: 0.75rem;
}

/* Icon Premium */
.metric-icon-premium {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 255, 136, 0.08);
  border: 1px solid rgba(0, 255, 136, 0.15);
  border-radius: 12px;
  color: var(--accent-primary);
  opacity: 0.8;
  transition: all 0.3s;
}

.metric-card-premium:hover .metric-icon-premium {
  opacity: 1;
  background: rgba(0, 255, 136, 0.12);
  border-color: rgba(0, 255, 136, 0.25);
  transform: scale(1.05);
}

.metric-icon-premium svg {
  width: 24px;
  height: 24px;
  stroke: var(--accent-primary);
}

/* Main Content */
.metric-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metric-value-premium {
  font-size: 2.75rem;
  font-weight: 900;
  color: var(--accent-primary);
  line-height: 1.1;
  letter-spacing: -0.02em;
  transition: all 0.3s;
}

.metric-value-premium.value-updated {
  animation: numberPulse 0.6s ease-out;
}

@keyframes numberPulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
    color: var(--accent-warning);
  }
}

.metric-label-premium {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 0.25rem;
}

.metric-description {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  opacity: 0.7;
  margin-top: 0.25rem;
  line-height: 1.4;
}

/* Trend Indicator */
.metric-trend-premium {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.85rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
  transition: all 0.3s;
}

.metric-trend-premium.up {
  background: rgba(0, 255, 136, 0.12);
  color: var(--accent-primary);
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.metric-trend-premium.down {
  background: rgba(255, 71, 87, 0.12);
  color: var(--accent-error);
  border: 1px solid rgba(255, 71, 87, 0.2);
}

.metric-trend-premium.neutral {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.metric-trend-premium svg {
  width: 12px;
  height: 12px;
}

.metric-trend-premium.down svg {
  transform: rotate(180deg);
}

/* Mini Chart */
.metric-chart-mini {
  height: 32px;
  width: 100%;
  margin-top: auto;
  opacity: 0.5;
  transition: opacity 0.3s;
}

.metric-card-premium:hover .metric-chart-mini {
  opacity: 0.8;
}

.metric-chart-mini svg {
  width: 100%;
  height: 100%;
}

/* Progress Mini */
.metric-progress-mini {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: auto;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary) 0%, rgba(0, 255, 136, 0.6) 100%);
  border-radius: 2px;
  transition: width 1s ease-out;
  box-shadow: 0 0 8px rgba(0, 255, 136, 0.4);
}

.progress-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent-primary);
  min-width: 40px;
  text-align: right;
}

/* Responsive */
@media (max-width: 1200px) {
  .metrics-grid-premium {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}

@media (max-width: 768px) {
  .metrics-grid-premium {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .metric-card-premium {
    padding: 2rem 1.5rem;
    min-height: 180px;
  }

  .metric-card-premium.combined .metric-card-content {
    flex-direction: column;
    gap: 1.5rem;
  }

  .metric-divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(to right,
        transparent,
        rgba(0, 255, 136, 0.3),
        transparent);
    margin: 0.5rem 0;
  }

  .metric-value-premium {
    font-size: 2.25rem;
  }

  .combined-metric .metric-value-premium {
    font-size: 2rem;
  }

  .metric-icon-premium {
    width: 40px;
    height: 40px;
  }

  .metric-icon-premium svg {
    width: 20px;
    height: 20px;
  }
}


/* Recent Bets Section */
.recent-bets-section-modern {
  margin-bottom: 6rem;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.recent-bets-section-modern.animate-in {
  opacity: 1;
  transform: translateY(0);
}

/* Bets List Container - Same pattern as Games */
.bets-list-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.bets-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bet-item {
  padding: 0;
  border-left: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.bet-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-left-color: var(--accent-primary);
  box-shadow: 0 4px 12px rgba(31, 163, 122, 0.15);
}

.bet-item.is-expanded {
  background: rgba(0, 0, 0, 0.2);
  border-left-color: var(--accent-primary);
  box-shadow: 0 0 20px rgba(31, 163, 122, 0.3), 0 4px 12px rgba(31, 163, 122, 0.15);
}

.bet-item.pending {
  border-left-color: var(--accent-warning);
}

.bet-item.pending.is-expanded {
  border-left-color: var(--accent-warning);
  box-shadow: 0 0 20px rgba(255, 217, 61, 0.3), 0 4px 12px rgba(255, 217, 61, 0.15);
}

.bet-item.won {
  border-left-color: var(--accent-primary);
}

.bet-item.won.is-expanded {
  border-left-color: var(--accent-primary);
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3), 0 4px 12px rgba(0, 255, 136, 0.15);
}

.bet-item.lost {
  border-left-color: var(--accent-error);
}

.bet-item.lost.is-expanded {
  border-left-color: var(--accent-error);
  box-shadow: 0 0 20px rgba(255, 71, 87, 0.3), 0 4px 12px rgba(255, 71, 87, 0.15);
}

.bet-item-content {
  display: grid;
  grid-template-columns: 2fr 2fr 2fr auto;
  gap: 1.5rem;
  align-items: center;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.bet-item-content:hover {
  background: rgba(255, 255, 255, 0.02);
}

/* User Info */
.bet-user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar-bet {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--gradient-button);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--gradient-button-text);
  font-size: 1.1rem;
  box-shadow: 0 2px 8px rgba(0, 255, 136, 0.3);
  flex-shrink: 0;
}

.user-info-bet {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name-bet {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.bet-time-bet {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

/* Game Info */
.bet-game-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.game-teams-bet {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.team-name-bet {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.vs-divider-bet {
  padding: 0.25rem 0.5rem;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Market Info */
.bet-market-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.market-type-bet {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.market-label-bet {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.market-value-bet {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.market-odds-bet {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.odds-label-bet {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.odds-value-bet {
  font-weight: 700;
  color: var(--accent-primary);
  font-size: 0.95rem;
}

/* Status Section */
.bet-status-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.status-badge-bet {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.status-badge-bet.pending {
  background: rgba(255, 217, 61, 0.15);
  color: var(--accent-warning);
  border: 1px solid rgba(255, 217, 61, 0.3);
}

.status-badge-bet.won {
  background: rgba(0, 255, 136, 0.15);
  color: var(--accent-primary);
  border: 1px solid rgba(0, 255, 136, 0.3);
}

.status-badge-bet.lost {
  background: rgba(255, 71, 87, 0.15);
  color: var(--accent-error);
  border: 1px solid rgba(255, 71, 87, 0.3);
}

.expand-icon-bet {
  font-size: 0.75rem;
  color: var(--text-secondary);
  transition: transform 0.3s ease;
  user-select: none;
}

.expand-icon-bet.expanded {
  transform: rotate(180deg);
}

.bet-item-content:hover .expand-icon-bet {
  color: var(--accent-primary);
}

/* Expanded Content (Accordion) */
.bet-expanded-content {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.1);
}

.expanded-section {
  margin-bottom: 1.5rem;
}

.expanded-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.section-icon {
  font-size: 1.2rem;
}

.section-title-expanded {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.section-content {
  padding-left: 2rem;
}

.game-info-expanded {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.game-matchup-expanded {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
}

.team-name-expanded {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.vs-expanded {
  padding: 0.4rem 0.8rem;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.market-grid-expanded {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.market-card {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
}

.market-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.market-type-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.market-badge-expanded {
  padding: 0.4rem 0.8rem;
  background: rgba(0, 255, 136, 0.15);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 6px;
  font-weight: 700;
  color: var(--accent-primary);
  font-size: 0.9rem;
}

.market-selection-expanded {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.selection-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.selection-value {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

/* Expand Transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 1000px;
}

/* Responsive */
@media (max-width: 1200px) {
  .bet-item-content {
    grid-template-columns: 2fr 2fr 1.5fr auto;
  }
}

@media (max-width: 768px) {
  .bet-item-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .bet-user-info,
  .bet-game-info,
  .bet-market-info,
  .bet-status-section {
    width: 100%;
  }

  .bet-status-section {
    align-items: flex-start;
  }

  .game-teams-bet {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

/* Featured Games Section */
.featured-games-section-modern {
  margin-bottom: 6rem;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.featured-games-section-modern.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.games-grid-modern {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.game-card-modern {
  position: relative;
  padding: 2rem;
  border-left: 3px solid transparent;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(20px);
  transition-delay: var(--delay, 0s);
  overflow: hidden;
}

.game-card-modern>*:not(.game-card-glow) {
  position: relative;
  z-index: 1;
}

.game-card-modern.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.game-card-modern:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 255, 136, 0.2);
  border-left-color: var(--accent-primary);
}

.game-card-modern.live {
  border-left-color: var(--accent-error);
  animation: livePulse 2s ease-in-out infinite;
}

@keyframes livePulse {

  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.4);
  }

  50% {
    box-shadow: 0 0 0 8px rgba(255, 71, 87, 0);
  }
}

.game-card-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 24px;
  pointer-events: none;
  z-index: 0;
}

.game-card-modern:hover .game-card-glow {
  opacity: 1;
}

.game-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.game-teams-modern {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.team-display {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
}

.team-name-large {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.vs-display {
  text-align: center;
  padding: 0.5rem 0;
}

.vs-text {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.game-status-modern {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.game-status-modern .status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: statusPulse 2s ease-in-out infinite;
}

.game-status-modern.scheduled {
  background: rgba(0, 255, 136, 0.15);
  color: var(--accent-primary);
  border: 1px solid rgba(0, 255, 136, 0.3);
}

.game-status-modern.scheduled .status-dot {
  background: var(--accent-primary);
}

.game-status-modern.live {
  background: rgba(255, 71, 87, 0.15);
  color: var(--accent-error);
  border: 1px solid rgba(255, 71, 87, 0.3);
}

.game-status-modern.live .status-dot {
  background: var(--accent-error);
}

.game-status-modern.closed {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.game-status-modern.closed .status-dot {
  background: var(--text-secondary);
}

@keyframes statusPulse {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

.game-info-modern {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.info-icon {
  font-size: 1.2rem;
}

.game-odds-modern {
  display: flex;
  gap: 1rem;
}

.odds-display {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.odds-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  transition: all 0.3s;
}

.odds-card:hover {
  background: rgba(0, 255, 136, 0.1);
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

.odds-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.odds-value {
  font-weight: 800;
  color: var(--accent-primary);
  font-size: 1.5rem;
}

.game-link-modern {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--accent-primary);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  padding: 0.75rem 1.5rem;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  width: 100%;
  justify-content: center;
  position: relative;
  z-index: 10;
  pointer-events: auto;
  cursor: pointer;
}

.game-link-modern:hover {
  background: rgba(0, 255, 136, 0.2);
  transform: translateX(4px);
}

/* Loading & Empty States */
.loading-state-modern,
.empty-state-modern {
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(0, 255, 136, 0.1);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-subtitle {
  font-size: 0.9rem;
  color: var(--text-tertiary);
  margin-top: 0.5rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
  }

  .hero-visual {
    display: none;
  }

  .hero-title {
    font-size: 4rem;
  }

  .charts-grid-modern {
    grid-template-columns: 1fr;
  }

  .metrics-grid-premium.hud-container {
    padding: 2.5rem 2rem;
  }

  .metric-item-hud {
    padding: 0 1.5rem;
  }
}

@media (max-width: 900px) {
  .metrics-grid-premium.hud-container {
    flex-wrap: wrap;
  }

  .metric-item-hud {
    flex: 1 1 calc(50% - 1rem);
    min-width: 280px;
    padding: 0 1rem;
  }

  .hud-divider {
    width: 1px;
    height: auto;
    margin: 0 1rem;
  }

  .metric-item-hud:nth-child(3) {
    flex: 1 1 100%;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(0, 255, 136, 0.2);
  }

  .metric-item-hud:nth-child(3)~.hud-divider {
    display: none;
  }
}

@media (max-width: 768px) {
  .home-main {
    padding: 1rem;
  }

  .hero-title {
    font-size: 3rem;
  }

  .section-title-modern {
    font-size: 2rem;
  }

  .stats-grid-modern {
    grid-template-columns: 1fr;
  }

  .games-grid-modern {
    grid-template-columns: 1fr;
  }

  .bet-details-modern {
    grid-template-columns: 1fr;
  }

  .section-header-modern {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-tagline {
    flex-direction: column;
    gap: 0.5rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .hero-actions .cta-primary,
  .hero-actions .cta-secondary,
  .hero-actions .cta-tertiary,
  .hero-actions .cta-ranking {
    width: 100%;
    justify-content: center;
  }

  .hero-prize-info {
    flex-direction: column;
  }

  .prize-info-card,
  .limits-info-card {
    min-width: 100%;
  }

  .hero-metrics-section {
    padding-top: 2rem;
  }

  .metrics-header-hud {
    padding: 0 1rem;
    margin-bottom: 2rem;
  }

  .metrics-grid-premium.hud-container {
    flex-direction: column;
    padding: 2.5rem 1.75rem;
    max-width: 100%;
  }

  .hud-title {
    font-size: 1.5rem;
  }

  .hud-subtitle {
    font-size: 0.85rem;
  }

  .metric-item-hud {
    padding: 2rem 0;
  }

  .metric-item-hud:first-child {
    padding-top: 0;
  }

  .metric-item-hud:last-child {
    padding-bottom: 0;
  }

  .hud-divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(to right,
        transparent 0%,
        rgba(0, 255, 136, 0.2) 20%,
        rgba(0, 255, 136, 0.4) 50%,
        rgba(0, 255, 136, 0.2) 80%,
        transparent 100%);
    margin: 0;
  }

  .hud-number {
    font-size: 2.75rem;
  }

  .hud-currency {
    font-size: 1.5rem;
  }

  .hud-suffix {
    font-size: 2rem;
  }

  .hud-icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .hud-icon {
    width: 24px;
    height: 24px;
  }

  .preview-value {
    font-size: 2rem;
  }

  .metrics-title {
    font-size: 1.5rem;
  }


  .hero-visual {
    display: none;
  }
}

.title-icon {
  display: inline-block;
  margin-right: 0.5rem;
  font-size: 1.2em;
}
</style>
