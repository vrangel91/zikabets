// Sistema de proxy único para esconder rotas na aba Network do DevTools
// Todas as requisições passam por um único endpoint genérico

// Códigos de rota ofuscados (hash simples)
const routeCodes: Record<string, string> = {
  // Auth
  'AUTH_REG': 'a1b2c3',
  'AUTH_LOG': 'd4e5f6',
  
  // Users
  'USER_ME': 'g7h8i9',
  'USER_UPD': 'j0k1l2',
  
  // Wallet
  'WALL_TXN': 'm3n4o5',
  'WALL_BAL': 'd1e2f3',
  
  // Games
  'GAME_LIST': 's9t0u1',
  'GAME_GET': 'v2w3x4',
  'GAME_RANK': 'y5z6a7',
  'GAME_STATS': 'a8b9c0',
  
  // Bets
  'BET_LIST': 'b8c9d0',
  'BET_CREATE': 'e1f2g3',
  'BET_RANKING': 'r1s2t3',
  
  // Admin
  'ADM_TEAM_LIST': 'h4i5j6',
  'ADM_TEAM_CREATE': 'k7l8m9',
  'ADM_TEAM_UPDATE': 'n0o1p2',
  'ADM_TEAM_DELETE': 'q3r4s5',
  'ADM_TEAM_GET': 't6u7v8',
  'ADM_PLAY_LIST': 'w9x0y1',
  'ADM_PLAY_CREATE': 'z2a3b4',
  'ADM_PLAY_UPDATE': 'u8v9w0',
  'ADM_PLAY_DELETE': 'c5d6e7',
  'ADM_GAME_CREATE': 'f8g9h0',
  'ADM_GAME_UPDATE': 'i1j2k3',
  'ADM_GAME_DELETE': 'l4m5n6',
  'ADM_GAME_ODDS': 'o7p8q9',
  'ADM_GAME_CLOSE': 'r0s1t2',
  'ADM_USER_LIST': 'g4h5i6',
  'ADM_BET_LIST': 'j7k8l9',
};

// Mapeamento reverso (código -> rota)
const codeToRoute: Record<string, string> = Object.fromEntries(
  Object.entries(routeCodes).map(([k, v]) => [v, k])
);

// Função para obter código da rota
export const getRouteCode = (routeKey: string): string => {
  return routeCodes[routeKey] || routeKey;
};

// Função para obter rota do código
export const getRouteFromCode = (code: string): string => {
  return codeToRoute[code] || code;
};

// Endpoint único do proxy (sempre usar para máxima segurança)
export const PROXY_ENDPOINT = '/x';

