<template>
  <header class="admin-header">
    <div class="header-content">
      <!-- Logo Section -->
      <RouterLink to="/panel/dashboard" class="logo-section">
        <div class="logo-dot"></div>
        <div>
          <h1>ZIKABET ADMIN</h1>
          <p>Painel Administrativo</p>
        </div>
      </RouterLink>

      <!-- Navigation Links -->
      <nav class="admin-nav">
        <RouterLink
          v-for="link in adminNavLinks"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          :class="{ active: isActive(link.to) }"
        >
          <span class="nav-icon" v-html="getIcon(link.icon)"></span>
          <span class="nav-text">{{ link.label }}</span>
        </RouterLink>
      </nav>

      <!-- Actions -->
      <div class="header-actions">
        <RouterLink to="/home" class="back-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Voltar ao Site</span>
        </RouterLink>
        
        <div class="user-menu-wrapper" ref="userMenuRef">
          <button 
            class="user-menu-trigger"
            @click="toggleUserMenu"
            :class="{ active: showUserMenu }"
          >
            <div class="user-avatar">
              <span>{{ getUserInitial }}</span>
            </div>
            <div class="user-details">
              <span class="user-name">{{ userStore.user?.name }}</span>
              <span class="user-email">{{ userStore.user?.email }}</span>
            </div>
            <svg 
              class="dropdown-arrow" 
              :class="{ open: showUserMenu }"
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          <transition name="dropdown">
            <div v-if="showUserMenu" class="user-menu-dropdown" @click.stop>
              <div class="dropdown-header">
                <div class="dropdown-user-info">
                  <div class="dropdown-avatar">
                    <span>{{ getUserInitial }}</span>
                  </div>
                  <div class="dropdown-user-details">
                    <div class="dropdown-user-name">{{ userStore.user?.name }}</div>
                    <div class="dropdown-user-email">{{ userStore.user?.email }}</div>
                  </div>
                </div>
              </div>
              
              <div class="dropdown-divider"></div>
              
              <div class="dropdown-body">
                <RouterLink to="/home" class="dropdown-item" @click="closeUserMenu">
                  <svg class="dropdown-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  <span>Voltar ao Site</span>
                  <svg class="dropdown-arrow-right" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </RouterLink>
                
                <RouterLink 
                  v-if="isMasterAdmin" 
                  to="/panel/users" 
                  class="dropdown-item" 
                  @click="closeUserMenu"
                >
                  <svg class="dropdown-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span>Usuários</span>
                  <svg class="dropdown-arrow-right" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </RouterLink>
              </div>
              
              <div class="dropdown-divider"></div>
              
              <div class="dropdown-footer">
                <button class="dropdown-item logout" @click="handleLogout">
                  <svg class="dropdown-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Sair da Conta</span>
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// @ts-ignore - Vue Router module resolution
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useUserStore } from '@/store/useUserStore';
import { computed, ref, onMounted, onUnmounted } from 'vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const showUserMenu = ref(false);
const userMenuRef = ref<HTMLElement | null>(null);

const allAdminNavLinks = [
  { to: '/panel/dashboard', label: 'Dashboard', icon: 'dashboard', permission: 'dashboard' },
  { to: '/panel/teams', label: 'Times', icon: 'teams', permission: 'teams' },
  { to: '/panel/players', label: 'Jogadores', icon: 'players', permission: 'players' },
  { to: '/panel/games', label: 'Jogos', icon: 'games', permission: 'games' },
  { to: '/panel/odds', label: 'Odds', icon: 'odds', permission: 'odds' },
  { to: '/panel/close-game', label: 'Fechar Jogo', icon: 'close', permission: 'close-game' },
  { to: '/panel/championship', label: 'Campeonato', icon: 'championship', permission: 'championship' },
];

const adminNavLinks = computed(() => {
  // Se não for admin, não mostra nada
  if (userStore.user?.role !== 'ADMIN') {
    return [];
  }

  // Se não tem permissões definidas (admin master), mostra tudo
  if (!userStore.user?.adminPermissions || userStore.user.adminPermissions.length === 0) {
    return allAdminNavLinks;
  }

  // Filtra apenas as páginas permitidas
  return allAdminNavLinks.filter(link => 
    userStore.user?.adminPermissions?.includes(link.permission)
  );
});

// Computed para verificar se é admin master e pode ver "Usuários"
const isMasterAdmin = computed(() => {
  return userStore.user?.email?.toLowerCase() === 'admin@zika.games';
});

const getIcon = (iconName: string) => {
  const icons: Record<string, string> = {
    dashboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>`,
    teams: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>`,
    players: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>`,
    games: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>`,
    odds: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="22 6 13.5 15.5 8.5 10.5 2 17"></polyline>
      <polyline points="16 6 22 6 22 12"></polyline>
    </svg>`,
    close: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>`,
    championship: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
      <path d="M4 22h16"></path>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>`,
    users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>`,
  };
  return icons[iconName] || '';
};

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/');
};

const getUserInitial = computed(() => {
  const name = userStore.user?.name || 'A';
  if (!name) return 'A';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
});

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const closeUserMenu = () => {
  showUserMenu.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    showUserMenu.value = false;
  }
};

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showUserMenu.value) {
    showUserMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleEscape);
});

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.admin-header {
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(20, 25, 45, 0.9);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}

.header-content {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}

/* Logo Section */
.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  flex-shrink: 0;
  transition: transform 0.3s;
}

.logo-section:hover {
  transform: translateX(4px);
}

.logo-dot {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--gradient-button);
  box-shadow: 0 0 20px rgba(31, 163, 122, 0.3);
  flex-shrink: 0;
}

.logo-section h1 {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  background: var(--gradient-button);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  line-height: 1.2;
}

.logo-section p {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-weight: 500;
}

/* Navigation Links */
.admin-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
  flex-wrap: wrap;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: var(--accent-primary);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link:hover {
  color: var(--accent-primary);
}

.nav-link:hover::after {
  width: 80%;
}

.nav-link.active {
  color: var(--accent-primary);
}

.nav-link.active::after {
  width: 80%;
}

.nav-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  color: currentColor;
}

.nav-icon svg {
  width: 100%;
  height: 100%;
  stroke: currentColor;
}

.nav-link:hover .nav-icon {
  transform: scale(1.15);
  color: var(--accent-primary);
}

.nav-link.active .nav-icon {
  color: var(--accent-primary);
}

.nav-text {
  font-size: 0.875rem;
  font-weight: 600;
}

/* Dropdown Transition */
.dropdown-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px) scale(0.96);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-5px) scale(0.98);
}

/* User Menu Dropdown Transition - específico para alinhamento à direita */
.user-menu-wrapper .dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.96);
}

.user-menu-wrapper .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.98);
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(31, 163, 122, 0.3);
  color: var(--accent-primary);
  transform: translateY(-2px);
}

.back-btn svg {
  transition: transform 0.3s;
}

.back-btn:hover svg {
  transform: translateX(-2px);
}

/* User Menu */
.user-menu-wrapper {
  position: relative;
}

.user-menu-trigger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.user-menu-trigger::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(31, 163, 122, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.user-menu-trigger:hover::before,
.user-menu-trigger.active::before {
  opacity: 1;
}

.user-menu-trigger:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(31, 163, 122, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(31, 163, 122, 0.15);
}

.user-menu-trigger.active {
  background: rgba(31, 163, 122, 0.1);
  border-color: rgba(31, 163, 122, 0.4);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--accent-primary), #00cc6f);
  border: 1px solid rgba(31, 163, 122, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 4px 12px rgba(31, 163, 122, 0.25),
    0 0 0 1px rgba(31, 163, 122, 0.1) inset;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.user-menu-trigger:hover .user-avatar {
  transform: scale(1.05);
  box-shadow: 
    0 6px 20px rgba(31, 163, 122, 0.35),
    0 0 0 1px rgba(31, 163, 122, 0.2) inset;
}

.user-menu-trigger:hover .user-avatar::before {
  opacity: 1;
}

.user-avatar span {
  font-size: 0.85rem;
  font-weight: 700;
  color: #05080f;
  letter-spacing: 0;
  position: relative;
  z-index: 1;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  text-align: left;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.2;
}

.user-email {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.2;
}

.user-menu-trigger .dropdown-arrow {
  width: 14px;
  height: 14px;
  color: rgba(255, 255, 255, 0.6);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.user-menu-trigger .dropdown-arrow.open {
  transform: rotate(180deg);
  color: var(--accent-primary);
}

/* User Menu Dropdown */
.user-menu-dropdown {
  position: absolute;
  top: calc(100% + 0.75rem);
  right: 0;
  min-width: 280px;
  background: rgba(20, 25, 45, 0.95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  z-index: 1001;
  overflow: hidden;
}

.user-menu-dropdown .dropdown-header {
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(31, 163, 122, 0.1), rgba(31, 163, 122, 0.05));
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.user-menu-dropdown .dropdown-user-info {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.user-menu-dropdown .dropdown-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-primary), #00cc6f);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(31, 163, 122, 0.3);
  flex-shrink: 0;
}

.user-menu-dropdown .dropdown-avatar span {
  font-size: 1.1rem;
  font-weight: 700;
  color: #05080f;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
}

.user-menu-dropdown .dropdown-user-details {
  flex: 1;
  min-width: 0;
}

.user-menu-dropdown .dropdown-user-name {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu-dropdown .dropdown-user-email {
  color: var(--text-secondary);
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu-dropdown .dropdown-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  margin: 0.5rem 0;
}

.user-menu-dropdown .dropdown-body {
  padding: 0.5rem;
}

.user-menu-dropdown .dropdown-footer {
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.user-menu-dropdown .dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  color: var(--text-primary);
  text-decoration: none;
  border: none;
  background: transparent;
  border-radius: 10px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  text-align: left;
  position: relative;
  overflow: hidden;
}

.user-menu-dropdown .dropdown-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 3px;
  height: 0;
  background: var(--accent-primary);
  border-radius: 0 2px 2px 0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-menu-dropdown .dropdown-item:hover {
  background: rgba(31, 163, 122, 0.12);
  color: var(--accent-primary);
  transform: translateX(4px);
  padding-left: 1.25rem;
}

.user-menu-dropdown .dropdown-item:hover::before {
  transform: translateY(-50%) scaleY(1);
  height: 60%;
}

.user-menu-dropdown .dropdown-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: currentColor;
  transition: transform 0.25s;
}

.user-menu-dropdown .dropdown-item:hover .dropdown-icon {
  transform: scale(1.1);
}

.user-menu-dropdown .dropdown-item span {
  flex: 1;
}

.user-menu-dropdown .dropdown-arrow-right {
  width: 14px;
  height: 14px;
  color: var(--text-tertiary);
  opacity: 0;
  transition: all 0.25s;
  flex-shrink: 0;
}

.user-menu-dropdown .dropdown-item:hover .dropdown-arrow-right {
  opacity: 1;
  transform: translateX(4px);
  color: var(--accent-primary);
}

.user-menu-dropdown .dropdown-item.logout {
  color: #ff6b6b;
}

.user-menu-dropdown .dropdown-item.logout:hover {
  background: rgba(255, 107, 107, 0.12);
  color: #ff5252;
}

/* Responsive */
@media (max-width: 1200px) {
  .header-content {
    gap: 1.5rem;
  }

  .admin-nav {
    order: 3;
    width: 100%;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .admin-header {
    padding: 1rem;
  }

  .header-content {
    gap: 1rem;
  }

  .logo-section h1 {
    font-size: 1.1rem;
  }

  .logo-section p {
    display: none;
  }

  .logo-dot {
    width: 32px;
    height: 32px;
  }

  .admin-nav {
    gap: 0.375rem;
  }

  .nav-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }

  .nav-text {
    display: none;
  }

  .user-details {
    display: none;
  }

  .back-btn span {
    display: none;
  }

  .user-menu-dropdown {
    min-width: calc(100vw - 2rem);
    right: auto;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>

