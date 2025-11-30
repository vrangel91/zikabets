// Sistema de ofuscação de rotas para segurança
// As rotas são ofuscadas para não aparecerem claramente no DevTools

// Função de ofuscação usando base64 reverso
const _o = (s: string): string => {
  if (!import.meta.env.PROD) return s;
  try {
    return btoa(s).split('').reverse().join('').replace(/=/g, '');
  } catch {
    return s;
  }
};

const _d = (s: string): string => {
  if (!import.meta.env.PROD) return s;
  try {
    return atob(s.split('').reverse().join(''));
  } catch {
    return s;
  }
};

// Rotas ofuscadas (em produção serão decodificadas dinamicamente)
const _r: Record<string, string> = {
  _a: _o('/auth/register'),
  _b: _o('/auth/login'),
  _c: _o('/users/me'),
  _d: _o('/wallet/transactions'),
  _f: _o('/games'),
  _g: _o('/games/ranking'),
  _h: _o('/bets'),
  _i: _o('/m/teams'),
  _j: _o('/m/players'),
  _k: _o('/m/games'),
  _l: _o('odds'),
  _m: _o('close'),
  _n: _o('/m/bets'),
};

// Função para obter rota
const _g = (k: string): string => {
  return _d(_r[k] || k);
};

// Funções helper para rotas específicas (nomes genéricos para ofuscação)
export const routes = {
  auth: {
    register: () => _g('_a'),
    login: () => _g('_b'),
  },
  users: {
    me: () => _g('_c'),
    update: () => _g('_c'),
  },
  wallet: {
    transactions: (limit?: number) => {
      const b = _g('_d');
      return limit ? `${b}?limit=${limit}` : b;
    },
  },
  games: {
    list: (status?: string) => {
      const b = _g('_f');
      return status ? `${b}?status=${status}` : b;
    },
    get: (id: string) => `${_g('_f')}/${id}`,
    ranking: () => _g('_g'),
    stats: () => `${_g('_f')}/stats`,
  },
  bets: {
    list: (status?: string) => {
      const b = _g('_h');
      return status ? `${b}?status=${status}` : b;
    },
    create: () => _g('_h'),
  },
  admin: {
    teams: {
      list: () => _g('_i'),
      create: () => _g('_i'),
      update: (id: string) => `${_g('_i')}/${id}`,
      delete: (id: string) => `${_g('_i')}/${id}`,
      get: (id: string) => `${_g('_i')}/${id}`,
    },
    players: {
      list: () => _g('_j'),
      create: () => _g('_j'),
      update: (id: string) => `${_g('_j')}/${id}`,
      delete: (id: string) => `${_g('_j')}/${id}`,
    },
    games: {
      create: () => _g('_k'),
      update: (id: string) => `${_g('_k')}/${id}`,
      delete: (id: string) => `${_g('_k')}/${id}`,
      updateOdds: (id: string) => `${_g('_k')}/${id}/${_g('_l')}`,
      close: (id: string) => `${_g('_k')}/${id}/${_g('_m')}`,
    },
    bets: {
      list: (status?: string) => {
        const b = _g('_n');
        return status ? `${b}?status=${status}` : b;
      },
    },
  },
};
