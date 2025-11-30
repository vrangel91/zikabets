import { FastifyInstance } from 'fastify';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import walletRoutes from './wallet.js';
import gameRoutes from './games.js';
import betRoutes from './bets.js';
import adminRoutes from './admin.js';

// Mapeamento de códigos para rotas (deve corresponder ao frontend)
const codeToRoute: Record<string, { method: string; path: string; handler: any }> = {
  // Auth
  'a1b2c3': { method: 'post', path: '/auth/register', handler: null },
  'd4e5f6': { method: 'post', path: '/auth/login', handler: null },
  
  // Users
  'g7h8i9': { method: 'get', path: '/users/me', handler: null },
  'j0k1l2': { method: 'patch', path: '/users/me', handler: null },
  
  // Wallet
  'm3n4o5': { method: 'get', path: '/wallet/transactions', handler: null },
  'p6q7r8': { method: 'post', path: '/wallet/deposit/pix', handler: null },
  'd1e2f3': { method: 'get', path: '/wallet/balance', handler: null },
  
  // Games
  's9t0u1': { method: 'get', path: '/games', handler: null },
  'v2w3x4': { method: 'get', path: '/games/:id', handler: null },
  'y5z6a7': { method: 'get', path: '/games/ranking', handler: null },
  'a8b9c0': { method: 'get', path: '/games/stats', handler: null },
  
  // Bets
  'b8c9d0': { method: 'get', path: '/bets', handler: null },
  'e1f2g3': { method: 'post', path: '/bets', handler: null },
  'r1s2t3': { method: 'get', path: '/bets/ranking', handler: null },
  
  // Management - Teams
  'h4i5j6': { method: 'get', path: '/m/teams', handler: null },
  'k7l8m9': { method: 'post', path: '/m/teams', handler: null },
  'n0o1p2': { method: 'put', path: '/m/teams/:id', handler: null },
  'q3r4s5': { method: 'delete', path: '/m/teams/:id', handler: null },
  't6u7v8': { method: 'get', path: '/m/teams/:id', handler: null },
  
  // Management - Players
  'w9x0y1': { method: 'get', path: '/m/players', handler: null },
  'z2a3b4': { method: 'post', path: '/m/players', handler: null },
  'u8v9w0': { method: 'patch', path: '/m/players/:id', handler: null },
  'c5d6e7': { method: 'delete', path: '/m/players/:id', handler: null },
  
  // Management - Games
  'f8g9h0': { method: 'post', path: '/m/games', handler: null },
  'i1j2k3': { method: 'put', path: '/m/games/:id', handler: null },
  'l4m5n6': { method: 'delete', path: '/m/games/:id', handler: null },
  'o7p8q9': { method: 'patch', path: '/m/games/:id/odds', handler: null },
  'r0s1t2': { method: 'post', path: '/m/games/:id/close', handler: null },
  
  // Management - Users
  'g4h5i6': { method: 'get', path: '/m/users', handler: null },
  
  // Management - Bets
  'j7k8l9': { method: 'get', path: '/m/bets', handler: null },
};

export default async function proxyRoutes(fastify: FastifyInstance) {
  fastify.log.info({ msg: 'Registering proxy routes' });
  
  // Test endpoint
  fastify.get('/x', async (request, reply) => {
    return reply.send({ message: 'Proxy endpoint is working', method: 'GET' });
  });

  // Endpoint único de proxy (apenas em produção ou quando habilitado)
  fastify.post('/x', async (request, reply) => {
    try {
      const body = request.body as any;
      
      fastify.log.info({ msg: 'Proxy POST request received', body, url: request.url });
      
      if (!body || typeof body !== 'object' || !body.c) {
        fastify.log.error({ msg: 'Invalid proxy request', body, type: typeof body });
        return reply.code(400).send({ error: 'Invalid request: missing route code' });
      }

      const routeBody = body as {
        c: string; // código da rota
        m: string; // método original
        p: Record<string, any>; // parâmetros da query
        d: any; // dados do body
        i?: string; // ID do recurso
      };

      const routeConfig = codeToRoute[routeBody.c];
      if (!routeConfig) {
        fastify.log.error({ msg: 'Route not found for code', code: routeBody.c });
        return reply.code(404).send({ error: `Route not found for code: ${routeBody.c}` });
      }

      // Verificar autenticação se necessário (exceto para auth routes)
      const authCodes = ['a1b2c3', 'd4e5f6'];
      if (!authCodes.includes(routeBody.c)) {
        try {
          await request.jwtVerify();
          const decoded = request.user as { sub?: string; id?: string; role: string };
          request.user = {
            id: decoded.sub || decoded.id || '',
            role: decoded.role,
          } as { id: string; role: string };
        } catch (err) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }
      }

      // Roteamento interno baseado no código
      let response: any;

      // Helper para criar headers sem Content-Length
      const createInjectHeaders = (originalHeaders: any): Record<string, string> => {
        const headers: Record<string, string> = {};
        Object.keys(originalHeaders).forEach(key => {
          const lowerKey = key.toLowerCase();
          // Não copiar Content-Length e Host, deixar o Fastify calcular
          if (lowerKey !== 'content-length' && lowerKey !== 'host') {
            headers[key] = originalHeaders[key] as string;
          }
        });
        return headers;
      };
      
      // Helper para serializar payload
      const serializePayload = (data: any): string => {
        return typeof data === 'string' ? data : JSON.stringify(data);
      };
      
      // Auth routes
      if (routeBody.c === 'a1b2c3') {
        // Register - chamar handler de auth
        response = await fastify.inject({
          method: 'POST',
          url: '/auth/register',
          payload: serializePayload(routeBody.d),
          headers: createInjectHeaders(request.headers),
        });
      } else if (routeBody.c === 'd4e5f6') {
        // Login
        const loginData = routeBody.d || {};
        fastify.log.info({ 
          msg: 'Proxy login request', 
          email: loginData.email,
          hasPassword: !!loginData.password,
          dataKeys: Object.keys(loginData)
        });
        
        // Verificar se os dados estão corretos
        if (!loginData.email || !loginData.password) {
          fastify.log.error({ 
            msg: 'Missing login data', 
            data: loginData 
          });
          return reply.code(400).send({ 
            error: 'Missing email or password',
            received: loginData 
          });
        }
        
        response = await fastify.inject({
          method: 'POST',
          url: '/auth/login',
          payload: serializePayload(loginData),
          headers: createInjectHeaders(request.headers),
        });
        
        fastify.log.info({ 
          msg: 'Proxy login response', 
          status: response.statusCode,
          body: response.json()
        });
      } else if (routeBody.c === 'g7h8i9') {
        // Get user profile
        response = await fastify.inject({
          method: 'GET',
          url: '/users/me',
          headers: request.headers,
        });
      } else if (routeBody.c === 'j0k1l2') {
        // Update user profile
        response = await fastify.inject({
          method: 'PATCH',
          url: '/users/me',
          payload: serializePayload(routeBody.d),
          headers: createInjectHeaders(request.headers),
        });
      } else if (routeBody.c === 'm3n4o5') {
        // Get transactions
        const limit = routeBody.p?.limit || 20;
        response = await fastify.inject({
          method: 'GET',
          url: `/wallet/transactions?limit=${limit}`,
          headers: request.headers,
        });
      } else if (routeBody.c === 's9t0u1') {
        // Get games
        const status = routeBody.p?.status;
        const url = status ? `/games?status=${status}` : '/games';
        response = await fastify.inject({
          method: 'GET',
          url,
          headers: request.headers,
        });
      } else if (routeBody.c === 'v2w3x4') {
        // Get game by ID
        response = await fastify.inject({
          method: 'GET',
          url: `/games/${routeBody.i}`,
          headers: request.headers,
        });
      } else if (routeBody.c === 'y5z6a7') {
        // Get ranking
        response = await fastify.inject({
          method: 'GET',
          url: '/games/ranking',
          headers: request.headers,
        });
      } else if (routeBody.c === 'b8c9d0') {
        // Get bets
        const status = routeBody.p?.status;
        const url = status ? `/bets?status=${status}` : '/bets';
        response = await fastify.inject({
          method: 'GET',
          url,
          headers: request.headers,
        });
      } else if (routeBody.c === 'e1f2g3') {
        // Create bet
        fastify.log.info({ msg: 'Creating bet via proxy', data: routeBody.d });
        try {
          response = await fastify.inject({
            method: 'POST',
            url: '/bets',
            payload: serializePayload(routeBody.d),
            headers: createInjectHeaders(request.headers),
          });
          fastify.log.info({ msg: 'Bet creation response status', statusCode: response.statusCode });
          if (response.statusCode >= 400) {
            fastify.log.error({ msg: 'Bet creation failed', body: response.body });
          }
        } catch (err: any) {
          fastify.log.error({ msg: 'Error in bet creation', error: err });
          return reply.code(500).send({ error: 'Error creating bet', details: err.message });
        }
      } else if (routeBody.c === 'r1s2t3') {
        // Get ranking
        response = await fastify.inject({
          method: 'GET',
          url: '/bets/ranking',
          headers: request.headers,
        });
      } else if (routeBody.c === 'h4i5j6') {
        // Admin: Get teams
        response = await fastify.inject({
          method: 'GET',
          url: '/m/teams',
          headers: request.headers,
        });
      } else if (routeBody.c === 'k7l8m9') {
        // Admin: Create team
        response = await fastify.inject({
          method: 'POST',
          url: '/m/teams',
          payload: serializePayload(routeBody.d),
          headers: createInjectHeaders(request.headers),
        });
      } else if (routeBody.c === 'n0o1p2') {
        // Admin: Update team
        response = await fastify.inject({
          method: 'PUT',
          url: `/m/teams/${routeBody.i}`,
          payload: serializePayload(routeBody.d),
          headers: createInjectHeaders(request.headers),
        });
      } else if (routeBody.c === 'q3r4s5') {
        // Admin: Delete team
        response = await fastify.inject({
          method: 'DELETE',
          url: `/m/teams/${routeBody.i}`,
          headers: request.headers,
        });
      } else if (routeBody.c === 't6u7v8') {
        // Admin: Get team
        response = await fastify.inject({
          method: 'GET',
          url: `/m/teams/${routeBody.i}`,
          headers: request.headers,
        });
      } else if (routeBody.c === 'w9x0y1') {
        // Admin: Get players
        const teamId = routeBody.p?.teamId;
        const url = teamId ? `/m/players?teamId=${teamId}` : '/m/players';
        response = await fastify.inject({
          method: 'GET',
          url,
          headers: request.headers,
        });
      } else if (routeBody.c === 'z2a3b4') {
        // Admin: Create player
        response = await fastify.inject({
          method: 'POST',
          url: '/m/players',
          payload: serializePayload(routeBody.d),
          headers: createInjectHeaders(request.headers),
        });
      } else if (routeBody.c === 'u8v9w0') {
        // Admin: Update player
        response = await fastify.inject({
          method: 'PATCH',
          url: `/m/players/${routeBody.i}`,
          payload: serializePayload(routeBody.d),
          headers: createInjectHeaders(request.headers),
        });
      } else if (routeBody.c === 'c5d6e7') {
        // Admin: Delete player
        response = await fastify.inject({
          method: 'DELETE',
          url: `/m/players/${routeBody.i}`,
          headers: request.headers,
        });
      } else if (routeBody.c === 'f8g9h0') {
        // Admin: Create game
        response = await fastify.inject({
          method: 'POST',
          url: '/m/games',
          payload: serializePayload(routeBody.d),
          headers: createInjectHeaders(request.headers),
        });
      } else if (routeBody.c === 'i1j2k3') {
        // Admin: Update game
        response = await fastify.inject({
          method: 'PUT',
          url: `/m/games/${routeBody.i}`,
          payload: serializePayload(routeBody.d),
          headers: createInjectHeaders(request.headers),
        });
      } else if (routeBody.c === 'l4m5n6') {
        // Admin: Delete game
        response = await fastify.inject({
          method: 'DELETE',
          url: `/m/games/${routeBody.i}`,
          headers: request.headers,
        });
      } else if (routeBody.c === 'o7p8q9') {
        // Admin: Update odds
        response = await fastify.inject({
          method: 'PATCH',
          url: `/m/games/${routeBody.i}/odds`,
          payload: serializePayload(routeBody.d),
          headers: createInjectHeaders(request.headers),
        });
      } else if (routeBody.c === 'r0s1t2') {
        // Admin: Close game
        if (!routeBody.i) {
          fastify.log.error({ msg: 'Close game: missing game ID', routeBody });
          return reply.code(400).send({ error: 'Game ID is required' });
        }
        fastify.log.info({ msg: 'Close game request', gameId: routeBody.i, data: routeBody.d });
        response = await fastify.inject({
          method: 'POST',
          url: `/m/games/${routeBody.i}/close`,
          payload: serializePayload(routeBody.d),
          headers: createInjectHeaders(request.headers),
        });
      } else {
        return reply.code(404).send({ error: 'Route not found' });
      }

      // Retornar resposta
      if (!response) {
        fastify.log.error({ msg: 'No response from internal route' });
        return reply.code(500).send({ error: 'Internal server error: no response' });
      }

      // Se a resposta tem erro (status >= 400), retornar diretamente
      if (response.statusCode >= 400) {
        fastify.log.error({ msg: `Error response (${response.statusCode})`, body: response.body });
        try {
          let errorData: any;
          if (typeof response.body === 'string') {
            try {
              errorData = JSON.parse(response.body);
            } catch {
              errorData = { error: response.body };
            }
          } else {
            errorData = response.body;
          }
          
          // Garantir que temos uma mensagem de erro
          if (!errorData.error && !errorData.message) {
            errorData = { error: 'Bad Request', details: errorData };
          }
          
          return reply
            .code(response.statusCode)
            .headers(response.headers || {})
            .send(errorData);
        } catch (parseError) {
          fastify.log.error({ msg: 'Error parsing error response', error: parseError });
          return reply
            .code(response.statusCode)
            .headers(response.headers || {})
            .send({ error: 'Bad Request', details: response.body || 'Error occurred' });
        }
      }

      try {
        // fastify.inject retorna body como string JSON
        let responseData: any;
        if (typeof response.body === 'string') {
          try {
            responseData = JSON.parse(response.body);
          } catch (parseError) {
            // Se não for JSON válido, retornar como está
            responseData = response.body;
          }
        } else {
          responseData = response.body;
        }
        
        // Retornar resposta com status code e headers
        const statusCode = response.statusCode || 200;
        const headers = response.headers || {};
        
        return reply
          .code(statusCode)
          .headers(headers)
          .send(responseData);
      } catch (e: any) {
        fastify.log.error({ msg: 'Error parsing response', error: e });
        return reply
          .code(response.statusCode || 500)
          .headers(response.headers || {})
          .send(response.body || { error: 'Internal server error' });
      }
    } catch (error: any) {
      fastify.log.error({ msg: 'Proxy error', error });
      fastify.log.error({ msg: 'Error stack', stack: error.stack });
      return reply.code(500).send({ 
        error: 'Internal server error',
        message: error.message,
        details: error.toString()
      });
    }
  });
}

