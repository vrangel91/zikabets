<template>
  <div class="championship-page">
    <!-- Animated Background -->
    <AnimatedBackground :show-image="true" />

    <AppHeader />

    <main class="championship-main">
      <div class="championship-container">
        <!-- Header -->
        <div class="championship-header">
          <div class="header-content">
            <h1 class="championship-title">
              <span class="title-icon">🏆</span>
              CAMPEONATO ZIKA
            </h1>
            <p v-if="championship?.description" class="championship-description">
              {{ championship.description }}
            </p>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Carregando campeonato...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
          <div class="error-icon">⚠️</div>
          <p>{{ error }}</p>
        </div>

        <!-- Championship Content -->
        <div v-else-if="championship" class="championship-content">
          <!-- Tabs -->
          <div class="tabs-container">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="['tab-button', { active: activeTab === tab.id }]"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Groups Tab -->
          <div v-if="activeTab === 'groups'" class="tab-content">
            <div v-if="championship.groups && championship.groups.length > 0" class="groups-grid">
              <div
                v-for="group in championship.groups"
                :key="group.id"
                class="group-card glass-panel"
              >
                <div class="group-header">
                  <h3 class="group-name">Grupo {{ group.name }}</h3>
                </div>
                <div class="group-teams">
                  <div
                    v-for="(team, index) in group.teams"
                    :key="team.id"
                    class="team-row"
                    :class="{ advanced: team.advanced }"
                  >
                    <div class="team-position">{{ index + 1 }}º</div>
                    <div
                      class="team-name"
                      @mouseenter="showTooltip($event, team)"
                      @mouseleave="hideTooltip"
                    >
                      {{ team.name }}
                      <span v-if="team.advanced" class="advanced-badge">✓</span>
                    </div>
                    <div class="team-stats">
                      <div class="stat-item">
                        <span class="stat-label">P</span>
                        <span class="stat-value">{{ team.points }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">V</span>
                        <span class="stat-value">{{ team.wins }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">D</span>
                        <span class="stat-value">{{ team.losses }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>Nenhum grupo cadastrado ainda.</p>
            </div>

            <!-- Próxima Fase -->
            <div v-if="hasAdvancedTeams()" class="next-phase-section glass-panel">
              <div class="next-phase-header">
                <h3 class="next-phase-title">Próxima Fase</h3>
                <span class="next-phase-type">{{ getNextPhaseInfo().label }}</span>
              </div>
              <div class="next-phase-content">
                <p class="next-phase-description">
                  {{ getNextPhaseInfo().description }}
                </p>
                <div class="advanced-teams-list">
                  <h4 class="advanced-teams-title">Times Classificados:</h4>
                  <div class="advanced-teams-grid">
                    <div
                      v-for="team in getAdvancedTeams()"
                      :key="team.id"
                      class="advanced-team-card"
                      @mouseenter="showTooltip($event, team)"
                      @mouseleave="hideTooltip"
                    >
                      <div class="advanced-team-name">{{ team.name }}</div>
                      <div class="advanced-team-group">Grupo {{ getTeamGroup(team.id) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Matches Tab -->
          <div v-if="activeTab === 'matches'" class="tab-content">
            <div v-if="championship.matches && championship.matches.length > 0" class="matches-container">
              <!-- Group by phase -->
              <div
                v-for="phase in phases"
                :key="phase"
                v-show="getMatchesByPhase(phase).length > 0"
                class="phase-section"
              >
                <h3 class="phase-title">{{ getPhaseLabel(phase) }}</h3>
                <div class="matches-grid">
                  <div
                    v-for="match in getMatchesByPhase(phase)"
                    :key="match.id"
                    class="match-card glass-panel"
                    :class="match.status.toLowerCase()"
                  >
                    <div class="match-header">
                      <span class="match-status-badge" :class="match.status.toLowerCase()">
                        {{ getStatusLabel(match.status) }}
                      </span>
                      <span v-if="match.matchDate" class="match-date">
                        {{ formatDate(match.matchDate) }}
                      </span>
                    </div>
                    <div class="match-teams">
                      <div class="match-team">
                        <div class="team-name" @mouseenter="showTooltip($event, match.teamA)" @mouseleave="hideTooltip">
                          {{ match.teamA?.name || 'TBD' }}
                        </div>
                        <div class="team-score">{{ match.scoreA ?? '-' }}</div>
                      </div>
                      <div class="match-vs">VS</div>
                      <div class="match-team">
                        <div class="team-score">{{ match.scoreB ?? '-' }}</div>
                        <div class="team-name" @mouseenter="showTooltip($event, match.teamB)" @mouseleave="hideTooltip">
                          {{ match.teamB?.name || 'TBD' }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>Nenhuma partida cadastrada ainda.</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Tooltip -->
    <div
      v-if="tooltip.visible"
      class="tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <div class="tooltip-header">
        <strong>{{ tooltip.teamName }}</strong>
      </div>
      <div class="tooltip-content">
        <div v-if="tooltip.players && tooltip.players.length > 0" class="players-list">
          <div
            v-for="player in tooltip.players"
            :key="player.id"
            class="player-item"
          >
            {{ player.name }}
          </div>
        </div>
        <div v-else class="no-players">
          Nenhum jogador cadastrado
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Vue module resolution
import { ref, onMounted, computed } from 'vue';
// @ts-ignore - Vue component with script setup
import AppHeader from '@/components/AppHeader.vue';
// @ts-ignore - Vue component with script setup
import AnimatedBackground from '@/components/AnimatedBackground.vue';
import api from '@/services/api';

interface Player {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
  logo?: string;
  points: number;
  wins: number;
  losses: number;
  advanced: boolean;
  players: Player[];
}

interface Group {
  id: string;
  name: string;
  teams: Team[];
}

interface Match {
  id: string;
  phase: string;
  teamA?: Team;
  teamB?: Team;
  scoreA?: number;
  scoreB?: number;
  status: string;
  matchDate?: string;
}

interface Championship {
  id: string;
  name: string;
  description?: string;
  status: string;
  groups: Group[];
  matches: Match[];
  config?: {
    hasRoundOf16: boolean;
    hasQuarterFinals: boolean;
    hasSemiFinals: boolean;
    hasFinal: boolean;
    startPhase: string;
  };
}

const championship = ref<Championship | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const activeTab = ref('groups');

const tabs = [
  { id: 'groups', label: 'Grupos' },
  { id: 'matches', label: 'Partidas' },
];

const phases = ['GROUPS', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL'];

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  teamName: '',
  players: [] as Player[],
});

const getMatchesByPhase = (phase: string) => {
  if (!championship.value?.matches) return [];
  return championship.value.matches.filter(m => m.phase === phase);
};

const getPhaseLabel = (phase: string) => {
  const labels: Record<string, string> = {
    GROUPS: 'Fase de Grupos',
    ROUND_OF_16: 'Oitavas de Final',
    QUARTER_FINALS: 'Quartas de Final',
    SEMI_FINALS: 'Semifinal',
    FINAL: 'Final',
  };
  return labels[phase] || phase;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    SCHEDULED: 'Agendado',
    LIVE: 'Ao Vivo',
    FINISHED: 'Finalizado',
  };
  return labels[status] || status;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const showTooltip = (event: MouseEvent, team: Team | undefined) => {
  if (!team) return;
  tooltip.value = {
    visible: true,
    x: event.clientX + 10,
    y: event.clientY + 10,
    teamName: team.name,
    players: team.players || [],
  };
};

const hideTooltip = () => {
  tooltip.value.visible = false;
};

const hasAdvancedTeams = () => {
  if (!championship.value?.groups) return false;
  return championship.value.groups.some(group =>
    group.teams.some(team => team.advanced)
  );
};

const getAdvancedTeams = () => {
  if (!championship.value?.groups) return [];
  const advanced: Team[] = [];
  championship.value.groups.forEach(group => {
    group.teams.forEach(team => {
      if (team.advanced) {
        advanced.push(team);
      }
    });
  });
  return advanced;
};

const getTeamGroup = (teamId: string) => {
  if (!championship.value?.groups) return '';
  for (const group of championship.value.groups) {
    const team = group.teams.find(t => t.id === teamId);
    if (team) return group.name;
  }
  return '';
};

const getNextPhaseInfo = () => {
  if (!championship.value?.config) {
    return { label: 'Eliminatória', description: 'Fase eliminatória' };
  }

  const config = championship.value.config;
  const startPhase = championship.value.startPhase || 'GROUPS';

  // Determinar qual é a próxima fase após os grupos
  if (startPhase === 'GROUPS') {
    // Se começou nos grupos, a próxima fase depende da configuração
    if (config.hasRoundOf16) {
      return {
        label: 'Oitavas de Final',
        description: 'Fase eliminatória - Oitavas de Final. Os times classificados disputarão em chave única, eliminatória.',
        type: 'eliminatória'
      };
    } else if (config.hasQuarterFinals) {
      return {
        label: 'Quartas de Final',
        description: 'Fase eliminatória - Quartas de Final. Os times classificados disputarão em chave única, eliminatória.',
        type: 'eliminatória'
      };
    } else if (config.hasSemiFinals) {
      return {
        label: 'Semifinal',
        description: 'Fase eliminatória - Semifinal. Os times classificados disputarão em chave única, eliminatória.',
        type: 'eliminatória'
      };
    } else if (config.hasFinal) {
      return {
        label: 'Final',
        description: 'Fase eliminatória - Final. Os times classificados disputarão em chave única, eliminatória.',
        type: 'eliminatória'
      };
    }
  }

  // Se já está em uma fase eliminatória, determinar a próxima
  if (startPhase === 'ROUND_OF_16') {
    if (config.hasQuarterFinals) {
      return {
        label: 'Quartas de Final',
        description: 'Fase eliminatória - Quartas de Final. Os times classificados disputarão em chave única, eliminatória.',
        type: 'eliminatória'
      };
    }
  } else if (startPhase === 'QUARTER_FINALS') {
    if (config.hasSemiFinals) {
      return {
        label: 'Semifinal',
        description: 'Fase eliminatória - Semifinal. Os times classificados disputarão em chave única, eliminatória.',
        type: 'eliminatória'
      };
    }
  } else if (startPhase === 'SEMI_FINALS') {
    if (config.hasFinal) {
      return {
        label: 'Final',
        description: 'Fase eliminatória - Final. Os times classificados disputarão em chave única, eliminatória.',
        type: 'eliminatória'
      };
    }
  }

  return {
    label: 'Eliminatória',
    description: 'Fase eliminatória. Os times classificados disputarão em chave única, eliminatória.',
    type: 'eliminatória'
  };
};

const loadChampionship = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await api.get('/championship');
    championship.value = response.data.championship;
  } catch (err: any) {
    console.error('Erro ao carregar campeonato:', err);
    error.value = err.response?.data?.error || 'Erro ao carregar campeonato';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadChampionship();
});
</script>

<style scoped>
.championship-page {
  min-height: 100vh;
  background: var(--gradient-bg), var(--bg-primary);
  color: var(--text-primary);
  position: relative;
  overflow-x: hidden;
}


.championship-main {
  position: relative;
  z-index: 1;
  padding-top: 80px;
  padding-bottom: 3rem;
}

.championship-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.championship-header {
  margin-bottom: 3rem;
  text-align: center;
}

.header-content {
  display: inline-block;
}

.championship-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  background: var(--gradient-button);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.title-icon {
  font-size: 3rem;
  filter: drop-shadow(0 0 10px rgba(31, 163, 122, 0.5));
}

.championship-description {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.tabs-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-button {
  padding: 1rem 2rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
  position: relative;
  top: 1px;
}

.tab-button:hover {
  color: rgba(255, 255, 255, 0.9);
}

.tab-button.active {
  color: var(--accent-primary);
  border-bottom-color: var(--accent-primary);
}

.tab-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.group-card {
  padding: 2rem;
  border-radius: 16px;
  backdrop-filter: blur(20px);
  background: rgba(30, 37, 66, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.group-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.group-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--accent-primary);
}

.group-teams {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.team-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s;
}

.team-row:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(31, 163, 122, 0.3);
  transform: translateX(4px);
}

.team-row.advanced {
  border-color: rgba(31, 163, 122, 0.5);
  background: rgba(31, 163, 122, 0.1);
}

.team-position {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--accent-primary);
  min-width: 40px;
  text-align: center;
}

.team-name {
  flex: 1;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.advanced-badge {
  color: var(--accent-primary);
  font-size: 1.2rem;
}

.team-stats {
  display: flex;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 35px;
}

.stat-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  font-weight: 600;
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.stat-value.positive {
  color: #00ff88;
}

.stat-value.negative {
  color: #ff7b9a;
}

.matches-container {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.phase-section {
  margin-bottom: 2rem;
}

.phase-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  color: var(--accent-primary);
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(31, 163, 122, 0.3);
}

.matches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.match-card {
  padding: 1.5rem;
  border-radius: 16px;
  backdrop-filter: blur(20px);
  background: rgba(30, 37, 66, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.match-card:hover {
  transform: translateY(-4px);
  border-color: rgba(31, 163, 122, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.match-card.live {
  border-color: rgba(255, 123, 154, 0.5);
  background: rgba(255, 123, 154, 0.1);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 123, 154, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(255, 123, 154, 0);
  }
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.match-status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.match-status-badge.scheduled {
  background: rgba(31, 163, 122, 0.15);
  color: var(--accent-primary);
  border: 1px solid rgba(31, 163, 122, 0.3);
}

.match-status-badge.live {
  background: rgba(255, 123, 154, 0.15);
  color: #ff7b9a;
  border: 1px solid rgba(255, 123, 154, 0.3);
}

.match-status-badge.finished {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.match-date {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.match-teams {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.match-team {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.team-name {
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: color 0.3s;
}

.team-name:hover {
  color: var(--accent-primary);
}

.team-score {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-primary);
}

.match-vs {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.5);
}

.tooltip {
  position: fixed;
  z-index: 1000;
  background: rgba(20, 25, 40, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(31, 163, 122, 0.3);
  border-radius: 12px;
  padding: 1rem;
  min-width: 200px;
  max-width: 300px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  pointer-events: none;
  animation: tooltipFadeIn 0.2s ease-out;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tooltip-header {
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--accent-primary);
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.player-item {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-size: 0.9rem;
}

.no-players {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  font-style: italic;
}

.next-phase-section {
  margin-top: 3rem;
  padding: 2rem;
  border-radius: 16px;
  backdrop-filter: blur(20px);
  background: rgba(30, 37, 66, 0.4);
  border: 2px solid rgba(31, 163, 122, 0.3);
  box-shadow: 0 8px 32px rgba(31, 163, 122, 0.2);
}

.next-phase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(31, 163, 122, 0.3);
}

.next-phase-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: var(--accent-primary);
}

.next-phase-type {
  padding: 0.5rem 1rem;
  background: rgba(31, 163, 122, 0.2);
  border: 1px solid rgba(31, 163, 122, 0.4);
  border-radius: 8px;
  color: var(--accent-primary);
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.next-phase-content {
  margin-top: 1.5rem;
}

.next-phase-description {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.advanced-teams-list {
  margin-top: 2rem;
}

.advanced-teams-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 1rem 0;
}

.advanced-teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.advanced-team-card {
  padding: 1rem;
  background: rgba(31, 163, 122, 0.1);
  border: 1px solid rgba(31, 163, 122, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.advanced-team-card:hover {
  background: rgba(31, 163, 122, 0.2);
  border-color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(31, 163, 122, 0.3);
}

.advanced-team-name {
  font-weight: 600;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
}

.advanced-team-group {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 768px) {
  .championship-title {
    font-size: 2.5rem;
  }

  .groups-grid {
    grid-template-columns: 1fr;
  }

  .matches-grid {
    grid-template-columns: 1fr;
  }

  .team-stats {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .advanced-teams-grid {
    grid-template-columns: 1fr;
  }

  .next-phase-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>

