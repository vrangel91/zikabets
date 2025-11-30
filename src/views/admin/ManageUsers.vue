<template>
  <div class="manage-users">
    <AdminHeader />
    <main class="admin-main">
      <div class="page-header">
        <h2>Gerenciar Usuários</h2>
        <p>Gerencie permissões de administradores e defina quais páginas cada admin pode acessar</p>
      </div>

      <div v-if="loading && users.length === 0" class="loading glass-panel">
        <p>Carregando usuários...</p>
      </div>

      <div v-else-if="users.length === 0" class="empty-state glass-panel">
        <p>Nenhum usuário encontrado.</p>
      </div>

      <div v-else class="users-list">
        <div v-for="user in users" :key="user.id" class="user-card glass-panel">
          <div class="user-header">
            <div class="user-info">
              <div class="user-avatar">
                <span>{{ getUserInitial(user.name) }}</span>
              </div>
              <div class="user-details">
                <h3>{{ user.name }}</h3>
                <p class="user-email">{{ user.email }}</p>
                <p class="user-balance">Saldo: R$ {{ user.balance.toFixed(2) }}</p>
              </div>
            </div>
            <div class="user-role-badge" :class="{ admin: user.role === 'ADMIN' }">
              {{ user.role === 'ADMIN' ? 'ADMIN' : 'USUÁRIO' }}
            </div>
          </div>

          <div class="user-actions">
            <div class="role-selector">
              <label>
                <span class="label-text">Tipo de Usuário:</span>
                <select v-model="user.role" @change="updateUserRole(user)" class="role-select">
                  <option value="USER">Usuário</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </label>
            </div>

            <div v-if="user.role === 'ADMIN'" class="permissions-section">
              <label class="permissions-label">
                <span class="label-text">Permissões de Acesso:</span>
                <span class="info-icon" data-tooltip="Marque as páginas que este administrador poderá acessar no painel admin">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </span>
              </label>
              <div class="permissions-grid">
                <label
                  v-for="permission in availablePermissions"
                  :key="permission.key"
                  class="permission-checkbox"
                >
                  <input
                    type="checkbox"
                    :value="permission.key"
                    v-model="user.adminPermissions"
                    @change="updateUserPermissions(user)"
                  />
                  <span class="checkbox-label">
                    <span class="permission-icon" v-html="getPermissionIcon(permission.key)"></span>
                    <span>{{ permission.label }}</span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <AdminFooter />
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Vue module resolution
import { ref, onMounted } from 'vue';
// @ts-ignore - Vue Router module resolution
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/useUserStore';
import api from '@/services/api';
// @ts-ignore - Vue component with script setup
import AdminHeader from '@/components/AdminHeader.vue';
// @ts-ignore - Vue component with script setup
import AdminFooter from '@/components/AdminFooter.vue';

interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  role: 'USER' | 'ADMIN';
  adminPermissions: string[] | null;
}

const router = useRouter();
const userStore = useUserStore();

const users = ref<User[]>([]);
const loading = ref(false);

const availablePermissions = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'teams', label: 'Times' },
  { key: 'players', label: 'Jogadores' },
  { key: 'games', label: 'Jogos' },
  { key: 'odds', label: 'Odds' },
  { key: 'close-game', label: 'Fechar Jogo' },
  { key: 'championship', label: 'Campeonato' },
  { key: 'users', label: 'Usuários' },
];

const getPermissionIcon = (key: string) => {
  const icons: Record<string, string> = {
    dashboard: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>`,
    teams: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>`,
    players: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>`,
    games: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>`,
    odds: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="22 6 13.5 15.5 8.5 10.5 2 17"></polyline>
      <polyline points="16 6 22 6 22 12"></polyline>
    </svg>`,
    'close-game': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>`,
    championship: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
      <path d="M4 22h16"></path>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>`,
    users: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>`,
  };
  return icons[key] || '';
};

const getUserInitial = (name: string) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const loadUsers = async () => {
  try {
    loading.value = true;
    const response = await api.get('/m/users');
    // adminPermissions já vem parseado do backend como array ou null
    users.value = response.data.users.map((user: any) => ({
      ...user,
      adminPermissions: user.adminPermissions || [],
    }));
  } catch (error: any) {
    console.error('Erro ao carregar usuários:', error);
    const errorMessage = error.response?.data?.error || 'Erro ao carregar usuários';
    alert(errorMessage);
    // Se for erro 403, redirecionar para dashboard
    if (error.response?.status === 403) {
      router.push('/panel/dashboard');
    }
  } finally {
    loading.value = false;
  }
};

const updateUserRole = async (user: User) => {
  try {
    const payload: any = {
      role: user.role,
    };

    // Se for ADMIN, enviar permissões (pode ser array vazio ou null)
    if (user.role === 'ADMIN') {
      payload.adminPermissions = user.adminPermissions && user.adminPermissions.length > 0 
        ? user.adminPermissions 
        : [];
    }
    // Se for USER, não enviar adminPermissions (backend vai definir como null)

    const response = await api.put(`/m/users/${user.id}/role`, payload);

    const updatedUser = response.data.user;
    const index = users.value.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      users.value[index] = {
        ...updatedUser,
        // adminPermissions já vem parseado do backend
        adminPermissions: updatedUser.adminPermissions || [],
      };
    }
  } catch (error: any) {
    console.error('Erro ao atualizar role do usuário:', error);
    const errorMessage = error.response?.data?.error || error.response?.data?.details || 'Erro ao atualizar role do usuário';
    alert(errorMessage);
    // Recarregar para reverter mudanças
    await loadUsers();
  }
};

const updateUserPermissions = async (user: User) => {
  if (user.role !== 'ADMIN') return;

  try {
    const response = await api.put(`/m/users/${user.id}/role`, {
      role: user.role,
      adminPermissions: user.adminPermissions || [],
    });

    const updatedUser = response.data.user;
    const index = users.value.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      users.value[index] = {
        ...updatedUser,
        // adminPermissions já vem parseado do backend
        adminPermissions: updatedUser.adminPermissions || [],
      };
    }
  } catch (error: any) {
    console.error('Erro ao atualizar permissões:', error);
    alert(error.response?.data?.error || 'Erro ao atualizar permissões');
    // Recarregar para reverter mudanças
    await loadUsers();
  }
};

onMounted(async () => {
  if (!userStore.isAuthenticated || userStore.user?.role !== 'ADMIN') {
    router.push('/panel/login');
    return;
  }

  // Verificar se é admin master (admin@zika.games)
  const isMasterAdmin = userStore.user?.email?.toLowerCase() === 'admin@zika.games';
  
  if (!isMasterAdmin) {
    alert('Acesso negado: apenas o administrador master pode gerenciar usuários');
    router.push('/panel/dashboard');
    return;
  }

  // Aguardar um pouco para garantir que o store está atualizado
  await new Promise(resolve => setTimeout(resolve, 100));
  
  loadUsers();
});
</script>

<style scoped>
.manage-users {
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

.loading,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.5);
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.user-card {
  padding: 1.5rem;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-primary), #00cc6f);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #05080f;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
}

.user-details h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.user-email {
  margin: 0 0 0.5rem 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.user-balance {
  margin: 0;
  color: var(--accent-primary);
  font-weight: 600;
  font-size: 0.95rem;
}

.user-role-badge {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.user-role-badge.admin {
  background: rgba(31, 163, 122, 0.2);
  color: var(--accent-primary);
  border: 1px solid rgba(31, 163, 122, 0.3);
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.role-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label-text {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.role-select {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.role-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.08);
}

.permissions-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.permissions-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.permission-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.permission-checkbox:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(31, 163, 122, 0.3);
}

.permission-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--accent-primary);
}

.permission-checkbox input[type="checkbox"]:checked + .checkbox-label {
  color: var(--accent-primary);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  font-weight: 500;
}

.permission-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: currentColor;
}

.permission-icon svg {
  width: 100%;
  height: 100%;
  stroke: currentColor;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: rgba(31, 163, 122, 0.7);
  cursor: help;
  position: relative;
  transition: all 0.2s;
  flex-shrink: 0;
}

.info-icon svg {
  width: 100%;
  height: 100%;
  stroke: currentColor;
}

.info-icon:hover {
  color: var(--accent-primary);
  transform: scale(1.15);
}

.info-icon[data-tooltip]::before {
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

.info-icon[data-tooltip]:hover::before {
  opacity: 1;
  transform: translateX(-50%) translateY(-12px);
  pointer-events: auto;
}

.info-icon[data-tooltip]::after {
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

.info-icon[data-tooltip]:hover::after {
  opacity: 1;
  transform: translateX(-50%) translateY(-8px);
}

@media (max-width: 768px) {
  .permissions-grid {
    grid-template-columns: 1fr;
  }

  .user-header {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>

