<template>
  <div class="close-game">
    <AdminHeader />

    <main class="admin-main">
      <div class="page-header">
        <h2>Fechar Jogo e Liquidar Apostas</h2>
        <p>Defina o resultado do jogo para liquidar todas as apostas automaticamente</p>
      </div>

      <!-- Seleção de jogo -->
      <div class="game-selector glass-panel">
        <h3>Selecionar Jogo</h3>
        <div class="selector-content">
          <select v-model="selectedGameId" @change="loadGameData" :disabled="loading">
            <option value="">Selecione um jogo</option>
            <option v-for="game in scheduledGames" :key="game.id" :value="game.id">
              {{ game.teamA.name }} vs {{ game.teamB.name }} - {{ formatDateTime(game.startTime) }}
            </option>
          </select>
          <p v-if="!selectedGameId" class="hint">
            Selecione um jogo para definir o resultado e fechar
          </p>
        </div>
      </div>

      <!-- Formulário para fechar jogo -->
      <div v-if="selectedGame && selectedGameId" class="close-form-section glass-panel">
        <div class="game-info">
          <h3>{{ selectedGame.teamA.name }} vs {{ selectedGame.teamB.name }}</h3>
          <p class="game-date">{{ formatDateTime(selectedGame.startTime) }}</p>
          <div class="game-stats">
            <div class="stat-item">
              <span class="stat-label">Apostas Pendentes</span>
              <span class="stat-value">{{ pendingBetsCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Total Apostado</span>
              <span class="stat-value">R$ {{ totalBetAmount.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleCloseGame" class="close-form">
          <!-- Vencedor -->
          <div class="form-section">
            <h4>Time Vencedor</h4>
            <div class="winner-options">
              <label class="winner-option">
                <input type="radio" v-model="form.winnerId" :value="selectedGame.teamAId" :disabled="loading" />
                <div class="option-content">
                  <span class="team-name">{{ selectedGame.teamA.name }}</span>
                  <span class="team-odds">Odds: {{ selectedGame.odds?.teamAOdds || 'N/A' }}x</span>
                </div>
              </label>
              <label class="winner-option">
                <input type="radio" v-model="form.winnerId" :value="selectedGame.teamBId" :disabled="loading" />
                <div class="option-content">
                  <span class="team-name">{{ selectedGame.teamB.name }}</span>
                  <span class="team-odds">Odds: {{ selectedGame.odds?.teamBOdds || 'N/A' }}x</span>
                </div>
              </label>
              <label class="winner-option">
                <input type="radio" v-model="form.winnerId" value="" :disabled="loading" />
                <div class="option-content">
                  <span class="team-name">Empate / Sem vencedor</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Duração -->
          <div class="form-section">
            <h4>Duração da Partida (minutos)</h4>
            <div class="duration-input">
              <input type="number" v-model.number="form.duration" min="1" step="1" placeholder="Ex: 35"
                :disabled="loading" />
              <small class="field-hint">
                Duração total da partida em minutos. Será usado para calcular a faixa de duração.
              </small>
            </div>
            <div v-if="form.duration" class="duration-preview">
              <span class="preview-label">Faixa de duração:</span>
              <span class="preview-value">{{ getDurationBand(form.duration) }} min</span>
            </div>
          </div>

          <!-- Top Killer -->
          <div class="form-section">
            <h4>Jogador com Mais Kills (Top Killer)</h4>
            <div class="top-killer-input">
              <select v-model="form.topKiller" :disabled="loading || !gamePlayers.length">
                <option value="">Selecione o jogador</option>
                <optgroup v-for="team in gameTeams" :key="team.id" :label="team.name">
                  <option v-for="player in team.players" :key="player.id" :value="player.id">
                    {{ player.name }}
                  </option>
                </optgroup>
              </select>
              <small class="field-hint">
                Selecione o jogador que teve mais kills na partida
              </small>
            </div>
          </div>

          <!-- Lowest Deaths -->
          <div class="form-section">
            <h4>Jogador Top Dead</h4>
            <div class="top-killer-input">
              <select v-model="form.lowestDeaths" :disabled="loading || !gamePlayers.length">
                <option value="">Selecione o jogador</option>
                <optgroup v-for="team in gameTeams" :key="team.id" :label="team.name">
                  <option v-for="player in team.players" :key="player.id" :value="player.id">
                    {{ player.name }}
                  </option>
                </optgroup>
              </select>
              <small class="field-hint">
                Selecione o jogador Top Dead na partida
              </small>
            </div>
          </div>

          <!-- Total de Roshan -->
          <div class="form-section">
            <h4>Total de Roshan na Partida</h4>
            <div class="duration-input">
              <input type="number" v-model.number="form.roshanTotal" min="0" step="1" placeholder="Ex: 3"
                :disabled="loading" />
              <small class="field-hint">
                Número total de Roshans feitos na partida
              </small>
            </div>
          </div>

          <!-- Primeiro Roshan -->
          <div class="form-section">
            <h4>Time que fez o Primeiro Roshan</h4>
            <div class="winner-options">
              <label class="winner-option">
                <input type="radio" v-model="form.firstRoshanTeamId" :value="selectedGame.teamAId" :disabled="loading" />
                <div class="option-content">
                  <span class="team-name">{{ selectedGame.teamA.name }}</span>
                </div>
              </label>
              <label class="winner-option">
                <input type="radio" v-model="form.firstRoshanTeamId" :value="selectedGame.teamBId" :disabled="loading" />
                <div class="option-content">
                  <span class="team-name">{{ selectedGame.teamB.name }}</span>
                </div>
              </label>
              <label class="winner-option">
                <input type="radio" v-model="form.firstRoshanTeamId" value="" :disabled="loading" />
                <div class="option-content">
                  <span class="team-name">Nenhum / Não aplicável</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Primeiro !ff -->
          <div class="form-section">
            <h4>Time que deu !ff</h4>
            <div class="winner-options">
              <label class="winner-option">
                <input type="radio" v-model="form.firstFFTeamId" :value="selectedGame.teamAId" :disabled="loading" />
                <div class="option-content">
                  <span class="team-name">{{ selectedGame.teamA.name }}</span>
                </div>
              </label>
              <label class="winner-option">
                <input type="radio" v-model="form.firstFFTeamId" :value="selectedGame.teamBId" :disabled="loading" />
                <div class="option-content">
                  <span class="team-name">{{ selectedGame.teamB.name }}</span>
                </div>
              </label>
              <label class="winner-option">
                <input type="radio" v-model="form.firstFFTeamId" value="" :disabled="loading" />
                <div class="option-content">
                  <span class="team-name">Nenhum / Não aplicável</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Resumo das apostas -->
          <div v-if="pendingBets.length > 0" class="bets-summary">
            <h4>Resumo das Apostas Pendentes</h4>
            <div class="bets-list">
              <div v-for="bet in pendingBets" :key="bet.id" class="bet-item" :class="getBetResultClass(bet)">
                <div class="bet-info">
                  <span class="bet-type">{{ getBetTypeLabel(bet.type) }}</span>
                  <span class="bet-selection">{{ getBetSelectionLabel(bet) }}</span>
                </div>
                <div class="bet-amount">
                  <span>R$ {{ bet.amount.toFixed(2) }}</span>
                  <span class="bet-odds">{{ bet.odds }}x</span>
                </div>
                <div class="bet-result">
                  <span v-if="getBetResult(bet) === 'WON'" class="result-won">✓ Ganhou</span>
                  <span v-else-if="getBetResult(bet) === 'LOST'" class="result-lost">✗ Perdeu</span>
                  <span v-else class="result-pending">- Pendente</span>
                </div>
              </div>
            </div>
            <div class="summary-total">
              <span>Total a pagar em ganhos:</span>
              <span class="total-amount">R$ {{ totalPayout.toFixed(2) }}</span>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="loading || !canClose">
              {{ loading ? 'Fechando...' : 'Fechar Jogo e Liquidar Apostas' }}
            </button>
            <button type="button" @click="resetForm" class="reset-btn" :disabled="loading">
              Limpar
            </button>
          </div>

          <div v-if="!canClose && form.winnerId && form.duration && form.topKiller" class="warning-box">
            <p>⚠️ Preencha todos os campos para fechar o jogo</p>
          </div>

          <p v-if="error" class="error-message">{{ error }}</p>
          <p v-if="success" class="success-message">{{ success }}</p>
        </form>
      </div>

      <!-- Mensagem quando nenhum jogo selecionado -->
      <div v-else-if="scheduledGames.length === 0" class="empty-state glass-panel">
        <p>Nenhum jogo agendado encontrado.</p>
        <RouterLink to="/panel/games" class="cta-link">Criar um jogo</RouterLink>
      </div>
    </main>

    <AdminFooter />

    <!-- Modal de Confirmação -->
    <div v-if="showConfirmModal" class="modal-overlay" @click.self="showConfirmModal = false">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Confirmar Fechamento do Jogo</h3>
          <button class="modal-close" @click="showConfirmModal = false">×</button>
        </div>

        <div class="modal-content">
          <div class="confirm-icon">⚠️</div>
          <p class="confirm-message">
            Tem certeza que deseja fechar este jogo? Todas as apostas serão liquidadas automaticamente.
          </p>

          <div class="confirm-details">
            <div class="detail-item">
              <span class="detail-label">Vencedor:</span>
              <span class="detail-value">
                {{gameTeams.find((t) => t.id === form.winnerId)?.name || 'Empate'}}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Duração:</span>
              <span class="detail-value">{{ form.duration }} minutos</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Top Killer:</span>
              <span class="detail-value">
                {{ form.topKiller ? gamePlayers.find(p => p.id === form.topKiller)?.name || 'N/A' : 'N/A' }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Top Dead:</span>
              <span class="detail-value">
                {{ form.lowestDeaths ? gamePlayers.find(p => p.id === form.lowestDeaths)?.name || 'N/A' : 'N/A' }}
              </span>
            </div>
            <div v-if="form.roshanTotal !== null && form.roshanTotal !== undefined" class="detail-item">
              <span class="detail-label">Total Roshan:</span>
              <span class="detail-value">{{ form.roshanTotal }}</span>
            </div>
            <div v-if="form.firstRoshanTeamId" class="detail-item">
              <span class="detail-label">Primeiro Roshan:</span>
              <span class="detail-value">
                {{ gameTeams.find((t) => t.id === form.firstRoshanTeamId)?.name || 'N/A' }}
              </span>
            </div>
            <div v-if="form.firstFFTeamId" class="detail-item">
              <span class="detail-label">Primeiro !ff:</span>
              <span class="detail-value">
                {{ gameTeams.find((t) => t.id === form.firstFFTeamId)?.name || 'N/A' }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Apostas Pendentes:</span>
              <span class="detail-value">{{ pendingBetsCount }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Total Apostado:</span>
              <span class="detail-value">R$ {{ totalBetAmount.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="modal-btn cancel-btn" @click="showConfirmModal = false" :disabled="loading">
            Cancelar
          </button>
          <button class="modal-btn confirm-btn" @click="confirmCloseGame" :disabled="loading">
            <span v-if="loading">Processando...</span>
            <span v-else>Confirmar e Fechar Jogo</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Vue component with script setup
import AdminHeader from '@/components/AdminHeader.vue';
// @ts-ignore - Vue component with script setup
import AdminFooter from '@/components/AdminFooter.vue';
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, RouterLink, useRoute } from 'vue-router';
import { useUserStore } from '@/store/useUserStore';
import { useGameStore } from '@/store/useGameStore';
import api from '@/services/api';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const gameStore = useGameStore();

const loading = ref(false);
const error = ref('');
const success = ref('');
const selectedGameId = ref('');
const gamePlayers = ref<any[]>([]);
const showConfirmModal = ref(false);

const form = ref({
  winnerId: '',
  duration: null as number | null,
  topKiller: '',
  lowestDeaths: '',
  roshanTotal: null as number | null,
  firstRoshanTeamId: '',
  firstFFTeamId: '',
});

const scheduledGames = computed(() => {
  return gameStore.games.filter((game) => game.status === 'SCHEDULED');
});

const selectedGame = computed(() => {
  if (!selectedGameId.value) return null;
  return gameStore.games.find((game) => game.id === selectedGameId.value);
});

const gameTeams = computed(() => {
  if (!selectedGame.value) return [];
  const teamA = gameStore.teams.find((t) => t.id === selectedGame.value!.teamAId);
  const teamB = gameStore.teams.find((t) => t.id === selectedGame.value!.teamBId);
  return [teamA, teamB].filter(Boolean) as any[];
});

const pendingBets = computed(() => {
  if (!selectedGameId.value) return [];
  return gameStore.bets.filter((bet) => bet.gameId === selectedGameId.value && bet.status === 'PENDING');
});

const pendingBetsCount = computed(() => pendingBets.value.length);

const totalBetAmount = computed(() => {
  return pendingBets.value.reduce((sum, bet) => sum + bet.amount, 0);
});

const canClose = computed(() => {
  return !!(form.value.winnerId && form.value.duration && form.value.topKiller);
});

const totalPayout = computed(() => {
  return pendingBets.value
    .filter((bet) => getBetResult(bet) === 'WON')
    .reduce((sum, bet) => sum + bet.amount * bet.odds, 0);
});

const getDurationBand = (duration: number): string => {
  if (duration <= 20) return '15 a 20';
  if (duration <= 25) return '21 a 25';
  if (duration <= 30) return '26 a 30';
  if (duration <= 35) return '31 a 35';
  if (duration <= 40) return '36 a 40';
  if (duration <= 45) return '41 a 45';
  if (duration <= 50) return '46 a 50';
  return '51+';
};

const getBetTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    WINNER: 'Vitória',
    DURATION: 'Duração',
    TOP_KILLER: 'Top Killer',
    LOWEST_DEATHS: 'Top Dead',
    ROSHAN_TOTAL: 'Total Roshan',
    FIRST_ROSHAN: 'Primeiro Roshan',
    FIRST_FF: 'Primeiro !ff',
  };
  return labels[type] || type;
};

const getPlayerName = (playerId: string): string => {
  if (!playerId) return 'N/A';
  const player = gamePlayers.value.find((p) => p.id === playerId);
  return player?.name || playerId;
};

const getBetSelectionLabel = (bet: any) => {
  if (bet.type === 'WINNER') {
    const team = gameTeams.value.find((t) => t.id === bet.selection);
    return team?.name || bet.selection;
  }
  if (bet.type === 'DURATION') {
    return `${bet.selection} min`;
  }
  if (bet.type === 'TOP_KILLER' || bet.type === 'TOP_DEAD') {
    return getPlayerName(bet.selection);
  }
  if (bet.type === 'LOWEST_DEATHS') {
    return getPlayerName(bet.selection);
  }
  if (bet.type === 'ROSHAN_TOTAL') {
    if (bet.selection.startsWith('over_')) {
      const value = bet.selection.replace('over_', '');
      return `Acima de ${value}`;
    } else if (bet.selection.startsWith('under_')) {
      const value = bet.selection.replace('under_', '');
      return `Abaixo de ${value}`;
    }
    return bet.selection;
  }
  if (bet.type === 'FIRST_ROSHAN' || bet.type === 'FIRST_FF') {
    const team = gameTeams.value.find((t) => t.id === bet.selection);
    return team?.name || bet.selection;
  }
  return bet.selection;
};

const getBetResult = (bet: any): 'WON' | 'LOST' | 'PENDING' => {
  if (!form.value.winnerId || !form.value.duration || !form.value.topKiller) {
    return 'PENDING';
  }
  
  // Para LOWEST_DEATHS, só calcular se o campo estiver preenchido
  if (bet.type === 'LOWEST_DEATHS' && !form.value.lowestDeaths) {
    return 'PENDING';
  }

  if (bet.type === 'WINNER') {
return bet.selection === form.value.winnerId ? 'WON' : 'LOST';
  }

  if (bet.type === 'DURATION') {
    const band = getDurationBand(form.value.duration);
    return bet.selection === band ? 'WON' : 'LOST';
  }

  if (bet.type === 'TOP_KILLER') {
    // Comparar IDs (as apostas armazenam o ID do jogador)
    return bet.selection === form.value.topKiller ? 'WON' : 'LOST';
  }

  if (bet.type === 'LOWEST_DEATHS') {
    // Comparar IDs (as apostas armazenam o ID do jogador)
    return bet.selection === form.value.lowestDeaths ? 'WON' : 'LOST';
  }

  if (bet.type === 'ROSHAN_TOTAL') {
    if (form.value.roshanTotal === null || form.value.roshanTotal === undefined) {
      return 'PENDING';
    }
    if (bet.selection.startsWith('over_')) {
      const threshold = parseFloat(bet.selection.replace('over_', ''));
      return form.value.roshanTotal > threshold ? 'WON' : 'LOST';
    } else if (bet.selection.startsWith('under_')) {
      const threshold = parseFloat(bet.selection.replace('under_', ''));
      return form.value.roshanTotal < threshold ? 'WON' : 'LOST';
    }
    return 'PENDING';
  }

  if (bet.type === 'FIRST_ROSHAN') {
    if (!form.value.firstRoshanTeamId) {
      return 'PENDING';
    }
    return bet.selection === form.value.firstRoshanTeamId ? 'WON' : 'LOST';
  }

  if (bet.type === 'FIRST_FF') {
    if (!form.value.firstFFTeamId) {
      return 'PENDING';
    }
    return bet.selection === form.value.firstFFTeamId ? 'WON' : 'LOST';
  }

  return 'PENDING';
};

const getBetResultClass = (bet: any) => {
  const result = getBetResult(bet);
  return {
    won: result === 'WON',
    lost: result === 'LOST',
    pending: result === 'PENDING',
  };
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

onMounted(async () => {
  if (!userStore.isAuthenticated || userStore.user?.role !== 'ADMIN') {
    router.push('/panel/login');
    return;
  }

  await loadData();

  // Verificar se há gameId na query string
  const gameId = route.query.game as string;
  if (gameId) {
    selectedGameId.value = gameId;
    await loadGameData();
  }
});

const loadData = async () => {
  loading.value = true;
  try {
    await gameStore.fetchGames('SCHEDULED');
    await gameStore.fetchTeams();
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Erro ao carregar dados';
  } finally {
    loading.value = false;
  }
};

const loadGameData = async () => {
  if (!selectedGameId.value) {
    resetForm();
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    await gameStore.fetchGame(selectedGameId.value);
    await gameStore.fetchBets('PENDING');

    // Carregar players dos times
    if (selectedGame.value) {
      const teamA = gameStore.teams.find((t) => t.id === selectedGame.value!.teamAId);
      const teamB = gameStore.teams.find((t) => t.id === selectedGame.value!.teamBId);

      gamePlayers.value = [
        ...(teamA?.players || []),
        ...(teamB?.players || []),
      ];
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Erro ao carregar dados do jogo';
  } finally {
    loading.value = false;
  }
};

watch(selectedGameId, () => {
  if (selectedGameId.value) {
    loadGameData();
  }
});

const resetForm = () => {
  form.value = {
    winnerId: '',
    duration: null,
    topKiller: '',
    lowestDeaths: '',
    roshanTotal: null,
    firstRoshanTeamId: '',
    firstFFTeamId: '',
  };
  gamePlayers.value = [];
  error.value = '';
  success.value = '';
};

const handleCloseGame = async () => {
  if (!canClose.value) {
    error.value = 'Preencha todos os campos obrigatórios';
    return;
  }

  // Abrir modal de confirmação
  showConfirmModal.value = true;
};

const confirmCloseGame = async () => {
  loading.value = true;
  error.value = '';
  success.value = '';
  showConfirmModal.value = false;

  try {
    await gameStore.closeGame(selectedGameId.value, {
      winnerId: form.value.winnerId || undefined,
      duration: form.value.duration || undefined,
      topKiller: form.value.topKiller || undefined,
      lowestDeaths: form.value.lowestDeaths || undefined,
      roshanTotal: form.value.roshanTotal || undefined,
      firstRoshanTeamId: form.value.firstRoshanTeamId || undefined,
      firstFFTeamId: form.value.firstFFTeamId || undefined,
    });

    success.value = 'Jogo fechado e apostas liquidadas com sucesso!';

    // Recarregar dados
    await loadData();
    resetForm();
    selectedGameId.value = '';

    setTimeout(() => {
      success.value = '';
    }, 5000);
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Erro ao fechar jogo';
  } finally {
    loading.value = false;
  }
};

</script>

<style scoped>
.close-game {
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
  color: var(--text-secondary);
  margin: 0;
}

.glass-panel {
  background: rgba(30, 37, 66, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.game-selector {
  padding: 2rem;
  margin-bottom: 2rem;
}

.game-selector h3 {
  margin: 0 0 1rem 0;
}

.selector-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.selector-content select {
  padding: 0.875rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.selector-content select:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(31, 163, 122, 0.1);
}

.selector-content select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hint {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  margin: 0;
}

.close-form-section {
  padding: 2rem;
}

.game-info {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
}

.game-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.game-date {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1rem 0;
}

.game-stats {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.6);
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--accent-primary);
}

.close-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.form-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: var(--accent-primary);
}

.winner-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.winner-option {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.winner-option:hover {
  background: var(--input-bg-hover);
  border-color: rgba(0, 255, 136, 0.3);
}

.winner-option input[type='radio'] {
  margin-right: 1rem;
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--accent-primary);
}

.winner-option input[type='radio']:checked+.option-content {
  color: var(--accent-primary);
}

.winner-option:has(input:checked) {
  background: rgba(0, 255, 136, 0.15);
  border-color: var(--accent-primary);
}

.option-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.team-name {
  font-size: 1rem;
  font-weight: 600;
}

.team-odds {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.duration-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.duration-input input {
  padding: 0.875rem;
  border-radius: 10px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  max-width: 200px;
  transition: all 0.2s;
}

.duration-input input:focus {
  outline: none;
  border-color: var(--input-border-focus);
  background: var(--input-bg-hover);
  box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
}

.duration-input input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.duration-preview {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(0, 255, 136, 0.15);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.preview-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--accent-primary);
}

.top-killer-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 400px;
}

.top-killer-input select {
  padding: 0.875rem;
  border-radius: 10px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.2s;
}

.top-killer-input select:focus {
  outline: none;
  border-color: var(--input-border-focus);
  background: var(--input-bg-hover);
  box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
}

.top-killer-input select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.field-hint {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 0.25rem;
}

.bets-summary {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
}

.bets-summary h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: var(--accent-primary);
}

.bets-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.bet-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
  padding: 0.875rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid var(--border-primary);
  align-items: center;
}

.bet-item.won {
  background: rgba(0, 255, 136, 0.1);
  border-color: rgba(0, 255, 136, 0.3);
}

.bet-item.lost {
  background: rgba(255, 71, 87, 0.1);
  border-color: rgba(255, 71, 87, 0.3);
}

.bet-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.bet-type {
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.bet-selection {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.bet-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.bet-amount>span:first-child {
  font-size: 0.9rem;
  font-weight: 600;
}

.bet-odds {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.bet-result {
  text-align: right;
  font-size: 0.85rem;
  font-weight: 600;
}

.result-won {
  color: var(--accent-primary);
}

.result-lost {
  color: var(--accent-error);
}

.result-pending {
  color: var(--text-tertiary);
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  font-weight: 600;
}

.total-amount {
  font-size: 1.2rem;
  color: var(--accent-primary);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.submit-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 10px;
  background: var(--gradient-button);
  color: var(--gradient-button-text);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 255, 136, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-btn {
  padding: 1rem 2rem;
  border: 1px solid var(--border-primary);
  border-radius: 10px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover:not(:disabled) {
  background: var(--input-bg-hover);
  border-color: var(--accent-primary);
}

.reset-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.warning-box {
  padding: 1rem;
  background: rgba(255, 217, 61, 0.1);
  border: 1px solid rgba(255, 217, 61, 0.3);
  border-radius: 8px;
  color: var(--accent-warning);
  margin-top: 1rem;
}

.warning-box p {
  margin: 0;
  font-size: 0.85rem;
}

.error-message {
  color: #ff7b9a;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.success-message {
  color: #00ff88;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

/* Modal de Confirmação */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 14, 39, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.modal-container {
  background: var(--bg-glass);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.05em;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  line-height: 1;
}

.modal-close:hover {
  background: rgba(255, 71, 87, 0.15);
  color: var(--accent-error);
  transform: rotate(90deg);
}

.modal-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.confirm-icon {
  font-size: 3rem;
  text-align: center;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}

.confirm-message {
  text-align: center;
  color: var(--text-primary);
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
}

.confirm-details {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-primary);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

.detail-value {
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 600;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-primary);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.modal-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 140px;
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.cancel-btn:hover:not(:disabled) {
  background: var(--bg-tertiary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.confirm-btn {
  background: var(--gradient-button);
  color: var(--gradient-button-text);
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 255, 136, 0.4);
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.cta-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--gradient-button);
  color: var(--gradient-button-text);
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
}

.cta-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(31, 163, 122, 0.3);
}

@media (max-width: 768px) {
  .game-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .bet-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .bet-amount,
  .bet-result {
    align-items: flex-start;
    text-align: left;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-nav {
    width: 100%;
    justify-content: space-around;
  }
}
</style>
