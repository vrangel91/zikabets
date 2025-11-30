<template>
  <div class="manage-odds">
    <AdminHeader />

    <main class="admin-main">
      <div class="page-header">
        <h2>Gerenciar Odds</h2>
        <p>Configure as odds dos jogos agendados</p>
      </div>

      <!-- Seleção de jogo -->
      <div class="game-selector glass-panel">
        <h3>Selecionar Jogo</h3>
        <div class="selector-content">
          <select v-model="selectedGameId" @change="loadGameOdds" :disabled="loading">
            <option value="">Selecione um jogo</option>
            <option v-for="game in scheduledGames" :key="game.id" :value="game.id">
              {{ game.teamA.name }} vs {{ game.teamB.name }} - {{ formatDateTime(game.startTime) }}
            </option>
          </select>
          <p v-if="!selectedGameId" class="hint">
            Selecione um jogo para editar suas odds
          </p>
        </div>
      </div>

      <!-- Formulário de odds -->
      <div v-if="selectedGame && selectedGameId" class="odds-form-section glass-panel">
        <div class="game-info">
          <h3>{{ selectedGame.teamA.name }} vs {{ selectedGame.teamB.name }}</h3>
          <p class="game-date">{{ formatDateTime(selectedGame.startTime) }}</p>
        </div>

        <form @submit.prevent="handleUpdateOdds" class="odds-form">
          <!-- Odds de Vitória -->
          <div class="odds-section">
            <h4>Odds de Vitória</h4>
            <div class="winner-odds-grid">
              <div class="form-group">
                <label>
                  <span class="team-label">{{ selectedGame.teamA.name }}</span>
                  <input
                    type="number"
                    v-model.number="form.teamAOdds"
                    @blur="form.teamAOdds = roundToTwoDecimals(form.teamAOdds)"
                    step="0.01"
                    min="1"
                    required
                    :disabled="loading"
                  />
                </label>
              </div>
              <div class="form-group">
                <label>
                  <span class="team-label">{{ selectedGame.teamB.name }}</span>
                  <input
                    type="number"
                    v-model.number="form.teamBOdds"
                    @blur="form.teamBOdds = roundToTwoDecimals(form.teamBOdds)"
                    step="0.01"
                    min="1"
                    required
                    :disabled="loading"
                  />
                </label>
              </div>
            </div>
          </div>

          <!-- Odds de Duração -->
          <div class="odds-section">
            <h4>Odds de Duração da Partida</h4>
            <div class="duration-odds-grid">
              <div
                v-for="band in durationBands"
                :key="band"
                class="duration-odds-item"
              >
                <label>
                  <span class="duration-label">{{ band }}</span>
                  <input
                    type="number"
                    v-model.number="form.durationOdds[band]"
                    step="0.01"
                    min="1"
                    :placeholder="getDefaultDurationOdd(band)"
                    :disabled="loading"
                    @blur="form.durationOdds[band] = roundToTwoDecimals(form.durationOdds[band])"
                  />
                </label>
              </div>
            </div>
          </div>

          <!-- Gerenciamento em Massa de Odds -->
          <div v-if="gamePlayers.length > 0" class="odds-section bulk-odds-section">
            <h4>Gerenciamento em Massa</h4>
            <div class="bulk-controls">
              <div class="bulk-select-section">
                <div class="bulk-header">
                  <label class="bulk-select-all">
                    <input
                      type="checkbox"
                      :checked="allPlayersSelected"
                      @change="toggleSelectAll"
                      :disabled="loading"
                    />
                    <span>Selecionar Todos ({{ selectedPlayers.length }}/{{ gamePlayers.length }})</span>
                  </label>
                  <button
                    type="button"
                    @click="clearSelection"
                    class="clear-selection-btn"
                    :disabled="selectedPlayers.length === 0 || loading"
                  >
                    Limpar Seleção
                  </button>
                </div>
                <div class="bulk-players-list">
                  <label
                    v-for="player in gamePlayers"
                    :key="player.id"
                    class="bulk-player-checkbox"
                  >
                    <input
                      type="checkbox"
                      :value="player.id"
                      v-model="selectedPlayers"
                      :disabled="loading"
                    />
                    <span class="bulk-player-name">{{ player.name }}</span>
                    <span class="bulk-player-team">{{ getPlayerTeam(player.teamId) }}</span>
                  </label>
                </div>
              </div>
              <div class="bulk-actions-section">
                <div class="bulk-action-group">
                  <label class="bulk-action-label">
                    <span>Top Killer Odds</span>
                    <input
                      type="number"
                      v-model.number="bulkTopKillerOdds"
                      step="0.01"
                      min="1"
                      placeholder="Ex: 2.5"
                      :disabled="loading || selectedPlayers.length === 0"
                      @blur="bulkTopKillerOdds = roundToTwoDecimals(bulkTopKillerOdds)"
                    />
                  </label>
                  <button
                    type="button"
                    @click="applyBulkOdds('topKiller')"
                    class="bulk-apply-btn"
                    :disabled="loading || selectedPlayers.length === 0 || !bulkTopKillerOdds"
                  >
                    Aplicar para {{ selectedPlayers.length }} jogador{{ selectedPlayers.length !== 1 ? 'es' : '' }}
                  </button>
                </div>
                <div class="bulk-action-group">
                  <label class="bulk-action-label">
                    <span>Menos Mortes Odds</span>
                    <input
                      type="number"
                      v-model.number="bulkTopDeadOdds"
                      step="0.01"
                      min="1"
                      placeholder="Ex: 2.5"
                      :disabled="loading || selectedPlayers.length === 0"
                      @blur="bulkTopDeadOdds = roundToTwoDecimals(bulkTopDeadOdds)"
                    />
                  </label>
                  <button
                    type="button"
                    @click="applyBulkOdds('topDead')"
                    class="bulk-apply-btn"
                    :disabled="loading || selectedPlayers.length === 0 || !bulkTopDeadOdds"
                  >
                    Aplicar para {{ selectedPlayers.length }} jogador{{ selectedPlayers.length !== 1 ? 'es' : '' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Odds de Top Killer -->
          <div class="odds-section">
            <h4>Odds de Top Killer</h4>
            <div class="top-killer-section">
              <div class="form-group">
                <label>Odds padrão para Top Killer</label>
                <input
                  type="number"
                    v-model.number="form.topKillerOdds"
                    @blur="form.topKillerOdds = roundToTwoDecimals(form.topKillerOdds)"
                  step="0.1"
                  min="1"
                  required
                  :disabled="loading"
                />
                <small class="field-hint">
                  Esta odds será aplicada se não houver odds específica para o jogador
                </small>
              </div>
            </div>
            
            <!-- Odds por Jogador - Top Killer -->
            <div v-if="gamePlayers.length > 0" class="player-odds-section">
              <h5>Odds por Jogador (Top Killer)</h5>
              <div class="player-odds-grid">
                <div v-for="player in gamePlayers" :key="player.id" class="player-odds-item">
                  <label>
                    <span class="player-name">{{ player.name }}</span>
                    <span class="player-team">{{ getPlayerTeam(player.teamId) }}</span>
                    <input
                      type="number"
                      v-model.number="form.topKillerPlayerOdds[player.id]"
                      step="0.01"
                      min="1"
                      :placeholder="roundToTwoDecimals(form.topKillerOdds).toFixed(2)"
                      :disabled="loading"
                      @blur="roundPlayerOdds(player.id, 'topKiller')"
                    />
                  </label>
                </div>
              </div>
              <small class="field-hint">
                Deixe em branco para usar a odds padrão
              </small>
            </div>
          </div>

          <!-- Odds de Menos Mortes -->
          <div class="odds-section">
            <h4>Odds de Menos Mortes</h4>
            <div class="top-killer-section">
              <div class="form-group">
                <label>Odds padrão para Menos Mortes</label>
                <input
                  type="number"
                    v-model.number="form.lowestDeathsOdds"
                    @blur="form.lowestDeathsOdds = roundToTwoDecimals(form.lowestDeathsOdds)"
                  step="0.1"
                  min="1"
                  required
                  :disabled="loading"
                />
                <small class="field-hint">
                  Esta odds será aplicada se não houver odds específica para o jogador
                </small>
              </div>
            </div>
            
            <!-- Odds por Jogador - Menos Mortes -->
            <div v-if="gamePlayers.length > 0" class="player-odds-section">
              <h5>Odds por Jogador (Menos Mortes)</h5>
              <div class="player-odds-grid">
                <div v-for="player in gamePlayers" :key="player.id" class="player-odds-item">
                  <label>
                    <span class="player-name">{{ player.name }}</span>
                    <span class="player-team">{{ getPlayerTeam(player.teamId) }}</span>
                    <input
                      type="number"
                      v-model.number="form.lowestDeathsPlayerOdds[player.id]"
                      step="0.01"
                      min="1"
                      :placeholder="roundToTwoDecimals(form.lowestDeathsOdds).toFixed(2)"
                      :disabled="loading"
                      @blur="roundPlayerOdds(player.id, 'topDead')"
                    />
                  </label>
                </div>
              </div>
              <small class="field-hint">
                Deixe em branco para usar a odds padrão
              </small>
            </div>
          </div>

          <!-- Odds de Total de Roshan -->
          <div class="odds-section">
            <h4>Odds de Total de Roshan (Over/Under)</h4>
            <div class="roshan-total-odds-grid">
              <div
                v-for="option in roshanTotalOptions"
                :key="option.key"
                class="roshan-odds-item"
              >
                <label>
                  <span class="roshan-label">{{ option.label }}</span>
                  <input
                    type="number"
                    v-model.number="form.roshanTotalOdds[option.key]"
                    step="0.01"
                    min="1"
                    placeholder="1.5"
                    :disabled="loading"
                    @blur="form.roshanTotalOdds[option.key] = roundToTwoDecimals(form.roshanTotalOdds[option.key])"
                  />
                </label>
              </div>
            </div>
            <small class="field-hint">
              Configure as odds para Over/Under do total de Roshans na partida
            </small>
          </div>

          <!-- Odds de Primeiro Roshan -->
          <div class="odds-section">
            <h4>Odds de Primeiro Roshan</h4>
            <div class="winner-odds-grid">
              <div class="form-group">
                <label>
                  <span class="team-label">{{ selectedGame.teamA.name }}</span>
                  <input
                    type="number"
                    v-model.number="form.firstRoshanOdds.teamA"
                    @blur="form.firstRoshanOdds.teamA = roundToTwoDecimals(form.firstRoshanOdds.teamA)"
                    step="0.01"
                    min="1"
                    required
                    :disabled="loading"
                  />
                </label>
              </div>
              <div class="form-group">
                <label>
                  <span class="team-label">{{ selectedGame.teamB.name }}</span>
                  <input
                    type="number"
                    v-model.number="form.firstRoshanOdds.teamB"
                    @blur="form.firstRoshanOdds.teamB = roundToTwoDecimals(form.firstRoshanOdds.teamB)"
                    step="0.01"
                    min="1"
                    required
                    :disabled="loading"
                  />
                </label>
              </div>
            </div>
          </div>

          <!-- Odds de Primeiro !ff -->
          <div class="odds-section">
            <h4>Odds de Primeiro !ff</h4>
            <div class="winner-odds-grid">
              <div class="form-group">
                <label>
                  <span class="team-label">{{ selectedGame.teamA.name }}</span>
                  <input
                    type="number"
                    v-model.number="form.firstFFOdds.teamA"
                    @blur="form.firstFFOdds.teamA = roundToTwoDecimals(form.firstFFOdds.teamA)"
                    step="0.01"
                    min="1"
                    required
                    :disabled="loading"
                  />
                </label>
              </div>
              <div class="form-group">
                <label>
                  <span class="team-label">{{ selectedGame.teamB.name }}</span>
                  <input
                    type="number"
                    v-model.number="form.firstFFOdds.teamB"
                    @blur="form.firstFFOdds.teamB = roundToTwoDecimals(form.firstFFOdds.teamB)"
                    step="0.01"
                    min="1"
                    required
                    :disabled="loading"
                  />
                </label>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="loading">
              {{ loading ? 'Salvando...' : 'Salvar Odds' }}
            </button>
            <button type="button" @click="resetForm" class="reset-btn" :disabled="loading">
              Resetar
            </button>
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

      <!-- Gerenciamento Global de Jogadores -->
      <div class="global-players-section glass-panel">
        <div class="section-header-global">
          <div>
            <h3>Gerenciamento Global de Jogadores</h3>
            <p>Configure o pote e odds padrão de todos os jogadores</p>
          </div>
          <button
            type="button"
            @click="loadAllPlayers"
            class="refresh-btn"
            :disabled="loadingAllPlayers"
          >
            <span v-if="!loadingAllPlayers">🔄</span>
            <span v-else class="btn-spinner"></span>
            {{ loadingAllPlayers ? 'Carregando...' : 'Atualizar Lista' }}
          </button>
        </div>

        <div v-if="loadingAllPlayers" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Carregando jogadores...</p>
        </div>

        <div v-else-if="allPlayers.length === 0" class="empty-state">
          <p>Nenhum jogador cadastrado.</p>
          <RouterLink to="/panel/players" class="cta-link">Adicionar Jogadores</RouterLink>
        </div>

        <div v-else class="global-players-content">
          <!-- Filtros e busca -->
          <div class="players-filters">
            <div class="filter-group">
              <label>Buscar jogador</label>
              <input
                type="text"
                v-model="playerSearch"
                placeholder="Digite o nome do jogador..."
                class="search-input"
              />
            </div>
            <div class="filter-group">
              <label>Filtrar por time</label>
              <select v-model="filterTeamId" class="filter-select">
                <option value="">Todos os times</option>
                <option v-for="team in allTeams" :key="team.id" :value="team.id">
                  {{ team.name }}
                </option>
              </select>
            </div>
            <div class="filter-group">
              <label>Filtrar por pote</label>
              <select v-model="filterPot" class="filter-select">
                <option value="">Todos os potes</option>
                <option v-for="pot in [1, 2, 3, 4, 5]" :key="pot" :value="pot">
                  Pote {{ pot }}
                </option>
                <option value="null">Sem pote</option>
              </select>
            </div>
          </div>

          <!-- Tabela de jogadores -->
          <div class="players-table-container">
            <table class="players-table">
              <thead>
                <tr>
                  <th>Jogador</th>
                  <th>Time</th>
                  <th>Pote</th>
                  <th>Top Killer Odds</th>
                  <th>Menos Mortes Odds</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="player in filteredPlayers" :key="player.id" class="player-row">
                  <td class="player-name-cell">
                    <div class="player-avatar-small">
                      <span>{{ getPlayerInitial(player.name) }}</span>
                    </div>
                    <span>{{ player.name }}</span>
                  </td>
                  <td class="player-team-cell">
                    {{ getPlayerTeamName(player.teamId) }}
                  </td>
                  <td class="player-pot-cell">
                    <select
                      v-model.number="playerPotData[player.id]"
                      @change="updatePlayerPot(player.id, playerPotData[player.id])"
                      class="pot-select"
                      :disabled="savingPot[player.id]"
                    >
                      <option :value="null">Sem pote</option>
                      <option v-for="pot in [1, 2, 3, 4, 5]" :key="pot" :value="pot">
                        Pote {{ pot }}
                      </option>
                    </select>
                    <span v-if="savingPot[player.id]" class="saving-indicator">💾</span>
                  </td>
                  <td class="player-odds-cell">
                    <input
                      type="number"
                      :value="playerOddsData[player.id]?.topKiller"
                      @input="(e) => updatePlayerOddsInput(player.id, 'topKiller', parseFloat((e.target as HTMLInputElement).value) || undefined)"
                      @blur="updatePlayerOdds(player.id, 'topKiller', playerOddsData[player.id]?.topKiller)"
                      step="0.01"
                      min="1"
                      placeholder="2.0"
                      class="odds-input"
                      :disabled="savingOdds[player.id]"
                    />
                  </td>
                  <td class="player-odds-cell">
                    <input
                      type="number"
                      :value="playerOddsData[player.id]?.topDead"
                      @input="(e) => updatePlayerOddsInput(player.id, 'topDead', parseFloat((e.target as HTMLInputElement).value) || undefined)"
                      @blur="updatePlayerOdds(player.id, 'topDead', playerOddsData[player.id]?.topDead)"
                      step="0.01"
                      min="1"
                      placeholder="2.0"
                      class="odds-input"
                      :disabled="savingOdds[player.id]"
                    />
                  </td>
                  <td class="player-actions-cell">
                    <button
                      type="button"
                      @click="resetPlayerData(player.id)"
                      class="reset-player-btn"
                      title="Resetar dados do jogador"
                    >
                      🔄
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Estatísticas -->
          <div class="players-stats">
            <div class="stat-item">
              <span class="stat-label">Total de Jogadores</span>
              <span class="stat-value">{{ allPlayers.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Com Pote Definido</span>
              <span class="stat-value">{{ playersWithPot }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Com Odds Configuradas</span>
              <span class="stat-value">{{ playersWithOdds }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <AdminFooter />

    <!-- Modal de Confirmação -->
    <div v-if="showConfirmModal" class="modal-overlay" @click.self="cancelReset">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Confirmar Reset</h3>
        </div>
        <div class="modal-body">
          <p>Tem certeza que deseja resetar os dados deste jogador?</p>
          <p class="modal-warning">Esta ação não pode ser desfeita.</p>
        </div>
        <div class="modal-footer">
          <button type="button" @click="cancelReset" class="modal-btn modal-btn-cancel">
            Cancelar
          </button>
          <button type="button" @click="confirmReset" class="modal-btn modal-btn-confirm">
            Confirmar
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
import { routes } from '@/utils/routes';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const gameStore = useGameStore();

const loading = ref(false);
const error = ref('');
const success = ref('');
const selectedGameId = ref('');
const gamePlayers = ref<any[]>([]);
const selectedPlayers = ref<string[]>([]);
const bulkTopKillerOdds = ref<number | null>(null);
const bulkTopDeadOdds = ref<number | null>(null);

// Global players management
const allPlayers = ref<any[]>([]);
const allTeams = ref<any[]>([]);
const loadingAllPlayers = ref(false);
const playerSearch = ref('');
const filterTeamId = ref('');
const filterPot = ref<string | number>('');
const playerPotData = ref<Record<string, number | null>>({});
const playerOddsData = ref<Record<string, { topKiller?: number; topDead?: number }>>({});
const savingPot = ref<Record<string, boolean>>({});
const savingOdds = ref<Record<string, boolean>>({});

// Modal de confirmação
const showConfirmModal = ref(false);
const playerToReset = ref<string | null>(null);

const durationBands = ['15 a 20', '21 a 25', '26 a 30', '31 a 35', '36 a 40', '41 a 45', '46 a 50', '51+'];

const roshanTotalOptions = [
  { key: 'over_2.5', label: 'Acima de 2.5' },
  { key: 'under_2.5', label: 'Abaixo de 2.5' },
  { key: 'over_3.5', label: 'Acima de 3.5' },
  { key: 'under_3.5', label: 'Abaixo de 3.5' },
  { key: 'over_4.5', label: 'Acima de 4.5' },
  { key: 'under_4.5', label: 'Abaixo de 4.5' },
];

const form = ref({
  teamAOdds: 1.5,
  teamBOdds: 1.5,
  topKillerOdds: 2.0,
  lowestDeathsOdds: 2.0,
  topKillerPlayerOdds: {} as Record<string, number>,
  lowestDeathsPlayerOdds: {} as Record<string, number>,
  durationOdds: {
    '15 a 20': 2.5,
    '21 a 25': 2.0,
    '26 a 30': 1.8,
    '31 a 35': 1.5,
    '36 a 40': 1.3,
    '41 a 45': 1.2,
    '46 a 50': 1.1,
    '51+': 1.0,
  },
  roshanTotalOdds: {
    'over_2.5': 1.8,
    'under_2.5': 1.9,
    'over_3.5': 2.0,
    'under_3.5': 1.7,
    'over_4.5': 2.2,
    'under_4.5': 1.6,
  } as Record<string, number>,
  firstRoshanOdds: {
    teamA: 1.5,
    teamB: 1.5,
  },
  firstFFOdds: {
    teamA: 1.5,
    teamB: 1.5,
  },
});

const scheduledGames = computed(() => {
  return gameStore.games.filter((game) => game.status === 'SCHEDULED');
});

const selectedGame = computed(() => {
  if (!selectedGameId.value) return null;
  return gameStore.games.find((game) => game.id === selectedGameId.value);
});

// Função para arredondar para 2 casas decimais
const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100;
};

const getDefaultDurationOdd = (band: string) => {
  const value = form.value.durationOdds[band];
  return value ? roundToTwoDecimals(value).toFixed(2) : '1.00';
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
  await loadAllPlayers();

  // Verificar se há gameId na query string
  const gameId = route.query.game as string;
  if (gameId) {
    selectedGameId.value = gameId;
    await loadGameOdds();
  }
});

const loadData = async () => {
  loading.value = true;
  try {
    await gameStore.fetchGames();
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Erro ao carregar jogos';
  } finally {
    loading.value = false;
  }
};

const loadGameOdds = async () => {
  if (!selectedGameId.value) {
    resetForm();
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    const game = await gameStore.fetchGame(selectedGameId.value);
    await gameStore.fetchTeams();

    // Carregar jogadores dos times
    if (game) {
      const teamA = gameStore.teams.find((t) => t.id === game.teamAId);
      const teamB = gameStore.teams.find((t) => t.id === game.teamBId);

      // Carregar players de cada time
      const playersA = teamA ? (await api.get(`${routes.admin.players.list()}?teamId=${teamA.id}`)).data.players : [];
      const playersB = teamB ? (await api.get(`${routes.admin.players.list()}?teamId=${teamB.id}`)).data.players : [];
      
      gamePlayers.value = [...playersA, ...playersB];
    }

    if (game && game.odds) {
      // Parse player odds
      let topKillerPlayerOdds: Record<string, number> = {};
      let lowestDeathsPlayerOdds: Record<string, number> = {};
      
      if (game.odds.topKillerPlayerOdds) {
        try {
          topKillerPlayerOdds = typeof game.odds.topKillerPlayerOdds === 'string' 
            ? JSON.parse(game.odds.topKillerPlayerOdds) 
            : game.odds.topKillerPlayerOdds;
        } catch {
          topKillerPlayerOdds = {};
        }
      }
      
      if (game.odds.lowestDeathsPlayerOdds) {
        try {
          lowestDeathsPlayerOdds = typeof game.odds.lowestDeathsPlayerOdds === 'string'
            ? JSON.parse(game.odds.lowestDeathsPlayerOdds)
            : game.odds.lowestDeathsPlayerOdds;
        } catch {
          lowestDeathsPlayerOdds = {};
        }
      }

      // Arredondar valores para 2 casas decimais
      const parseDurationOdds = (odds: any) => {
        if (!odds) return {
          '15 a 20': 2.5,
          '21 a 25': 2.0,
          '26 a 30': 1.8,
          '31 a 35': 1.5,
          '36 a 40': 1.3,
          '41 a 45': 1.2,
          '46 a 50': 1.1,
          '51+': 1.0,
        };
        if (typeof odds === 'string') {
          try {
            odds = JSON.parse(odds);
          } catch {
            return {
              '15 a 20': 2.5,
              '21 a 25': 2.0,
              '26 a 30': 1.8,
              '31 a 35': 1.5,
              '36 a 40': 1.3,
              '41 a 45': 1.2,
              '46 a 50': 1.1,
              '51+': 1.0,
            };
          }
        }
        const result: Record<string, number> = {};
        Object.keys(odds).forEach(key => {
          result[key] = roundToTwoDecimals(odds[key]);
        });
        return result;
      };

      // Parse Roshan Total Odds
      let roshanTotalOdds: Record<string, number> = {
        'over_2.5': 1.8,
        'under_2.5': 1.9,
        'over_3.5': 2.0,
        'under_3.5': 1.7,
        'over_4.5': 2.2,
        'under_4.5': 1.6,
      };
      if (game.odds.roshanTotalOdds) {
        try {
          const parsed = typeof game.odds.roshanTotalOdds === 'string'
            ? JSON.parse(game.odds.roshanTotalOdds)
            : game.odds.roshanTotalOdds;
          roshanTotalOdds = Object.fromEntries(
            Object.entries(parsed).map(([k, v]) => [k, roundToTwoDecimals(v as number)])
          );
        } catch {
          // Usar valores padrão
        }
      }

      // Parse First Roshan Odds
      let firstRoshanOdds = { teamA: 1.5, teamB: 1.5 };
      if (game.odds.firstRoshanOdds) {
        try {
          const parsed = typeof game.odds.firstRoshanOdds === 'string'
            ? JSON.parse(game.odds.firstRoshanOdds)
            : game.odds.firstRoshanOdds;
          firstRoshanOdds = {
            teamA: roundToTwoDecimals(parsed.teamA || 1.5),
            teamB: roundToTwoDecimals(parsed.teamB || 1.5),
          };
        } catch {
          // Usar valores padrão
        }
      }

      // Parse First FF Odds
      let firstFFOdds = { teamA: 1.5, teamB: 1.5 };
      if (game.odds.firstFFOdds) {
        try {
          const parsed = typeof game.odds.firstFFOdds === 'string'
            ? JSON.parse(game.odds.firstFFOdds)
            : game.odds.firstFFOdds;
          firstFFOdds = {
            teamA: roundToTwoDecimals(parsed.teamA || 1.5),
            teamB: roundToTwoDecimals(parsed.teamB || 1.5),
          };
        } catch {
          // Usar valores padrão
        }
      }

      form.value = {
        teamAOdds: roundToTwoDecimals(game.odds.teamAOdds || 1.5),
        teamBOdds: roundToTwoDecimals(game.odds.teamBOdds || 1.5),
        topKillerOdds: roundToTwoDecimals(game.odds.topKillerOdds || 2.0),
        lowestDeathsOdds: roundToTwoDecimals(game.odds.lowestDeathsOdds || 2.0),
        topKillerPlayerOdds: Object.fromEntries(
          Object.entries(topKillerPlayerOdds).map(([k, v]) => [k, roundToTwoDecimals(v)])
        ),
        lowestDeathsPlayerOdds: Object.fromEntries(
          Object.entries(lowestDeathsPlayerOdds).map(([k, v]) => [k, roundToTwoDecimals(v)])
        ),
        durationOdds: parseDurationOdds(game.odds.durationOdds),
        roshanTotalOdds,
        firstRoshanOdds,
        firstFFOdds,
      };
    } else {
      // Se não tem odds, usar valores padrão
      resetForm();
    }
    
    // Garantir que todos os campos de roshanTotalOdds existam
    roshanTotalOptions.forEach(option => {
      if (!form.value.roshanTotalOdds[option.key]) {
        form.value.roshanTotalOdds[option.key] = option.key.startsWith('over_') ? 1.8 : 1.9;
      }
    });
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Erro ao carregar odds do jogo';
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  if (selectedGame.value && selectedGame.value.odds) {
    const odds = selectedGame.value.odds;
    
    let topKillerPlayerOdds: Record<string, number> = {};
    let lowestDeathsPlayerOdds: Record<string, number> = {};
    
    if (odds.topKillerPlayerOdds) {
      try {
        topKillerPlayerOdds = typeof odds.topKillerPlayerOdds === 'string'
          ? JSON.parse(odds.topKillerPlayerOdds)
          : odds.topKillerPlayerOdds;
      } catch {
        topKillerPlayerOdds = {};
      }
    }
    
    if (odds.lowestDeathsPlayerOdds) {
      try {
        lowestDeathsPlayerOdds = typeof odds.lowestDeathsPlayerOdds === 'string'
          ? JSON.parse(odds.lowestDeathsPlayerOdds)
          : odds.lowestDeathsPlayerOdds;
      } catch {
        lowestDeathsPlayerOdds = {};
      }
    }
    
    // Parse Roshan Total Odds
    let roshanTotalOdds: Record<string, number> = {
      'over_2.5': 1.8,
      'under_2.5': 1.9,
      'over_3.5': 2.0,
      'under_3.5': 1.7,
      'over_4.5': 2.2,
      'under_4.5': 1.6,
    };
    if (odds.roshanTotalOdds) {
      try {
        const parsed = typeof odds.roshanTotalOdds === 'string'
          ? JSON.parse(odds.roshanTotalOdds)
          : odds.roshanTotalOdds;
        roshanTotalOdds = parsed;
      } catch {
        // Usar valores padrão
      }
    }

    // Parse First Roshan Odds
    let firstRoshanOdds = { teamA: 1.5, teamB: 1.5 };
    if (odds.firstRoshanOdds) {
      try {
        const parsed = typeof odds.firstRoshanOdds === 'string'
          ? JSON.parse(odds.firstRoshanOdds)
          : odds.firstRoshanOdds;
        firstRoshanOdds = {
          teamA: parsed.teamA || 1.5,
          teamB: parsed.teamB || 1.5,
        };
      } catch {
        // Usar valores padrão
      }
    }

    // Parse First FF Odds
    let firstFFOdds = { teamA: 1.5, teamB: 1.5 };
    if (odds.firstFFOdds) {
      try {
        const parsed = typeof odds.firstFFOdds === 'string'
          ? JSON.parse(odds.firstFFOdds)
          : odds.firstFFOdds;
        firstFFOdds = {
          teamA: parsed.teamA || 1.5,
          teamB: parsed.teamB || 1.5,
        };
      } catch {
        // Usar valores padrão
      }
    }

    form.value = {
      teamAOdds: odds.teamAOdds || 1.5,
      teamBOdds: odds.teamBOdds || 1.5,
      topKillerOdds: odds.topKillerOdds || 2.0,
      lowestDeathsOdds: odds.lowestDeathsOdds || 2.0,
      topKillerPlayerOdds,
      lowestDeathsPlayerOdds,
      durationOdds: (() => {
        if (!odds.durationOdds) {
          return {
            '15 a 20': 2.5,
            '21 a 25': 2.0,
            '26 a 30': 1.8,
            '31 a 35': 1.5,
            '36 a 40': 1.3,
            '41 a 45': 1.2,
            '46 a 50': 1.1,
            '51+': 1.0,
          };
        }
        if (typeof odds.durationOdds === 'string') {
          try {
            return JSON.parse(odds.durationOdds);
          } catch {
            return {
              '15 a 20': 2.5,
              '21 a 25': 2.0,
              '26 a 30': 1.8,
              '31 a 35': 1.5,
              '36 a 40': 1.3,
              '41 a 45': 1.2,
              '46 a 50': 1.1,
              '51+': 1.0,
            };
          }
        }
        return odds.durationOdds;
      })(),
      roshanTotalOdds,
      firstRoshanOdds,
      firstFFOdds,
    };
  } else {
    form.value = {
      teamAOdds: 1.5,
      teamBOdds: 1.5,
      topKillerOdds: 2.0,
      lowestDeathsOdds: 2.0,
      topKillerPlayerOdds: {},
      lowestDeathsPlayerOdds: {},
      durationOdds: {
        '15 a 20': 2.5,
        '21 a 25': 2.0,
        '26 a 30': 1.8,
        '31 a 35': 1.5,
        '36 a 40': 1.3,
        '41 a 45': 1.2,
        '46 a 50': 1.1,
        '51+': 1.0,
      },
      roshanTotalOdds: {
        'over_2.5': 1.8,
        'under_2.5': 1.9,
        'over_3.5': 2.0,
        'under_3.5': 1.7,
        'over_4.5': 2.2,
        'under_4.5': 1.6,
      },
      firstRoshanOdds: {
        teamA: 1.5,
        teamB: 1.5,
      },
      firstFFOdds: {
        teamA: 1.5,
        teamB: 1.5,
      },
    };
  }
  error.value = '';
  success.value = '';
};

const getPlayerTeam = (teamId: string) => {
  if (!selectedGame.value) return '';
  const team = gameStore.teams.find((t) => t.id === teamId);
  return team?.name || '';
};

const allPlayersSelected = computed(() => {
  return gamePlayers.value.length > 0 && selectedPlayers.value.length === gamePlayers.value.length;
});

const toggleSelectAll = () => {
  if (allPlayersSelected.value) {
    selectedPlayers.value = [];
  } else {
    selectedPlayers.value = gamePlayers.value.map(p => p.id);
  }
};

const clearSelection = () => {
  selectedPlayers.value = [];
};

const applyBulkOdds = (type: 'topKiller' | 'topDead') => {
  if (selectedPlayers.value.length === 0) return;
  
  const oddsValue = type === 'topKiller' ? bulkTopKillerOdds.value : bulkTopDeadOdds.value;
  if (!oddsValue || oddsValue < 1) return;

  const roundedOdds = roundToTwoDecimals(oddsValue);
  
  selectedPlayers.value.forEach(playerId => {
    if (type === 'topKiller') {
      form.value.topKillerPlayerOdds[playerId] = roundedOdds;
    } else {
      form.value.lowestDeathsPlayerOdds[playerId] = roundedOdds;
    }
  });

    success.value = `Odds de ${type === 'topKiller' ? 'Top Killer' : 'Menos Mortes'} aplicada para ${selectedPlayers.value.length} jogador${selectedPlayers.value.length !== 1 ? 'es' : ''}!`;
  setTimeout(() => {
    success.value = '';
  }, 3000);
};

// Global players management functions
const loadAllPlayers = async () => {
  loadingAllPlayers.value = true;
  try {
    await gameStore.fetchTeams();
    allTeams.value = gameStore.teams;

    // Carregar todos os jogadores de todos os times
    const playersPromises = allTeams.value.map(async (team) => {
      try {
        const response = await api.get(`${routes.admin.players.list()}?teamId=${team.id}`);
        return response.data.players.map((player: any) => ({
          ...player,
          teamName: team.name,
        }));
      } catch {
        return [];
      }
    });

    const playersArrays = await Promise.all(playersPromises);
    allPlayers.value = playersArrays.flat();

    // Carregar dados de pot e odds
    allPlayers.value.forEach(player => {
      playerPotData.value[player.id] = player.pot || null;
      playerOddsData.value[player.id] = {
        topKiller: player.topKillerDefaultOdds || undefined,
        topDead: player.topDeadDefaultOdds || undefined,
      };
    });
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Erro ao carregar jogadores';
  } finally {
    loadingAllPlayers.value = false;
  }
};

const filteredPlayers = computed(() => {
  let filtered = allPlayers.value;

  // Filtrar por busca
  if (playerSearch.value) {
    const search = playerSearch.value.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(search));
  }

  // Filtrar por time
  if (filterTeamId.value) {
    filtered = filtered.filter(p => p.teamId === filterTeamId.value);
  }

  // Filtrar por pote
  if (filterPot.value !== '') {
    if (filterPot.value === 'null') {
      filtered = filtered.filter(p => !playerPotData.value[p.id]);
    } else {
      filtered = filtered.filter(p => playerPotData.value[p.id] === Number(filterPot.value));
    }
  }

  return filtered;
});

const playersWithPot = computed(() => {
  return allPlayers.value.filter(p => playerPotData.value[p.id] !== null && playerPotData.value[p.id] !== undefined).length;
});

const playersWithOdds = computed(() => {
  return allPlayers.value.filter(p => {
    const odds = playerOddsData.value[p.id];
    return odds && (odds.topKiller || odds.topDead);
  }).length;
});

const getPlayerInitial = (name: string) => {
  const parts = name.split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getPlayerTeamName = (teamId: string) => {
  const team = allTeams.value.find(t => t.id === teamId);
  return team?.name || '';
};

const updatePlayerPot = async (playerId: string, pot: number | null) => {
  savingPot.value[playerId] = true;
  try {
    await api.patch(routes.admin.players.update(playerId), { pot });
    // Atualizar o player na lista
    const player = allPlayers.value.find(p => p.id === playerId);
    if (player) {
      player.pot = pot;
    }
    success.value = 'Pote atualizado com sucesso!';
    setTimeout(() => {
      success.value = '';
    }, 2000);
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Erro ao atualizar pote';
    // Reverter mudança
    const player = allPlayers.value.find(p => p.id === playerId);
    if (player) {
      playerPotData.value[playerId] = player.pot || null;
    }
  } finally {
    savingPot.value[playerId] = false;
  }
};

const updatePlayerOddsInput = (playerId: string, type: 'topKiller' | 'topDead', odds: number | undefined) => {
  // Garantir que o objeto existe
  if (!playerOddsData.value[playerId]) {
    playerOddsData.value[playerId] = {};
  }
  
  if (!odds || odds < 1) {
    // Se vazio ou inválido, remover
    delete playerOddsData.value[playerId][type];
  } else {
    playerOddsData.value[playerId][type] = odds;
  }
};

const updatePlayerOdds = async (playerId: string, type: 'topKiller' | 'topDead', odds: number | undefined) => {
  savingOdds.value[playerId] = true;
  try {
    let roundedOdds: number | null = null;
    
    if (odds && odds >= 1) {
      roundedOdds = roundToTwoDecimals(odds);
    }
    
    // Garantir que o objeto existe
    if (!playerOddsData.value[playerId]) {
      playerOddsData.value[playerId] = {};
    }
    playerOddsData.value[playerId][type] = roundedOdds || undefined;
    
    // Salvar no banco de dados
    const updateData: any = {};
    if (type === 'topKiller') {
      updateData.topKillerDefaultOdds = roundedOdds;
    } else {
      updateData.topDeadDefaultOdds = roundedOdds;
    }
    
    await api.patch(routes.admin.players.update(playerId), updateData);
    
    // Atualizar o player na lista
    const player = allPlayers.value.find(p => p.id === playerId);
    if (player) {
      if (type === 'topKiller') {
        player.topKillerDefaultOdds = roundedOdds;
      } else {
        player.topDeadDefaultOdds = roundedOdds;
      }
    }
    
    success.value = `Odds de ${type === 'topKiller' ? 'Top Killer' : 'Menos Mortes'} ${roundedOdds ? 'atualizada' : 'removida'} com sucesso!`;
    setTimeout(() => {
      success.value = '';
    }, 2000);
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Erro ao atualizar odds';
    // Reverter mudança em caso de erro
    const player = allPlayers.value.find(p => p.id === playerId);
    if (player) {
      if (type === 'topKiller') {
        playerOddsData.value[playerId].topKiller = player.topKillerDefaultOdds || undefined;
      } else {
        playerOddsData.value[playerId].topDead = player.topDeadDefaultOdds || undefined;
      }
    }
  } finally {
    savingOdds.value[playerId] = false;
  }
};

const resetPlayerData = (playerId: string) => {
  playerToReset.value = playerId;
  showConfirmModal.value = true;
};

const confirmReset = async () => {
  if (!playerToReset.value) return;
  
  const playerId = playerToReset.value;
  showConfirmModal.value = false;
  
  try {
    await api.patch(routes.admin.players.update(playerId), { 
      pot: null,
      topKillerDefaultOdds: null,
      topDeadDefaultOdds: null,
    });
    const player = allPlayers.value.find(p => p.id === playerId);
    if (player) {
      player.pot = null;
      player.topKillerDefaultOdds = null;
      player.topDeadDefaultOdds = null;
    }
    playerPotData.value[playerId] = null;
    playerOddsData.value[playerId] = {
      topKiller: undefined,
      topDead: undefined,
    };
    success.value = 'Dados do jogador resetados!';
    setTimeout(() => {
      success.value = '';
    }, 2000);
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Erro ao resetar dados';
  } finally {
    playerToReset.value = null;
  }
};

const cancelReset = () => {
  showConfirmModal.value = false;
  playerToReset.value = null;
};

// Função para arredondar odds de jogador
const roundPlayerOdds = (playerId: string, oddsType: 'topKiller' | 'topDead') => {
  if (oddsType === 'topKiller') {
    if (form.value.topKillerPlayerOdds[playerId] !== undefined) {
      form.value.topKillerPlayerOdds[playerId] = roundToTwoDecimals(form.value.topKillerPlayerOdds[playerId]);
    }
  } else {
    if (form.value.lowestDeathsPlayerOdds[playerId] !== undefined) {
      form.value.lowestDeathsPlayerOdds[playerId] = roundToTwoDecimals(form.value.lowestDeathsPlayerOdds[playerId]);
    }
  }
};

watch(selectedGameId, () => {
  if (selectedGameId.value) {
    loadGameOdds();
  } else {
    gamePlayers.value = [];
    selectedPlayers.value = [];
    bulkTopKillerOdds.value = null;
    bulkTopDeadOdds.value = null;
    resetForm();
  }
});

watch(gamePlayers, () => {
  // Limpar seleção quando os jogadores mudarem
  selectedPlayers.value = [];
  bulkTopKillerOdds.value = null;
  bulkTopDeadOdds.value = null;
});

const handleUpdateOdds = async () => {
  if (!selectedGameId.value) {
    error.value = 'Selecione um jogo primeiro';
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    // Filtrar odds vazias (undefined/null) antes de enviar
    const topKillerPlayerOddsFiltered: Record<string, number> = {};
    const lowestDeathsPlayerOddsFiltered: Record<string, number> = {};
    
    Object.entries(form.value.topKillerPlayerOdds).forEach(([playerId, odds]) => {
      if (odds && odds > 0) {
        topKillerPlayerOddsFiltered[playerId] = odds;
      }
    });
    
    Object.entries(form.value.lowestDeathsPlayerOdds).forEach(([playerId, odds]) => {
      if (odds && odds > 0) {
        lowestDeathsPlayerOddsFiltered[playerId] = odds;
      }
    });

    // Arredondar todos os valores antes de enviar
    const roundedDurationOdds: Record<string, number> = {};
    Object.entries(form.value.durationOdds).forEach(([key, value]) => {
      roundedDurationOdds[key] = roundToTwoDecimals(value);
    });

    const roundedTopKillerPlayerOdds: Record<string, number> = {};
    Object.entries(topKillerPlayerOddsFiltered).forEach(([key, value]) => {
      roundedTopKillerPlayerOdds[key] = roundToTwoDecimals(value);
    });

    const roundedLowestDeathsPlayerOdds: Record<string, number> = {};
    Object.entries(lowestDeathsPlayerOddsFiltered).forEach(([key, value]) => {
      roundedLowestDeathsPlayerOdds[key] = roundToTwoDecimals(value);
    });

    // Arredondar Roshan Total Odds
    const roundedRoshanTotalOdds: Record<string, number> = {};
    Object.entries(form.value.roshanTotalOdds).forEach(([key, value]) => {
      if (value && value > 0) {
        roundedRoshanTotalOdds[key] = roundToTwoDecimals(value);
      }
    });

    // Arredondar First Roshan Odds
    const roundedFirstRoshanOdds = {
      teamA: roundToTwoDecimals(form.value.firstRoshanOdds.teamA),
      teamB: roundToTwoDecimals(form.value.firstRoshanOdds.teamB),
    };

    // Arredondar First FF Odds
    const roundedFirstFFOdds = {
      teamA: roundToTwoDecimals(form.value.firstFFOdds.teamA),
      teamB: roundToTwoDecimals(form.value.firstFFOdds.teamB),
    };

    await gameStore.updateOdds(selectedGameId.value, {
      teamAOdds: roundToTwoDecimals(form.value.teamAOdds),
      teamBOdds: roundToTwoDecimals(form.value.teamBOdds),
      topKillerOdds: roundToTwoDecimals(form.value.topKillerOdds),
      lowestDeathsOdds: roundToTwoDecimals(form.value.lowestDeathsOdds),
      topKillerPlayerOdds: Object.keys(roundedTopKillerPlayerOdds).length > 0 ? roundedTopKillerPlayerOdds : undefined,
      lowestDeathsPlayerOdds: Object.keys(roundedLowestDeathsPlayerOdds).length > 0 ? roundedLowestDeathsPlayerOdds : undefined,
      durationOdds: roundedDurationOdds,
      roshanTotalOdds: Object.keys(roundedRoshanTotalOdds).length > 0 ? roundedRoshanTotalOdds : undefined,
      firstRoshanOdds: roundedFirstRoshanOdds,
      firstFFOdds: roundedFirstFFOdds,
    });

    success.value = 'Odds atualizadas com sucesso!';
    setTimeout(() => {
      success.value = '';
    }, 3000);
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Erro ao atualizar odds';
  } finally {
    loading.value = false;
  }
};

</script>

<style scoped>
.manage-odds {
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
  background: rgba(10, 14, 26, 0.9);
  background-color: rgba(10, 14, 26, 0.9);
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.2s;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
}

.selector-content select:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(10, 14, 26, 0.95);
  background-color: rgba(10, 14, 26, 0.95);
  box-shadow: 0 0 0 3px rgba(31, 163, 122, 0.1);
}

.selector-content select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.selector-content select option {
  background: rgba(10, 14, 26, 0.95);
  background-color: rgba(10, 14, 26, 0.95);
  color: #fff;
  padding: 0.5rem;
}

.hint {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  margin: 0;
}

.odds-form-section {
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
  margin: 0;
}

.odds-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.odds-section {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.odds-section h4 {
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
  color: var(--accent-primary);
}

.winner-odds-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.team-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.form-group input {
  padding: 0.875rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(31, 163, 122, 0.1);
}

.form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.field-hint {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.25rem;
}

.duration-odds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.duration-odds-item {
  display: flex;
  flex-direction: column;
}

.duration-odds-item label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.duration-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.duration-odds-item input {
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.duration-odds-item input:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(31, 163, 122, 0.1);
}

.top-killer-section {
  max-width: 400px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.submit-btn {
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 10px;
  background: var(--gradient-button);
  color: var(--gradient-button-text);
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(31, 163, 122, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-btn {
  padding: 0.875rem 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.reset-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.empty-state {
  padding: 3rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.player-odds-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-primary);
}

.player-odds-section h5 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.player-odds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.player-odds-item {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 8px;
  padding: 0.75rem;
  transition: all 0.2s;
}

.player-odds-item:hover {
  border-color: var(--input-border-focus);
  background: var(--input-bg-hover);
}

.player-odds-item label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.player-odds-item .player-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.player-odds-item .player-team {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.player-odds-item input {
  width: 100%;
  padding: 0.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--input-border);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.2s;
}

.player-odds-item input:focus {
  outline: none;
  border-color: var(--input-border-focus);
  box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
}

.player-odds-item input::placeholder {
  color: var(--text-muted);
}

/* Roshan Total Odds */
.roshan-total-odds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.roshan-odds-item {
  display: flex;
  flex-direction: column;
}

.roshan-odds-item label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.roshan-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.roshan-odds-item input {
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.roshan-odds-item input:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(31, 163, 122, 0.1);
}

/* Bulk Odds Section */
.bulk-odds-section {
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.bulk-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.bulk-select-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bulk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.bulk-select-all {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--accent-primary);
  cursor: pointer;
}

.bulk-select-all input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--accent-primary);
}

.clear-selection-btn {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-selection-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.clear-selection-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bulk-players-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.bulk-player-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.bulk-player-checkbox:hover {
  background: rgba(255, 255, 255, 0.05);
}

.bulk-player-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--accent-primary);
}

.bulk-player-name {
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
}

.bulk-player-team {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bulk-actions-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.bulk-action-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.bulk-action-label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bulk-action-label > span {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bulk-action-label input {
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
}

.bulk-action-label input:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
}

.bulk-action-label input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bulk-apply-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: var(--gradient-button);
  color: var(--gradient-button-text);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.bulk-apply-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
}

.bulk-apply-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .bulk-controls {
    grid-template-columns: 1fr;
  }
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

/* Global Players Section */
.global-players-section {
  margin-top: 3rem;
  padding: 2rem;
}

.section-header-global {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-header-global h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.section-header-global p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.refresh-btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.players-filters {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.search-input,
.filter-select {
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.search-input:focus,
.filter-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
}

.players-table-container {
  overflow-x: auto;
  margin-bottom: 2rem;
}

.players-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  overflow: hidden;
}

.players-table thead {
  background: rgba(0, 255, 136, 0.1);
  border-bottom: 2px solid rgba(0, 255, 136, 0.3);
}

.players-table th {
  padding: 1rem;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.players-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.player-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.player-row:last-child td {
  border-bottom: none;
}

.player-name-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.player-avatar-small {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--accent-primary);
  flex-shrink: 0;
}

.player-team-cell {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.player-pot-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pot-select {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
}

.pot-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.08);
}

.pot-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.saving-indicator {
  font-size: 0.9rem;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.player-odds-cell {
  min-width: 120px;
}

.odds-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;
}

.odds-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
}

.odds-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.odds-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.player-actions-cell {
  text-align: center;
}

.reset-player-btn {
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.reset-player-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.players-stats {
  display: flex;
  gap: 2rem;
  padding: 1.5rem;
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-primary);
}

@media (max-width: 1024px) {
  .players-filters {
    grid-template-columns: 1fr;
  }

  .players-table {
    font-size: 0.85rem;
  }

  .players-table th,
  .players-table td {
    padding: 0.75rem 0.5rem;
  }
}

/* Modal de Confirmação */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 0;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideUp 0.3s ease-out;
  overflow: hidden;
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
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
}

.modal-body {
  padding: 2rem;
  text-align: center;
}

.modal-body p {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: var(--text-primary);
  line-height: 1.6;
}

.modal-warning {
  color: var(--accent-primary);
  font-weight: 600;
  font-size: 0.95rem;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  background: rgba(0, 0, 0, 0.2);
}

.modal-btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.modal-btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-btn-cancel:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.modal-btn-confirm {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: var(--text-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.modal-btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.modal-btn-confirm:active {
  transform: translateY(0);
}

@media (max-width: 640px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1.25rem 1.5rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-btn {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .winner-odds-grid {
    grid-template-columns: 1fr;
  }

  .duration-odds-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-nav {
    width: 100%;
    justify-content: space-around;
  }

  .section-header-global {
    flex-direction: column;
    gap: 1rem;
  }

  .players-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .players-table-container {
    overflow-x: scroll;
  }

  .players-table {
    min-width: 800px;
  }
}
</style>

