<template>
  <div class="manage-players">
    <AdminHeader />

    <main class="admin-main">
      <div class="page-header">
        <h2>Gerenciar Jogadores</h2>
        <p>Adicione e gerencie jogadores de cada time</p>
      </div>

      <!-- Form Premium para adicionar jogador -->
      <div class="form-section-premium">
        <div class="form-header">
          <div class="form-header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <div class="form-header-content">
            <div>
              <h3>Adicionar Jogador{{ isMultipleMode ? 'es' : '' }}</h3>
              <p>{{ isMultipleMode ? 'Cadastre vários jogadores de uma vez' : 'Cadastre jogadores para os times cadastrados' }}</p>
            </div>
            <button 
              type="button" 
              @click="toggleMode" 
              class="mode-toggle-btn"
              :class="{ 'active': isMultipleMode }"
            >
              <span v-if="!isMultipleMode">📝 Modo Múltiplo</span>
              <span v-else>👤 Modo Simples</span>
            </button>
          </div>
        </div>
        <form @submit.prevent="isMultipleMode ? handleAddMultiplePlayers() : handleAddPlayer()" class="player-form-premium">
          <div class="form-row-premium">
            <div class="form-group-premium">
              <label>
                <span class="label-icon">🏆</span>
                Time
              </label>
              <select v-model="form.teamId" required :disabled="loading">
                <option value="">Selecione um time</option>
                <option v-for="team in teams" :key="team.id" :value="team.id">
                  {{ team.name }}
                </option>
              </select>
            </div>
            <div class="form-group-premium" v-if="!isMultipleMode">
              <label>
                <span class="label-icon">👤</span>
                Nome do Jogador
              </label>
              <input
                type="text"
                v-model="form.name"
                required
                placeholder="Ex: Ana"
                :disabled="loading"
              />
            </div>
            <div class="form-group-premium form-group-multiple" v-else>
              <label>
                <span class="label-icon">👥</span>
                Nomes dos Jogadores
                <span class="label-hint">(um por linha ou separados por vírgula)</span>
              </label>
              <textarea
                v-model="form.names"
                required
                placeholder="Ex:&#10;Ana&#10;Bruno&#10;Carlos&#10;&#10;ou: Ana, Bruno, Carlos"
                :disabled="loading"
                rows="6"
                class="names-textarea"
              ></textarea>
              <div class="names-preview" v-if="parsedNames.length > 0">
                <span class="preview-label">{{ parsedNames.length }} jogador{{ parsedNames.length !== 1 ? 'es' : '' }} será{{ parsedNames.length !== 1 ? 'ão' : '' }} adicionado{{ parsedNames.length !== 1 ? 's' : '' }}:</span>
                <div class="preview-tags">
                  <span v-for="(name, index) in parsedNames.slice(0, 10)" :key="index" class="preview-tag">
                    {{ name.trim() }}
                  </span>
                  <span v-if="parsedNames.length > 10" class="preview-tag preview-tag-more">
                    +{{ parsedNames.length - 10 }} mais
                  </span>
                </div>
              </div>
            </div>
            <div class="form-group-premium form-submit">
              <button type="submit" class="submit-btn-premium" :disabled="loading || (isMultipleMode && parsedNames.length === 0)">
                <span v-if="!loading" class="btn-icon">{{ isMultipleMode ? '📝' : '+' }}</span>
                <span v-else class="btn-spinner"></span>
                <span>{{ loading ? (isMultipleMode ? 'Adicionando...' : 'Adicionando...') : (isMultipleMode ? `Adicionar ${parsedNames.length} Jogador${parsedNames.length !== 1 ? 'es' : ''}` : 'Adicionar Jogador') }}</span>
              </button>
            </div>
          </div>
          <div v-if="error" class="message-error">
            <span class="message-icon">⚠️</span>
            {{ error }}
          </div>
          <div v-if="success" class="message-success">
            <span class="message-icon">✓</span>
            {{ success }}
          </div>
        </form>
      </div>

      <!-- Lista Premium de Jogadores por Time -->
      <div class="players-section-premium">
        <div class="section-header-premium">
          <div>
            <h3>Jogadores por Time</h3>
            <p>Gerencie os jogadores de cada time cadastrado</p>
          </div>
          <div class="total-stats">
            <div class="stat-badge">
              <span class="stat-number">{{ totalPlayers }}</span>
              <span class="stat-label">Total de Jogadores</span>
            </div>
          </div>
        </div>

        <div v-if="loading && teams.length === 0" class="loading-premium">
          <div class="loading-spinner"></div>
          <p>Carregando jogadores...</p>
        </div>

        <div v-else-if="teams.length === 0" class="empty-state-premium">
          <div class="empty-icon">🏆</div>
          <h4>Nenhum time cadastrado</h4>
          <p>Cadastre times primeiro para adicionar jogadores</p>
          <RouterLink to="/panel/teams" class="empty-action-btn">
            Ir para Times →
          </RouterLink>
        </div>

        <div v-else class="teams-list-container">
          <div class="teams-list">
            <div
              v-for="team in teams"
              :key="team.id"
              class="team-item glass-panel"
              :class="{ 'is-expanded': expandedTeamId === team.id }"
            >
              <!-- Main Row (Always Visible) -->
              <div class="team-item-content" @click="toggleTeam(team.id)">
                <!-- Left: Team Info -->
                <div class="team-info">
                  <div class="team-logo-compact">
                    <div v-if="team.logo" class="team-logo-wrapper-compact">
                      <img :src="team.logo" :alt="team.name" class="team-logo-img-compact" />
                    </div>
                    <div v-else class="team-logo-placeholder-compact">
                      <span class="logo-initial-compact">{{ getTeamInitial(team.name) }}</span>
                    </div>
                  </div>
                  <div class="team-details-compact">
                    <h4 class="team-name-compact">{{ team.name }}</h4>
                    <div class="team-meta">
                      <span class="meta-item">
                        <span class="meta-icon">👥</span>
                        {{ team.players?.length || 0 }} jogador{{ (team.players?.length || 0) !== 1 ? 'es' : '' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Center: Players Count -->
                <div class="team-stats-compact">
                  <div class="stat-group">
                    <span class="stat-label-small">Total de Jogadores</span>
                    <span class="stat-value-small">
                      {{ team.players?.length || 0 }}
                    </span>
                  </div>
                </div>

                <!-- Right: Status & Expand -->
                <div class="team-actions-section">
                  <div class="players-badge-compact" :class="{ 'badge-empty': (team.players?.length || 0) === 0 }">
                    <span v-if="(team.players?.length || 0) === 0" class="badge-text">Sem jogadores</span>
                    <span v-else-if="(team.players?.length || 0) >= 5" class="badge-text">✓ Completo</span>
                    <span v-else class="badge-text">Incompleto</span>
                  </div>
                  <span class="expand-icon" :class="{ 'expanded': expandedTeamId === team.id }">
                    ▼
                  </span>
                </div>
              </div>

              <!-- Expanded Details (Accordion Content) -->
              <transition name="expand">
                <div v-if="expandedTeamId === team.id" class="team-expanded-content">
                  <!-- Players Section -->
                  <div class="expanded-section">
                    <div class="section-header">
                      <span class="section-icon">👥</span>
                      <h4 class="section-title-expanded">Jogadores ({{ team.players?.length || 0 }})</h4>
                    </div>
                    <div class="section-content">
                      <div v-if="team.players && team.players.length > 0" class="players-grid-expanded">
                        <div
                          v-for="player in team.players"
                          :key="player.id"
                          class="player-card-expanded"
                        >
                          <div class="player-avatar-expanded">
                            <span class="avatar-initial-expanded">{{ getPlayerInitial(player.name) }}</span>
                          </div>
                          <div class="player-info-expanded">
                            <span class="player-name-expanded">{{ player.name }}</span>
                          </div>
                          <button
                            @click.stop="handleDeletePlayer(player.id)"
                            class="delete-btn-expanded"
                            :disabled="loading"
                            title="Deletar jogador"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div v-else class="no-players-expanded">
                        <div class="empty-players-icon">👤</div>
                        <p class="empty-players-text">Nenhum jogador cadastrado</p>
                        <p class="empty-players-hint">Use o formulário acima para adicionar</p>
                      </div>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </main>

    <AdminFooter />
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
import api from '@/services/api';
import { routes } from '@/utils/routes';

const router = useRouter();
const userStore = useUserStore();
const gameStore = useGameStore();

const loading = ref(false);
const error = ref('');
const success = ref('');
const teams = ref<any[]>([]);
const players = ref<any[]>([]);
const expandedTeamId = ref<string | null>(null);
const isMultipleMode = ref(false);

const form = ref({
  teamId: '',
  name: '',
  names: '',
});

const totalPlayers = computed(() => {
  return teams.value.reduce((sum, team) => sum + (team.players?.length || 0), 0);
});

// Funções para design premium
const getTeamInitial = (name: string) => {
  return name.charAt(0).toUpperCase();
};

const getPlayerInitial = (name: string) => {
  const parts = name.split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const toggleMode = () => {
  isMultipleMode.value = !isMultipleMode.value;
  form.value.name = '';
  form.value.names = '';
  error.value = '';
  success.value = '';
};

const parsedNames = computed(() => {
  if (!form.value.names || !form.value.names.trim()) {
    return [];
  }
  
  // Separar por quebra de linha ou vírgula
  const names = form.value.names
    .split(/[\n,;]/)
    .map(name => name.trim())
    .filter(name => name.length > 0);
  
  return names;
});


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
    teams.value = gameStore.teams;

    // Carregar players de cada time
    for (const team of teams.value) {
      const response = await api.get(`${routes.admin.players.list()}?teamId=${team.id}`);
      team.players = response.data.players;
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Erro ao carregar dados';
  } finally {
    loading.value = false;
  }
};

const handleAddPlayer = async () => {
  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    await api.post(routes.admin.players.create(), {
      teamId: form.value.teamId,
      name: form.value.name,
    });
    success.value = 'Jogador adicionado com sucesso!';
    form.value = { teamId: '', name: '', names: '' };
    await loadData();
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Erro ao adicionar jogador';
  } finally {
    loading.value = false;
  }
};

const handleAddMultiplePlayers = async () => {
  if (parsedNames.value.length === 0) {
    error.value = 'Digite pelo menos um nome de jogador';
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Adicionar jogadores sequencialmente
    for (const name of parsedNames.value) {
      try {
        await api.post(routes.admin.players.create(), {
          teamId: form.value.teamId,
          name: name,
        });
        successCount++;
      } catch (err: any) {
        errorCount++;
        const errorMsg = err.response?.data?.error || 'Erro desconhecido';
        errors.push(`${name}: ${errorMsg}`);
      }
    }

    if (successCount > 0) {
      success.value = `${successCount} jogador${successCount !== 1 ? 'es' : ''} adicionado${successCount !== 1 ? 's' : ''} com sucesso!`;
      if (errorCount > 0) {
        success.value += ` ${errorCount} falha${errorCount !== 1 ? 'ram' : 'ram'}.`;
      }
    }

    if (errorCount > 0 && successCount === 0) {
      error.value = `Erro ao adicionar jogadores: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? '...' : ''}`;
    } else if (errorCount > 0) {
      error.value = `Alguns jogadores falharam: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? '...' : ''}`;
    }

    form.value = { teamId: '', name: '', names: '' };
    await loadData();
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Erro ao adicionar jogadores';
  } finally {
    loading.value = false;
  }
};

const handleDeletePlayer = async (playerId: string) => {
  if (!confirm('Tem certeza que deseja deletar este jogador?')) return;

  try {
    await api.delete(`/admin/players/${playerId}`);
    success.value = 'Jogador deletado com sucesso!';
    await loadData();
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Erro ao deletar jogador';
  }
};

const toggleTeam = (teamId: string) => {
  if (expandedTeamId.value === teamId) {
    expandedTeamId.value = null;
  } else {
    expandedTeamId.value = teamId;
  }
};

</script>

<style scoped>
.manage-players {
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

/* Form Premium */
.form-section-premium {
  background: rgba(30, 37, 66, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2.5rem;
  margin-bottom: 3rem;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.form-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  gap: 1rem;
}

.mode-toggle-btn {
  padding: 0.6rem 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.mode-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.mode-toggle-btn.active {
  background: rgba(0, 255, 136, 0.15);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.form-header-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 204, 102, 0.2));
  border: 1px solid rgba(0, 255, 136, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
  flex-shrink: 0;
}

.form-header h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.form-header p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.player-form-premium {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row-premium {
  display: grid;
  grid-template-columns: 2fr 2fr 1.5fr;
  gap: 1.5rem;
  align-items: end;
}

.form-group-multiple {
  grid-column: span 2;
}

.form-group-premium {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-group-premium label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label-icon {
  font-size: 1rem;
}

.form-group-premium input,
.form-group-premium select {
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.form-group-premium input:focus,
.form-group-premium select:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
}

.form-group-premium input:disabled,
.form-group-premium select:disabled,
.form-group-premium textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.names-textarea {
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s;
  line-height: 1.6;
}

.names-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
}

.label-hint {
  font-size: 0.75rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
  margin-left: 0.5rem;
}

.names-preview {
  margin-top: 0.75rem;
  padding: 1rem;
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 10px;
}

.preview-label {
  display: block;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.preview-tag {
  padding: 0.4rem 0.8rem;
  background: rgba(0, 255, 136, 0.15);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  font-size: 0.8rem;
  color: var(--accent-primary);
  font-weight: 500;
}

.preview-tag-more {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
}

.submit-btn-premium {
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 12px;
  background: var(--gradient-button);
  color: var(--gradient-button-text);
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 16px rgba(0, 255, 136, 0.3);
  white-space: nowrap;
}

.submit-btn-premium:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 255, 136, 0.25);
}

.submit-btn-premium:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1.2rem;
  font-weight: 800;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(5, 8, 15, 0.3);
  border-top-color: var(--gradient-button-text);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.message-error,
.message-success {
  padding: 1rem 1.25rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.message-error {
  background: rgba(255, 71, 87, 0.15);
  border: 1px solid rgba(255, 71, 87, 0.3);
  color: var(--accent-error);
}

.message-success {
  background: rgba(0, 255, 136, 0.15);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
}

.message-icon {
  font-size: 1.1rem;
}

/* Players Section Premium */
.players-section-premium {
  margin-top: 2rem;
}

.section-header-premium {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.section-header-premium h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 700;
}

.section-header-premium p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.total-stats {
  display: flex;
  gap: 1rem;
}

.stat-badge {
  padding: 1rem 1.5rem;
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 120px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: var(--accent-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.loading-premium {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(0, 255, 136, 0.2);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-premium p {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.empty-state-premium {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(30, 37, 66, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state-premium h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.empty-state-premium p {
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 1.5rem 0;
}

.empty-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--gradient-button);
  color: var(--gradient-button-text);
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s;
}

.empty-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 255, 136, 0.3);
}

/* Teams List */
.teams-list-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.teams-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.team-item {
  padding: 0;
  border-left: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.03);
  margin-bottom: 0.75rem;
}

.team-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-left-color: var(--accent-primary);
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.15);
}

.team-item.is-expanded {
  background: rgba(0, 0, 0, 0.2);
  border-left-color: var(--accent-primary);
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3), 0 4px 12px rgba(0, 255, 136, 0.15);
}

.team-item-content {
  display: grid;
  grid-template-columns: 2fr 1.5fr auto;
  gap: 1.5rem;
  align-items: center;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.team-item-content:hover {
  background: rgba(255, 255, 255, 0.02);
}

.team-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.team-logo-compact {
  flex-shrink: 0;
}

.team-logo-wrapper-compact {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-primary);
}

.team-logo-img-compact {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.team-logo-placeholder-compact {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-initial-compact {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-primary);
}

.team-details-compact {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.team-name-compact {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.team-meta {
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

.team-stats-compact {
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

.team-actions-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.players-badge-compact {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.players-badge-compact.badge-empty {
  background: rgba(255, 71, 87, 0.15);
  color: var(--accent-secondary);
  border: 1px solid rgba(255, 71, 87, 0.3);
}

.players-badge-compact:not(.badge-empty) {
  background: rgba(0, 255, 136, 0.15);
  color: var(--accent-primary);
  border: 1px solid rgba(0, 255, 136, 0.3);
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

.team-item-content:hover .expand-icon {
  color: var(--accent-primary);
}

/* Expanded Content */
.team-expanded-content {
  padding: 0 1.5rem 1.5rem 1.5rem;
  background: rgba(0, 0, 0, 0.15);
  border-top: 1px solid rgba(0, 255, 136, 0.2);
  margin-top: 0.5rem;
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

.players-grid-expanded {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.player-card-expanded {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.2s;
}

.player-card-expanded:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.player-avatar-expanded {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-initial-expanded {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--accent-primary);
}

.player-info-expanded {
  flex: 1;
}

.player-name-expanded {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
}

.delete-btn-expanded {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.3);
  color: var(--accent-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.2s;
  flex-shrink: 0;
}

.delete-btn-expanded:hover:not(:disabled) {
  background: rgba(255, 71, 87, 0.2);
  transform: translateY(-2px);
}

.delete-btn-expanded:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-players-expanded {
  text-align: center;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-players-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.empty-players-text {
  color: var(--text-secondary);
  margin: 0;
}

.empty-players-hint {
  color: var(--text-tertiary);
  margin: 0;
  font-size: 0.85rem;
}

/* Animação de expansão */
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

.empty-players-icon {
  font-size: 3rem;
  opacity: 0.4;
}

.empty-players-text {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-weight: 500;
}

.empty-players-hint {
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .form-header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-row-premium {
    grid-template-columns: 1fr;
  }

  .form-group-multiple {
    grid-column: span 1;
  }

  .team-item-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .team-actions-section {
    width: 100%;
    justify-content: space-between;
  }

  .team-expanded-content {
    padding: 0 1rem 1rem 1rem;
  }

  .section-content {
    padding-left: 1rem;
  }

  .players-grid-expanded {
    grid-template-columns: 1fr;
  }
}
</style>

