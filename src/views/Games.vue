<template>
  <div class="games-page">
    <!-- Animated Background -->
    <AnimatedBackground :show-image="true" image-url="/games.png" />

    <!-- Header Animado -->
    <AppHeader />

    <!-- Main Content -->
    <main class="games-main">
      <!-- Page Header -->
      <section class="page-header">
        <div class="header-text">
          <p class="chip">Calendário de Jogos</p>
          <h2>Jogos liberados para apostas</h2>
          <p class="subtitle">
            Limite de até R$10 por palpite e múltipla em no máximo dois confrontos simultâneos.
          </p>
          <div v-if="!isAuthenticated" class="auth-prompt">
            <RouterLink to="/register">Cadastre-se</RouterLink> ou
            <RouterLink to="/login">entre</RouterLink> para fazer apostas!
          </div>
        </div>
      </section>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state glass-panel">
        <p>Carregando jogos...</p>
      </div>

      <!-- Games List -->
      <div v-else-if="games.length > 0" class="games-list-container">
        <div class="games-list">
          <div
            v-for="game in games"
            :key="game.id"
            class="game-item glass-panel"
            :class="[game.status.toLowerCase(), { 'is-expanded': expandedGameId === game.id }]"
          >
            <!-- Main Row (Always Visible) -->
            <div class="game-item-content" @click="toggleGame(game.id)">
              <!-- Left: Game Info -->
              <div class="game-info">
                <div class="game-teams">
                  <span class="team-name">{{ game.teamA }}</span>
                  <span class="vs-divider">VS</span>
                  <span class="team-name">{{ game.teamB }}</span>
                </div>
                <div class="game-meta">
                  <span class="meta-item">
                    <span class="meta-icon">🕐</span>
                    {{ game.startTime }}
                  </span>
                </div>
              </div>

              <!-- Center: Odds Info -->
              <div class="game-odds-compact">
                <div class="odds-row">
                  <span class="odds-badge">
                    🏆 {{ game.teamA }}
                  </span>
                  <span class="odds-value-compact">{{ game.oddsA }}x</span>
                </div>
                <div class="odds-row">
                  <span class="odds-badge">
                    🏆 {{ game.teamB }}
                  </span>
                  <span class="odds-value-compact">{{ game.oddsB }}x</span>
                </div>
              </div>

              <!-- Right: Stats -->
              <div class="game-stats">
                <div class="stat-group">
                  <span class="stat-label-small">Duração</span>
                  <span class="stat-value-small">1.8x - 5.0x</span>
                </div>
                <div class="stat-group">
                  <span class="stat-label-small">Top Killer</span>
                  <span class="stat-value-small odds">{{ game.topKillerOdds }}x</span>
                </div>
              </div>

              <!-- Status Badge -->
              <div class="game-status-section">
                <span class="status-badge-compact" :class="game.status.toLowerCase()">
                  {{ getStatusLabel(game.status) }}
                </span>
                <span class="expand-icon" :class="{ 'expanded': expandedGameId === game.id }">
                  ▼
                </span>
              </div>
            </div>

            <!-- Expanded Details (Accordion Content) -->
            <transition name="expand">
              <div v-if="expandedGameId === game.id" class="game-expanded-content">
                <!-- Game Info Section -->
                <div class="expanded-section">
                  <div class="section-header">
                    <span class="section-icon">🎮</span>
                    <h4 class="section-title-expanded">Informações do Jogo</h4>
                  </div>
                  <div class="section-content">
                    <div class="game-info-expanded">
                      <div class="game-matchup-expanded">
                        <span class="team-name-expanded">{{ game.teamA }}</span>
                        <span class="vs-expanded">VS</span>
                        <span class="team-name-expanded">{{ game.teamB }}</span>
                      </div>
                      <div class="game-date-expanded">
                        <span class="info-icon">🕐</span>
                        <span>{{ game.startTime }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Odds Section -->
                <div class="expanded-section">
                  <div class="section-header">
                    <span class="section-icon">📊</span>
                    <h4 class="section-title-expanded">Odds Disponíveis</h4>
                  </div>
                  <div class="section-content">
                    <div class="odds-grid-expanded">
                      <div class="odds-card">
                        <div class="odds-card-header">
                          <span class="odds-type-label">🏆 Vencedor - {{ game.teamA }}</span>
                          <span class="odds-badge-expanded">{{ game.oddsA }}x</span>
                        </div>
                      </div>
                      <div class="odds-card">
                        <div class="odds-card-header">
                          <span class="odds-type-label">🏆 Vencedor - {{ game.teamB }}</span>
                          <span class="odds-badge-expanded">{{ game.oddsB }}x</span>
                        </div>
                      </div>
                      <div class="odds-card">
                        <div class="odds-card-header">
                          <span class="odds-type-label">⏱️ Duração</span>
                          <span class="odds-badge-expanded">1.8x - 5.0x</span>
                        </div>
                      </div>
                      <div class="odds-card">
                        <div class="odds-card-header">
                          <span class="odds-type-label">⚔️ Top Killer</span>
                          <span class="odds-badge-expanded">{{ game.topKillerOdds }}x</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Action Section -->
                <div class="expanded-section">
                  <div class="section-content">
                    <button
                      v-if="isAuthenticated"
                      class="bet-button-expanded"
                      @click.stop="openBetSlip(game)"
                      :disabled="game.status !== 'SCHEDULED'"
                    >
                      {{ game.status === 'SCHEDULED' ? 'Apostar' : getStatusLabel(game.status) }}
                    </button>
                    <RouterLink v-else to="/login" class="bet-button-expanded" @click.stop>
                      Entrar para apostar
                    </RouterLink>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state glass-panel">
        <p class="empty-title">Nenhum jogo disponível no momento.</p>
        <p class="empty-description">
          Os jogos cadastrados pelo admin aparecerão aqui quando estiverem abertos para apostas.
        </p>
      </div>

      <!-- Rules Section -->
      <section class="rules-section glass-panel">
        <h3>Regras rápidas</h3>
        <ul class="rules-list">
          <li>Valor máximo por aposta: R$ 10</li>
          <li>Tipos de aposta: vitória do time, duração da partida (faixas) ou jogador com mais kills</li>
          <li>Odds configuradas pelo admin para cada tipo de aposta</li>
          <li>Múltiplas permitidas em até 2 jogos simultaneamente</li>
          <li>Retorno calculado automaticamente conforme as odds configuradas</li>
          <li>Jogos finalizados não aparecem mais para apostas</li>
        </ul>
      </section>
    </main>

    <!-- Modal de Aposta -->
    <div v-if="showBetModal" class="modal-overlay" @click.self="closeBetModal">
      <div class="modal-container bet-modal">
        <div class="modal-header">
          <h3>Fazer Aposta</h3>
          <button class="modal-close" @click="closeBetModal">×</button>
        </div>

        <div v-if="selectedGame" class="modal-content">
          <!-- Info do Jogo -->
          <div class="game-info-header">
            <div class="game-teams">
              <span class="team-name">{{ selectedGame.teamA }}</span>
              <span class="vs">VS</span>
              <span class="team-name">{{ selectedGame.teamB }}</span>
            </div>
            <p class="game-time">{{ selectedGame.startTime }}</p>
          </div>

          <!-- Categorias de Mercados -->
          <div class="bet-categories">
            <button
              @click="betCategory = 'RESULT'; betType = 'WINNER'"
              class="category-btn"
              :class="{ active: betCategory === 'RESULT' }"
            >
              <span class="category-icon">🏆</span>
              <span class="category-label">Resultado</span>
            </button>
            <button
              @click="betCategory = 'STATS'; betType = 'DURATION'"
              class="category-btn"
              :class="{ active: betCategory === 'STATS' }"
            >
              <span class="category-icon">📊</span>
              <span class="category-label">Estatísticas</span>
            </button>
            <button
              @click="betCategory = 'EVENTS'; betType = 'ROSHAN_TOTAL'"
              class="category-btn"
              :class="{ active: betCategory === 'EVENTS' }"
            >
              <span class="category-icon">⚡</span>
              <span class="category-label">Eventos</span>
            </button>
          </div>

          <!-- Tabs de Tipo de Aposta por Categoria -->
          <div class="bet-tabs">
            <!-- Resultado -->
            <template v-if="betCategory === 'RESULT'">
              <button
                @click="betType = 'WINNER'"
                class="tab-btn"
                :class="{ active: betType === 'WINNER' }"
              >
                Vitória
              </button>
            </template>

            <!-- Estatísticas -->
            <template v-if="betCategory === 'STATS'">
              <button
                @click="betType = 'DURATION'"
                class="tab-btn"
                :class="{ active: betType === 'DURATION' }"
              >
                Duração
              </button>
              <button
                @click="betType = 'TOP_KILLER'"
                class="tab-btn"
                :class="{ active: betType === 'TOP_KILLER' }"
              >
                Top Killer
              </button>
              <button
                @click="betType = 'LOWEST_DEATHS'"
                class="tab-btn"
                :class="{ active: betType === 'LOWEST_DEATHS' }"
              >
                Menor Mortes
              </button>
            </template>

            <!-- Eventos -->
            <template v-if="betCategory === 'EVENTS'">
              <button
                @click="betType = 'ROSHAN_TOTAL'"
                class="tab-btn"
                :class="{ active: betType === 'ROSHAN_TOTAL' }"
              >
                Total Roshan
              </button>
              <button
                @click="betType = 'FIRST_ROSHAN'"
                class="tab-btn"
                :class="{ active: betType === 'FIRST_ROSHAN' }"
              >
                Primeiro Roshan
              </button>
              <button
                @click="betType = 'FIRST_FF'"
                class="tab-btn"
                :class="{ active: betType === 'FIRST_FF' }"
              >
                Primeiro !ff
              </button>
            </template>
          </div>

          <!-- Conteúdo do Tipo de Aposta -->
          <div class="bet-content">
            <!-- Aposta em Vitória -->
            <div v-if="betType === 'WINNER'" class="bet-options">
              <h4>Escolha o vencedor:</h4>
              <div v-if="betSelections.WINNER" class="selected-badge">
                <span>Selecionado: {{ betSelections.WINNER === selectedGame.game.teamAId ? selectedGame.teamA : selectedGame.teamB }}</span>
                <button @click="betSelections.WINNER = undefined" class="remove-selection">×</button>
              </div>
              <div class="options-grid">
                <button
                  @click="handleSelection('WINNER', selectedGame.game.teamAId)"
                  class="option-btn"
                  :class="{ active: isSelected('WINNER', selectedGame.game.teamAId) }"
                >
                  <span class="option-name">{{ selectedGame.teamA }}</span>
                  <span class="option-odds">{{ selectedGame.oddsA }}x</span>
                </button>
                <button
                  @click="handleSelection('WINNER', selectedGame.game.teamBId)"
                  class="option-btn"
                  :class="{ active: isSelected('WINNER', selectedGame.game.teamBId) }"
                >
                  <span class="option-name">{{ selectedGame.teamB }}</span>
                  <span class="option-odds">{{ selectedGame.oddsB }}x</span>
                </button>
              </div>
            </div>

            <!-- Aposta em Duração -->
            <div v-if="betType === 'DURATION'" class="bet-options">
              <h4>Escolha a faixa de duração:</h4>
              <div v-if="betSelections.DURATION" class="selected-badge">
                <span>Selecionado: {{ betSelections.DURATION }} min</span>
                <button @click="betSelections.DURATION = undefined" class="remove-selection">×</button>
              </div>
              <div class="options-grid duration-grid">
                <button
                  v-for="(odd, band) in durationOdds"
                  :key="band"
                  @click="handleSelection('DURATION', band)"
                  class="option-btn"
                  :class="{ active: isSelected('DURATION', band) }"
                >
                  <span class="option-name">{{ band }} min</span>
                  <span class="option-odds">{{ odd }}x</span>
                </button>
              </div>
            </div>

            <!-- Aposta em Top Killer -->
            <div v-if="betType === 'TOP_KILLER'" class="bet-options">
              <h4>Escolha o jogador Top Killer durante a partida:</h4>
              <div v-if="betSelections.TOP_KILLER" class="selected-badge">
                <span>Selecionado: {{ getPlayerName(betSelections.TOP_KILLER) }}</span>
                <button @click="betSelections.TOP_KILLER = undefined" class="remove-selection">×</button>
              </div>
              <div v-if="loadingPlayers" class="loading-players">
                <p>Carregando jogadores...</p>
              </div>
              <div v-else-if="allPlayers.length === 0" class="no-players">
                <p>Nenhum jogador cadastrado para estes times.</p>
              </div>
              <div v-else class="options-grid players-grid">
                <button
                  v-for="player in allPlayers"
                  :key="player.id"
                  @click="handleSelection('TOP_KILLER', player.id)"
                  class="option-btn player-option"
                  :class="{ active: isSelected('TOP_KILLER', player.id) }"
                >
                  <span class="option-name">{{ player.name }}</span>
                  <span class="option-team">{{ getPlayerTeam(player.teamId) }}</span>
                  <span class="option-odds">{{ getSelectionOdds('TOP_KILLER', player.id).toFixed(2) }}x</span>
                </button>
              </div>
            </div>

            <!-- Aposta em Menor Mortes -->
            <div v-if="betType === 'LOWEST_DEATHS'" class="bet-options">
              <h4>Escolha o jogador com Menor Mortes durante a partida:</h4>
              <div v-if="betSelections.LOWEST_DEATHS" class="selected-badge">
                <span>Selecionado: {{ getPlayerName(betSelections.LOWEST_DEATHS) }}</span>
                <button @click="betSelections.LOWEST_DEATHS = undefined" class="remove-selection">×</button>
              </div>
              <div v-if="loadingPlayers" class="loading-players">
                <p>Carregando jogadores...</p>
              </div>
              <div v-else-if="allPlayers.length === 0" class="no-players">
                <p>Nenhum jogador cadastrado para estes times.</p>
              </div>
              <div v-else class="options-grid players-grid">
                <button
                  v-for="player in allPlayers"
                  :key="player.id"
                  @click="handleSelection('LOWEST_DEATHS', player.id)"
                  class="option-btn player-option"
                  :class="{ active: isSelected('LOWEST_DEATHS', player.id) }"
                >
                  <span class="option-name">{{ player.name }}</span>
                  <span class="option-team">{{ getPlayerTeam(player.teamId) }}</span>
                  <span class="option-odds">{{ getSelectionOdds('LOWEST_DEATHS', player.id).toFixed(2) }}x</span>
                </button>
              </div>
            </div>

            <!-- Aposta em Total de Roshan (Over/Under) -->
            <div v-if="betType === 'ROSHAN_TOTAL'" class="bet-options">
              <h4>Total de Roshan feitos na partida:</h4>
              <div v-if="betSelections.ROSHAN_TOTAL" class="selected-badge">
                <span>Selecionado: {{ formatRoshanSelection(betSelections.ROSHAN_TOTAL) }}</span>
                <button @click="betSelections.ROSHAN_TOTAL = undefined" class="remove-selection">×</button>
              </div>
              <div class="options-grid roshan-grid">
                <button
                  v-for="(odd, option) in roshanTotalOdds"
                  :key="option"
                  @click="handleSelection('ROSHAN_TOTAL', option)"
                  class="option-btn"
                  :class="{ active: isSelected('ROSHAN_TOTAL', option) }"
                >
                  <span class="option-name">{{ formatRoshanSelection(option) }}</span>
                  <span class="option-odds">{{ odd }}x</span>
                </button>
              </div>
            </div>

            <!-- Aposta em Primeiro Roshan -->
            <div v-if="betType === 'FIRST_ROSHAN'" class="bet-options">
              <h4>Time que irá fazer o primeiro Roshan:</h4>
              <div v-if="betSelections.FIRST_ROSHAN" class="selected-badge">
                <span>Selecionado: {{ betSelections.FIRST_ROSHAN === selectedGame.game.teamAId ? selectedGame.teamA : selectedGame.teamB }}</span>
                <button @click="betSelections.FIRST_ROSHAN = undefined" class="remove-selection">×</button>
              </div>
              <div class="options-grid">
                <button
                  @click="handleSelection('FIRST_ROSHAN', selectedGame.game.teamAId)"
                  class="option-btn"
                  :class="{ active: isSelected('FIRST_ROSHAN', selectedGame.game.teamAId) }"
                >
                  <span class="option-name">{{ selectedGame.teamA }}</span>
                  <span class="option-odds">{{ getSelectionOdds('FIRST_ROSHAN', selectedGame.game.teamAId).toFixed(2) }}x</span>
                </button>
                <button
                  @click="handleSelection('FIRST_ROSHAN', selectedGame.game.teamBId)"
                  class="option-btn"
                  :class="{ active: isSelected('FIRST_ROSHAN', selectedGame.game.teamBId) }"
                >
                  <span class="option-name">{{ selectedGame.teamB }}</span>
                  <span class="option-odds">{{ getSelectionOdds('FIRST_ROSHAN', selectedGame.game.teamBId).toFixed(2) }}x</span>
                </button>
              </div>
            </div>

            <!-- Aposta em Primeiro !ff -->
            <div v-if="betType === 'FIRST_FF'" class="bet-options">
              <h4>Time que irá dar !ff:</h4>
              <div v-if="betSelections.FIRST_FF" class="selected-badge">
                <span>Selecionado: {{ betSelections.FIRST_FF === selectedGame.game.teamAId ? selectedGame.teamA : selectedGame.teamB }}</span>
                <button @click="betSelections.FIRST_FF = undefined" class="remove-selection">×</button>
              </div>
              <div class="options-grid">
                <button
                  @click="handleSelection('FIRST_FF', selectedGame.game.teamAId)"
                  class="option-btn"
                  :class="{ active: isSelected('FIRST_FF', selectedGame.game.teamAId) }"
                >
                  <span class="option-name">{{ selectedGame.teamA }}</span>
                  <span class="option-odds">{{ getSelectionOdds('FIRST_FF', selectedGame.game.teamAId).toFixed(2) }}x</span>
                </button>
                <button
                  @click="handleSelection('FIRST_FF', selectedGame.game.teamBId)"
                  class="option-btn"
                  :class="{ active: isSelected('FIRST_FF', selectedGame.game.teamBId) }"
                >
                  <span class="option-name">{{ selectedGame.teamB }}</span>
                  <span class="option-odds">{{ getSelectionOdds('FIRST_FF', selectedGame.game.teamBId).toFixed(2) }}x</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Resumo das Seleções -->
          <div v-if="selectedCount > 0" class="selections-summary">
            <h4>Seleções ativas ({{ selectedCount }}/3):</h4>
            <div class="selections-list">
              <div v-if="betSelections.WINNER" class="selection-item">
                <span class="selection-type">Vitória:</span>
                <span class="selection-value">
                  {{ betSelections.WINNER === selectedGame.game.teamAId ? selectedGame.teamA : selectedGame.teamB }}
                  ({{ getSelectionOdds('WINNER', betSelections.WINNER).toFixed(2) }}x)
                </span>
              </div>
              <div v-if="betSelections.DURATION" class="selection-item">
                <span class="selection-type">Duração:</span>
                <span class="selection-value">
                  {{ betSelections.DURATION }} min ({{ getSelectionOdds('DURATION', betSelections.DURATION).toFixed(2) }}x)
                </span>
              </div>
              <div v-if="betSelections.TOP_KILLER" class="selection-item">
                <span class="selection-type">Top Killer (durante a partida):</span>
                <span class="selection-value">
                  {{ getPlayerName(betSelections.TOP_KILLER) }} ({{ getSelectionOdds('TOP_KILLER', betSelections.TOP_KILLER).toFixed(2) }}x)
                </span>
              </div>
              <div v-if="betSelections.LOWEST_DEATHS" class="selection-item">
                <span class="selection-type">Menor Mortes (durante a partida):</span>
                <span class="selection-value">
                  {{ getPlayerName(betSelections.LOWEST_DEATHS) }} ({{ getSelectionOdds('LOWEST_DEATHS', betSelections.LOWEST_DEATHS).toFixed(2) }}x)
                </span>
              </div>
              <div v-if="betSelections.ROSHAN_TOTAL" class="selection-item">
                <span class="selection-type">Total Roshan:</span>
                <span class="selection-value">
                  {{ formatRoshanSelection(betSelections.ROSHAN_TOTAL) }} ({{ getSelectionOdds('ROSHAN_TOTAL', betSelections.ROSHAN_TOTAL).toFixed(2) }}x)
                </span>
              </div>
              <div v-if="betSelections.FIRST_ROSHAN" class="selection-item">
                <span class="selection-type">Primeiro Roshan:</span>
                <span class="selection-value">
                  {{ betSelections.FIRST_ROSHAN === selectedGame.game.teamAId ? selectedGame.teamA : selectedGame.teamB }} ({{ getSelectionOdds('FIRST_ROSHAN', betSelections.FIRST_ROSHAN).toFixed(2) }}x)
                </span>
              </div>
              <div v-if="betSelections.FIRST_FF" class="selection-item">
                <span class="selection-type">Primeiro !ff:</span>
                <span class="selection-value">
                  {{ betSelections.FIRST_FF === selectedGame.game.teamAId ? selectedGame.teamA : selectedGame.teamB }} ({{ getSelectionOdds('FIRST_FF', betSelections.FIRST_FF).toFixed(2) }}x)
                </span>
              </div>
            </div>
            <div class="total-odds">
              <span>Odds Total:</span>
              <strong>
                {{ totalOdds.toFixed(2) }}x
                <span v-if="selectedCount > 1 && getRawTotalOdds() > 3.0" class="odds-limited-badge">
                  (limitada)
                </span>
              </strong>
            </div>
          </div>

          <!-- Valor da Aposta -->
          <div class="bet-amount-section">
            <label>Valor da aposta (máx. R$ 10,00)</label>
            <div class="amount-input-wrapper" :class="{ 'has-error': betAmount > 10 }">
              <span class="currency">R$</span>
              <input
                type="number"
                v-model.number="betAmount"
                min="0.01"
                max="10"
                step="0.01"
                placeholder="0.00"
                class="amount-input"
                :class="{ 'input-error': betAmount > 10 }"
                :disabled="loading"
              />
            </div>
            <div v-if="betAmount > 10" class="error-message-amount">
              O valor máximo permitido por aposta é R$ 10,00
            </div>
            <div class="amount-info">
              <span>Saldo disponível: R$ {{ walletBalance.toFixed(2) }}</span>
              <span v-if="betAmount && selectedCount > 0 && betAmount <= 10" class="potential-return">
                Retorno potencial: R$ {{ potentialReturn.toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- Mensagens de Erro/Sucesso -->
          <p v-if="betError" class="error-message">{{ betError }}</p>
          <p v-if="betSuccess" class="success-message">{{ betSuccess }}</p>
        </div>

        <!-- Footer do Modal -->
        <div class="modal-footer">
          <button class="modal-btn cancel-btn" @click="closeBetModal" :disabled="loading">
            Cancelar
          </button>
          <button
            class="modal-btn confirm-btn"
            @click="placeBet"
            :disabled="loading || !canPlaceBet"
          >
            <span v-if="loading">Processando...</span>
            <span v-else>Confirmar Aposta</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useUserStore } from '@/store/useUserStore';
import { useGameStore } from '@/store/useGameStore';
// @ts-ignore - Vue component with script setup
import AppHeader from '@/components/AppHeader.vue';
// @ts-ignore - Vue component with script setup
import AnimatedBackground from '@/components/AnimatedBackground.vue';
import api from '@/services/api';
import { routes } from '@/utils/routes';

const router = useRouter();
const userStore = useUserStore();
const gameStore = useGameStore();

const isAuthenticated = computed(() => userStore.isAuthenticated);
const loading = computed(() => gameStore.loading);
const walletBalance = computed(() => userStore.balance);

const showBetModal = ref(false);
const selectedGame = ref<any>(null);
const expandedGameId = ref<string | null>(null);
const betCategory = ref<'RESULT' | 'STATS' | 'EVENTS'>('RESULT');
const betType = ref<'WINNER' | 'DURATION' | 'TOP_KILLER' | 'LOWEST_DEATHS' | 'ROSHAN_TOTAL' | 'FIRST_ROSHAN' | 'FIRST_FF'>('WINNER');
const betSelections = ref<{
  WINNER?: string;
  DURATION?: string;
  TOP_KILLER?: string;
  LOWEST_DEATHS?: string;
  ROSHAN_TOTAL?: string;
  FIRST_ROSHAN?: string;
  FIRST_FF?: string;
}>({});
const betAmount = ref<number>(0);

// Watch para validar valor (mensagem será exibida no template)
watch(betAmount, () => {
  // A validação e mensagem são tratadas no template via v-if
});
const betError = ref('');
const betSuccess = ref('');
const loadingPlayers = ref(false);
const allPlayers = ref<any[]>([]);

// Helper para fazer parse de campos JSON string
const parseJsonField = (field: any): any => {
  if (!field) return null;
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      // Se for um objeto vazio ou null, retornar null
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length === 0) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }
  // Se já for um objeto, verificar se está vazio
  if (field && typeof field === 'object' && Object.keys(field).length === 0) {
    return null;
  }
  return field;
};

const games = computed(() => {
  return gameStore.upcomingGames.map((game) => {
    const parsedTopKillerPlayerOdds = parseJsonField(game.odds?.topKillerPlayerOdds);
    return {
      id: game.id,
      teamA: game.teamA.name,
      teamB: game.teamB.name,
      startTime: new Date(game.startTime).toLocaleString('pt-BR'),
      status: game.status,
      oddsA: game.odds?.teamAOdds || 1.5,
      oddsB: game.odds?.teamBOdds || 1.5,
      topKillerOdds: game.odds?.topKillerOdds || 2.0,
      lowestDeathsOdds: game.odds?.lowestDeathsOdds || 2.0,
      topKillerPlayerOdds: parsedTopKillerPlayerOdds,
      lowestDeathsPlayerOdds: parseJsonField(game.odds?.lowestDeathsPlayerOdds),
      durationOdds: parseJsonField(game.odds?.durationOdds) || {},
      roshanTotalOdds: parseJsonField(game.odds?.roshanTotalOdds),
      firstRoshanOdds: parseJsonField(game.odds?.firstRoshanOdds),
      firstFFOdds: parseJsonField(game.odds?.firstFFOdds),
      game,
    };
  });
});

const durationOdds = computed(() => {
  if (!selectedGame.value) return {};
  // Usar os dados já parseados do computed games
  return selectedGame.value.durationOdds || {};
});

const roshanTotalOdds = computed(() => {
  if (!selectedGame.value) return {};
  // Usar os dados já parseados do computed games
  const odds = selectedGame.value.roshanTotalOdds;
  return odds || { 'over_2.5': 1.8, 'under_2.5': 1.9, 'over_3.5': 2.0, 'under_3.5': 1.7 };
});

const getSelectionOdds = (type: 'WINNER' | 'DURATION' | 'TOP_KILLER' | 'LOWEST_DEATHS' | 'ROSHAN_TOTAL' | 'FIRST_ROSHAN' | 'FIRST_FF', selection: string): number => {
  if (!selectedGame.value) return 1.5;
  
  if (type === 'WINNER') {
    if (selection === selectedGame.value.game.teamAId) {
      return selectedGame.value.oddsA;
    } else if (selection === selectedGame.value.game.teamBId) {
      return selectedGame.value.oddsB;
    }
  } else if (type === 'DURATION') {
    return durationOdds.value[selection] || 1.5;
  } else if (type === 'TOP_KILLER') {
    // Verificar se há odds específicas por jogador (já parseado no computed games)
    const topKillerPlayerOdds = selectedGame.value.topKillerPlayerOdds;
    if (topKillerPlayerOdds && typeof topKillerPlayerOdds === 'object' && !Array.isArray(topKillerPlayerOdds)) {
      const playerOdds = topKillerPlayerOdds[selection];
      if (playerOdds && typeof playerOdds === 'number' && playerOdds > 0) {
        return playerOdds;
      }
    }
    return selectedGame.value.topKillerOdds || 2.0;
  } else if (type === 'LOWEST_DEATHS') {
    // Verificar se há odds específicas por jogador (já parseado no computed games)
    const lowestDeathsPlayerOdds = selectedGame.value.lowestDeathsPlayerOdds;
    if (lowestDeathsPlayerOdds && typeof lowestDeathsPlayerOdds === 'object' && !Array.isArray(lowestDeathsPlayerOdds)) {
      const playerOdds = lowestDeathsPlayerOdds[selection];
      if (playerOdds && typeof playerOdds === 'number' && playerOdds > 0) {
        return playerOdds;
      }
    }
    return selectedGame.value.lowestDeathsOdds || 2.0;
  } else if (type === 'ROSHAN_TOTAL') {
    return roshanTotalOdds.value[selection] || 1.8;
  } else if (type === 'FIRST_ROSHAN') {
    const firstRoshanOdds = selectedGame.value.firstRoshanOdds;
    if (firstRoshanOdds && typeof firstRoshanOdds === 'object') {
      if (selection === selectedGame.value.game.teamAId) {
        return firstRoshanOdds['teamA'] || 1.5;
      } else if (selection === selectedGame.value.game.teamBId) {
        return firstRoshanOdds['teamB'] || 1.5;
      }
    }
    return 1.5;
  } else if (type === 'FIRST_FF') {
    const firstFFOdds = selectedGame.value.firstFFOdds;
    if (firstFFOdds && typeof firstFFOdds === 'object') {
      if (selection === selectedGame.value.game.teamAId) {
        return firstFFOdds['teamA'] || 1.5;
      } else if (selection === selectedGame.value.game.teamBId) {
        return firstFFOdds['teamB'] || 1.5;
      }
    }
    return 1.5;
  }
  
  return 1.5;
};

const formatRoshanSelection = (selection: string): string => {
  if (selection.startsWith('over_')) {
    const value = selection.replace('over_', '');
    return `Acima de ${value}`;
  } else if (selection.startsWith('under_')) {
    const value = selection.replace('under_', '');
    return `Abaixo de ${value}`;
  }
  return selection;
};

const totalOdds = computed(() => {
  const selections = Object.entries(betSelections.value).filter(([_, value]) => value);
  if (selections.length === 0) return 1;
  
  const calculatedOdds = selections.reduce((total, [type, selection]) => {
    return total * getSelectionOdds(type as 'WINNER' | 'DURATION' | 'TOP_KILLER' | 'LOWEST_DEATHS' | 'ROSHAN_TOTAL' | 'FIRST_ROSHAN' | 'FIRST_FF', selection!);
  }, 1);
  
  // Limitar a 3.0 para apostas múltiplas
  const isMultiple = selections.length > 1;
  return isMultiple ? Math.min(calculatedOdds, 3.0) : calculatedOdds;
});

const potentialReturn = computed(() => {
  if (!betAmount.value || totalOdds.value === 1) return 0;
  return betAmount.value * totalOdds.value;
});

const selectedCount = computed(() => {
  return Object.values(betSelections.value).filter(v => v).length;
});

const canPlaceBet = computed(() => {
  return (
    selectedCount.value > 0 &&
    betAmount.value > 0 &&
    betAmount.value <= 10 &&
    betAmount.value <= walletBalance.value
  );
});

onMounted(async () => {
  if (userStore.token) {
    await userStore.fetchProfile();
  }
  await gameStore.fetchGames('SCHEDULED');
});

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    SCHEDULED: 'Pre-Match',
    LIVE: 'Ao Vivo',
    CLOSED: 'Encerrado',
  };
  return labels[status] || status;
};

const toggleGame = (gameId: string) => {
  if (expandedGameId.value === gameId) {
    expandedGameId.value = null;
  } else {
    expandedGameId.value = gameId;
  }
};

const openBetSlip = async (game: any) => {
  selectedGame.value = game;
  betCategory.value = 'RESULT';
  betType.value = 'WINNER';
  betSelections.value = {};
  betAmount.value = 0;
  betError.value = '';
  betSuccess.value = '';
  showBetModal.value = true;
  
  // Carregar jogadores antecipadamente
  await loadPlayers();
};

const closeBetModal = () => {
  showBetModal.value = false;
  selectedGame.value = null;
  betCategory.value = 'RESULT';
  betType.value = 'WINNER';
  betSelections.value = {};
  betAmount.value = 0;
  betError.value = '';
  betSuccess.value = '';
  allPlayers.value = [];
};

const loadPlayers = async () => {
  if (!selectedGame.value) return;
  
  loadingPlayers.value = true;
  try {
    // Buscar todos os times para pegar os jogadores
    const teamsResponse = await api.get(routes.admin.teams.list());
    const teams = teamsResponse.data.teams || [];
    
    const teamAId = selectedGame.value.game.teamAId;
    const teamBId = selectedGame.value.game.teamBId;
    
    const teamA = teams.find((t: any) => t.id === teamAId);
    const teamB = teams.find((t: any) => t.id === teamBId);
    
    const playersA = teamA?.players || [];
    const playersB = teamB?.players || [];
    
    allPlayers.value = [...playersA, ...playersB];
  } catch (error) {
    console.error('Erro ao carregar jogadores:', error);
    allPlayers.value = [];
  } finally {
    loadingPlayers.value = false;
  }
};


const getPlayerTeam = (teamId: string): string => {
  if (!selectedGame.value) return '';
  if (teamId === selectedGame.value.game.teamAId) {
    return selectedGame.value.teamA;
  }
  return selectedGame.value.teamB;
};

const getPlayerName = (playerId: string): string => {
  const player = allPlayers.value.find(p => p.id === playerId);
  return player?.name || '';
};

// Função auxiliar para calcular a odd total sem limitação (para exibição)
const getRawTotalOdds = (): number => {
  const selections = Object.entries(betSelections.value).filter(([_, value]) => value);
  if (selections.length === 0) return 1;
  
  return selections.reduce((total, [type, selection]) => {
    return total * getSelectionOdds(type as 'WINNER' | 'DURATION' | 'TOP_KILLER' | 'LOWEST_DEATHS' | 'ROSHAN_TOTAL' | 'FIRST_ROSHAN' | 'FIRST_FF', selection!);
  }, 1);
};

const placeBet = async () => {
  if (!canPlaceBet.value || !selectedGame.value) return;
  
  betError.value = '';
  betSuccess.value = '';
  
  try {
    const selections = Object.entries(betSelections.value).filter(([_, value]) => value);
    
    if (selections.length === 1) {
      // Aposta simples
      const [type, selection] = selections[0];
        await gameStore.placeBet({
          gameId: selectedGame.value.id,
          type: type as 'WINNER' | 'DURATION' | 'TOP_KILLER' | 'LOWEST_DEATHS' | 'ROSHAN_TOTAL' | 'FIRST_ROSHAN' | 'FIRST_FF',
          selection: selection!,
          amount: betAmount.value,
        });
    } else {
      // Aposta múltipla - criar múltiplas apostas vinculadas
      // Dividir o valor igualmente entre as seleções
      const multipleId = `multi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const amountPerBet = betAmount.value / selections.length;
      
      // Calcular odd total real (sem limitação)
      const rawTotalOdds = getRawTotalOdds();
      const needsAdjustment = rawTotalOdds > 3.0;
      
      // Se a odd total passar de 3.0, calcular fator de ajuste
      const adjustmentFactor = needsAdjustment ? Math.pow(3.0 / rawTotalOdds, 1 / selections.length) : 1;
      
      for (const [type, selection] of selections) {
        const originalOdds = getSelectionOdds(type as 'WINNER' | 'DURATION' | 'TOP_KILLER' | 'LOWEST_DEATHS' | 'ROSHAN_TOTAL' | 'FIRST_ROSHAN' | 'FIRST_FF', selection!);
        const adjustedOdds = needsAdjustment ? originalOdds * adjustmentFactor : originalOdds;
        
        await gameStore.placeBet({
          gameId: selectedGame.value.id,
          type: type as 'WINNER' | 'DURATION' | 'TOP_KILLER' | 'LOWEST_DEATHS' | 'ROSHAN_TOTAL' | 'FIRST_ROSHAN' | 'FIRST_FF',
          selection: selection!,
          amount: amountPerBet,
          isMultiple: true,
          multipleId,
          adjustedOdds: needsAdjustment ? adjustedOdds : undefined, // Passar odd ajustada se necessário
        });
      }
    }
    
    betSuccess.value = `Aposta${selections.length > 1 ? ' múltipla' : ''} realizada com sucesso!`;
    setTimeout(async () => {
      closeBetModal();
      // Recarregar dados
      await gameStore.fetchGames('SCHEDULED');
      if (userStore.isAuthenticated) {
        await userStore.fetchProfile();
        await gameStore.fetchBets('PENDING');
      }
    }, 2000);
  } catch (error: any) {
    console.error('Erro ao fazer aposta:', error);
    const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message || 'Erro ao fazer aposta';
    betError.value = errorMessage;
    
    // Se houver detalhes de validação, mostrar também
    if (error.response?.data?.details) {
      console.error('Detalhes do erro:', error.response.data.details);
      if (Array.isArray(error.response.data.details)) {
        const detailsText = error.response.data.details.map((d: any) => d.message || d).join(', ');
        betError.value = `${errorMessage}: ${detailsText}`;
      }
    }
  }
};

const handleSelection = (type: 'WINNER' | 'DURATION' | 'TOP_KILLER' | 'LOWEST_DEATHS' | 'ROSHAN_TOTAL' | 'FIRST_ROSHAN' | 'FIRST_FF', selection: string) => {
  if (betSelections.value[type] === selection) {
    // Desmarcar se já estiver selecionado
    delete betSelections.value[type];
  } else {
    // Marcar nova seleção
    betSelections.value[type] = selection;
  }
};

const isSelected = (type: 'WINNER' | 'DURATION' | 'TOP_KILLER' | 'LOWEST_DEATHS' | 'ROSHAN_TOTAL' | 'FIRST_ROSHAN' | 'FIRST_FF', selection: string): boolean => {
  return betSelections.value[type] === selection;
};
</script>

<style scoped>
.games-page {
  min-height: 100vh;
  background: var(--gradient-bg), var(--bg-primary);
  color: var(--text-primary);
}

/* Header removido - usando AppHeader component */

/* Main Content */
.games-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Page Header */
.page-header {
  margin-bottom: 1rem;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.chip {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  background: rgba(31, 163, 122, 0.15);
  border: 1px solid rgba(31, 163, 122, 0.3);
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

/* Loading & Empty States */
.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
}

.empty-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-description {
  margin: 0;
}

/* Games List */
.games-list-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.games-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.game-item {
  padding: 0;
  border-left: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.03);
  margin-bottom: 0.75rem;
}

.game-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-left-color: var(--accent-primary);
  box-shadow: 0 4px 12px rgba(31, 163, 122, 0.15);
}

.game-item.is-expanded {
  background: rgba(0, 0, 0, 0.2);
  border-left-color: var(--accent-primary);
  box-shadow: 0 0 20px rgba(31, 163, 122, 0.3), 0 4px 12px rgba(31, 163, 122, 0.15);
}

.game-item.scheduled {
  border-left-color: #0ef;
}

.game-item.scheduled.is-expanded {
  border-left-color: #0ef;
  box-shadow: 0 0 20px rgba(14, 255, 224, 0.3), 0 4px 12px rgba(14, 255, 224, 0.15);
}

.game-item.live {
  border-left-color: #ff7b9a;
}

.game-item.live.is-expanded {
  border-left-color: #ff7b9a;
  box-shadow: 0 0 20px rgba(255, 123, 154, 0.3), 0 4px 12px rgba(255, 123, 154, 0.15);
}

.game-item.closed {
  border-left-color: rgba(255, 255, 255, 0.3);
}

.game-item-content {
  display: grid;
  grid-template-columns: 2fr 2fr 1.5fr auto;
  gap: 1.5rem;
  align-items: center;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.game-item-content:hover {
  background: rgba(255, 255, 255, 0.02);
}

.game-info {
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

.game-meta {
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

.game-odds-compact {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.odds-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.odds-badge {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.odds-value-compact {
  font-size: 0.95rem;
  font-weight: 600;
  color: #933dff;
}

.game-stats {
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

.game-status-section {
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

.status-badge-compact.scheduled {
  background: rgba(31, 163, 122, 0.15);
  color: var(--accent-primary);
  border: 1px solid rgba(14, 255, 224, 0.3);
}

.status-badge-compact.live {
  background: rgba(255, 123, 154, 0.15);
  color: #ff7b9a;
  border: 1px solid rgba(255, 123, 154, 0.3);
}

.status-badge-compact.closed {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
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

.game-item-content:hover .expand-icon {
  color: var(--accent-primary);
}

/* Expanded Content (Accordion) */
.game-expanded-content {
  padding: 0 1.5rem 1.5rem 1.5rem;
  background: rgba(0, 0, 0, 0.15);
  border-top: 1px solid rgba(31, 163, 122, 0.2);
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

.info-icon {
  font-size: 1rem;
}

/* Odds Grid Expanded */
.odds-grid-expanded {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.odds-card {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.2s;
}

.odds-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.odds-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.odds-type-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
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

.bet-button-expanded {
  width: 100%;
  padding: 1rem;
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
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
  display: block;
}

.bet-button-expanded:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(31, 163, 122, 0.3);
}

.bet-button-expanded:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
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
  color: var(--text-tertiary);
}

.detail-value {
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 500;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
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

.game-odds-section {
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.odds-title {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
  margin: 0 0 0.75rem 0;
}

.odds-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.odds-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.odds-type {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.odds-value {
  font-size: 0.85rem;
  color: var(--accent-primary);
  font-weight: 600;
}

.bet-button {
  padding: 1rem;
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
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
  margin-top: 0.5rem;
}

.bet-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(31, 163, 122, 0.3);
}

.bet-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

/* Rules Section */
.rules-section {
  padding: 2rem;
  margin-top: 1rem;
}

.rules-section h3 {
  font-size: 1.3rem;
  margin: 0 0 1.5rem 0;
}

.rules-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.75rem;
}

.rules-list li {
  padding-left: 1.5rem;
  position: relative;
  color: var(--text-secondary);
  line-height: 1.6;
}

.rules-list li::before {
  content: '•';
  color: var(--accent-primary);
  font-weight: bold;
  position: absolute;
  left: 0;
  font-size: 1.2rem;
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
  .games-main {
    padding: 1rem;
  }

  .game-item-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .game-stats {
    justify-content: space-between;
  }

  .game-expanded-content {
    padding: 0 1rem 1rem 1rem;
  }

  .section-content {
    padding-left: 1rem;
  }

  .odds-grid-expanded {
    grid-template-columns: 1fr;
  }

  .game-matchup-expanded {
    flex-direction: column;
    gap: 1rem;
  }

  .vs-expanded {
    order: -1;
  }
}

/* Modal de Aposta */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
  padding: 1rem;
}

.modal-container {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  padding: 0;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

.bet-modal {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-secondary);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 2rem;
  cursor: pointer;
  transition: color 0.2s;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: var(--accent-error);
}

.modal-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.game-info-header {
  text-align: center;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-secondary);
}

.game-teams {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.game-teams .team-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
}

.game-teams .vs {
  padding: 0.4rem 0.8rem;
  background: var(--radiant-bg);
  border: 1px solid var(--radiant-border);
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--accent-primary);
}

.game-time {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.bet-categories {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--border-secondary);
  padding-bottom: 0.75rem;
}

.category-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.category-btn:hover {
  background: var(--input-bg);
  color: var(--text-primary);
  border-color: var(--input-border);
}

.category-btn.active {
  background: var(--radiant-bg);
  color: var(--accent-primary);
  border-color: var(--radiant-border);
}

.category-icon {
  font-size: 1.5rem;
}

.category-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.bet-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border-secondary);
  padding-bottom: 0.5rem;
  flex-wrap: wrap;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: var(--input-bg);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--radiant-bg);
  color: var(--accent-primary);
  border: 1px solid var(--radiant-border);
}

.bet-content {
  min-height: 200px;
}

.bet-options h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
}

.duration-grid {
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
}

.roshan-grid {
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
}

.players-grid {
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

.option-btn {
  padding: 1rem;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}

.option-btn:hover {
  background: var(--input-bg-hover);
  border-color: var(--input-border-focus);
  transform: translateY(-2px);
}

.option-btn.active {
  background: var(--radiant-bg);
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.2);
}

.player-option {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.option-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.option-team {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.option-odds {
  font-size: 0.9rem;
  color: var(--accent-primary);
  font-weight: 600;
}

.loading-players,
.no-players {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.selected-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--radiant-bg);
  border: 1px solid var(--radiant-border);
  border-radius: 10px;
  margin-bottom: 1rem;
}

.selected-badge span {
  color: var(--accent-primary);
  font-weight: 500;
  font-size: 0.9rem;
}

.remove-selection {
  background: var(--dire-bg);
  border: 1px solid var(--dire-border);
  color: var(--accent-error);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  transition: all 0.2s;
  padding: 0;
}

.remove-selection:hover {
  background: rgba(255, 71, 87, 0.3);
  transform: scale(1.1);
}

.selections-summary {
  padding: 1.5rem;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.selections-summary h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.selections-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.selection-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-secondary);
}

.selection-item:last-child {
  border-bottom: none;
}

.selection-type {
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
}

.selection-value {
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
}

.total-odds {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-secondary);
  font-size: 1.1rem;
}

.total-odds span {
  color: var(--text-secondary);
  font-weight: 500;
}

.total-odds strong {
  color: var(--accent-primary);
  font-size: 1.3rem;
  font-weight: 700;
}

.odds-limited-badge {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 400;
  margin-left: 0.5rem;
  font-style: italic;
}

.bet-amount-section {
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-secondary);
}

.bet-amount-section label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

.amount-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  transition: all 0.2s;
}

.amount-input-wrapper:focus-within {
  border-color: var(--input-border-focus) !important;
  box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1) !important;
}

.amount-input-wrapper.has-error:focus-within {
  border-color: var(--accent-error) !important;
  box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.1) !important;
}

.amount-input-wrapper.has-error {
  border-color: var(--accent-error) !important;
}

/* Garantir que o input interno não tenha borda ou outline - sobrescreve estilos globais */
.amount-input-wrapper .amount-input,
.amount-input-wrapper .amount-input:focus,
.amount-input-wrapper .amount-input:hover,
.amount-input-wrapper input[type="number"],
.amount-input-wrapper input[type="number"]:focus {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
  background-color: transparent !important;
}

.currency {
  color: var(--text-secondary);
  font-weight: 600;
}

.amount-input {
  flex: 1;
  background: transparent;
  border: none !important;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  outline: none !important;
  box-shadow: none !important;
}

.amount-input:focus {
  border: none !important;
  border-color: transparent !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
  background-color: transparent !important;
}

.amount-input::placeholder {
  color: var(--text-tertiary);
}

.amount-input.input-error {
  /* Removido box-shadow - apenas o wrapper mostra o outline */
}

.error-message-amount {
  margin-top: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.3);
  border-radius: 8px;
  color: var(--accent-error);
  font-size: 0.875rem;
  font-weight: 500;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.amount-info {
  display: flex;
  justify-content: space-between;
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.potential-return {
  color: var(--accent-primary);
  font-weight: 600;
}

.error-message {
  color: var(--accent-error);
  font-size: 0.9rem;
  margin: 0;
  padding: 0.75rem;
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.2);
  border-radius: 8px;
}

.success-message {
  color: var(--accent-primary);
  font-size: 0.9rem;
  margin: 0;
  padding: 0.75rem;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 8px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--border-secondary);
}

.modal-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: var(--input-bg);
  color: var(--text-secondary);
  border: 1px solid var(--input-border);
}

.cancel-btn:hover:not(:disabled) {
  background: var(--input-bg-hover);
  border-color: var(--text-muted);
}

.confirm-btn {
  background: var(--gradient-button);
  color: var(--gradient-button-text);
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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
</style>
