import axios from 'axios';
import { PROXY_ENDPOINT, getRouteCode } from '@/utils/apiProxy';
import { validateRoute, checkBackendHealth } from '@/utils/apiValidator';

// Configuração da base URL do backend
const getBackendURL = (): string => {
  const envURL = import.meta.env.VITE_API_URL;
  if (envURL) {
    return envURL;
  }
  // Porta padrão do backend
  // Frontend: 5173 (Vite)
  // Backend: 3333 (Fastify)
  return 'http://localhost:3333';
};

const api = axios.create({
  baseURL: getBackendURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// Cache para verificação de saúde do backend
let backendHealthCache: { isHealthy: boolean; lastCheck: number } = {
  isHealthy: true,
  lastCheck: 0,
};

const HEALTH_CHECK_INTERVAL = 30000; // Verificar a cada 30 segundos

// Verificar saúde do backend periodicamente
async function verifyBackendHealth(): Promise<boolean> {
  const now = Date.now();
  if (now - backendHealthCache.lastCheck < HEALTH_CHECK_INTERVAL) {
    return backendHealthCache.isHealthy;
  }

  try {
    const baseURL = api.defaults.baseURL || getBackendURL();
    const isHealthy = await checkBackendHealth(baseURL);
    backendHealthCache = {
      isHealthy,
      lastCheck: now,
    };
    return isHealthy;
  } catch (error) {
    backendHealthCache = {
      isHealthy: false,
      lastCheck: now,
    };
    return false;
  }
}

// Interceptor para validar e processar requisições
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Garantir que baseURL está correta
  const backendURL = getBackendURL();
  if (api.defaults.baseURL !== backendURL) {
    api.defaults.baseURL = backendURL;
  }

  const originalMethod = config.method?.toUpperCase() || 'GET';
  const originalUrl = config.url || '';

  // Validar se a rota existe no backend (apenas em produção ou quando habilitado)
  // Em desenvolvimento, permitir todas as rotas para facilitar debug
  const shouldValidate = import.meta.env.PROD || import.meta.env.VITE_VALIDATE_ROUTES === 'true';
  if (shouldValidate && !validateRoute(originalUrl, originalMethod)) {
    console.error('[API] Rota inválida:', {
      url: originalUrl,
      method: originalMethod,
      baseURL: api.defaults.baseURL,
    });
    throw new Error(`Rota inválida: ${originalMethod} ${originalUrl}`);
  }

  // Verificar se o backend está ativo (apenas em dev para não impactar performance)
  if (import.meta.env.DEV) {
    const isHealthy = await verifyBackendHealth();
    if (!isHealthy) {
      const baseURL = api.defaults.baseURL || getBackendURL();
      console.warn('[API] Backend pode não estar disponível:', baseURL);
    }
  }

  // Usar proxy apenas em produção ou quando explicitamente habilitado
  // Em desenvolvimento, usar rotas diretas para facilitar debug
  const useProxy = import.meta.env.PROD || import.meta.env.VITE_USE_PROXY === 'true';
  
  if (useProxy) {
    // Extrair método e URL original
    const originalMethod = config.method?.toUpperCase() || 'GET';
    const originalUrl = config.url || '';
    
    // Extrair parâmetros da query string
    const params: Record<string, any> = {};
    if (config.params) {
      Object.assign(params, config.params);
    }
    if (originalUrl.includes('?')) {
      const urlObj = new URL(originalUrl, 'http://dummy');
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });
    }
    
    // Criar código da rota baseado na URL
    // Mapear URL para código
    let routeKey = '';
    const cleanUrl = originalUrl.split('?')[0]; // Remove query string
    
    if (cleanUrl === '/auth/register') routeKey = 'AUTH_REG';
    else if (cleanUrl === '/auth/login') routeKey = 'AUTH_LOG';
    else if (cleanUrl === '/users/me' && originalMethod === 'GET') routeKey = 'USER_ME';
    else if (cleanUrl === '/users/me' && originalMethod === 'PATCH') routeKey = 'USER_UPD';
    else if (cleanUrl === '/wallet/transactions') routeKey = 'WALL_TXN';
    else if (cleanUrl === '/wallet/balance') routeKey = 'WALL_BAL';
    else if (cleanUrl === '/games/stats') routeKey = 'GAME_STATS';
    else if (cleanUrl === '/games/ranking') routeKey = 'GAME_RANK';
    else if (cleanUrl.match(/^\/games\/[^/]+$/)) routeKey = 'GAME_GET';
    else if (cleanUrl === '/games') routeKey = 'GAME_LIST';
    else if (cleanUrl === '/bets/ranking') routeKey = 'BET_RANKING';
    else if (cleanUrl === '/bets' && originalMethod === 'POST') routeKey = 'BET_CREATE';
    else if (cleanUrl === '/bets') routeKey = 'BET_LIST';
    else if (cleanUrl.match(/^\/m\/teams\/[^/]+$/) && originalMethod === 'GET') routeKey = 'ADM_TEAM_GET';
    else if (cleanUrl.match(/^\/m\/teams\/[^/]+$/) && originalMethod === 'PUT') routeKey = 'ADM_TEAM_UPDATE';
    else if (cleanUrl.match(/^\/m\/teams\/[^/]+$/) && originalMethod === 'DELETE') routeKey = 'ADM_TEAM_DELETE';
    else if (cleanUrl === '/m/teams' && originalMethod === 'POST') routeKey = 'ADM_TEAM_CREATE';
    else if (cleanUrl === '/m/teams') routeKey = 'ADM_TEAM_LIST';
    else if (cleanUrl.match(/^\/m\/players\/[^/]+$/) && originalMethod === 'PATCH') routeKey = 'ADM_PLAY_UPDATE';
    else if (cleanUrl.match(/^\/m\/players\/[^/]+$/) && originalMethod === 'DELETE') routeKey = 'ADM_PLAY_DELETE';
    else if (cleanUrl === '/m/players' && originalMethod === 'POST') routeKey = 'ADM_PLAY_CREATE';
    else if (cleanUrl === '/m/players') routeKey = 'ADM_PLAY_LIST';
    else if (cleanUrl === '/m/users') routeKey = 'ADM_USER_LIST';
    else if (cleanUrl === '/m/bets') routeKey = 'ADM_BET_LIST';
    else if (cleanUrl.match(/^\/m\/games\/[^/]+\/odds$/)) routeKey = 'ADM_GAME_ODDS';
    else if (cleanUrl.match(/^\/m\/games\/[^/]+\/close$/)) routeKey = 'ADM_GAME_CLOSE';
    else if (cleanUrl.match(/^\/m\/games\/[^/]+$/) && originalMethod === 'PUT') routeKey = 'ADM_GAME_UPDATE';
    else if (cleanUrl.match(/^\/m\/games\/[^/]+$/) && originalMethod === 'DELETE') routeKey = 'ADM_GAME_DELETE';
    else if (cleanUrl === '/m/games' && originalMethod === 'POST') routeKey = 'ADM_GAME_CREATE';
    
    if (!routeKey) {
      // Se não encontrou, usar rota original (fallback)
      return config;
    }
    
    const routeCode = getRouteCode(routeKey);
    
    // Extrair ID da URL se houver
    // Para rotas com path adicional (ex: /m/games/:id/close), extrair o ID antes do último segmento
    let resourceId: string | undefined = undefined;
    
    // Rotas que precisam de ID extraído antes do último segmento
    const routesWithSubPath = ['ADM_GAME_ODDS', 'ADM_GAME_CLOSE'];
    
    if (routesWithSubPath.includes(routeKey)) {
      // Para /m/games/:id/close ou /m/games/:id/odds, extrair o ID do meio
      const match = cleanUrl.match(/\/m\/games\/([^/]+)\/(close|odds)$/);
      if (match && match[1]) {
        resourceId = match[1];
      } else {
        // Fallback: tentar extrair de outra forma
        const parts = cleanUrl.split('/');
        const gamesIndex = parts.indexOf('games');
        if (gamesIndex >= 0 && parts[gamesIndex + 1]) {
          resourceId = parts[gamesIndex + 1];
        }
      }
    } else {
      // Para outras rotas, extrair do final
      const idMatch = cleanUrl.match(/\/([a-f0-9-]{36}|[a-zA-Z0-9_-]+)$/);
      if (idMatch && !cleanUrl.includes('/ranking') && !cleanUrl.includes('/transactions') && !cleanUrl.includes('/deposit')) {
        resourceId = idMatch[1];
      }
    }
    
    // Converter para POST no proxy
    config.method = 'POST';
    config.url = PROXY_ENDPOINT;
    
    const proxyData = {
      c: routeCode, // código da rota
      m: originalMethod.toLowerCase(), // método original
      p: params, // parâmetros da query
      d: config.data || {}, // dados do body
      i: resourceId, // ID do recurso se houver
    };
    
    config.data = proxyData;
    
    // Remover params da URL
    config.params = undefined;
  }

  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Erro de conexão (backend não disponível)
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      const baseURL = api.defaults.baseURL || getBackendURL();
      console.error('[API] Erro de conexão com o backend:', {
        baseURL,
        error: error.message,
      });
      
      // Marcar backend como não saudável
      backendHealthCache = {
        isHealthy: false,
        lastCheck: Date.now(),
      };

      // Se estava usando proxy e falhou, tentar rota direta (apenas em dev)
      if (import.meta.env.DEV && error.config?.url === PROXY_ENDPOINT) {
        console.warn('[API] Proxy falhou, tentando rota direta...');
        // Retornar erro para que o componente possa tratar
      }
    }

    // Erro 404 - Rota não encontrada
    if (error.response?.status === 404) {
      const baseURL = api.defaults.baseURL || getBackendURL();
      console.error('[API] Rota não encontrada (404):', {
        url: error.config?.url,
        method: error.config?.method,
        baseURL,
        response: error.response?.data,
      });

      // Se foi uma requisição ao proxy, pode ser que a rota não exista no backend
      if (error.config?.url === PROXY_ENDPOINT) {
        const proxyData = error.config?.data;
        if (proxyData?.c) {
          console.error('[API] Código de rota do proxy não encontrado:', proxyData.c);
        }
      }
    }

    // Erro 401 - Não autorizado
    if (error.response?.status === 401) {
      // Remove token e limpa store
      localStorage.removeItem('token');
      // Importa dinamicamente para evitar dependência circular
      import('@/store/useUserStore').then(({ useUserStore }) => {
        const userStore = useUserStore();
        userStore.logout();
      });
      
      // Só redireciona se não estiver já na página de login
      if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/panel/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default api;

