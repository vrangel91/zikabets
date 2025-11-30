<template>
  <div class="manage-championship">
    <AdminHeader />

    <main class="admin-main">
      <div class="page-header">
        <h2>Gerenciar Campeonato Zika</h2>
        <p>Configure grupos, times, jogadores e partidas do campeonato</p>
      </div>

      <!-- Championship Config -->
      <div v-if="championship" class="config-section glass-panel">
        <h3>Configuração do Campeonato</h3>
        <div class="config-form">
          <div class="form-row">
            <div class="form-group">
              <label>
                Nome do Campeonato
                <span class="info-icon" data-tooltip="Nome que será exibido publicamente na página do campeonato">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
              </label>
              <input type="text" v-model="championship.name" @blur="updateChampionship" />
            </div>
            <div class="form-group">
              <label>
                Descrição
                <span class="info-icon" data-tooltip="Descrição opcional sobre o campeonato (não obrigatório)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
              </label>
              <input type="text" v-model="championship.description" @blur="updateChampionship" />
            </div>
            <div class="form-group">
              <label>
                Status
                <span class="info-icon" data-tooltip="Rascunho: apenas admins veem | Ativo: visível publicamente | Finalizado: campeonato encerrado">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
              </label>
              <select v-model="championship.status" @change="updateChampionship">
                <option value="DRAFT">Rascunho</option>
                <option value="ACTIVE">Ativo</option>
                <option value="FINISHED">Finalizado</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>
                Fase Inicial
                <span class="info-icon" data-tooltip="Define a partir de qual fase o campeonato começa. Se escolher 'Grupos', começa pela fase de grupos. Se escolher 'Oitavas', pula direto para as oitavas de final.">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
              </label>
              <select v-model="championship.startPhase" @change="updateChampionship">
                <option value="GROUPS">Grupos</option>
                <option value="ROUND_OF_16">Oitavas de Final</option>
                <option value="QUARTER_FINALS">Quartas de Final</option>
                <option value="SEMI_FINALS">Semifinal</option>
                <option value="FINAL">Final</option>
              </select>
            </div>
            <div class="form-group checkbox-group">
              <label>
                Fases do Campeonato:
                <span class="info-icon" data-tooltip="Marque quais fases o campeonato terá. Apenas as fases marcadas aparecerão na página pública.">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
              </label>
              <div class="checkboxes">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="championship.config.hasRoundOf16" @change="updateChampionship" />
                  <span>Oitavas de Final</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="championship.config.hasQuarterFinals" @change="updateChampionship" />
                  <span>Quartas de Final</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="championship.config.hasSemiFinals" @change="updateChampionship" />
                  <span>Semifinal</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="championship.config.hasFinal" @change="updateChampionship" />
                  <span>Final</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Championship if not exists -->
      <div v-else class="create-section glass-panel">
        <h3>Criar Campeonato</h3>
        <form @submit.prevent="createChampionship" class="create-form">
          <div class="form-row">
            <div class="form-group">
              <label>Nome do Campeonato</label>
              <input type="text" v-model="newChampionship.name" required placeholder="Campeonato Zika 2024" />
            </div>
            <div class="form-group">
              <label>Descrição</label>
              <input type="text" v-model="newChampionship.description" placeholder="Descrição do campeonato" />
            </div>
          </div>
          <button type="submit" class="submit-btn" :disabled="loading">Criar Campeonato</button>
        </form>
      </div>

      <!-- Tabs -->
      <div v-if="championship" class="tabs-container">
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
      <div v-if="activeTab === 'groups' && championship" class="tab-content">
        <div class="section-header">
          <h3>
            Grupos
            <span class="info-icon" data-tooltip="Organize os times em grupos. Cada grupo pode ter vários times. Os times são organizados por pontos e vitórias dentro de cada grupo.">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </span>
          </h3>
          <button @click="showAddGroupModal = true" class="add-btn">+ Adicionar Grupo</button>
        </div>
        <div v-if="championship.groups && championship.groups.length > 0" class="groups-list">
          <div v-for="group in championship.groups" :key="group.id" class="group-card glass-panel">
            <div class="group-header">
              <h4>Grupo {{ group.name }}</h4>
              <button @click="deleteGroup(group.id)" class="delete-btn-small">🗑️</button>
            </div>
            <div class="group-teams">
              <div v-for="team in group.teams" :key="team.id" class="team-item-small">
                <div class="team-info-small">
                  <span class="team-name-small">{{ team.name }}</span>
                  <span class="team-stats-small">
                    P: {{ team.points }} | V: {{ team.wins }} | D: {{ team.losses }}
                    <span class="info-icon-small" data-tooltip="P = Pontos (3 por vitória) | V = Vitórias | D = Derrotas">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                    </span>
                  </span>
                </div>
                <div class="team-actions-small">
                  <button @click="editTeam(team)" class="icon-btn" title="Editar time e adicionar jogadores">✏️</button>
                  <button @click="deleteTeam(team.id)" class="icon-btn" title="Deletar time">🗑️</button>
                </div>
              </div>
              <button @click="showAddTeamModal = group.id" class="add-team-btn">+ Adicionar Time</button>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>Nenhum grupo cadastrado. Adicione o primeiro grupo.</p>
        </div>
      </div>

      <!-- Matches Tab -->
      <div v-if="activeTab === 'matches' && championship" class="tab-content">
        <div class="section-header">
          <h3>
            Partidas
            <span class="info-icon" data-tooltip="Gerencie todas as partidas do campeonato. Ao definir placar e marcar como 'Finalizado', os pontos dos times são calculados automaticamente (3 pontos por vitória).">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </span>
          </h3>
          <button @click="showAddMatchModal = true" class="add-btn">+ Adicionar Partida</button>
        </div>
        <div v-if="championship.matches && championship.matches.length > 0" class="matches-list">
          <div
            v-for="phase in phases"
            :key="phase"
            v-show="getMatchesByPhase(phase).length > 0"
            class="phase-section"
          >
            <h4 class="phase-title">{{ getPhaseLabel(phase) }}</h4>
            <div class="matches-grid">
              <div v-for="match in getMatchesByPhase(phase)" :key="match.id" class="match-card glass-panel">
                <div class="match-header">
                  <span class="match-status" :class="match.status.toLowerCase()">
                    {{ getStatusLabel(match.status) }}
                  </span>
                  <button @click="deleteMatch(match.id)" class="delete-btn-small">🗑️</button>
                </div>
                <div class="match-content">
                  <div class="match-team">
                    <select v-model="match.teamAId" @change="updateMatch(match)" class="team-select">
                      <option :value="null">Selecione...</option>
                      <option v-for="team in getAllTeams()" :key="team.id" :value="team.id">
                        {{ team.name }}
                      </option>
                    </select>
                    <input
                      type="number"
                      v-model.number="match.scoreA"
                      @blur="updateMatch(match)"
                      class="score-input"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div class="match-vs">VS</div>
                  <div class="match-team">
                    <input
                      type="number"
                      v-model.number="match.scoreB"
                      @blur="updateMatch(match)"
                      class="score-input"
                      placeholder="0"
                      min="0"
                    />
                    <select v-model="match.teamBId" @change="updateMatch(match)" class="team-select">
                      <option :value="null">Selecione...</option>
                      <option v-for="team in getAllTeams()" :key="team.id" :value="team.id">
                        {{ team.name }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="match-footer">
                  <div class="match-footer-item">
                    <select v-model="match.status" @change="updateMatch(match)" class="status-select">
                      <option value="SCHEDULED">Agendado</option>
                      <option value="LIVE">Ao Vivo</option>
                      <option value="FINISHED">Finalizado</option>
                    </select>
                    <span class="info-icon-small" data-tooltip="Agendado: partida futura | Ao Vivo: partida em andamento | Finalizado: partida concluída (calcula pontos automaticamente)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                    </span>
                  </div>
                  <div class="match-footer-item">
                    <input
                      type="datetime-local"
                      v-model="match.matchDate"
                      @change="updateMatch(match)"
                      class="date-input"
                    />
                    <span class="info-icon-small" data-tooltip="Data e hora da partida (opcional). Formato: DD/MM/AAAA HH:MM">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>Nenhuma partida cadastrada. Adicione a primeira partida.</p>
        </div>
      </div>

      <!-- Add Group Modal -->
      <div v-if="showAddGroupModal" class="modal-overlay" @click="showAddGroupModal = false">
        <div class="modal-content" @click.stop>
          <h3>Adicionar Grupo</h3>
          <form @submit.prevent="addGroup">
            <div class="form-group">
              <label>
                Nome do Grupo
                <span class="info-icon" data-tooltip="Use letras (A, B, C) ou números (1, 2, 3) para identificar os grupos">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
              </label>
              <input type="text" v-model="newGroup.name" required placeholder="A, B, C..." />
            </div>
            <div class="modal-actions">
              <button type="button" @click="showAddGroupModal = false" class="cancel-btn">Cancelar</button>
              <button type="submit" class="submit-btn" :disabled="loading">Adicionar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Add Team Modal -->
      <div v-if="showAddTeamModal" class="modal-overlay" @click="showAddTeamModal = null">
        <div class="modal-content" @click.stop>
          <h3>Adicionar Time</h3>
          <form @submit.prevent="addTeam">
            <div class="form-group">
              <label>
                Nome do Time
                <span class="info-icon" data-tooltip="Nome completo do time que será exibido publicamente">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
              </label>
              <input type="text" v-model="newTeam.name" required />
            </div>
            <div class="form-group">
              <label>
                Logo (URL opcional)
                <span class="info-icon" data-tooltip="URL da imagem do logo do time (ex: https://exemplo.com/logo.png). Deixe em branco se não tiver logo.">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
              </label>
              <input type="url" v-model="newTeam.logo" />
            </div>
            <div class="modal-actions">
              <button type="button" @click="showAddTeamModal = null" class="cancel-btn">Cancelar</button>
              <button type="submit" class="submit-btn" :disabled="loading">Adicionar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Team Modal -->
      <div v-if="editingTeam" class="modal-overlay" @click="editingTeam = null">
        <div class="modal-content" @click.stop>
          <h3>Editar Time</h3>
          <form @submit.prevent="saveTeam">
            <div class="form-group">
              <label>Nome do Time</label>
              <input type="text" v-model="editingTeam.name" required />
            </div>
            <div class="form-group">
              <label>Logo (URL opcional)</label>
              <input type="url" v-model="editingTeam.logo" />
            </div>
            <div class="form-group">
              <label>
                Pontos
                <span class="info-icon" data-tooltip="Pontos do time (3 pontos por vitória). São calculados automaticamente quando uma partida é finalizada, mas podem ser ajustados manualmente aqui.">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
              </label>
              <input type="number" v-model.number="editingTeam.points" min="0" />
            </div>
            <div class="form-group">
              <label>
                Vitórias
                <span class="info-icon" data-tooltip="Número de vitórias do time. Atualizado automaticamente quando partidas são finalizadas.">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
              </label>
              <input type="number" v-model.number="editingTeam.wins" min="0" />
            </div>
            <div class="form-group">
              <label>
                Derrotas
                <span class="info-icon" data-tooltip="Número de derrotas do time. Atualizado automaticamente quando partidas são finalizadas.">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
              </label>
              <input type="number" v-model.number="editingTeam.losses" min="0" />
            </div>
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="editingTeam.advanced" />
                <span>
                  Avançou para próxima fase
                  <span class="info-icon-small" data-tooltip="Marque esta opção quando o time se classificar para a próxima fase. Times marcados aparecerão na seção 'Próxima Fase' da página pública.">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </span>
                </span>
              </label>
            </div>
            <div class="form-group">
              <label>
                Jogadores
                <span class="info-icon" data-tooltip="Adicione os jogadores do time. Digite o nome e pressione Enter ou clique no botão +. Os jogadores aparecem em um tooltip quando o usuário passa o mouse sobre o nome do time na página pública.">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
              </label>
              <div class="players-list">
                <div v-for="player in editingTeam.players" :key="player.id" class="player-item">
                  <span>{{ player.name }}</span>
                  <button @click="deletePlayer(player.id)" class="icon-btn-small">🗑️</button>
                </div>
                <div class="add-player-form">
                  <input
                    type="text"
                    v-model="newPlayerName"
                    @keyup.enter="addPlayer"
                    placeholder="Nome do jogador"
                    class="player-input"
                  />
                  <button @click="addPlayer" class="add-player-btn">+</button>
                </div>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" @click="editingTeam = null" class="cancel-btn">Cancelar</button>
              <button type="submit" class="submit-btn" :disabled="loading">Salvar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Add Match Modal -->
      <div v-if="showAddMatchModal" class="modal-overlay" @click="showAddMatchModal = false">
        <div class="modal-content" @click.stop>
          <h3>Adicionar Partida</h3>
          <form @submit.prevent="addMatch">
            <div class="form-group">
              <label>
                Fase
                <span class="info-icon" data-tooltip="Selecione em qual fase do campeonato esta partida acontece (Grupos, Oitavas, Quartas, Semifinal ou Final)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
              </label>
              <select v-model="newMatch.phase" required>
                <option value="GROUPS">Grupos</option>
                <option value="ROUND_OF_16">Oitavas de Final</option>
                <option value="QUARTER_FINALS">Quartas de Final</option>
                <option value="SEMI_FINALS">Semifinal</option>
                <option value="FINAL">Final</option>
              </select>
            </div>
            <div class="form-group">
              <label>
                Time A
                <span class="info-icon" data-tooltip="Selecione o primeiro time da partida. Você pode deixar em branco e definir depois.">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
              </label>
              <select v-model="newMatch.teamAId">
                <option :value="null">Selecione...</option>
                <option v-for="team in getAllTeams()" :key="team.id" :value="team.id">
                  {{ team.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>
                Time B
                <span class="info-icon" data-tooltip="Selecione o segundo time da partida. Você pode deixar em branco e definir depois.">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
              </label>
              <select v-model="newMatch.teamBId">
                <option :value="null">Selecione...</option>
                <option v-for="team in getAllTeams()" :key="team.id" :value="team.id">
                  {{ team.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>
                Data e Hora
                <span class="info-icon" data-tooltip="Data e hora da partida (opcional). Formato: DD/MM/AAAA HH:MM. Deixe em branco se não souber ainda.">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
              </label>
              <input type="datetime-local" v-model="newMatch.matchDate" />
            </div>
            <div class="modal-actions">
              <button type="button" @click="showAddMatchModal = false" class="cancel-btn">Cancelar</button>
              <button type="submit" class="submit-btn" :disabled="loading">Adicionar</button>
            </div>
          </form>
        </div>
      </div>
    </main>

    <AdminFooter />
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Vue module resolution
import { ref, onMounted, computed } from 'vue';
// @ts-ignore - Vue Router module resolution
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/useUserStore';
import api from '@/services/api';
// @ts-ignore - Vue component with script setup
import AdminHeader from '@/components/AdminHeader.vue';
// @ts-ignore - Vue component with script setup
import AdminFooter from '@/components/AdminFooter.vue';

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
  teamAId?: string;
  teamBId?: string;
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
  startPhase: string;
  groups: Group[];
  matches: Match[];
  config: {
    hasRoundOf16: boolean;
    hasQuarterFinals: boolean;
    hasSemiFinals: boolean;
    hasFinal: boolean;
    startPhase: string;
  };
}

const router = useRouter();
const userStore = useUserStore();

const championship = ref<Championship | null>(null);
const loading = ref(false);
const activeTab = ref('groups');
const showAddGroupModal = ref(false);
const showAddTeamModal = ref<string | null>(null);
const showAddMatchModal = ref(false);
const editingTeam = ref<Team | null>(null);
const newPlayerName = ref('');

const tabs = [
  { id: 'groups', label: 'Grupos e Times' },
  { id: 'matches', label: 'Partidas' },
];

const phases = ['GROUPS', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL'];

const newChampionship = ref({
  name: 'Campeonato Zika',
  description: '',
  startPhase: 'GROUPS',
  hasRoundOf16: false,
  hasQuarterFinals: false,
  hasSemiFinals: false,
  hasFinal: true,
});

const newGroup = ref({ name: '' });
const newTeam = ref({ name: '', logo: '' });
const newMatch = ref({
  phase: 'GROUPS',
  teamAId: null as string | null,
  teamBId: null as string | null,
  matchDate: '',
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

const getAllTeams = () => {
  if (!championship.value?.groups) return [];
  return championship.value.groups.flatMap(g => g.teams);
};

const loadChampionship = async () => {
  try {
    loading.value = true;
    const response = await api.get('/m/championship');
    championship.value = response.data.championship;
    if (!championship.value.config) {
      championship.value.config = {
        hasRoundOf16: false,
        hasQuarterFinals: false,
        hasSemiFinals: false,
        hasFinal: true,
        startPhase: 'GROUPS',
      };
    }
    
    // Formatar datas das partidas para o formato datetime-local (YYYY-MM-DDTHH:mm)
    if (championship.value.matches) {
      championship.value.matches = championship.value.matches.map((match: Match) => {
        if (match.matchDate) {
          const date = new Date(match.matchDate);
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            match.matchDate = `${year}-${month}-${day}T${hours}:${minutes}`;
          }
        }
        return match;
      });
    }
  } catch (error: any) {
    console.error('Erro ao carregar campeonato:', error);
  } finally {
    loading.value = false;
  }
};

const createChampionship = async () => {
  try {
    loading.value = true;
    await api.post('/m/championship', newChampionship.value);
    await loadChampionship();
  } catch (error: any) {
    console.error('Erro ao criar campeonato:', error);
    alert(error.response?.data?.error || 'Erro ao criar campeonato');
  } finally {
    loading.value = false;
  }
};

const updateChampionship = async () => {
  if (!championship.value) return;
  try {
    const response = await api.put(`/m/championship/${championship.value.id}`, {
      name: championship.value.name,
      description: championship.value.description,
      status: championship.value.status,
      startPhase: championship.value.startPhase,
      hasRoundOf16: championship.value.config.hasRoundOf16,
      hasQuarterFinals: championship.value.config.hasQuarterFinals,
      hasSemiFinals: championship.value.config.hasSemiFinals,
      hasFinal: championship.value.config.hasFinal,
    });
    // Atualizar o estado local com a resposta do servidor
    if (response.data.championship) {
      championship.value = response.data.championship;
      // Garantir que config existe
      if (!championship.value.config) {
        championship.value.config = {
          hasRoundOf16: false,
          hasQuarterFinals: false,
          hasSemiFinals: false,
          hasFinal: true,
          startPhase: 'GROUPS',
        };
      }
    }
  } catch (error: any) {
    console.error('Erro ao atualizar campeonato:', error);
    alert(error.response?.data?.error || 'Erro ao atualizar campeonato');
    // Recarregar dados em caso de erro para garantir consistência
    await loadChampionship();
  }
};

const addGroup = async () => {
  if (!championship.value) return;
  try {
    loading.value = true;
    await api.post(`/m/championship/${championship.value.id}/groups`, newGroup.value);
    newGroup.value.name = '';
    showAddGroupModal.value = false;
    await loadChampionship();
  } catch (error: any) {
    console.error('Erro ao adicionar grupo:', error);
    alert(error.response?.data?.error || 'Erro ao adicionar grupo');
  } finally {
    loading.value = false;
  }
};

const deleteGroup = async (groupId: string) => {
  if (!confirm('Tem certeza que deseja deletar este grupo?')) return;
  try {
    await api.delete(`/m/championship/groups/${groupId}`);
    await loadChampionship();
  } catch (error: any) {
    console.error('Erro ao deletar grupo:', error);
    alert(error.response?.data?.error || 'Erro ao deletar grupo');
  }
};

const addTeam = async () => {
  if (!showAddTeamModal.value) return;
  try {
    loading.value = true;
    await api.post(`/m/championship/groups/${showAddTeamModal.value}/teams`, newTeam.value);
    newTeam.value = { name: '', logo: '' };
    showAddTeamModal.value = null;
    await loadChampionship();
  } catch (error: any) {
    console.error('Erro ao adicionar time:', error);
    alert(error.response?.data?.error || 'Erro ao adicionar time');
  } finally {
    loading.value = false;
  }
};

const editTeam = (team: Team) => {
  editingTeam.value = { ...team };
  newPlayerName.value = '';
};

const saveTeam = async () => {
  if (!editingTeam.value) return;
  try {
    loading.value = true;
    await api.put(`/m/championship/teams/${editingTeam.value.id}`, {
      name: editingTeam.value.name,
      logo: editingTeam.value.logo,
      points: editingTeam.value.points,
      wins: editingTeam.value.wins,
      losses: editingTeam.value.losses,
      advanced: editingTeam.value.advanced,
    });
    editingTeam.value = null;
    await loadChampionship();
  } catch (error: any) {
    console.error('Erro ao salvar time:', error);
    alert(error.response?.data?.error || 'Erro ao salvar time');
  } finally {
    loading.value = false;
  }
};

const deleteTeam = async (teamId: string) => {
  if (!confirm('Tem certeza que deseja deletar este time?')) return;
  try {
    await api.delete(`/m/championship/teams/${teamId}`);
    await loadChampionship();
  } catch (error: any) {
    console.error('Erro ao deletar time:', error);
    alert(error.response?.data?.error || 'Erro ao deletar time');
  }
};

const addPlayer = async () => {
  if (!editingTeam.value || !newPlayerName.value.trim()) return;
  const teamId = editingTeam.value.id; // Salvar o ID antes de qualquer operação
  try {
    await api.post(`/m/championship/teams/${teamId}/players`, {
      name: newPlayerName.value.trim(),
    });
    newPlayerName.value = '';
    await loadChampionship();
    // Reload editing team
    if (teamId) {
      const updatedTeam = getAllTeams().find(t => t.id === teamId);
      if (updatedTeam) {
        editingTeam.value = { ...updatedTeam };
      } else {
        // Se não encontrou o time, pode ter sido deletado ou houve algum problema
        console.warn('Time não encontrado após adicionar jogador');
      }
    }
  } catch (error: any) {
    console.error('Erro ao adicionar jogador:', error);
    alert(error.response?.data?.error || 'Erro ao adicionar jogador');
  }
};

const deletePlayer = async (playerId: string) => {
  if (!confirm('Tem certeza que deseja deletar este jogador?')) return;
  if (!editingTeam.value) return;
  const teamId = editingTeam.value.id; // Salvar o ID antes de qualquer operação
  try {
    await api.delete(`/m/championship/players/${playerId}`);
    await loadChampionship();
    if (teamId) {
      const updatedTeam = getAllTeams().find(t => t.id === teamId);
      if (updatedTeam) {
        editingTeam.value = { ...updatedTeam };
      } else {
        console.warn('Time não encontrado após deletar jogador');
      }
    }
  } catch (error: any) {
    console.error('Erro ao deletar jogador:', error);
    alert(error.response?.data?.error || 'Erro ao deletar jogador');
  }
};

const addMatch = async () => {
  if (!championship.value) return;
  try {
    loading.value = true;
    const matchData: any = {
      phase: newMatch.value.phase,
      teamAId: newMatch.value.teamAId || null,
      teamBId: newMatch.value.teamBId || null,
    };
    
    // Só adicionar matchDate se não estiver vazio
    if (newMatch.value.matchDate && newMatch.value.matchDate.trim() !== '') {
      matchData.matchDate = newMatch.value.matchDate;
    } else {
      matchData.matchDate = null;
    }
    
    await api.post(`/m/championship/${championship.value.id}/matches`, matchData);
    newMatch.value = {
      phase: 'GROUPS',
      teamAId: null,
      teamBId: null,
      matchDate: '',
    };
    showAddMatchModal.value = false;
    await loadChampionship();
  } catch (error: any) {
    console.error('Erro ao adicionar partida:', error);
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.details?.map((d: any) => d.message).join(', ') ||
                        'Erro ao adicionar partida';
    alert(errorMessage);
  } finally {
    loading.value = false;
  }
};

const updateMatch = async (match: Match) => {
  try {
    // Preparar dados da partida
    const matchData: any = {
      teamAId: match.teamAId || null,
      teamBId: match.teamBId || null,
      scoreA: match.scoreA ?? null,
      scoreB: match.scoreB ?? null,
      status: match.status,
    };
    
    // Tratar matchDate - pode vir como string do input ou como Date do banco
    if (match.matchDate) {
      if (typeof match.matchDate === 'string') {
        // Se for string, usar diretamente (formato datetime-local)
        matchData.matchDate = match.matchDate.trim() !== '' ? match.matchDate : null;
      } else if (match.matchDate instanceof Date) {
        // Se for Date, converter para formato datetime-local (YYYY-MM-DDTHH:mm)
        const date = match.matchDate;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        matchData.matchDate = `${year}-${month}-${day}T${hours}:${minutes}`;
      } else {
        matchData.matchDate = null;
      }
    } else {
      matchData.matchDate = null;
    }
    
    await api.put(`/m/championship/matches/${match.id}`, matchData);
    await loadChampionship();
  } catch (error: any) {
    console.error('Erro ao atualizar partida:', error);
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.details?.map((d: any) => d.message).join(', ') ||
                        'Erro ao atualizar partida';
    alert(errorMessage);
  }
};

const deleteMatch = async (matchId: string) => {
  if (!confirm('Tem certeza que deseja deletar esta partida?')) return;
  try {
    await api.delete(`/m/championship/matches/${matchId}`);
    await loadChampionship();
  } catch (error: any) {
    console.error('Erro ao deletar partida:', error);
    alert(error.response?.data?.error || 'Erro ao deletar partida');
  }
};


onMounted(() => {
  if (!userStore.isAuthenticated || userStore.user?.role !== 'ADMIN') {
    router.push('/panel/login');
    return;
  }
  loadChampionship();
});
</script>

<style scoped>
.manage-championship {
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

.config-section h3,
.section-header h3 {
  font-size: 1.5rem;
  margin: 0 0 1.5rem 0;
  color: var(--accent-primary);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.08);
}

.checkbox-group {
  grid-column: 1 / -1;
}

.checkboxes {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.add-btn {
  padding: 0.75rem 1.5rem;
  background: var(--gradient-button);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(31, 163, 122, 0.3);
}

.groups-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.group-card {
  padding: 1.5rem;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.group-header h4 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--accent-primary);
}

.delete-btn-small {
  background: rgba(255, 123, 154, 0.2);
  border: 1px solid rgba(255, 123, 154, 0.3);
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.delete-btn-small:hover {
  background: rgba(255, 123, 154, 0.3);
}

.group-teams {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.team-item-small {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.team-info-small {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.team-name-small {
  font-weight: 600;
}

.team-stats-small {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.team-actions-small {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: transform 0.2s;
}

.icon-btn:hover {
  transform: scale(1.1);
}

.add-team-btn {
  width: 100%;
  padding: 0.75rem;
  background: rgba(31, 163, 122, 0.1);
  border: 1px dashed rgba(31, 163, 122, 0.3);
  border-radius: 8px;
  color: var(--accent-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.add-team-btn:hover {
  background: rgba(31, 163, 122, 0.2);
  border-color: var(--accent-primary);
}

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.phase-section {
  margin-bottom: 2rem;
}

.phase-title {
  font-size: 1.5rem;
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
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.match-status {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.match-status.scheduled {
  background: rgba(31, 163, 122, 0.15);
  color: var(--accent-primary);
}

.match-status.live {
  background: rgba(255, 123, 154, 0.15);
  color: #ff7b9a;
}

.match-status.finished {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

.match-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.match-team {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.team-select {
  width: 100%;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--text-primary);
}

.score-input {
  width: 60px;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--text-primary);
  text-align: center;
  font-size: 1.2rem;
  font-weight: 700;
}

.match-vs {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
}

.match-footer {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.status-select,
.date-input {
  flex: 1;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--text-primary);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(20, 25, 40, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  color: var(--accent-primary);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background: var(--gradient-button);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(31, 163, 122, 0.3);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.player-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.add-player-form {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.player-input {
  flex: 1;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--text-primary);
}

.add-player-btn {
  padding: 0.5rem 1rem;
  background: var(--gradient-button);
  border: none;
  border-radius: 6px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.icon-btn-small {
  background: transparent;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.5);
}

/* Info Icons and Tooltips */
.info-icon,
.info-icon-small {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-left: 0.5rem;
  color: rgba(31, 163, 122, 0.7);
  cursor: help;
  position: relative;
  vertical-align: middle;
  transition: all 0.2s;
  flex-shrink: 0;
}

.info-icon-small {
  width: 14px;
  height: 14px;
  margin-left: 0.35rem;
}

.info-icon svg,
.info-icon-small svg {
  width: 100%;
  height: 100%;
  stroke: currentColor;
}

.info-icon:hover,
.info-icon-small:hover {
  color: var(--accent-primary);
  transform: scale(1.15);
}

.info-icon:hover svg,
.info-icon-small:hover svg {
  stroke: var(--accent-primary);
}

.info-icon[data-tooltip]::before,
.info-icon-small[data-tooltip]::before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-8px);
  background: rgba(20, 25, 40, 0.98);
  backdrop-filter: blur(20px);
  color: rgba(255, 255, 255, 0.95);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 400;
  white-space: normal;
  width: 280px;
  max-width: 90vw;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(31, 163, 122, 0.3);
  border: 1px solid rgba(31, 163, 122, 0.2);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s, transform 0.2s;
  z-index: 1000;
  line-height: 1.5;
  text-align: left;
}

.info-icon-small[data-tooltip]::before {
  width: 240px;
  font-size: 0.8rem;
  padding: 0.6rem 0.85rem;
}

.info-icon[data-tooltip]:hover::before,
.info-icon-small[data-tooltip]:hover::before {
  opacity: 1;
  transform: translateX(-50%) translateY(-12px);
  pointer-events: auto;
}

.info-icon[data-tooltip]::after,
.info-icon-small[data-tooltip]::after {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-4px);
  border: 6px solid transparent;
  border-top-color: rgba(31, 163, 122, 0.2);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s, transform 0.2s;
  z-index: 1001;
}

.info-icon[data-tooltip]:hover::after,
.info-icon-small[data-tooltip]:hover::after {
  opacity: 1;
  transform: translateX(-50%) translateY(-8px);
}

/* Adjust tooltip position for small icons in stats */
.team-stats-small .info-icon-small[data-tooltip]::before {
  left: auto;
  right: 0;
  transform: translateX(0) translateY(-8px);
}

.team-stats-small .info-icon-small[data-tooltip]:hover::before {
  transform: translateX(0) translateY(-12px);
}

.team-stats-small .info-icon-small[data-tooltip]::after {
  left: auto;
  right: 8px;
  transform: translateX(0) translateY(-4px);
}

.team-stats-small .info-icon-small[data-tooltip]:hover::after {
  transform: translateX(0) translateY(-8px);
}

/* Match footer tooltips */
.match-footer-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.match-footer-item .info-icon-small[data-tooltip]::before {
  left: auto;
  right: 0;
  transform: translateX(0) translateY(-8px);
}

.match-footer-item .info-icon-small[data-tooltip]:hover::before {
  transform: translateX(0) translateY(-12px);
}

.match-footer-item .info-icon-small[data-tooltip]::after {
  left: auto;
  right: 8px;
  transform: translateX(0) translateY(-4px);
}

.match-footer-item .info-icon-small[data-tooltip]:hover::after {
  transform: translateX(0) translateY(-8px);
}

/* Section header tooltip */
.section-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-header h3 .info-icon[data-tooltip]::before {
  left: 0;
  transform: translateX(0) translateY(-8px);
}

.section-header h3 .info-icon[data-tooltip]:hover::before {
  transform: translateX(0) translateY(-12px);
}

.section-header h3 .info-icon[data-tooltip]::after {
  left: 12px;
  transform: translateX(0) translateY(-4px);
}

.section-header h3 .info-icon[data-tooltip]:hover::after {
  transform: translateX(0) translateY(-8px);
}

/* Checkbox label tooltip */
.checkbox-label {
  position: relative;
}

.checkbox-label .info-icon-small[data-tooltip]::before {
  left: auto;
  right: 0;
  transform: translateX(0) translateY(-8px);
}

.checkbox-label .info-icon-small[data-tooltip]:hover::before {
  transform: translateX(0) translateY(-12px);
}

.checkbox-label .info-icon-small[data-tooltip]::after {
  left: auto;
  right: 8px;
  transform: translateX(0) translateY(-4px);
}

.checkbox-label .info-icon-small[data-tooltip]:hover::after {
  transform: translateX(0) translateY(-8px);
}

@media (max-width: 768px) {
  .groups-list {
    grid-template-columns: 1fr;
  }

  .matches-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

