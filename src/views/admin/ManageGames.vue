<template>
  <div class="manage-games">
    <AdminHeader />

    <main class="admin-main">
      <div class="page-header">
        <h2>Gerenciar Jogos</h2>
        <p>Crie e gerencie os jogos disponíveis para apostas</p>
      </div>

      <!-- Form para criar jogo -->
      <div class="form-section glass-panel">
        <h3>Criar Novo Jogo</h3>
        <form @submit.prevent="handleCreateGame" class="game-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Time A</label>
              <select v-model="form.teamAId" required :disabled="loading">
                <option value="">Selecione o Time A</option>
                <option v-for="team in teams" :key="team.id" :value="team.id">
                  {{ team.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Time B</label>
              <select v-model="form.teamBId" required :disabled="loading">
                <option value="">Selecione o Time B</option>
                <option v-for="team in teams" :key="team.id" :value="team.id">
                  {{ team.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Data e Hora do Jogo</label>
              <input
                type="datetime-local"
                v-model="form.startTime"
                required
                :disabled="loading"
              />
            </div>
          </div>

          <div class="odds-section">
            <h4>Odds Iniciais</h4>
            <div class="odds-grid">
              <div class="form-group">
                <label>Odds Time A (Vitória)</label>
                <input
                  type="number"
                  v-model.number="form.teamAOdds"
                  step="0.01"
                  min="1"
                  required
                  :disabled="loading"
                />
              </div>

              <div class="form-group">
                <label>Odds Time B (Vitória)</label>
                <input
                  type="number"
                  v-model.number="form.teamBOdds"
                  step="0.01"
                  min="1"
                  required
                  :disabled="loading"
                  @blur="form.teamBOdds = roundToTwoDecimals(form.teamBOdds)"
                />
              </div>

              <div class="form-group">
                <label>Odds Top Killer</label>
                <input
                  type="number"
                  v-model.number="form.topKillerOdds"
                  step="0.01"
                  min="1"
                  required
                  :disabled="loading"
                  @blur="form.topKillerOdds = roundToTwoDecimals(form.topKillerOdds)"
                />
              </div>

              <div class="form-group">
                <label>Odds Top Dead</label>
                <input
                  type="number"
                  v-model.number="form.lowestDeathsOdds"
                  step="0.01"
                  min="1"
                  required
                  :disabled="loading"
                  @blur="form.lowestDeathsOdds = roundToTwoDecimals(form.lowestDeathsOdds)"
                />
              </div>
            </div>

            <div class="duration-odds-section">
              <label>Odds de Duração</label>
              <div class="duration-odds-grid">
                <div class="duration-odds-item" v-for="band in durationBands" :key="band">
                  <label class="duration-label">{{ band }}</label>
                  <input
                    type="number"
                    v-model.number="form.durationOdds[band]"
                    step="0.01"
                    min="1"
                    :placeholder="getDefaultDurationOdd(band)"
                    :disabled="loading"
                    @blur="form.durationOdds[band] = roundToTwoDecimals(form.durationOdds[band])"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="loading || !canSubmit">
              {{ loading ? 'Criando...' : 'Criar Jogo' }}
            </button>
            <button type="button" @click="resetForm" class="reset-btn" :disabled="loading">
              Limpar
            </button>
          </div>

          <p v-if="error" class="error-message">{{ error }}</p>
          <p v-if="success" class="success-message">{{ success }}</p>
        </form>
      </div>

      <!-- Lista de jogos -->
      <div class="games-section">
        <h3>Jogos Cadastrados</h3>
        <div class="games-filters">
          <button
            v-for="filter in statusFilters"
            :key="filter.value"
            @click="activeFilter = filter.value"
            class="filter-btn"
            :class="{ active: activeFilter === filter.value }"
          >
            {{ filter.label }}
          </button>
        </div>

        <div v-if="loading && filteredGames.length === 0" class="loading glass-panel">
          <p>Carregando jogos...</p>
        </div>
        <div v-else-if="filteredGames.length === 0" class="empty-state glass-panel">
          <p>Nenhum jogo encontrado.</p>
        </div>
        <div v-else class="games-list">
          <div v-for="game in filteredGames" :key="game.id" class="game-card glass-panel">
            <div class="game-header">
              <div class="game-matchup">
                <div class="team-info">
                  <span class="team-name">{{ game.teamA.name }}</span>
                  <span class="team-odds">Odds: {{ game.odds?.teamAOdds || 'N/A' }}x</span>
                </div>
                <span class="vs">VS</span>
                <div class="team-info">
                  <span class="team-name">{{ game.teamB.name }}</span>
                  <span class="team-odds">Odds: {{ game.odds?.teamBOdds || 'N/A' }}x</span>
                </div>
              </div>
              <span class="status-badge" :class="game.status.toLowerCase()">
                {{ getStatusLabel(game.status) }}
              </span>
            </div>

            <div class="game-details">
              <div class="detail-item">
                <span class="detail-label">Data/Hora</span>
                <span class="detail-value">{{ formatDateTime(game.startTime) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Top Killer Odds</span>
                <span class="detail-value">{{ game.odds?.topKillerOdds || 'N/A' }}x</span>
              </div>
            </div>

            <div class="game-actions">
              <button
                @click="handleEditGame(game)"
                class="action-btn edit"
                v-if="game.status === 'SCHEDULED'"
                :disabled="loading"
              >
                Editar Jogo
              </button>
              <RouterLink
                :to="`/panel/odds?game=${game.id}`"
                class="action-btn odds"
                v-if="game.status === 'SCHEDULED'"
              >
                Editar Odds
              </RouterLink>
              <RouterLink
                :to="`/panel/close-game?game=${game.id}`"
                class="action-btn close"
                v-if="game.status === 'SCHEDULED'"
              >
                Fechar Jogo
              </RouterLink>
              <button
                @click="openDeleteModal(game)"
                class="action-btn delete"
                :disabled="loading"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <AdminFooter />

    <!-- Modal de Exclusão -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Confirmar Exclusão</h3>
          <button class="modal-close" @click="closeDeleteModal">×</button>
        </div>
        
        <div class="modal-content">
          <div class="confirm-icon">🗑️</div>
          <p class="confirm-message">
            Tem certeza que deseja excluir este jogo? Esta ação não pode ser desfeita.
          </p>
          
          <div class="confirm-details" v-if="deletingGame">
            <div class="detail-item">
              <span class="detail-label">Jogo:</span>
              <span class="detail-value">
                {{ deletingGame.teamA?.name }} vs {{ deletingGame.teamB?.name }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Data/Hora:</span>
              <span class="detail-value">{{ formatDateTime(deletingGame.startTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status:</span>
              <span class="detail-value">{{ getStatusLabel(deletingGame.status) }}</span>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            class="modal-btn cancel-btn" 
            @click="closeDeleteModal" 
            :disabled="loading"
          >
            Cancelar
          </button>
          <button 
            class="modal-btn delete-btn" 
            @click="handleDeleteGame" 
            :disabled="loading"
          >
            <span v-if="loading">Excluindo...</span>
            <span v-else>Confirmar Exclusão</span>
          </button>
        </div>
        
        <p v-if="error" class="error-message">{{ error }}</p>
        <p v-if="success" class="success-message">{{ success }}</p>
      </div>
    </div>

    <!-- Modal de Edição -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-container edit-modal">
        <div class="modal-header">
          <h3>Editar Jogo</h3>
          <button class="modal-close" @click="closeEditModal">×</button>
        </div>
        
        <form @submit.prevent="handleUpdateGame" class="edit-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Time A</label>
              <select v-model="editForm.teamAId" required :disabled="loading">
                <option value="">Selecione o Time A</option>
                <option v-for="team in teams" :key="team.id" :value="team.id">
                  {{ team.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Time B</label>
              <select v-model="editForm.teamBId" required :disabled="loading">
                <option value="">Selecione o Time B</option>
                <option v-for="team in teams" :key="team.id" :value="team.id">
                  {{ team.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Data e Hora do Jogo</label>
              <input
                type="datetime-local"
                v-model="editForm.startTime"
                required
                :disabled="loading"
              />
            </div>
          </div>

          <div class="odds-section">
            <h4>Odds</h4>
            <div class="odds-grid">
              <div class="form-group">
                <label>Odds Time A (Vitória)</label>
                <input
                  type="number"
                  v-model.number="editForm.teamAOdds"
                  step="0.01"
                  min="1"
                  required
                  :disabled="loading"
                />
              </div>

              <div class="form-group">
                <label>Odds Time B (Vitória)</label>
                <input
                  type="number"
                  v-model.number="editForm.teamBOdds"
                  step="0.01"
                  min="1"
                  required
                  :disabled="loading"
                  @blur="editForm.teamBOdds = roundToTwoDecimals(editForm.teamBOdds)"
                />
              </div>

              <div class="form-group">
                <label>Odds Top Killer</label>
                <input
                  type="number"
                  v-model.number="editForm.topKillerOdds"
                  step="0.01"
                  min="1"
                  required
                  :disabled="loading"
                  @blur="editForm.topKillerOdds = roundToTwoDecimals(editForm.topKillerOdds)"
                />
              </div>

              <div class="form-group">
                <label>Odds Top Dead</label>
                <input
                  type="number"
                  v-model.number="editForm.lowestDeathsOdds"
                  step="0.01"
                  min="1"
                  required
                  :disabled="loading"
                  @blur="editForm.lowestDeathsOdds = roundToTwoDecimals(editForm.lowestDeathsOdds)"
                />
              </div>
            </div>

            <div class="duration-odds-section">
              <h5>Odds de Duração</h5>
              <div class="duration-grid">
                <div
                  v-for="band in durationBands"
                  :key="band"
                  class="form-group"
                >
                  <label>{{ band }} min</label>
                  <input
                    type="number"
                    v-model.number="editForm.durationOdds[band]"
                    step="0.01"
                    min="1"
                    required
                    :disabled="loading"
                    @blur="editForm.durationOdds[band] = roundToTwoDecimals(editForm.durationOdds[band])"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button 
              type="button" 
              class="modal-btn cancel-btn" 
              @click="closeEditModal" 
              :disabled="loading"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="modal-btn confirm-btn" 
              :disabled="loading || !canEditSubmit"
            >
              <span v-if="loading">Salvando...</span>
              <span v-else>Salvar Alterações</span>
            </button>
          </div>
          
          <p v-if="error" class="error-message">{{ error }}</p>
          <p v-if="success" class="success-message">{{ success }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Vue component with script setup
import AdminHeader from '@/components/AdminHeader.vue';
// @ts-ignore - Vue component with script setup
import AdminFooter from '@/components/AdminFooter.vue';
import { ref, computed, onMounted } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useUserStore } from '@/store/useUserStore';
import { useGameStore } from '@/store/useGameStore';

const router = useRouter();
const userStore = useUserStore();
const gameStore = useGameStore();

const loading = ref(false);
const error = ref('');
const success = ref('');
const activeFilter = ref('all');
const showEditModal = ref(false);
const editingGameId = ref<string | null>(null);
const showDeleteModal = ref(false);
const deletingGameId = ref<string | null>(null);
const deletingGame = ref<any>(null);

const durationBands = ['15 a 20', '21 a 25', '26 a 30', '31 a 35', '36 a 40', '41 a 45', '46 a 50', '51+'];

const statusFilters = [
  { label: 'Todos', value: 'all' },
  { label: 'Agendados', value: 'SCHEDULED' },
  { label: 'Ao Vivo', value: 'LIVE' },
  { label: 'Encerrados', value: 'CLOSED' },
];

const form = ref({
  teamAId: '',
  teamBId: '',
  startTime: '',
  teamAOdds: 1.5,
  teamBOdds: 1.5,
  topKillerOdds: 2.0,
  lowestDeathsOdds: 2.0,
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
});

const editForm = ref({
  teamAId: '',
  teamBId: '',
  startTime: '',
  teamAOdds: 1.5,
  teamBOdds: 1.5,
  topKillerOdds: 2.0,
  lowestDeathsOdds: 2.0,
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
});

const teams = computed(() => gameStore.teams);
const games = computed(() => gameStore.games);

const filteredGames = computed(() => {
  if (activeFilter.value === 'all') {
    return games.value;
  }
  return games.value.filter((game) => game.status === activeFilter.value);
});

const canSubmit = computed(() => {
  return (
    form.value.teamAId &&
    form.value.teamBId &&
    form.value.teamAId !== form.value.teamBId &&
    form.value.startTime
  );
});

const canEditSubmit = computed(() => {
  return (
    editForm.value.teamAId &&
    editForm.value.teamBId &&
    editForm.value.teamAId !== editForm.value.teamBId &&
    editForm.value.startTime
  );
});

const getDefaultDurationOdd = (band: string) => {
  return form.value.durationOdds[band]?.toString() || '1.0';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    SCHEDULED: 'Agendado',
    LIVE: 'Ao Vivo',
    CLOSED: 'Encerrado',
  };
  return labels[status] || status;
};

// Função para arredondar para 2 casas decimais
const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100;
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
});

const loadData = async () => {
  loading.value = true;
  try {
    await gameStore.fetchTeams();
    await gameStore.fetchGames();
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Erro ao carregar dados';
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.value = {
    teamAId: '',
    teamBId: '',
    startTime: '',
    teamAOdds: 1.5,
    teamBOdds: 1.5,
    topKillerOdds: 2.0,
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
  };
  error.value = '';
  success.value = '';
};

const formatDateTimeLocal = (date: string) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const handleEditGame = (game: any) => {
  editingGameId.value = game.id;
  
  // Parse duration odds if it's a string
  let durationOdds = {
    '15 a 20': 2.5,
    '21 a 25': 2.0,
    '26 a 30': 1.8,
    '31 a 35': 1.5,
    '36 a 40': 1.3,
    '41 a 45': 1.2,
    '46 a 50': 1.1,
    '51+': 1.0,
  };
  
  if (game.odds?.durationOdds) {
    try {
      const parsed = typeof game.odds.durationOdds === 'string' 
        ? JSON.parse(game.odds.durationOdds) 
        : game.odds.durationOdds;
      durationOdds = { ...durationOdds, ...parsed };
    } catch (e) {
      // Use default if parsing fails
    }
  }
  
  // Arredondar valores para 2 casas decimais
  const roundedDurationOdds: Record<string, number> = {};
  Object.entries(durationOdds).forEach(([key, value]) => {
    roundedDurationOdds[key] = roundToTwoDecimals(value);
  });

  editForm.value = {
    teamAId: game.teamAId,
    teamBId: game.teamBId,
    startTime: formatDateTimeLocal(game.startTime),
    teamAOdds: roundToTwoDecimals(game.odds?.teamAOdds || 1.5),
    teamBOdds: roundToTwoDecimals(game.odds?.teamBOdds || 1.5),
    topKillerOdds: roundToTwoDecimals(game.odds?.topKillerOdds || 2.0),
    lowestDeathsOdds: roundToTwoDecimals(game.odds?.lowestDeathsOdds || 2.0),
    durationOdds: roundedDurationOdds,
  };
  
  showEditModal.value = true;
  error.value = '';
  success.value = '';
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingGameId.value = null;
  editForm.value = {
    teamAId: '',
    teamBId: '',
    startTime: '',
    teamAOdds: 1.5,
    teamBOdds: 1.5,
    topKillerOdds: 2.0,
    lowestDeathsOdds: 2.0,
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
  };
  error.value = '';
  success.value = '';
};

const handleUpdateGame = async () => {
  if (!editingGameId.value) return;

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    // Converter data para formato ISO
    const startTimeISO = new Date(editForm.value.startTime).toISOString();

    // Arredondar todos os valores antes de enviar
    const roundedDurationOdds: Record<string, number> = {};
    Object.entries(editForm.value.durationOdds).forEach(([key, value]) => {
      roundedDurationOdds[key] = roundToTwoDecimals(value);
    });

    await gameStore.updateGame(editingGameId.value, {
      teamAId: editForm.value.teamAId,
      teamBId: editForm.value.teamBId,
      startTime: startTimeISO,
      teamAOdds: roundToTwoDecimals(editForm.value.teamAOdds),
      teamBOdds: roundToTwoDecimals(editForm.value.teamBOdds),
      topKillerOdds: roundToTwoDecimals(editForm.value.topKillerOdds),
      lowestDeathsOdds: roundToTwoDecimals(editForm.value.lowestDeathsOdds),
      durationOdds: roundedDurationOdds,
    });
    
    success.value = 'Jogo atualizado com sucesso!';
    setTimeout(() => {
      closeEditModal();
      success.value = '';
    }, 2000);
  } catch (err: any) {
    const errorMessage = err.response?.data?.error || err.message || 'Erro ao atualizar jogo';
    error.value = errorMessage;
  } finally {
    loading.value = false;
  }
};

const handleCreateGame = async () => {
  if (!canSubmit.value) {
    error.value = 'Preencha todos os campos obrigatórios e selecione times diferentes';
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    // Converter data para formato ISO
    const startTimeISO = new Date(form.value.startTime).toISOString();

    // Arredondar todos os valores antes de enviar
    const roundedDurationOdds: Record<string, number> = {};
    Object.entries(form.value.durationOdds).forEach(([key, value]) => {
      roundedDurationOdds[key] = roundToTwoDecimals(value);
    });

    await gameStore.createGame({
      teamAId: form.value.teamAId,
      teamBId: form.value.teamBId,
      startTime: startTimeISO,
      teamAOdds: roundToTwoDecimals(form.value.teamAOdds),
      teamBOdds: roundToTwoDecimals(form.value.teamBOdds),
      topKillerOdds: roundToTwoDecimals(form.value.topKillerOdds),
      lowestDeathsOdds: roundToTwoDecimals(form.value.lowestDeathsOdds),
      durationOdds: roundedDurationOdds,
    });

    success.value = 'Jogo criado com sucesso!';
    resetForm();
    setTimeout(() => {
      success.value = '';
    }, 3000);
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Erro ao criar jogo';
  } finally {
    loading.value = false;
  }
};

const openDeleteModal = (game: any) => {
  deletingGameId.value = game.id;
  deletingGame.value = game;
  showDeleteModal.value = true;
  error.value = '';
  success.value = '';
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deletingGameId.value = null;
  deletingGame.value = null;
  error.value = '';
  success.value = '';
};

const handleDeleteGame = async () => {
  if (!deletingGameId.value) return;

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    await gameStore.deleteGame(deletingGameId.value);
    success.value = 'Jogo excluído com sucesso!';
    setTimeout(() => {
      closeDeleteModal();
      success.value = '';
    }, 2000);
  } catch (err: any) {
    const errorMessage = err.response?.data?.error || err.message || 'Erro ao excluir jogo';
    error.value = errorMessage;
  } finally {
    loading.value = false;
  }
};

</script>

<style scoped>
.manage-games {
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

.form-section {
  padding: 2rem;
  margin-bottom: 2rem;
}

.form-section h3 {
  margin: 0 0 1.5rem 0;
}

.game-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(31, 163, 122, 0.1);
}

.form-group input:disabled,
.form-group select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.odds-section {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.odds-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: var(--accent-primary);
}

.odds-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.duration-odds-section {
  margin-top: 1.5rem;
}

.duration-odds-section > label {
  display: block;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.duration-odds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.duration-odds-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.duration-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
}

.duration-odds-item input {
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
  font-size: 0.85rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
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

.games-section h3 {
  margin: 0 0 1.5rem 0;
}

.games-filters {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.6rem 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
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

.loading,
.empty-state {
  padding: 3rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.games-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.game-card {
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.game-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(31, 163, 122, 0.15);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-primary);
}

.game-matchup {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.team-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
}

.team-name {
  font-size: 1.1rem;
  font-weight: 600;
}

.team-odds {
  font-size: 0.85rem;
  color: var(--accent-primary);
}

.vs {
  padding: 0.5rem 1rem;
  background: rgba(31, 163, 122, 0.15);
  border: 1px solid rgba(31, 163, 122, 0.3);
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent-primary);
}

.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.scheduled {
  background: rgba(31, 163, 122, 0.15);
  color: var(--accent-primary);
  border: 1px solid rgba(31, 163, 122, 0.3);
}

.status-badge.live {
  background: rgba(255, 123, 154, 0.15);
  color: #ff7b9a;
  border: 1px solid rgba(255, 123, 154, 0.3);
}

.status-badge.closed {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.game-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.6);
}

.detail-value {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.game-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
  text-align: center;
}

.action-btn.edit {
  background: rgba(31, 163, 122, 0.15);
  border: 1px solid rgba(31, 163, 122, 0.3);
  color: var(--accent-primary);
}

.action-btn.edit:hover {
  background: rgba(31, 163, 122, 0.25);
}

.action-btn.close {
  background: rgba(255, 123, 154, 0.15);
  border: 1px solid rgba(255, 123, 154, 0.3);
  color: #ff7b9a;
}

.action-btn.close:hover {
  background: rgba(255, 123, 154, 0.25);
}

.action-btn.delete {
  background: rgba(201, 74, 74, 0.15);
  border: 1px solid rgba(201, 74, 74, 0.3);
  color: #C94A4A;
}

.action-btn.delete:hover {
  background: rgba(201, 74, 74, 0.25);
  transform: translateY(-1px);
}

.action-btn.odds {
  background: rgba(212, 165, 116, 0.15);
  border: 1px solid rgba(212, 165, 116, 0.3);
  color: #D4A574;
}

.action-btn.odds:hover {
  background: rgba(212, 165, 116, 0.25);
}

@media (max-width: 768px) {
  .form-grid,
  .odds-grid {
    grid-template-columns: 1fr;
  }

  .duration-odds-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .game-matchup {
    flex-direction: column;
    gap: 1rem;
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

/* Modal de Edição */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
  overflow-y: auto;
  padding: 2rem 1rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.edit-modal {
  background: var(--bg-glass-strong);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin: auto;
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
  position: sticky;
  top: 0;
  background: var(--bg-glass-strong);
  z-index: 10;
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
  color: var(--accent-secondary);
  transform: rotate(90deg);
}

.edit-form {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.edit-form .form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.edit-form .odds-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 1.5rem;
}

.edit-form .odds-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.edit-form .odds-section h5 {
  margin: 1.5rem 0 1rem 0;
  font-size: 0.95rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.edit-form .odds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.edit-form .duration-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.edit-form .form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.edit-form .form-group label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.edit-form .form-group input,
.edit-form .form-group select {
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.2s;
}

.edit-form .form-group input:focus,
.edit-form .form-group select:focus {
  outline: none;
  border-color: var(--input-border-focus);
  background: var(--input-bg-hover);
  box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
}

.edit-form .form-group input:disabled,
.edit-form .form-group select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.edit-form .modal-footer {
  padding: 0;
  border-top: none;
  margin-top: 0.5rem;
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

.modal-btn.delete-btn {
  background: var(--accent-error);
  color: white;
}

.modal-btn.delete-btn:hover:not(:disabled) {
  background: var(--accent-secondary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
}

.confirm-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.confirm-message {
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1.5rem;
  text-align: center;
}

.confirm-details {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: left;
}

.edit-form .error-message {
  color: var(--accent-error);
  font-size: 0.85rem;
  margin: 0;
}

.edit-form .success-message {
  color: var(--accent-primary);
  font-size: 0.85rem;
  margin: 0;
}
</style>

