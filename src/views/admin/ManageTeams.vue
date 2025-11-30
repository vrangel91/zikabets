<template>
  <div class="manage-teams">
    <AdminHeader />

    <main class="admin-main">
      <div class="page-header">
        <h2>Gerenciar Times</h2>
        <p>Adicione e gerencie os times que participarão dos jogos</p>
      </div>

      <!-- Form para adicionar time -->
      <div class="form-section glass-panel">
        <h3>Adicionar Time</h3>
        <form @submit.prevent="handleAddTeam" class="team-form">
          <div class="form-row">
            <div class="form-group">
              <label>Nome do Time</label>
              <input type="text" v-model="form.name" required placeholder="Ex: Team Liquid" :disabled="loading" />
            </div>
            <div class="form-group">
              <label>Logo (URL opcional)</label>
              <input type="url" v-model="form.logo" placeholder="https://exemplo.com/logo.png" :disabled="loading" />
            </div>
            <div class="form-group">
              <button type="submit" class="submit-btn" :disabled="loading">
                {{ loading ? 'Adicionando...' : 'Adicionar Time' }}
              </button>
            </div>
          </div>
          <p v-if="error" class="error-message">{{ error }}</p>
          <p v-if="success" class="success-message">{{ success }}</p>
        </form>
      </div>

      <!-- Lista de times -->
      <div class="teams-section">
        <h3>Times Cadastrados</h3>
        <div v-if="loading && teams.length === 0" class="loading glass-panel">
          <p>Carregando times...</p>
        </div>
        <div v-else-if="teams.length === 0" class="empty-state glass-panel">
          <p>Nenhum time cadastrado ainda.</p>
          <p>Adicione o primeiro time usando o formulário acima.</p>
        </div>
        <div v-else class="teams-list-container">
          <div class="teams-list">
            <div v-for="team in teams" :key="team.id" class="team-item glass-panel"
              :class="{ 'is-expanded': expandedTeamId === team.id }">
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
                        {{ team.players?.length || 0 }} / 5 jogadores
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Center: Players Count -->
                <div class="team-stats-compact">
                  <div class="stat-group">
                    <span class="stat-label-small">Jogadores</span>
                    <span class="stat-value-small" :class="{ 'stat-full': (team.players?.length || 0) >= 5 }">
                      {{ team.players?.length || 0 }} / 5
                    </span>
                  </div>
                </div>

                <!-- Right: Actions & Status -->
                <div class="team-actions-section">
                  <div class="players-badge-compact" :class="{ 'badge-full': (team.players?.length || 0) >= 5 }">
                    <span v-if="(team.players?.length || 0) >= 5" class="badge-text">✓ Completo</span>
                    <span v-else class="badge-text">Incompleto</span>
                  </div>
                  <div class="team-actions-compact">
                    <button @click.stop="handleEditTeam(team)" class="action-btn edit-btn" :disabled="loading"
                      title="Editar time">
                      ✏️
                    </button>
                    <button @click.stop="handleDeleteTeam(team.id)" class="action-btn delete-btn" :disabled="loading"
                      title="Deletar time">
                      🗑️
                    </button>
                  </div>
                  <span class="expand-icon" :class="{ 'expanded': expandedTeamId === team.id }">
                    ▼
                  </span>
                </div>
              </div>

              <!-- Expanded Details (Accordion Content) -->
              <transition name="expand">
                <div v-if="expandedTeamId === team.id" class="team-expanded-content">
                  <!-- Team Info Section -->
                  <div class="expanded-section">
                    <div class="section-header">
                      <span class="section-icon">🏆</span>
                      <h4 class="section-title-expanded">Informações do Time</h4>
                    </div>
                    <div class="section-content">
                      <div class="team-info-expanded">
                        <div class="team-logo-expanded">
                          <div v-if="team.logo" class="team-logo-wrapper-expanded">
                            <img :src="team.logo" :alt="team.name" class="team-logo-img-expanded" />
                          </div>
                          <div v-else class="team-logo-placeholder-expanded">
                            <span class="logo-initial-expanded">{{ getTeamInitial(team.name) }}</span>
                          </div>
                        </div>
                        <div class="team-details-expanded">
                          <h3 class="team-name-expanded">{{ team.name }}</h3>
                          <div class="team-stats-expanded">
                            <div class="stat-item-expanded">
                              <span class="stat-label">Total de Jogadores</span>
                              <span class="stat-value">{{ team.players?.length || 0 }} / 5</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Players Section -->
                  <div class="expanded-section">
                    <div class="section-header">
                      <span class="section-icon">👥</span>
                      <h4 class="section-title-expanded">Jogadores ({{ team.players?.length || 0 }})</h4>
                    </div>
                    <div class="section-content">
                      <div v-if="team.players && team.players.length > 0" class="players-grid-expanded">
                        <div v-for="player in team.players" :key="player.id" class="player-card-expanded">
                          <div class="player-avatar-expanded">
                            <span class="avatar-initial-expanded">{{ getPlayerInitial(player.name) }}</span>
                          </div>
                          <span class="player-name-expanded">{{ player.name }}</span>
                        </div>
                      </div>
                      <div v-else class="no-players-expanded">
                        <div class="empty-players-icon">👤</div>
                        <p class="empty-players-text">Nenhum jogador cadastrado</p>
                        <RouterLink :to="`/panel/players?team=${team.id}`" class="add-players-btn-expanded">
                          <span>+</span>
                          Adicionar Jogadores
                        </RouterLink>
                      </div>
                    </div>
                  </div>

                  <!-- Actions Section -->
                  <div class="expanded-section">
                    <div class="section-content">
                      <div class="team-actions-expanded">
                        <RouterLink :to="`/panel/players?team=${team.id}`" class="action-link-expanded"
                          v-if="(team.players?.length || 0) < 5">
                          <span>+</span>
                          Adicionar Jogador
                        </RouterLink>
                        <button @click.stop="handleEditTeam(team)" class="action-btn-expanded edit" :disabled="loading">
                          ✏️ Editar Time
                        </button>
                        <button @click.stop="handleDeleteTeam(team.id)" class="action-btn-expanded delete"
                          :disabled="loading">
                          🗑️ Deletar Time
                        </button>
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

    <!-- Modal de Edição -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Editar Time</h3>
          <button class="modal-close" @click="closeEditModal">×</button>
        </div>

        <form @submit.prevent="handleUpdateTeam" class="edit-form">
          <div class="form-group">
            <label>Nome do Time</label>
            <input type="text" v-model="editForm.name" required placeholder="Ex: Team Liquid" :disabled="loading" />
          </div>

          <div class="form-group">
            <label>Logo (URL opcional)</label>
            <input type="url" v-model="editForm.logo" placeholder="https://exemplo.com/logo.png" :disabled="loading" />
          </div>

          <div class="modal-footer">
            <button type="button" class="modal-btn cancel-btn" @click="closeEditModal" :disabled="loading">
              Cancelar
            </button>
            <button type="submit" class="modal-btn confirm-btn" :disabled="loading">
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
const showEditModal = ref(false);
const editingTeamId = ref<string | null>(null);
const expandedTeamId = ref<string | null>(null);

const form = ref({
  name: '',
  logo: '',
});

const editForm = ref({
  name: '',
  logo: '',
});

const teams = computed(() => gameStore.teams);

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


onMounted(async () => {
  if (!userStore.isAuthenticated || userStore.user?.role !== 'ADMIN') {
    router.push('/panel/login');
    return;
  }

  await loadTeams();
});

const loadTeams = async () => {
  loading.value = true;
  try {
    await gameStore.fetchTeams();
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Erro ao carregar times';
  } finally {
    loading.value = false;
  }
};

const handleAddTeam = async () => {
  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    await gameStore.createTeam({
      name: form.value.name,
      logo: form.value.logo || undefined,
    });
    success.value = 'Time adicionado com sucesso!';
    form.value = { name: '', logo: '' };
    setTimeout(() => {
      success.value = '';
    }, 3000);
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Erro ao adicionar time';
  } finally {
    loading.value = false;
  }
};

const handleEditTeam = (team: any) => {
  editingTeamId.value = team.id;
  editForm.value = {
    name: team.name,
    logo: team.logo || '',
  };
  showEditModal.value = true;
  error.value = '';
  success.value = '';
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingTeamId.value = null;
  editForm.value = { name: '', logo: '' };
  error.value = '';
  success.value = '';
};

const handleUpdateTeam = async () => {
  if (!editingTeamId.value) return;

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    await gameStore.updateTeam(editingTeamId.value, {
      name: editForm.value.name,
      logo: editForm.value.logo || undefined,
    });

    success.value = 'Time atualizado com sucesso!';
    setTimeout(() => {
      closeEditModal();
      success.value = '';
    }, 2000);
  } catch (err: any) {
    const errorMessage = err.response?.data?.error || err.message || 'Erro ao atualizar time';
    error.value = errorMessage;
  } finally {
    loading.value = false;
  }
};

const handleDeleteTeam = async (teamId: string) => {
  const team = teams.value.find((t: any) => t.id === teamId);
  if (!team) return;

  if (
    !confirm(
      `Tem certeza que deseja deletar o time "${team.name}"?\n\nEsta ação não pode ser desfeita e todos os jogadores deste time também serão removidos.`,
    )
  ) {
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    await gameStore.deleteTeam(teamId);
    success.value = 'Time deletado com sucesso!';
    setTimeout(() => {
      success.value = '';
    }, 5000);
  } catch (err: any) {
    const errorMessage = err.response?.data?.error || err.message || 'Erro ao deletar time';
    error.value = errorMessage;

    // Manter a mensagem de erro visível por mais tempo se for um erro importante
    setTimeout(() => {
      error.value = '';
    }, 8000);
  } finally {
    loading.value = false;
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
.manage-teams {
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

.team-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr;
  gap: 1rem;
  align-items: end;
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

.form-group input {
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
  font-size: 0.9rem;
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

.submit-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  background: var(--gradient-button);
  color: var(--gradient-button-text);
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  white-space: nowrap;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 255, 136, 0.3);
}

.submit-btn:disabled {
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

.teams-section h3 {
  margin: 0 0 1.5rem 0;
}

.loading,
.empty-state {
  padding: 3rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
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
  border-left: 3px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: rgba(30, 37, 66, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 0.75rem;
}

.team-item:hover {
  background: rgba(30, 37, 66, 0.5);
  border-left-color: var(--accent-primary);
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.15);
}

.team-item.is-expanded {
  background: rgba(30, 37, 66, 0.6);
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

.stat-value-small.stat-full {
  color: var(--accent-primary);
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

.players-badge-compact:not(.badge-full) {
  background: rgba(255, 71, 87, 0.15);
  color: var(--accent-secondary);
  border: 1px solid rgba(255, 71, 87, 0.3);
}

.players-badge-compact.badge-full {
  background: rgba(0, 255, 136, 0.15);
  color: var(--accent-primary);
  border: 1px solid rgba(0, 255, 136, 0.3);
}

.team-actions-compact {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-primary);
}

.action-btn.edit-btn {
  color: var(--accent-primary);
}

.action-btn.edit-btn:hover:not(:disabled) {
  background: rgba(0, 255, 136, 0.15);
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

.action-btn.delete-btn {
  color: var(--accent-secondary);
}

.action-btn.delete-btn:hover:not(:disabled) {
  background: rgba(255, 71, 87, 0.15);
  border-color: var(--accent-secondary);
  transform: translateY(-2px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.team-info-expanded {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.team-logo-expanded {
  flex-shrink: 0;
}

.team-logo-wrapper-expanded {
  width: 120px;
  height: 120px;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-primary);
}

.team-logo-img-expanded {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.team-logo-placeholder-expanded {
  width: 120px;
  height: 120px;
  border-radius: 16px;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-initial-expanded {
  font-size: 3rem;
  font-weight: 700;
  color: var(--accent-primary);
}

.team-details-expanded {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.team-name-expanded {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.team-stats-expanded {
  display: flex;
  gap: 2rem;
}

.stat-item-expanded {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--accent-primary);
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

.player-name-expanded {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
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

.add-players-btn-expanded {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--gradient-button);
  color: var(--gradient-button-text);
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.2);
}

.add-players-btn-expanded:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 255, 136, 0.3);
}

.team-actions-expanded {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-link-expanded,
.action-btn-expanded {
  flex: 1;
  min-width: 150px;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.action-link-expanded {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: var(--accent-primary);
}

.action-link-expanded:hover {
  background: rgba(0, 255, 136, 0.2);
  transform: translateY(-2px);
}

.action-btn-expanded.edit {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: var(--accent-primary);
}

.action-btn-expanded.edit:hover:not(:disabled) {
  background: rgba(0, 255, 136, 0.2);
  transform: translateY(-2px);
}

.action-btn-expanded.delete {
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.3);
  color: var(--accent-secondary);
}

.action-btn-expanded.delete:hover:not(:disabled) {
  background: rgba(255, 71, 87, 0.2);
  transform: translateY(-2px);
}

.action-btn-expanded:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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


@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
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

  .team-info-expanded {
    flex-direction: column;
    gap: 1.5rem;
  }

  .players-grid-expanded {
    grid-template-columns: 1fr;
  }

  .team-actions-expanded {
    flex-direction: column;
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
  background: var(--bg-glass-strong);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  max-width: 500px;
  width: 90%;
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  color: var(--accent-secondary);
  transform: rotate(90deg);
}

.edit-form {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.edit-form .form-group input {
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.2s;
}

.edit-form .form-group input:focus {
  outline: none;
  border-color: var(--input-border-focus);
  background: var(--input-bg-hover);
  box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
}

.edit-form .form-group input:disabled {
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
  background: var(--gradient-primary);
  color: var(--gradient-button-text);
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 255, 136, 0.4);
}

.edit-form .error-message {
  color: #ff7b9a;
  font-size: 0.85rem;
  margin: 0;
}

.edit-form .success-message {
  color: var(--accent-primary);
  font-size: 0.85rem;
  margin: 0;
}
</style>
