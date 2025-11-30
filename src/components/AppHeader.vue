<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo Section -->
      <RouterLink to="/home" class="logo-section">
        <img src="/logo.png" alt="ZIKABET Logo" class="logo-image" />
        <div class="logo-text">
          <h1>ZIKABET</h1>
          <p>Casa de apostas • Dota Edition</p>
        </div>
      </RouterLink>

      <!-- Main Navigation (Desktop) -->
      <nav class="main-nav" v-if="!isMobileMenuOpen">
        <RouterLink
          v-for="link in mainNavLinks"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          :class="{ active: isActive(link.to) }"
          v-show="link.requiresAuth ? isAuthenticated : true"
        >
          <span class="nav-icon" v-html="getIcon(link.icon)"></span>
          <span class="nav-text">{{ link.label }}</span>
        </RouterLink>
      </nav>

      <!-- User Actions -->
      <div class="header-actions">
        <!-- Authenticated User -->
        <template v-if="isAuthenticated">
          <!-- Admin Button -->
          <RouterLink
            v-if="userStore.user?.role === 'ADMIN'"
            to="/panel/dashboard"
            class="admin-btn"
          >
            <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
            </svg>
            <span>Admin</span>
          </RouterLink>

          <!-- Balance Display -->
          <div class="balance-display" v-if="userStore.balance !== undefined">
            <span class="balance-label">Saldo</span>
            <span class="balance-value">R$ {{ userStore.balance.toFixed(2) }}</span>
          </div>

          <!-- User Menu -->
          <div class="user-menu-wrapper" ref="userDetailsRef">
            <button 
              class="user-menu-trigger" 
              @click="toggleUserDropdown"
              :class="{ 'active': showUserDropdown }"
            >
              <div class="user-avatar">
                <span class="avatar-initial">{{ getUserInitial }}</span>
              </div>
              <svg 
                class="dropdown-arrow" 
                :class="{ 'open': showUserDropdown }"
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            <!-- User Dropdown -->
            <transition name="dropdown">
              <div v-if="showUserDropdown" class="user-dropdown" @click.stop>
                <div class="dropdown-header">
                  <div class="dropdown-user-info">
                    <div class="dropdown-avatar">
                      <span>{{ getUserInitial }}</span>
                    </div>
                    <div class="dropdown-user-details">
                      <div class="dropdown-user-name">{{ userName }}</div>
                      <div class="dropdown-user-email">{{ userStore.user?.email }}</div>
                    </div>
                  </div>
                </div>
                
                <div class="dropdown-divider"></div>
                
                <div class="dropdown-body">
                  <button class="dropdown-item" @click="handleProfile">
                    <svg class="dropdown-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>Meu Perfil</span>
                    <svg class="dropdown-arrow-right" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                  
                  <button class="dropdown-item" @click="handleDeposit">
                    <svg class="dropdown-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    <span>Depositar</span>
                    <svg class="dropdown-arrow-right" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                  
                  <button class="dropdown-item" @click="handleTransactions">
                    <svg class="dropdown-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="8" y1="6" x2="21" y2="6"></line>
                      <line x1="8" y1="12" x2="21" y2="12"></line>
                      <line x1="8" y1="18" x2="21" y2="18"></line>
                      <line x1="3" y1="6" x2="3.01" y2="6"></line>
                      <line x1="3" y1="12" x2="3.01" y2="12"></line>
                      <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                    <span>Histórico</span>
                    <svg class="dropdown-arrow-right" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
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
        </template>

        <!-- Not Authenticated -->
        <template v-else>
          <div class="auth-buttons">
            <RouterLink to="/login" class="btn-small">
              <span>Entrar</span>
            </RouterLink>
            <RouterLink to="/register" class="btn-small primary">
              <span>Cadastrar</span>
            </RouterLink>
          </div>
        </template>

        <!-- Mobile Menu Toggle -->
        <button 
          class="mobile-menu-toggle" 
          @click="toggleMobileMenu"
          :class="{ 'active': isMobileMenuOpen }"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <transition name="mobile-nav">
      <nav v-if="isMobileMenuOpen" class="mobile-nav">
        <RouterLink
          v-for="link in allNavLinks"
          :key="link.to"
          :to="link.to"
          class="mobile-nav-link"
          :class="{ active: isActive(link.to) }"
          @click="closeMobileMenu"
        >
          <span class="nav-icon" v-html="getIcon(link.icon)"></span>
          <span class="nav-text">{{ link.label }}</span>
        </RouterLink>
      </nav>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useUserStore } from '@/store/useUserStore';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const showUserDropdown = ref(false);
const isMobileMenuOpen = ref(false);
const userDetailsRef = ref<HTMLElement | null>(null);

// Links principais (sempre visíveis no desktop)
const mainNavLinks = [
  { to: '/home', label: 'Home', icon: 'home', requiresAuth: false },
  { to: '/games', label: 'Jogos', icon: 'games', requiresAuth: false },
  { to: '/championship', label: 'Campeonato', icon: 'championship', requiresAuth: false },
  { to: '/bets', label: 'Minhas Apostas', icon: 'bets', requiresAuth: true },
  { to: '/ranking', label: 'Ranking', icon: 'ranking', requiresAuth: false },
];

// Todos os links (para mobile)
const allNavLinks = [
  { to: '/home', label: 'Home', icon: 'home' },
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/games', label: 'Jogos', icon: 'games' },
  { to: '/championship', label: 'Campeonato', icon: 'championship' },
  { to: '/bets', label: 'Minhas Apostas', icon: 'bets' },
  { to: '/ranking', label: 'Ranking', icon: 'ranking' },
  { to: '/profile', label: 'Perfil', icon: 'profile' },
];

const getIcon = (iconName: string) => {
  const icons: Record<string, string> = {
    home: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>`,
    games: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>`,
    championship: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
      <path d="M4 22h16"></path>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>`,
    bets: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>`,
    ranking: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"></line>
      <line x1="18" y1="20" x2="18" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="16"></line>
    </svg>`,
    dashboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>`,
    profile: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>`,
  };
  return icons[iconName] || '';
};

const isAuthenticated = computed(() => userStore.isAuthenticated);
const userName = computed(() => userStore.user?.name || 'Usuário');

const getUserInitial = computed(() => {
  const name = userName.value;
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
});

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/');
};

const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value;
};

const closeUserDropdown = () => {
  showUserDropdown.value = false;
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  if (isMobileMenuOpen.value) {
    showUserDropdown.value = false;
  }
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const handleDeposit = () => {
  closeUserDropdown();
  router.push('/dashboard');
  setTimeout(() => {
    const depositSection = document.querySelector('.wallet-card');
    if (depositSection) {
      depositSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
};

const handleProfile = () => {
  closeUserDropdown();
  router.push('/profile');
};

const handleTransactions = () => {
  closeUserDropdown();
  router.push('/profile');
  setTimeout(() => {
    const transactionsSection = document.querySelector('.transactions-section');
    if (transactionsSection) {
      transactionsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
};


const handleLogout = () => {
  closeUserDropdown();
  userStore.logout();
  router.push('/login');
};

// Fechar dropdown ao clicar fora ou pressionar ESC
const handleClickOutside = (event: MouseEvent) => {
  if (userDetailsRef.value && !userDetailsRef.value.contains(event.target as Node)) {
    showUserDropdown.value = false;
  }
};

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (showUserDropdown.value) {
      showUserDropdown.value = false;
    }
    if (isMobileMenuOpen.value) {
      isMobileMenuOpen.value = false;
    }
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
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(20, 25, 45, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

/* Logo Section */
.logo-section {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  text-decoration: none;
  transition: transform 0.3s;
  flex-shrink: 0;
}

.logo-section:hover {
  transform: translateX(4px);
}

.logo-image {
  width: 44px;
  height: 44px;
  object-fit: contain;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 8px rgba(31, 163, 122, 0.2));
}

.logo-section:hover .logo-image {
  transform: scale(1.1);
  filter: drop-shadow(0 4px 12px rgba(31, 163, 122, 0.4));
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.logo-text h1 {
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--text-logo);
  margin: 0;
  transition: all 0.3s;
}

.logo-section:hover .logo-text h1 {
  color: var(--accent-primary);
  text-shadow: 0 0 20px rgba(31, 163, 122, 0.5);
}

.logo-text p {
  font-size: 0.65rem;
  color: var(--text-tertiary);
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.05em;
}

/* Main Navigation */
.main-nav {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(31, 163, 122, 0.08);
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 10px;
}

.nav-link:hover::before {
  opacity: 1;
}

.nav-link:hover {
  color: var(--accent-primary);
  transform: translateY(-2px);
}

.nav-link.active {
  color: var(--accent-primary);
  background: rgba(31, 163, 122, 0.12);
}

.nav-link.active::before {
  opacity: 1;
  background: rgba(31, 163, 122, 0.15);
}

.nav-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  color: currentColor;
}

.nav-icon svg {
  width: 100%;
  height: 100%;
  stroke: currentColor;
}

.nav-link:hover .nav-icon {
  transform: scale(1.2) rotate(5deg);
  color: var(--accent-primary);
}

.nav-link.active .nav-icon {
  color: var(--accent-primary);
}

.nav-text {
  position: relative;
  z-index: 1;
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

/* Balance Display */
.balance-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 0.5rem 0.75rem;
  background: rgba(31, 163, 122, 0.1);
  border: 1px solid rgba(31, 163, 122, 0.2);
  border-radius: 10px;
  gap: 0.125rem;
}

.balance-label {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.balance-value {
  font-size: 0.95rem;
  color: var(--accent-primary);
  font-weight: 700;
}

/* Admin Button */
.admin-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--gradient-button);
  border: none;
  border-radius: 10px;
  color: var(--gradient-button-text);
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(31, 163, 122, 0.3);
}

.admin-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(31, 163, 122, 0.4);
}

.btn-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.admin-btn:hover .btn-icon {
  transform: rotate(90deg);
}

/* User Menu */
.user-menu-wrapper {
  position: relative;
}

.user-menu-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
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
  background: rgba(255, 255, 255, 0.05);
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

.avatar-initial {
  font-size: 0.85rem;
  font-weight: 700;
  color: #05080f;
  letter-spacing: 0;
  position: relative;
  z-index: 1;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
}

.dropdown-arrow {
  width: 12px;
  height: 12px;
  color: var(--text-secondary);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
  color: var(--accent-primary);
}

/* User Dropdown */
.user-dropdown {
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
  animation: dropdownSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dropdownSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dropdown-header {
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(31, 163, 122, 0.1), rgba(31, 163, 122, 0.05));
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.dropdown-user-info {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.dropdown-avatar {
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

.dropdown-avatar span {
  font-size: 1.1rem;
  font-weight: 700;
  color: #05080f;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
}

.dropdown-user-details {
  flex: 1;
  min-width: 0;
}

.dropdown-user-name {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-user-email {
  color: var(--text-secondary);
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  margin: 0.5rem 0;
}

.dropdown-body {
  padding: 0.5rem;
}

.dropdown-footer {
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.dropdown-item {
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

.dropdown-item::before {
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

.dropdown-item:hover {
  background: rgba(31, 163, 122, 0.12);
  color: var(--accent-primary);
  transform: translateX(4px);
  padding-left: 1.25rem;
}

.dropdown-item:hover::before {
  transform: translateY(-50%) scaleY(1);
  height: 60%;
}

.dropdown-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: currentColor;
  transition: transform 0.25s;
}

.dropdown-item:hover .dropdown-icon {
  transform: scale(1.1);
}

.dropdown-item span {
  flex: 1;
}

.dropdown-arrow-right {
  width: 14px;
  height: 14px;
  color: var(--text-tertiary);
  opacity: 0;
  transition: all 0.25s;
  flex-shrink: 0;
}

.dropdown-item:hover .dropdown-arrow-right {
  opacity: 1;
  transform: translateX(4px);
  color: var(--accent-primary);
}

.dropdown-item.logout {
  color: #ff6b6b;
}

.dropdown-item.logout:hover {
  background: rgba(255, 107, 107, 0.12);
  color: #ff5252;
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
  transform: translateY(-10px) scale(0.96);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.98);
}

/* Auth Buttons */
.auth-buttons {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.btn-small {
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid var(--border-secondary);
  color: var(--text-secondary);
  background: transparent;
}

.btn-small:hover {
  transform: translateY(-2px);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  box-shadow: 0 4px 12px rgba(31, 163, 122, 0.2);
}

.btn-small.primary {
  background: var(--gradient-button);
  color: var(--gradient-button-text);
  border: none;
  box-shadow: 0 4px 12px rgba(31, 163, 122, 0.3);
}

.btn-small.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(31, 163, 122, 0.4);
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  padding: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  justify-content: center;
  align-items: center;
}

.mobile-menu-toggle span {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--text-primary);
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-menu-toggle.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.mobile-menu-toggle.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* Mobile Navigation */
.mobile-nav {
  display: none;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: rgba(20, 25, 45, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.3s;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.875rem;
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  background: rgba(31, 163, 122, 0.12);
  color: var(--accent-primary);
}

.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-nav-enter-from,
.mobile-nav-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 1024px) {
  .main-nav {
    display: none;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .mobile-nav {
    display: flex;
  }

  .balance-display {
    display: none;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 1rem;
    gap: 1rem;
  }

  .logo-text h1 {
    font-size: 1.2rem;
  }

  .logo-text p {
    display: none;
  }

  .logo-image {
    width: 36px;
    height: 36px;
  }

  .header-actions {
    gap: 0.75rem;
  }

  .admin-btn span {
    display: none;
  }

  .user-dropdown {
    min-width: calc(100vw - 2rem);
    right: auto;
    left: 50%;
    transform: translateX(-50%);
  }

  .mobile-nav {
    padding: 1rem;
  }
}
</style>
