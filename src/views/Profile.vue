<template>
  <div class="profile-page">
    <!-- Animated Background -->
    <AnimatedBackground />

    <!-- Header Animado -->
    <AppHeader />

    <!-- Main Content -->
    <main class="profile-main">
      <!-- Auth Required -->
      <div v-if="!isAuthenticated" class="auth-required glass-panel">
        <p class="auth-title">Acesso restrito</p>
        <p class="auth-description">
          Você precisa estar logado para visualizar seu perfil.
        </p>
        <div class="auth-actions">
          <RouterLink to="/login" class="cta">Entrar</RouterLink>
          <RouterLink to="/register" class="cta secondary">Cadastrar</RouterLink>
        </div>
      </div>

      <!-- Profile Content -->
      <div v-else class="profile-content">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state glass-panel">
          <p>Carregando perfil...</p>
        </div>

        <!-- Profile Info -->
        <div v-else class="profile-sections">
          <!-- Profile Header Card -->
          <section class="profile-header-card glass-panel">
            <div class="avatar-section">
              <div class="avatar">
                <span class="avatar-initial">{{ userInitial }}</span>
              </div>
              <div class="user-info">
                <h2>{{ userProfile.name || 'Usuário' }}</h2>
                <p class="user-email">{{ userProfile.email || 'email@example.com' }}</p>
                <p class="user-cpf">CPF: {{ formatCPF(userProfile.cpf || '') }}</p>
              </div>
            </div>
            <div class="balance-section">
              <div class="balance-card">
                <span class="balance-label">Saldo Disponível</span>
                <span class="balance-value">R$ {{ formatCurrency(userProfile.balance || 0) }}</span>
              </div>
            </div>
          </section>

          <!-- Stats Bar -->
          <section class="stats-bar glass-panel">
            <div class="stat-block">
              <div class="stat-icon">🎯</div>
              <div class="stat-content">
                <span class="stat-value">{{ stats.totalBets }}</span>
                <span class="stat-label">Total de Apostas</span>
              </div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-block">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <span class="stat-value positive">{{ stats.wonBets }}</span>
                <span class="stat-label">Apostas Ganhas</span>
              </div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-block">
              <div class="stat-icon">💰</div>
              <div class="stat-content">
                <span class="stat-value positive">R$ {{ formatCurrency(stats.totalWon) }}</span>
                <span class="stat-label">Total Ganho</span>
              </div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-block">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <span class="stat-value">{{ stats.winRate }}%</span>
                <span class="stat-label">Taxa de Acerto</span>
              </div>
            </div>
          </section>

          <!-- Account Info & Transactions -->
          <div class="profile-grid">
            <!-- Account Information -->
            <section class="account-section glass-panel">
              <div class="section-header">
                <h3>Informações da Conta</h3>
                <button @click="toggleEditMode" class="edit-btn">
                  {{ editMode ? 'Cancelar' : 'Editar' }}
                </button>
              </div>

              <form v-if="editMode" @submit.prevent="handleUpdateProfile" class="profile-form">
                <label>
                  Nome Completo
                  <input type="text" v-model="editForm.name" required />
                </label>
                <label>
                  Email
                  <input type="email" v-model="editForm.email" required />
                </label>
                <label>
                  CPF
                  <input type="text" v-model="editForm.cpf" placeholder="000.000.000-00" maxlength="14" disabled />
                  <small class="field-hint">CPF não pode ser alterado</small>
                </label>
                <div class="form-actions">
                  <button type="submit" class="save-btn" :disabled="saving">
                    {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
                  </button>
                </div>
                <p v-if="updateError" class="error-message">{{ updateError }}</p>
                <p v-if="updateSuccess" class="success-message">{{ updateSuccess }}</p>
              </form>

              <div v-else class="account-info">
                <div class="info-row">
                  <span class="info-label">Nome Completo</span>
                  <span class="info-value">{{ userProfile.name || 'Não informado' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email</span>
                  <span class="info-value">{{ userProfile.email || 'Não informado' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">CPF</span>
                  <span class="info-value">{{ formatCPF(userProfile.cpf || '') || 'Não informado' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Data de Cadastro</span>
                  <span class="info-value">{{ formatDate(userProfile.createdAt) }}</span>
                </div>
              </div>
            </section>

            <!-- Recent Transactions -->
            <section class="transactions-section glass-panel">
              <div class="section-header">
                <h3>Transações Recentes</h3>
                <RouterLink to="/transactions" class="view-all-link">Ver todas</RouterLink>
              </div>

              <div v-if="transactions.length > 0" class="transactions-list">
                <div
                  v-for="transaction in transactions"
                  :key="transaction.id"
                  class="transaction-item"
                  :class="transaction.type.toLowerCase()"
                >
                  <div class="transaction-icon">
                    <span v-if="transaction.type === 'DEPOSIT'">💰</span>
                    <span v-else-if="transaction.type === 'WITHDRAWAL'">💸</span>
                    <span v-else-if="transaction.type === 'BET'">🎯</span>
                    <span v-else-if="transaction.type === 'WIN'">✅</span>
                  </div>
                  <div class="transaction-details">
                    <span class="transaction-type">{{ getTransactionTypeLabel(transaction.type) }}</span>
                    <span class="transaction-date">{{ formatDateTime(transaction.createdAt) }}</span>
                  </div>
                  <div class="transaction-amount" :class="transaction.type.toLowerCase()">
                    <span v-if="transaction.type === 'DEPOSIT' || transaction.type === 'WIN'">+</span>
                    <span v-else>-</span>
                    R$ {{ formatCurrency(Math.abs(transaction.amount)) }}
                  </div>
                </div>
              </div>

              <div v-else class="empty-transactions">
                <p>Nenhuma transação recente</p>
              </div>
            </section>
          </div>

          <!-- Security Section -->
          <section class="security-section glass-panel">
            <h3>Segurança</h3>
            <div class="security-options">
              <button @click="openChangePasswordModal" class="security-btn">
                <span>🔒</span>
                Alterar Senha
              </button>
              <button @click="handleLogout" class="security-btn logout">
                <span>🚪</span>
                Sair da Conta
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>

    <!-- Change Password Modal (placeholder) -->
    <div v-if="showPasswordModal" class="modal-overlay" @click="closePasswordModal">
      <div class="modal-content glass-panel" @click.stop>
        <div class="modal-header">
          <h3>Alterar Senha</h3>
          <button @click="closePasswordModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <p>Modal de alteração de senha será implementado em breve.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useUserStore } from '@/store/useUserStore';
import { useGameStore } from '@/store/useGameStore';
// @ts-ignore - Vue component with script setup
import AppHeader from '@/components/AppHeader.vue';
// @ts-ignore - Vue component with script setup
import AnimatedBackground from '@/components/AnimatedBackground.vue';
import api from '@/services/api';

const router = useRouter();
const userStore = useUserStore();
const gameStore = useGameStore();

const editMode = ref(false);
const saving = ref(false);
const updateError = ref('');
const updateSuccess = ref('');
const showPasswordModal = ref(false);

const isAuthenticated = computed(() => userStore.isAuthenticated);
const loading = computed(() => userStore.loading);
const userProfile = computed(() => userStore.user || {
  name: '',
  email: '',
  cpf: '',
  balance: 0,
  createdAt: new Date().toISOString(),
});

// Formulário de edição
const editForm = ref({
  name: '',
  email: '',
  cpf: '',
});

// Estatísticas
const stats = computed(() => {
  const allBets = gameStore.bets;
  const wonBets = allBets.filter((bet) => bet.status === 'WON');
  const totalWon = wonBets.reduce((sum, bet) => sum + (bet.returnAmount || 0), 0);
  const winRate = allBets.length > 0 ? (wonBets.length / allBets.length) * 100 : 0;

  return {
    totalBets: allBets.length,
    wonBets: wonBets.length,
    totalWon,
    winRate: Math.round(winRate * 10) / 10,
  };
});

const transactions = computed(() => userStore.transactions);

const userInitial = computed(() => {
  const name = userProfile.value?.name || 'U';
  return name.charAt(0).toUpperCase();
});

const formatCurrency = (value: number) => {
  return value.toFixed(2).replace('.', ',');
};

const formatCPF = (cpf: string) => {
  if (!cpf) return '';
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return cpf;
};

const formatDate = (date: Date | string) => {
  if (!date) return 'Não informado';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatDateTime = (date: Date | string) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getTransactionTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    DEPOSIT: 'Depósito',
    WITHDRAWAL: 'Saque',
    BET: 'Aposta',
    WIN: 'Ganho',
  };
  return labels[type] || type;
};

const toggleEditMode = () => {
  editMode.value = !editMode.value;
  if (editMode.value) {
    const profile = userProfile.value;
    editForm.value = {
      name: profile?.name || '',
      email: profile?.email || '',
      cpf: profile?.cpf || '',
    };
    updateError.value = '';
    updateSuccess.value = '';
  }
};

const handleUpdateProfile = async () => {
  saving.value = true;
  updateError.value = '';
  updateSuccess.value = '';

  try {
    await userStore.updateProfile({
      name: editForm.value.name,
      email: editForm.value.email,
    });
    updateSuccess.value = 'Perfil atualizado com sucesso!';
    setTimeout(() => {
      editMode.value = false;
      updateSuccess.value = '';
    }, 2000);
  } catch (error: any) {
    updateError.value = error.message || 'Erro ao atualizar perfil.';
  } finally {
    saving.value = false;
  }
};


const openChangePasswordModal = () => {
  showPasswordModal.value = true;
};

const closePasswordModal = () => {
  showPasswordModal.value = false;
};

// Auto-format CPF no edit form
watch(
  () => editForm.value.cpf,
  (newValue) => {
    let formattedCpf = newValue.replace(/\D/g, '');
    if (formattedCpf.length > 11) {
      formattedCpf = formattedCpf.slice(0, 11);
    }
    if (formattedCpf.length > 9) {
      formattedCpf = formattedCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (formattedCpf.length > 6) {
      formattedCpf = formattedCpf.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
    } else if (formattedCpf.length > 3) {
      formattedCpf = formattedCpf.replace(/(\d{3})(\d{3})/, '$1.$2');
    }
    editForm.value.cpf = formattedCpf;
  },
);

onMounted(async () => {
  if (userStore.token) {
    await userStore.fetchProfile();
    await userStore.fetchTransactions(10);
    await gameStore.fetchBets();
  }
});

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--gradient-bg), var(--bg-primary);
  color: var(--text-primary);
}

/* Header removido - usando AppHeader component */

/* Main Content */
.profile-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* Auth Required */
.auth-required {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 2rem auto;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.auth-description {
  margin: 0 0 2.5rem 0;
  color: var(--text-secondary);
  font-size: 1.1rem;
  line-height: 1.6;
}

.auth-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta {
  display: inline-block;
  padding: 1rem 2rem;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-primary), #00cc6f);
  color: var(--bg-primary);
  text-decoration: none;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
}

.cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 255, 136, 0.4);
  background: linear-gradient(135deg, #00ff99, var(--accent-primary));
}

.cta.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.cta.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
}

/* Profile Header Card */
.profile-header-card {
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0ef, #933dff);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(14, 255, 224, 0.4);
}

.avatar-initial {
  font-size: 2rem;
  font-weight: 700;
  color: #05080f;
}

.user-info h2 {
  font-size: 1.8rem;
  margin: 0 0 0.5rem 0;
}

.user-email {
  color: var(--text-secondary);
  margin: 0 0 0.25rem 0;
}

.user-cpf {
  color: var(--text-tertiary);
  font-size: 0.85rem;
  margin: 0;
}

.balance-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

.balance-card {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.balance-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
}

.balance-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--accent-primary);
}


/* Stats Bar */
.stats-bar {
  display: flex;
  align-items: center;
  padding: 2rem 2.5rem;
  margin-bottom: 2rem;
  gap: 0;
}

.stat-block {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1.5rem;
}

.stat-block:first-child {
  padding-left: 0;
}

.stat-block:last-child {
  padding-right: 0;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  opacity: 0.9;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--accent-primary);
  margin: 0;
  line-height: 1;
  letter-spacing: -0.02em;
}

.stat-value.positive {
  color: #00ff88;
}

.stat-label {
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  color: var(--text-tertiary);
  margin: 0;
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 60px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(255, 255, 255, 0.15),
    transparent
  );
  flex-shrink: 0;
}

/* Profile Grid */
.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

/* Account Section */
.account-section,
.transactions-section {
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  font-size: 1.3rem;
  margin: 0;
}

.edit-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
}

.edit-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.view-all-link {
  color: var(--accent-primary);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s;
}

.view-all-link:hover {
  color: #933dff;
}

/* Profile Form */
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.profile-form label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.profile-form input {
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
  font-size: 0.9rem;
}

.profile-form input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.field-hint {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.form-actions {
  margin-top: 0.5rem;
}

.save-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 12px;
  background: var(--gradient-primary);
  color: #05080f;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(14, 255, 224, 0.3);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #ff7b9a;
  margin-top: 0.5rem;
  font-size: 0.85rem;
}

.success-message {
  color: #00ff88;
  margin-top: 0.5rem;
  font-size: 0.85rem;
}

/* Account Info */
.account-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 0.85rem;
  color: var(--text-tertiary);
}

.info-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

/* Transactions */
.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.2s;
}

.transaction-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.transaction-icon {
  font-size: 1.5rem;
}

.transaction-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.transaction-type {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.transaction-date {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.transaction-amount {
  font-size: 1.1rem;
  font-weight: 700;
}

.transaction-amount.deposit,
.transaction-amount.win {
  color: #00ff88;
}

.transaction-amount.withdrawal,
.transaction-amount.bet {
  color: #ff7b9a;
}

.empty-transactions {
  text-align: center;
  padding: 2rem;
  color: var(--text-tertiary);
}

/* Security Section */
.security-section {
  padding: 2rem;
}

.security-section h3 {
  font-size: 1.3rem;
  margin: 0 0 1.5rem 0;
}

.security-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.security-btn {
  padding: 1rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s;
  font-size: 0.9rem;
  font-weight: 500;
}

.security-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.security-btn.logout {
  border-color: rgba(255, 123, 154, 0.3);
  color: #ff7b9a;
}

.security-btn.logout:hover {
  background: rgba(255, 123, 154, 0.1);
}

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  max-width: 500px;
  width: 100%;
  padding: 2rem;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  font-size: 1.5rem;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  color: var(--text-secondary);
}


@media (max-width: 768px) {
  .profile-header {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-nav {
    width: 100%;
    justify-content: space-around;
  }

  .profile-main {
    padding: 1rem;
  }

  .profile-header-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .balance-section {
    width: 100%;
    align-items: flex-start;
  }

  .stats-bar {
    flex-direction: column;
    padding: 2rem 1.5rem;
    gap: 1rem;
  }

  .stat-block {
    width: 100%;
    padding: 1rem 0 !important;
    justify-content: flex-start;
  }

  .stat-divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(
      to right,
      transparent,
      rgba(255, 255, 255, 0.15),
      transparent
    );
  }

  .stat-value {
    font-size: 2rem;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
