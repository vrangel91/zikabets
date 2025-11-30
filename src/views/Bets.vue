<template>
  <div class="bets-page">
    <!-- Animated Background -->
    <AnimatedBackground :show-image="true" image-url="/bets.png" />

    <!-- Header Animado -->
    <AppHeader />

    <!-- Main Content -->
    <main class="bets-main">
      <!-- Page Header -->
      <section class="page-header">
        <div class="header-text">
          <p class="chip">Histórico de Apostas</p>
          <h2>Minhas Apostas</h2>
          <p class="subtitle">
            Acompanhe todas as suas apostas, incluindo pendentes, ganhas e perdidas.
          </p>
        </div>
        <div v-if="isAuthenticated" class="stats-summary">
          <div class="stat-card glass-panel">
            <span class="stat-label">Total Apostado</span>
            <span class="stat-value">R$ {{ totalBet.toFixed(2) }}</span>
          </div>
          <div class="stat-card glass-panel">
            <span class="stat-label">Ganhos</span>
            <span class="stat-value positive">R$ {{ totalWon.toFixed(2) }}</span>
          </div>
          <div class="stat-card glass-panel">
            <span class="stat-label">Pendentes</span>
            <span class="stat-value">{{ pendingCount }}</span>
          </div>
        </div>
      </section>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state glass-panel">
        <div class="skeleton-loader">
          <div v-for="i in 5" :key="i" class="skeleton-item"></div>
        </div>
      </div>

      <!-- Auth Required -->
      <div v-else-if="!isAuthenticated" class="auth-required glass-panel">
        <p class="auth-title">Acesso restrito</p>
        <p class="auth-description">
          Você precisa estar logado para visualizar suas apostas.
        </p>
        <div class="auth-actions">
          <RouterLink to="/login" class="cta">Entrar</RouterLink>
          <RouterLink to="/register" class="cta secondary">Cadastrar</RouterLink>
        </div>
      </div>

      <!-- Bets List -->
      <div v-else-if="bets.length > 0" class="bets-list-container">
        <!-- Filters and Sort -->
        <div class="controls-bar glass-panel">
          <div class="filters">
            <button v-for="filter in filters" :key="filter.value" @click="activeFilter = filter.value"
              class="filter-btn" :class="{ active: activeFilter === filter.value }">
              {{ filter.label }}
              <span class="filter-count">({{ getFilterCount(filter.value) }})</span>
            </button>
          </div>
          <div class="sort-controls">
            <select v-model="sortBy" class="sort-select">
              <option value="recent">Mais Recente</option>
              <option value="oldest">Mais Antiga</option>
              <option value="amount-high">Maior Aposta</option>
              <option value="amount-low">Menor Aposta</option>
              <option value="odds-high">Maior Odd</option>
              <option value="odds-low">Menor Odd</option>
            </select>
          </div>
        </div>

        <!-- Bets List -->
        <div class="bets-list">
          <div v-for="bet in sortedAndFilteredBets" :key="bet.id" class="bet-item glass-panel"
            :class="[bet.status.toLowerCase(), { 'is-expanded': isExpanded(bet.id) }]">
            <!-- Main Row (Always Visible) -->
            <div class="bet-item-content" @click="toggleBetDetails(bet)">
              <!-- Left: Game Info -->
              <div class="bet-game-info">
                <div class="game-teams">
                  <span class="team-name">{{ getGameTeamA(bet) }}</span>
                  <span class="vs-divider">VS</span>
                  <span class="team-name">{{ getGameTeamB(bet) }}</span>
                </div>
                <div class="bet-meta">
                  <span class="meta-item">
                    <span class="meta-icon">🕐</span>
                    {{ formatDateTime(bet.game?.startTime || bet.bets?.[0]?.game?.startTime) }}
                  </span>
                  <span class="meta-item">
                    <span class="meta-icon">📅</span>
                    {{ formatDate(bet.createdAt) }}
                  </span>
                </div>
              </div>

              <!-- Center: Bet Details -->
              <div class="bet-details-compact">
                <div class="bet-type-row">
                  <span class="bet-type-badge" :class="getBetTypeClass(bet)">
                    {{ getBetTypeIcon(bet) }} {{ getBetTypeLabel(bet) }}
                  </span>
                  <span v-if="bet.isMultiple" class="multiple-tag">
                    🎯 Múltipla ({{ bet.bets?.length || 0 }})
                  </span>
                </div>
                <div class="bet-selection">
                  <span v-if="!bet.isMultiple" class="selection-text">
                    {{ formatSelectionSync(bet) }}
                  </span>
                  <span v-else class="selection-text">
                    {{ bet.bets?.length || 0 }} seleções
                  </span>
                </div>
              </div>

              <!-- Right: Stats -->
              <div class="bet-stats">
                <div class="stat-group">
                  <span class="stat-label-small">Valor</span>
                  <span class="stat-value-small">
                    R$ {{ (bet.isMultiple ? bet.totalAmount : bet.amount).toFixed(2) }}
                  </span>
                </div>
                <div class="stat-group">
                  <span class="stat-label-small">Odds</span>
                  <span class="stat-value-small odds">
                    {{ (bet.isMultiple ? bet.totalOdds : bet.odds).toFixed(2) }}x
                  </span>
                </div>
                <div class="stat-group">
                  <span class="stat-label-small">Retorno</span>
                  <span class="stat-value-small return">
                    R$ {{ getPotentialReturn(bet).toFixed(2) }}
                  </span>
                </div>
              </div>

              <!-- Status Badge -->
              <div class="bet-status-section">
                <span class="status-badge-compact" :class="bet.status.toLowerCase()">
                  {{ getStatusLabel(bet.status) }}
                </span>
                <span class="expand-icon" :class="{ 'expanded': isExpanded(bet.id) }">
                  ▼
                </span>
              </div>
            </div>

            <!-- Expanded Details (Accordion Content) -->
            <transition name="expand">
              <div v-if="isExpanded(bet.id)" class="bet-expanded-content">
                <!-- Game Info Section -->
                <div class="expanded-section">
                  <div class="section-header">
                    <span class="section-icon">🎮</span>
                    <h4 class="section-title-expanded">Informações do Jogo</h4>
                  </div>
                  <div class="section-content">
                    <div class="game-info-expanded">
                      <div class="game-matchup-expanded">
                        <span class="team-name-expanded">{{ getGameTeamA(bet) }}</span>
                        <span class="vs-expanded">VS</span>
                        <span class="team-name-expanded">{{ getGameTeamB(bet) }}</span>
                      </div>
                      <div class="game-date-expanded">
                        <span class="info-icon">🕐</span>
                        <span>{{ formatDateTime(bet.game?.startTime || bet.bets?.[0]?.game?.startTime) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Multiple Bet Selections -->
                <div v-if="bet.isMultiple" class="expanded-section">
                  <div class="section-header">
                    <span class="section-icon">🎯</span>
                    <h4 class="section-title-expanded">Seleções da Múltipla ({{ bet.bets.length }})</h4>
                  </div>
                  <div class="section-content">
                    <div class="selections-grid">
                      <div v-for="(singleBet, index) in bet.bets" :key="singleBet.id" class="selection-card"
                        :class="singleBet.status.toLowerCase()">
                        <div class="selection-number-badge">{{ index + 1 }}</div>
                        <div class="selection-info-expanded">
                          <div class="selection-header-expanded">
                            <span class="selection-type-expanded">{{ getSelectionTypeLabel(singleBet.type) }}</span>
                            <span class="odds-badge-expanded">{{ singleBet.odds.toFixed(2) }}x</span>
                          </div>
                          <div class="selection-value-expanded">{{ formatSelectionSync(singleBet) }}</div>
                          <div class="selection-status-expanded" :class="singleBet.status.toLowerCase()">
                            {{ getStatusLabel(singleBet.status) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Simple Bet Selection -->
                <div v-else class="expanded-section">
                  <div class="section-header">
                    <span class="section-icon">🎲</span>
                    <h4 class="section-title-expanded">Seleção</h4>
                  </div>
                  <div class="section-content">
                    <div class="selection-simple-expanded">
                      <div class="selection-type-row-expanded">
                        <span class="selection-type-badge-expanded">{{ getBetTypeLabel(bet.type) }}</span>
                        <span class="odds-badge-expanded">{{ bet.odds.toFixed(2) }}x</span>
                      </div>
                      <div class="selection-value-simple-expanded">{{ formatSelectionSync(bet) }}</div>
                    </div>
                  </div>
                </div>

                <!-- Financial Summary -->
                <div class="expanded-section">
                  <div class="section-header">
                    <span class="section-icon">💰</span>
                    <h4 class="section-title-expanded">Resumo Financeiro</h4>
                  </div>
                  <div class="section-content">
                    <div class="financial-grid">
                      <div class="financial-item">
                        <span class="financial-icon">💵</span>
                        <div class="financial-info">
                          <span class="financial-label">Valor Apostado</span>
                          <span class="financial-value">
                            R$ {{ (bet.isMultiple ? bet.totalAmount : bet.amount).toFixed(2) }}
                          </span>
                        </div>
                      </div>
                      <div class="financial-item">
                        <span class="financial-icon">📊</span>
                        <div class="financial-info">
                          <span class="financial-label">Odds Total</span>
                          <span class="financial-value odds-highlight">
                            {{ (bet.isMultiple ? bet.totalOdds : bet.odds).toFixed(2) }}x
                          </span>
                        </div>
                      </div>
                      <div class="financial-item">
                        <span class="financial-icon">📈</span>
                        <div class="financial-info">
                          <span class="financial-label">Retorno Potencial</span>
                          <span class="financial-value return-highlight">
                            R$ {{ getPotentialReturn(bet).toFixed(2) }}
                          </span>
                        </div>
                      </div>
                      <div v-if="bet.status === 'WON'" class="financial-item won-item">
                        <span class="financial-icon">🎉</span>
                        <div class="financial-info">
                          <span class="financial-label">Ganho Real</span>
                          <span class="financial-value won-highlight">
                            R$ {{ getPotentialReturn(bet).toFixed(2) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Metadata -->
                <div class="expanded-section">
                  <div class="section-header">
                    <span class="section-icon">ℹ️</span>
                    <h4 class="section-title-expanded">Informações da Aposta</h4>
                  </div>
                  <div class="section-content">
                    <div class="metadata-list">
                      <div class="metadata-row">
                        <span class="metadata-label-expanded">ID da Aposta</span>
                        <div class="metadata-value-with-copy-expanded">
                          <code class="bet-id-code-expanded">{{ bet.id }}</code>
                          <button class="copy-btn-expanded" @click.stop="copyBetId(bet.id)" title="Copiar ID">
                            📋
                          </button>
                        </div>
                      </div>
                      <div class="metadata-row">
                        <span class="metadata-label-expanded">Data da Aposta</span>
                        <span class="metadata-value-expanded">{{ formatDateTime(bet.createdAt) }}</span>
                      </div>
                      <div class="metadata-row">
                        <span class="metadata-label-expanded">Status</span>
                        <span class="status-badge-expanded" :class="bet.status.toLowerCase()">
                          {{ getStatusLabel(bet.status) }}
                        </span>
                      </div>
                      <div v-if="bet.isMultiple" class="metadata-row">
                        <span class="metadata-label-expanded">Tipo</span>
                        <span class="metadata-value-expanded">Aposta Múltipla</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state glass-panel">
        <div class="empty-icon">🎯</div>
        <p class="empty-title">Nenhuma aposta encontrada</p>
        <p class="empty-description">
          Você ainda não fez nenhuma aposta. Explore os jogos disponíveis e comece a apostar!
        </p>
        <RouterLink to="/games" class="cta">Ver Jogos</RouterLink>
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Vue module resolution
import { ref, computed, onMounted } from 'vue';
// @ts-ignore - Vue Router module resolution
import { RouterLink } from 'vue-router';
import { useUserStore } from '@/store/useUserStore';
import { useGameStore } from '@/store/useGameStore';
// @ts-ignore - Vue component import
// @ts-ignore - Vue component with script setup
import AppHeader from '@/components/AppHeader.vue';
// @ts-ignore - Vue component with script setup
import AnimatedBackground from '@/components/AnimatedBackground.vue';
import api from '@/services/api';
import { routes } from '@/utils/routes';

const userStore = useUserStore();
const gameStore = useGameStore();

const activeFilter = ref('all');
const sortBy = ref('recent');
const expandedBetId = ref<string | null>(null);

const isAuthenticated = computed(() => userStore.isAuthenticated);
const loading = computed(() => gameStore.loading);
const bets = computed(() => gameStore.bets);

const filters = [
  { label: 'Todas', value: 'all' },
  { label: 'Pendentes', value: 'pending' },
  { label: 'Ganhas', value: 'won' },
  { label: 'Perdidas', value: 'lost' },
];

const totalBet = computed(() => {
  return bets.value.reduce((sum: number, bet: any) => sum + bet.amount, 0);
});

const totalWon = computed(() => {
  return bets.value
    .filter((bet: any) => bet.status === 'WON')
    .reduce((sum: number, bet: any) => sum + bet.amount * bet.odds, 0);
});

const pendingCount = computed(() => {
  return bets.value.filter((bet: any) => bet.status === 'PENDING').length;
});

// Agrupar apostas múltiplas
const groupedBets = computed(() => {
  const grouped = new Map<string, any[]>();
  const singleBets: any[] = [];

  bets.value.forEach((bet: any) => {
    if (bet.isMultiple && bet.multipleId) {
      if (!grouped.has(bet.multipleId)) {
        grouped.set(bet.multipleId, []);
      }
      grouped.get(bet.multipleId)!.push(bet);
    } else {
      singleBets.push(bet);
    }
  });

  const multipleGroups = Array.from(grouped.entries()).map(([multipleId, groupBets]) => {
    const firstBet = groupBets[0];
    const totalAmount = groupBets.reduce((sum: number, b: any) => sum + b.amount, 0);
    const totalOdds = groupBets.reduce((prod: number, b: any) => prod * b.odds, 1);
    const allWon = groupBets.every((b: any) => b.status === 'WON');
    const allLost = groupBets.every((b: any) => b.status === 'LOST');

    let status = 'PENDING';
    if (allWon) status = 'WON';
    else if (allLost) status = 'LOST';
    else if (groupBets.some((b: any) => b.status === 'LOST')) status = 'LOST';

    return {
      id: multipleId,
      isMultiple: true,
      bets: groupBets,
      game: firstBet.game,
      status,
      totalAmount,
      totalOdds,
      createdAt: firstBet.createdAt,
    };
  });

  return [...multipleGroups, ...singleBets];
});

const filteredBets = computed(() => {
  const allBets = groupedBets.value;
  if (activeFilter.value === 'all') {
    return allBets;
  }
  return allBets.filter((bet: any) => {
    if (bet.isMultiple) {
      return bet.status.toLowerCase() === activeFilter.value;
    }
    return bet.status.toLowerCase() === activeFilter.value.toUpperCase();
  });
});

const sortedAndFilteredBets = computed(() => {
  const filtered = [...filteredBets.value];

  switch (sortBy.value) {
    case 'recent':
      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'oldest':
      return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case 'amount-high':
      return filtered.sort((a, b) => {
        const aAmount = a.isMultiple ? a.totalAmount : a.amount;
        const bAmount = b.isMultiple ? b.totalAmount : b.amount;
        return bAmount - aAmount;
      });
    case 'amount-low':
      return filtered.sort((a, b) => {
        const aAmount = a.isMultiple ? a.totalAmount : a.amount;
        const bAmount = b.isMultiple ? b.totalAmount : b.amount;
        return aAmount - bAmount;
      });
    case 'odds-high':
      return filtered.sort((a, b) => {
        const aOdds = a.isMultiple ? a.totalOdds : a.odds;
        const bOdds = b.isMultiple ? b.totalOdds : b.odds;
        return bOdds - aOdds;
      });
    case 'odds-low':
      return filtered.sort((a, b) => {
        const aOdds = a.isMultiple ? a.totalOdds : a.odds;
        const bOdds = b.isMultiple ? b.totalOdds : b.odds;
        return aOdds - bOdds;
      });
    default:
      return filtered;
  }
});

const getFilterCount = (filterValue: string) => {
  if (filterValue === 'all') {
    return groupedBets.value.length;
  }
  return filteredBets.value.length;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'Pendente',
    WON: 'Ganhou',
    LOST: 'Perdeu',
  };
  return labels[status] || status;
};

const getBetTypeLabel = (bet: any) => {
  if (bet.isMultiple) {
    return 'Múltipla';
  }
  const labels: Record<string, string> = {
    WINNER: 'Vencedor',
    DURATION: 'Duração',
    TOP_KILLER: 'Top Killer',
  };
  return labels[bet.type] || bet.type;
};

const getBetTypeIcon = (bet: any) => {
  if (bet.isMultiple) return '🎯';
  const icons: Record<string, string> = {
    WINNER: '🏆',
    DURATION: '⏱️',
    TOP_KILLER: '⚔️',
    LOWEST_DEATHS: '🛡️',
  };
  return icons[bet.type] || '📋';
};

const getBetTypeClass = (bet: any) => {
  if (bet.isMultiple) return 'type-multiple';
  const classes: Record<string, string> = {
    WINNER: 'type-winner',
    DURATION: 'type-duration',
    TOP_KILLER: 'type-killer',
    LOWEST_DEATHS: 'type-deaths',
  };
  return classes[bet.type] || '';
};

const getSelectionTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    WINNER: 'Vencedor',
    DURATION: 'Duração',
    TOP_KILLER: 'Top Killer',
    LOWEST_DEATHS: 'Top Dead',
  };
  return labels[type] || type;
};

const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatDateTime = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getGameTeamA = (bet: any) => {
  return bet.game?.teamA?.name || bet.bets?.[0]?.game?.teamA?.name || 'Time A';
};

const getGameTeamB = (bet: any) => {
  return bet.game?.teamB?.name || bet.bets?.[0]?.game?.teamB?.name || 'Time B';
};

const getPotentialReturn = (bet: any) => {
  if (bet.isMultiple) {
    return bet.totalAmount * bet.totalOdds;
  }
  return bet.amount * bet.odds;
};

// Cache de jogadores
const playersCache = ref<Map<string, any[]>>(new Map());
const playersLoading = ref<Set<string>>(new Set());

const getPlayersForGame = async (game: any): Promise<any[]> => {
  const cacheKey = game.id;
  if (playersCache.value.has(cacheKey)) {
    return playersCache.value.get(cacheKey)!;
  }

  if (playersLoading.value.has(cacheKey)) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return playersCache.value.get(cacheKey) || [];
  }

  playersLoading.value.add(cacheKey);

  try {
    const teamsResponse = await api.get(routes.admin.teams.list());
    const teams = teamsResponse.data.teams || [];

    const teamA = teams.find((t: any) => t.id === game.teamAId);
    const teamB = teams.find((t: any) => t.id === game.teamBId);

    const players = [...(teamA?.players || []), ...(teamB?.players || [])];
    playersCache.value.set(cacheKey, players);
    return players;
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error);
    return [];
  } finally {
    playersLoading.value.delete(cacheKey);
  }
};

const formatSelectionSync = (bet: any): string => {
  if (bet.type === 'WINNER') {
    if (bet.selection === bet.game.teamAId) {
      return bet.game.teamA?.name || 'Time A';
    } else if (bet.selection === bet.game.teamBId) {
      return bet.game.teamB?.name || 'Time B';
    }
    return bet.selection;
  } else if (bet.type === 'DURATION') {
    return `${bet.selection} min`;
  } else if (bet.type === 'TOP_KILLER') {
    const cacheKey = bet.game.id;
    const players = playersCache.value.get(cacheKey) || [];
    const player = players.find((p: any) => p.id === bet.selection);
    if (player) {
      return player.name;
    }
    if (!playersLoading.value.has(cacheKey)) {
      getPlayersForGame(bet.game);
    }
    return bet.selection;
  }
  return bet.selection;
};

const toggleBetDetails = (bet: any) => {
  if (expandedBetId.value === bet.id) {
    expandedBetId.value = null;
  } else {
    expandedBetId.value = bet.id;
  }
};

const isExpanded = (betId: string) => {
  return expandedBetId.value === betId;
};

const copyBetId = async (id: string) => {
  try {
    await navigator.clipboard.writeText(id);
    // Você pode adicionar uma notificação aqui
    alert('ID copiado para a área de transferência!');
  } catch (error) {
    console.error('Erro ao copiar ID:', error);
  }
};

onMounted(async () => {
  if (userStore.token) {
    await userStore.fetchProfile();
    await gameStore.fetchBets();

    const topKillerBets = bets.value.filter((b: any) => b.type === 'TOP_KILLER');
    const uniqueGames = new Map();
    topKillerBets.forEach((bet: any) => {
      if (!uniqueGames.has(bet.game.id)) {
        uniqueGames.set(bet.game.id, bet.game);
      }
    });

    for (const game of uniqueGames.values()) {
      await getPlayersForGame(game);
    }
  }
});
</script>

<style scoped>
.bets-page {
  min-height: 100vh;
  background: var(--gradient-bg), var(--bg-primary);
  color: var(--text-primary);
}

.bets-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  flex-wrap: wrap;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.chip {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  background: rgba(31, 163, 122, 0.15);
  border: 1px solid rgba(14, 255, 224, 0.3);
  border-radius: 8px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent-primary);
  width: fit-content;
}

.header-text h2 {
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  margin: 0;
  line-height: 1.2;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
}

.stats-summary {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-card {
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 140px;
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-primary);
}

.stat-value.positive {
  color: #00ff88;
}

/* Loading State */
.loading-state {
  padding: 2rem;
}

.skeleton-loader {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-item {
  height: 80px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 12px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

/* Auth Required */
.auth-required {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.auth-description {
  margin: 0 0 2rem 0;
  color: var(--text-secondary);
}

.auth-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.cta {
  display: inline-block;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  background: var(--gradient-button);
  color: var(--gradient-button-text);
  text-decoration: none;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  transition: transform 0.2s, box-shadow 0.2s;
}

.cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(14, 255, 224, 0.3);
}

.cta.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #f7f7ff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Controls Bar */
.controls-bar {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.filters {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.6rem 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
  font-weight: 500;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.filter-btn.active {
  background: var(--gradient-button);
  color: var(--gradient-button-text);
  border-color: transparent;
}

.filter-count {
  font-size: 0.75rem;
  opacity: 0.8;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-select {
  padding: 0.6rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.sort-select:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.sort-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(31, 163, 122, 0.2);
}

/* Bets List */
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
  background: rgba(255, 255, 255, 0.03);
  margin-bottom: 0.75rem;
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
  border-left-color: #0ef;
}

.bet-item.pending.is-expanded {
  border-left-color: #0ef;
  box-shadow: 0 0 20px rgba(14, 255, 224, 0.3), 0 4px 12px rgba(14, 255, 224, 0.15);
}

.bet-item.won {
  border-left-color: #00ff88;
}

.bet-item.won.is-expanded {
  border-left-color: #00ff88;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3), 0 4px 12px rgba(0, 255, 136, 0.15);
}

.bet-item.lost {
  border-left-color: #ff7b9a;
}

.bet-item.lost.is-expanded {
  border-left-color: #ff7b9a;
  box-shadow: 0 0 20px rgba(255, 123, 154, 0.3), 0 4px 12px rgba(255, 123, 154, 0.15);
}

.bet-item-content {
  display: grid;
  grid-template-columns: 2fr 2fr 1.5fr auto;
  gap: 1.5rem;
  align-items: center;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bet-item-content:hover {
  background: rgba(255, 255, 255, 0.02);
}

.bet-game-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.game-teams {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
}

.team-name {
  font-size: 1rem;
  color: var(--text-primary);
}

.vs-divider {
  padding: 0.25rem 0.5rem;
  background: rgba(31, 163, 122, 0.15);
  border: 1px solid rgba(14, 255, 224, 0.3);
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--accent-primary);
}

.bet-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.meta-icon {
  font-size: 0.9rem;
}

.bet-details-compact {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bet-type-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.bet-type-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.bet-type-badge.type-winner {
  background: rgba(255, 215, 0, 0.15);
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.bet-type-badge.type-duration {
  background: rgba(14, 255, 224, 0.15);
  color: #0ef;
  border: 1px solid rgba(14, 255, 224, 0.3);
}

.bet-type-badge.type-killer {
  background: rgba(147, 61, 255, 0.15);
  color: #933dff;
  border: 1px solid rgba(147, 61, 255, 0.3);
}

.bet-type-badge.type-multiple {
  background: rgba(31, 163, 122, 0.15);
  color: var(--accent-primary);
  border: 1px solid rgba(31, 163, 122, 0.3);
}

.multiple-tag {
  padding: 0.3rem 0.6rem;
  background: rgba(147, 61, 255, 0.2);
  border: 1px solid rgba(147, 61, 255, 0.4);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #933dff;
}

.bet-selection {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.selection-text {
  font-weight: 500;
}

.bet-stats {
  display: flex;
  gap: 1.5rem;
  justify-content: flex-end;
}

.stat-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.stat-label-small {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value-small {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-value-small.odds {
  color: #933dff;
}

.stat-value-small.return {
  color: var(--accent-primary);
}

.bet-status-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.status-badge-compact {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge-compact.pending {
  background: rgba(31, 163, 122, 0.15);
  color: var(--accent-primary);
  border: 1px solid rgba(14, 255, 224, 0.3);
}

.status-badge-compact.won {
  background: rgba(0, 255, 136, 0.15);
  color: #00ff88;
  border: 1px solid rgba(0, 255, 136, 0.3);
}

.status-badge-compact.lost {
  background: rgba(255, 123, 154, 0.15);
  color: #ff7b9a;
  border: 1px solid rgba(255, 123, 154, 0.3);
}

.expand-icon {
  font-size: 0.9rem;
  color: var(--text-tertiary);
  transition: transform 0.3s ease;
  display: inline-block;
}

.expand-icon.expanded {
  transform: rotate(180deg);
  color: var(--accent-primary);
}

.bet-item-content:hover .expand-icon {
  color: var(--accent-primary);
}

/* Expanded Content (Accordion) */
.bet-expanded-content {
  padding: 0 1.5rem 1.5rem 1.5rem;
  background: rgba(0, 0, 0, 0.15);
  border-top: 1px solid rgba(31, 163, 122, 0.2);
  margin-top: 0.5rem;
}

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
  max-height: 2000px;
}

.expanded-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.expanded-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
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
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.section-content {
  padding-left: 2rem;
}

/* Game Info Expanded */
.game-info-expanded {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.game-matchup-expanded {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.team-name-expanded {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
}

.vs-expanded {
  padding: 0.4rem 0.8rem;
  background: rgba(31, 163, 122, 0.15);
  border: 1px solid rgba(14, 255, 224, 0.3);
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--accent-primary);
}

.game-date-expanded {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Selections Grid */
.selections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.selection-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border-left: 3px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s;
}

.selection-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.selection-card.won {
  border-left-color: #00ff88;
  background: rgba(0, 255, 136, 0.05);
}

.selection-card.lost {
  border-left-color: #ff7b9a;
  background: rgba(255, 123, 154, 0.05);
}

.selection-number-badge {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(31, 163, 122, 0.2);
  border-radius: 50%;
  font-weight: 700;
  color: var(--accent-primary);
  flex-shrink: 0;
  font-size: 0.9rem;
}

.selection-info-expanded {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.selection-header-expanded {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selection-type-expanded {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.odds-badge-expanded {
  padding: 0.3rem 0.6rem;
  background: rgba(147, 61, 255, 0.2);
  border: 1px solid rgba(147, 61, 255, 0.4);
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #933dff;
}

.selection-value-expanded {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.selection-status-expanded {
  font-size: 0.75rem;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-weight: 600;
  text-transform: uppercase;
  width: fit-content;
}

.selection-status-expanded.pending {
  background: rgba(31, 163, 122, 0.15);
  color: var(--accent-primary);
}

.selection-status-expanded.won {
  background: rgba(0, 255, 136, 0.15);
  color: #00ff88;
}

.selection-status-expanded.lost {
  background: rgba(255, 123, 154, 0.15);
  color: #ff7b9a;
}

/* Simple Selection Expanded */
.selection-simple-expanded {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.selection-type-row-expanded {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.selection-type-badge-expanded {
  padding: 0.5rem 1rem;
  background: rgba(31, 163, 122, 0.15);
  border: 1px solid rgba(31, 163, 122, 0.3);
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent-primary);
}

.selection-value-simple-expanded {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* Financial Grid */
.financial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.financial-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.2s;
}

.financial-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.financial-item.won-item {
  grid-column: 1 / -1;
  border-color: rgba(0, 255, 136, 0.3);
  background: rgba(0, 255, 136, 0.05);
}

.financial-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.financial-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.financial-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.financial-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.financial-value.odds-highlight {
  color: #933dff;
}

.financial-value.return-highlight {
  color: var(--accent-primary);
}

.financial-value.won-highlight {
  color: #00ff88;
  font-size: 1.4rem;
}

/* Metadata List */
.metadata-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metadata-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.metadata-label-expanded {
  font-size: 0.85rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metadata-value-expanded {
  font-size: 0.95rem;
  color: var(--text-primary);
  font-weight: 500;
}

.metadata-value-with-copy-expanded {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bet-id-code-expanded {
  flex: 1;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: var(--accent-primary);
  word-break: break-all;
}

.copy-btn-expanded {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.copy-btn-expanded:hover {
  background: rgba(31, 163, 122, 0.2);
  border-color: var(--accent-primary);
  transform: scale(1.1);
}

.status-badge-expanded {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge-expanded.pending {
  background: rgba(31, 163, 122, 0.15);
  color: var(--accent-primary);
  border: 1px solid rgba(14, 255, 224, 0.3);
}

.status-badge-expanded.won {
  background: rgba(0, 255, 136, 0.15);
  color: #00ff88;
  border: 1px solid rgba(0, 255, 136, 0.3);
}

.status-badge-expanded.lost {
  background: rgba(255, 123, 154, 0.15);
  color: #ff7b9a;
  border: 1px solid rgba(255, 123, 154, 0.3);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-description {
  margin: 0 0 2rem 0;
  color: var(--text-secondary);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .bets-main {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
  }

  .stats-summary {
    width: 100%;
  }

  .stat-card {
    flex: 1;
    min-width: auto;
  }

  .controls-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filters {
    width: 100%;
    justify-content: center;
  }

  .bet-item-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .bet-stats {
    justify-content: space-between;
  }

  .bet-expanded-content {
    padding: 0 1rem 1rem 1rem;
  }

  .section-content {
    padding-left: 1rem;
  }

  .selections-grid {
    grid-template-columns: 1fr;
  }

  .financial-grid {
    grid-template-columns: 1fr;
  }

  .metadata-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
