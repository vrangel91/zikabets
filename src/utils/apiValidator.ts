/**
 * Sistema de validação de rotas da API
 * Garante que apenas rotas válidas sejam chamadas
 */

// Mapeamento completo de todas as rotas do backend
export const BACKEND_ROUTES = {
  // Auth
  auth: {
    register: { method: 'POST', path: '/auth/register' },
    login: { method: 'POST', path: '/auth/login' },
  },
  // Users
  users: {
    me: { method: 'GET', path: '/users/me' },
    update: { method: 'PATCH', path: '/users/me' },
  },
  // Wallet
  wallet: {
    transactions: { method: 'GET', path: '/wallet/transactions' },
    depositPix: { method: 'POST', path: '/wallet/deposit/pix' },
    balance: { method: 'GET', path: '/wallet/balance' },
    paymentStatus: { method: 'GET', path: '/wallet/payment/:id/status' },
  },
  // Games
  games: {
    list: { method: 'GET', path: '/games' },
    get: { method: 'GET', path: '/games/:id' },
    ranking: { method: 'GET', path: '/games/ranking' },
    stats: { method: 'GET', path: '/games/stats' },
  },
  // Bets
  bets: {
    list: { method: 'GET', path: '/bets' },
    create: { method: 'POST', path: '/bets' },
    ranking: { method: 'GET', path: '/bets/ranking' },
  },
  // Admin - Teams
  adminTeams: {
    list: { method: 'GET', path: '/m/teams' },
    create: { method: 'POST', path: '/m/teams' },
    update: { method: 'PUT', path: '/m/teams/:id' },
    delete: { method: 'DELETE', path: '/m/teams/:id' },
    get: { method: 'GET', path: '/m/teams/:id' },
  },
  // Admin - Players
  adminPlayers: {
    list: { method: 'GET', path: '/m/players' },
    create: { method: 'POST', path: '/m/players' },
    update: { method: 'PATCH', path: '/m/players/:id' },
    delete: { method: 'DELETE', path: '/m/players/:id' },
  },
  // Admin - Games
  adminGames: {
    create: { method: 'POST', path: '/m/games' },
    update: { method: 'PUT', path: '/m/games/:id' },
    delete: { method: 'DELETE', path: '/m/games/:id' },
    updateOdds: { method: 'PATCH', path: '/m/games/:id/odds' },
    close: { method: 'POST', path: '/m/games/:id/close' },
  },
  // Admin - Users
  adminUsers: {
    list: { method: 'GET', path: '/m/users' },
  },
  // Admin - Bets
  adminBets: {
    list: { method: 'GET', path: '/m/bets' },
  },
} as const;

/**
 * Valida se uma rota existe no backend
 */
export function validateRoute(url: string, method: string): boolean {
  const cleanUrl = url.split('?')[0]; // Remove query string
  const methodUpper = method.toUpperCase();

  // Normalizar URL (garantir que comece com /)
  const normalizedUrl = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;

  // Verificar rotas exatas
  for (const category of Object.values(BACKEND_ROUTES)) {
    for (const route of Object.values(category)) {
      if (route.method === methodUpper) {
        // Verificar rota exata
        if (route.path === normalizedUrl) {
          return true;
        }
        // Verificar rota com parâmetro (ex: /games/:id)
        const routePattern = route.path.replace(/:[^/]+/g, '[^/]+');
        const regex = new RegExp(`^${routePattern}$`);
        if (regex.test(normalizedUrl)) {
          return true;
        }
      }
    }
  }

  // Rotas especiais
  if (normalizedUrl === '/health' && methodUpper === 'GET') {
    return true;
  }
  if (normalizedUrl === '/x' && (methodUpper === 'GET' || methodUpper === 'POST')) {
    return true; // Proxy endpoint
  }

  // Em desenvolvimento, log para debug
  if (import.meta.env.DEV) {
    console.warn('[API Validator] Rota não encontrada:', {
      originalUrl: url,
      cleanUrl,
      normalizedUrl,
      method: methodUpper,
      availableRoutes: Object.values(BACKEND_ROUTES).flatMap(cat => 
        Object.values(cat).map(r => `${r.method} ${r.path}`)
      ),
    });
  }

  return false;
}

/**
 * Obtém informações sobre uma rota
 */
export function getRouteInfo(url: string, method: string): { exists: boolean; route?: typeof BACKEND_ROUTES[keyof typeof BACKEND_ROUTES][keyof typeof BACKEND_ROUTES[keyof typeof BACKEND_ROUTES]] } {
  const cleanUrl = url.split('?')[0];
  const methodUpper = method.toUpperCase();

  for (const category of Object.values(BACKEND_ROUTES)) {
    for (const route of Object.values(category)) {
      if (route.method === methodUpper) {
        if (route.path === cleanUrl) {
          return { exists: true, route };
        }
        const routePattern = route.path.replace(/:[^/]+/g, '[^/]+');
        const regex = new RegExp(`^${routePattern}$`);
        if (regex.test(cleanUrl)) {
          return { exists: true, route };
        }
      }
    }
  }

  return { exists: false };
}

/**
 * Verifica se o backend está ativo
 */
export async function checkBackendHealth(baseURL: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseURL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000), // 3 segundos de timeout
    });
    return response.ok;
  } catch (error) {
    console.warn('[API Validator] Backend health check failed:', error);
    return false;
  }
}

