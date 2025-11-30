import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/store/useUserStore';
import Loading from '@/views/Loading.vue';
import Home from '@/views/Home.vue';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import ForgotPassword from '@/views/ForgotPassword.vue';
import Dashboard from '@/views/Dashboard.vue';
import Games from '@/views/Games.vue';
import Bets from '@/views/Bets.vue';
import Ranking from '@/views/Ranking.vue';
import Profile from '@/views/Profile.vue';
import AdminLogin from '@/views/admin/AdminLogin.vue';
import AdminDashboard from '@/views/admin/AdminDashboard.vue';
import ManagePlayers from '@/views/admin/ManagePlayers.vue';
import ManageTeams from '@/views/admin/ManageTeams.vue';
import ManageGames from '@/views/admin/ManageGames.vue';
import ManageOdds from '@/views/admin/ManageOdds.vue';
import CloseGame from '@/views/admin/CloseGame.vue';
import Championship from '@/views/Championship.vue';
import ManageChampionship from '@/views/admin/ManageChampionship.vue';
import ManageUsers from '@/views/admin/ManageUsers.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'loading',
      component: Loading,
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPassword,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/games',
      name: 'games',
      component: Games,
    },
    {
      path: '/bets',
      name: 'bets',
      component: Bets,
    },
    {
      path: '/ranking',
      name: 'ranking',
      component: Ranking,
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
    },
    {
      path: '/panel/login',
      name: 'admin-login',
      component: AdminLogin,
    },
    {
      path: '/panel/dashboard',
      name: 'admin-dashboard',
      component: AdminDashboard,
    },
    {
      path: '/panel/players',
      name: 'admin-players',
      component: ManagePlayers,
    },
    {
      path: '/panel/teams',
      name: 'admin-teams',
      component: ManageTeams,
    },
    {
      path: '/panel/games',
      name: 'admin-games',
      component: ManageGames,
    },
    {
      path: '/panel/odds',
      name: 'admin-odds',
      component: ManageOdds,
    },
    {
      path: '/panel/close-game',
      name: 'admin-close-game',
      component: CloseGame,
    },
    {
      path: '/championship',
      name: 'championship',
      component: Championship,
    },
    {
      path: '/panel/championship',
      name: 'admin-championship',
      component: ManageChampionship,
    },
    {
      path: '/panel/users',
      name: 'admin-users',
      component: ManageUsers,
    },
  ],
});

// Rotas públicas que não precisam de autenticação
const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/panel/login'];

// Guard de navegação para verificar autenticação
router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore();
  
  // Verificar se a rota é pública
  const isPublicRoute = publicRoutes.includes(to.path);
  
  // Se há token mas não há usuário, tenta restaurar o perfil
  if (userStore.token && !userStore.user) {
    try {
      await userStore.fetchProfile();
    } catch (error) {
      // Se falhar, o token pode estar inválido - limpa o token
      console.error('Erro ao restaurar perfil:', error);
      userStore.logout();
    }
  }
  
  // Verificar se o usuário está autenticado
  const isAuthenticated = userStore.isAuthenticated;
  
  // Se a rota não é pública e o usuário não está autenticado, redirecionar para login
  if (!isPublicRoute && !isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } });
    return;
  }
  
  // Se o usuário está autenticado e tenta acessar login ou register, redirecionar para home
  if (isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    next({ path: '/home' });
    return;
  }

  // Proteção para rota de gerenciamento de usuários (apenas admin master)
  if (to.path === '/panel/users') {
    if (!isAuthenticated || userStore.user?.role !== 'ADMIN') {
      next({ path: '/panel/login' });
      return;
    }

    // Verificar se é admin master (admin@zika.games)
    const isMasterAdmin = userStore.user?.email?.toLowerCase() === 'admin@zika.games';
    
    if (!isMasterAdmin) {
      next({ path: '/panel/dashboard' });
      return;
    }
  }
  
  next();
});

export default router;

