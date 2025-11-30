import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { mapGame, mapUser, mapBet } from '../utils/mappers.js';

const createTeamSchema = z.object({
  name: z.string().min(1),
  logo: z.string().optional(),
});

const createGameSchema = z.object({
  teamAId: z.string(),
  teamBId: z.string(),
  startTime: z.string().datetime(),
  teamAOdds: z.number().positive().default(1.5),
  teamBOdds: z.number().positive().default(1.5),
  durationOdds: z.record(z.number()).optional(),
  topKillerOdds: z.number().positive().default(2.0),
  lowestDeathsOdds: z.number().positive().default(2.0),
  topKillerPlayerOdds: z.record(z.number().positive()).optional(),
  lowestDeathsPlayerOdds: z.record(z.number().positive()).optional(),
  roshanTotalOdds: z.record(z.number().positive()).optional(),
  firstRoshanOdds: z.record(z.number().positive()).optional(),
  firstFFOdds: z.record(z.number().positive()).optional(),
});

const updateOddsSchema = z.object({
  teamAOdds: z.number().positive().optional(),
  teamBOdds: z.number().positive().optional(),
  durationOdds: z.record(z.number()).optional(),
  topKillerOdds: z.number().positive().optional(),
  lowestDeathsOdds: z.number().positive().optional(),
  topKillerPlayerOdds: z.record(z.number().positive()).optional(),
  lowestDeathsPlayerOdds: z.record(z.number().positive()).optional(),
  roshanTotalOdds: z.record(z.number().positive()).optional(),
  firstRoshanOdds: z.record(z.number().positive()).optional(),
  firstFFOdds: z.record(z.number().positive()).optional(),
});

const closeGameSchema = z.object({
  winnerId: z.string().optional(),
  duration: z.number().positive().optional(),
  topKiller: z.string().optional(),
  lowestDeaths: z.string().optional(),
  roshanTotal: z.number().int().min(0).optional(),
  firstRoshanTeamId: z.string().optional(),
  firstFFTeamId: z.string().optional(),
});

const updateUserRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
  adminPermissions: z.union([
    z.array(z.string()),
    z.null(),
    z.undefined(),
  ]).optional(),
});

export default async function adminRoutes(fastify: FastifyInstance) {
  // Require admin for all routes
  fastify.addHook('onRequest', async (request, reply) => {
    await fastify.authenticate(request, reply);
    const user = request.user as { id: string; role: string } | undefined;
    if (!user || user.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'Forbidden: Admin access required' });
    }
  });

  // Teams
  fastify.post('/m/teams', async (request, reply) => {
    try {
      const body = createTeamSchema.parse(request.body);

      const team = await prisma.team.create({
        data: body,
      });

      return reply.code(201).send({ team });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Invalid data', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.get('/m/teams', async (request, reply) => {
    try {
      const teams = await prisma.team.findMany({
        include: { players: true },
        orderBy: { name: 'asc' },
      });

      return reply.send({ teams });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.put('/m/teams/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = createTeamSchema.parse(request.body);

      // Verificar se o nome já existe em outro time
      const existingTeam = await prisma.team.findFirst({
        where: {
          name: body.name,
          NOT: { id },
        },
      });

      if (existingTeam) {
        return reply.code(400).send({ error: 'Já existe um time com este nome' });
      }

      const team = await prisma.team.update({
        where: { id },
        data: body,
        include: { players: true },
      });

      return reply.send({ team });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Invalid data', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.delete('/m/teams/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      // Verificar se o time está sendo usado em jogos
      const gamesUsingTeam = await prisma.game.findFirst({
        where: {
          OR: [
            { teamAId: id },
            { teamBId: id },
          ],
        },
      });

      if (gamesUsingTeam) {
        return reply.code(400).send({ 
          error: 'Não é possível deletar este time pois ele está sendo usado em jogos. Delete ou altere os jogos primeiro.' 
        });
      }

      // Deletar o time (os jogadores serão deletados automaticamente devido ao onDelete: Cascade)
      await prisma.team.delete({
        where: { id },
      });

      return reply.send({ message: 'Team deleted' });
    } catch (error: any) {
      // Verificar se é erro de integridade referencial
      if (error.code === 'P2003' || error.message?.includes('Foreign key constraint')) {
        return reply.code(400).send({ 
          error: 'Não é possível deletar este time pois ele está sendo usado em jogos. Delete ou altere os jogos primeiro.' 
        });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Games
  fastify.post('/m/games', async (request, reply) => {
    try {
      const body = createGameSchema.parse(request.body);

      const game = await prisma.game.create({
        data: {
          teamAId: body.teamAId,
          teamBId: body.teamBId,
          startTime: new Date(body.startTime),
          status: 'SCHEDULED',
          odds: {
            create: {
              teamAOdds: body.teamAOdds,
              teamBOdds: body.teamBOdds,
            durationOdds: body.durationOdds ? JSON.stringify(body.durationOdds) : null,
            topKillerOdds: body.topKillerOdds,
            lowestDeathsOdds: body.lowestDeathsOdds,
            topKillerPlayerOdds: body.topKillerPlayerOdds ? JSON.stringify(body.topKillerPlayerOdds) : null,
            lowestDeathsPlayerOdds: body.lowestDeathsPlayerOdds ? JSON.stringify(body.lowestDeathsPlayerOdds) : null,
            },
          },
        },
        include: {
          teamA: true,
          teamB: true,
          odds: true,
        },
      });

      return reply.code(201).send({ game: mapGame(game) });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Invalid data', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.put('/m/games/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = createGameSchema.parse(request.body);

      // Verificar se o jogo existe
      const existingGame = await prisma.game.findUnique({
        where: { id },
        include: { odds: true },
      });

      if (!existingGame) {
        return reply.code(404).send({ error: 'Game not found' });
      }

      // Verificar se o jogo já foi fechado
      if (existingGame.status === 'CLOSED') {
        return reply.code(400).send({ error: 'Não é possível editar um jogo já encerrado' });
      }

      // Atualizar o jogo
      const game = await prisma.game.update({
        where: { id },
        data: {
          teamAId: body.teamAId,
          teamBId: body.teamBId,
          startTime: new Date(body.startTime),
        },
        include: {
          teamA: true,
          teamB: true,
          odds: true,
        },
      });

      // Atualizar ou criar odds
      if (existingGame.odds) {
        await prisma.gameOdds.update({
          where: { gameId: id },
          data: {
            teamAOdds: body.teamAOdds,
            teamBOdds: body.teamBOdds,
            durationOdds: body.durationOdds ? JSON.stringify(body.durationOdds) : null,
            topKillerOdds: body.topKillerOdds,
            lowestDeathsOdds: body.lowestDeathsOdds,
            topKillerPlayerOdds: body.topKillerPlayerOdds ? JSON.stringify(body.topKillerPlayerOdds) : null,
            lowestDeathsPlayerOdds: body.lowestDeathsPlayerOdds ? JSON.stringify(body.lowestDeathsPlayerOdds) : null,
          },
        });
      } else {
        await prisma.gameOdds.create({
          data: {
            gameId: id,
            teamAOdds: body.teamAOdds,
            teamBOdds: body.teamBOdds,
            durationOdds: body.durationOdds ? JSON.stringify(body.durationOdds) : null,
            topKillerOdds: body.topKillerOdds,
            lowestDeathsOdds: body.lowestDeathsOdds,
            topKillerPlayerOdds: body.topKillerPlayerOdds ? JSON.stringify(body.topKillerPlayerOdds) : null,
            lowestDeathsPlayerOdds: body.lowestDeathsPlayerOdds ? JSON.stringify(body.lowestDeathsPlayerOdds) : null,
          },
        });
      }

      const updatedGame = await prisma.game.findUnique({
        where: { id },
        include: {
          teamA: true,
          teamB: true,
          odds: true,
        },
      });

      return reply.send({ game: mapGame(updatedGame!) });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Invalid data', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.patch('/m/games/:id/odds', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = updateOddsSchema.parse(request.body);

      const game = await prisma.game.findUnique({
        where: { id },
        include: { odds: true },
      });

      if (!game) {
        return reply.code(404).send({ error: 'Game not found' });
      }

      if (game.odds) {
        await prisma.gameOdds.update({
          where: { gameId: id },
          data: {
            ...(body.teamAOdds && { teamAOdds: body.teamAOdds }),
            ...(body.teamBOdds && { teamBOdds: body.teamBOdds }),
            ...(body.durationOdds && { durationOdds: JSON.stringify(body.durationOdds) }),
            ...(body.topKillerOdds && { topKillerOdds: body.topKillerOdds }),
            ...(body.lowestDeathsOdds && { lowestDeathsOdds: body.lowestDeathsOdds }),
            ...(body.topKillerPlayerOdds && { topKillerPlayerOdds: JSON.stringify(body.topKillerPlayerOdds) }),
            ...(body.lowestDeathsPlayerOdds && { lowestDeathsPlayerOdds: JSON.stringify(body.lowestDeathsPlayerOdds) }),
            ...(body.roshanTotalOdds && { roshanTotalOdds: JSON.stringify(body.roshanTotalOdds) }),
            ...(body.firstRoshanOdds && { firstRoshanOdds: JSON.stringify(body.firstRoshanOdds) }),
            ...(body.firstFFOdds && { firstFFOdds: JSON.stringify(body.firstFFOdds) }),
          },
        });
      } else {
        await prisma.gameOdds.create({
          data: {
            gameId: id,
            teamAOdds: body.teamAOdds || 1.5,
            teamBOdds: body.teamBOdds || 1.5,
            durationOdds: body.durationOdds ? JSON.stringify(body.durationOdds) : null,
            topKillerOdds: body.topKillerOdds || 2.0,
            lowestDeathsOdds: body.lowestDeathsOdds || 2.0,
            topKillerPlayerOdds: body.topKillerPlayerOdds ? JSON.stringify(body.topKillerPlayerOdds) : null,
            lowestDeathsPlayerOdds: body.lowestDeathsPlayerOdds ? JSON.stringify(body.lowestDeathsPlayerOdds) : null,
            roshanTotalOdds: body.roshanTotalOdds ? JSON.stringify(body.roshanTotalOdds) : null,
            firstRoshanOdds: body.firstRoshanOdds ? JSON.stringify(body.firstRoshanOdds) : null,
            firstFFOdds: body.firstFFOdds ? JSON.stringify(body.firstFFOdds) : null,
          },
        });
      }

      const updatedGame = await prisma.game.findUnique({
        where: { id },
        include: {
          teamA: true,
          teamB: true,
          odds: true,
        },
      });

      return reply.send({ game: mapGame(updatedGame!) });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Invalid data', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Delete game
  fastify.delete('/m/games/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      // Verificar se o jogo existe
      const game = await prisma.game.findUnique({
        where: { id },
        include: {
          bets: true,
        },
      });

      if (!game) {
        return reply.code(404).send({ error: 'Jogo não encontrado' });
      }

      // Verificar se há apostas associadas
      if (game.bets && game.bets.length > 0) {
        return reply.code(400).send({ 
          error: 'Não é possível deletar este jogo pois existem apostas associadas. Cancele ou liquide as apostas primeiro.' 
        });
      }

      // Deletar odds primeiro (se existir)
      await prisma.gameOdds.deleteMany({
        where: { gameId: id },
      });

      // Deletar o jogo
      await prisma.game.delete({
        where: { id },
      });

      return reply.send({ message: 'Jogo deletado com sucesso' });
    } catch (error: any) {
      if (error.code === 'P2003' || error.message?.includes('Foreign key constraint')) {
        return reply.code(400).send({ 
          error: 'Não é possível deletar este jogo pois existem apostas associadas.' 
        });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.post('/m/games/:id/close', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = closeGameSchema.parse(request.body);

      const game = await prisma.game.findUnique({
        where: { id },
        include: { bets: true },
      });

      if (!game) {
        return reply.code(404).send({ error: 'Game not found' });
      }

      // Buscar o nome do jogador se topKiller foi fornecido (é um ID)
      let topKillerName: string | null = null;
      if (body.topKiller) {
        const player = await prisma.player.findUnique({
          where: { id: body.topKiller },
        });
        if (player) {
          topKillerName = player.name;
        } else {
          return reply.code(400).send({ error: 'Jogador não encontrado' });
        }
      }

      // Buscar o ID do jogador se lowestDeaths foi fornecido (é um ID)
      let lowestDeathsId: string | null = null;
      if (body.lowestDeaths) {
        const player = await prisma.player.findUnique({
          where: { id: body.lowestDeaths },
        });
        if (!player) {
          return reply.code(400).send({ error: 'Jogador Top Dead não encontrado' });
        }
        lowestDeathsId = player.id;
      }

      // Update game
      const updatedGame = await prisma.game.update({
        where: { id },
        data: {
          status: 'CLOSED',
          winnerId: body.winnerId || null,
          duration: body.duration || null,
          topKiller: topKillerName,
          lowestDeaths: lowestDeathsId,
          roshanTotal: body.roshanTotal || null,
          firstRoshanTeamId: body.firstRoshanTeamId || null,
          firstFFTeamId: body.firstFFTeamId || null,
        },
        include: {
          teamA: true,
          teamB: true,
          odds: true,
        },
      });

      // Settle bets
      for (const bet of game.bets) {
        let won = false;

        if (bet.type === 'WINNER' && bet.selection === body.winnerId) {
          won = true;
        } else if (bet.type === 'DURATION' && body.duration) {
          const durationBand = getDurationBand(body.duration);
          if (bet.selection === durationBand) {
            won = true;
          }
        } else if (bet.type === 'TOP_KILLER' && bet.selection === body.topKiller) {
          // Comparar com o ID do jogador (as apostas armazenam o ID)
          won = true;
        } else if (bet.type === 'LOWEST_DEATHS' && bet.selection === body.lowestDeaths) {
          // Comparar com o ID do jogador (as apostas armazenam o ID)
          won = true;
        } else if (bet.type === 'ROSHAN_TOTAL' && body.roshanTotal !== undefined) {
          // Verificar Over/Under
          if (bet.selection.startsWith('over_')) {
            const threshold = parseFloat(bet.selection.replace('over_', ''));
            won = body.roshanTotal > threshold;
          } else if (bet.selection.startsWith('under_')) {
            const threshold = parseFloat(bet.selection.replace('under_', ''));
            won = body.roshanTotal < threshold;
          }
        } else if (bet.type === 'FIRST_ROSHAN' && bet.selection === body.firstRoshanTeamId) {
          won = true;
        } else if (bet.type === 'FIRST_FF' && bet.selection === body.firstFFTeamId) {
          won = true;
        }

        const returnAmount = won ? bet.amount * bet.odds : 0;

        await prisma.bet.update({
          where: { id: bet.id },
          data: {
            status: won ? 'WON' : 'LOST',
            returnAmount,
          },
        });

        if (won) {
          // Add winnings to user balance
          await prisma.user.update({
            where: { id: bet.userId },
            data: { balance: { increment: returnAmount } },
          });

          // Create transaction
          await prisma.transaction.create({
            data: {
              userId: bet.userId,
              gameId: bet.gameId,
              type: 'WIN',
              amount: returnAmount,
              description: `Ganho da aposta #${bet.id}`,
            },
          });
        }
      }

      return reply.send({ game: mapGame(updatedGame) });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Invalid data', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });


  // Players
  const createPlayerSchema = z.object({
    name: z.string().min(1),
    teamId: z.string(),
  });

  fastify.post('/m/players', async (request, reply) => {
    try {
      const body = createPlayerSchema.parse(request.body);

      const player = await prisma.player.create({
        data: body,
        include: { team: true },
      });

      return reply.code(201).send({ player });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Invalid data', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.get('/m/players', async (request, reply) => {
    try {
      const teamId = (request.query as any)?.teamId;

      const players = await prisma.player.findMany({
        where: teamId ? { teamId } : undefined,
        include: { team: true },
        orderBy: { name: 'asc' },
      });

      return reply.send({ players });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Update player (pot, odds, etc)
  fastify.patch('/m/players/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as { 
        pot?: number | null; 
        name?: string;
        topKillerDefaultOdds?: number | null;
        topDeadDefaultOdds?: number | null;
      };

      const player = await prisma.player.findUnique({
        where: { id },
      });

      if (!player) {
        return reply.code(404).send({ error: 'Jogador não encontrado' });
      }

      const updatedPlayer = await prisma.player.update({
        where: { id },
        data: {
          ...(body.pot !== undefined && { pot: body.pot }),
          ...(body.name && { name: body.name }),
          ...(body.topKillerDefaultOdds !== undefined && { topKillerDefaultOdds: body.topKillerDefaultOdds }),
          ...(body.topDeadDefaultOdds !== undefined && { topDeadDefaultOdds: body.topDeadDefaultOdds }),
        },
        include: {
          team: true,
        },
      });

      return reply.send({ player: updatedPlayer });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return reply.code(400).send({ error: 'Já existe um jogador com este nome neste time' });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.delete('/m/players/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      await prisma.player.delete({
        where: { id },
      });

      return reply.send({ message: 'Player deleted' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get all bets (admin only)
  fastify.get('/m/bets', async (request, reply) => {
    try {
      const status = (request.query as any)?.status;

      const bets = await prisma.bet.findMany({
        where: {
          ...(status && { status }),
        },
        include: {
          game: {
            include: {
              teamA: true,
              teamB: true,
              odds: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              balance: true,
              role: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100, // Limitar a 100 apostas mais recentes
      });

      return reply.send({ bets: bets.map(mapBet) });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get all users (apenas admin master)
  fastify.get('/m/users', async (request, reply) => {
    try {
      const authUser = request.user as { id: string; role: string };
      
      if (!authUser || !authUser.id) {
        return reply.code(401).send({ error: 'Usuário não autenticado' });
      }

      // Verificar se é admin master (admin@zika.games)
      let currentUser;
      try {
        currentUser = await prisma.user.findUnique({
          where: { id: authUser.id },
          select: { email: true },
        });
      } catch (dbError: any) {
        fastify.log.error({ msg: 'Erro ao buscar usuário no banco', userId: authUser.id, error: dbError.message });
        return reply.code(500).send({ error: 'Erro ao verificar permissões', details: dbError.message });
      }

      if (!currentUser) {
        fastify.log.warn({ msg: 'Usuário não encontrado no banco', userId: authUser.id });
        return reply.code(404).send({ error: 'Usuário não encontrado' });
      }

      const userEmail = currentUser.email?.toLowerCase() || '';
      if (userEmail !== 'admin@zika.games') {
        fastify.log.warn({ 
          msg: 'Tentativa de acesso negada', 
          userId: authUser.id, 
          email: currentUser.email,
          expected: 'admin@zika.games'
        });
        return reply.code(403).send({ error: 'Acesso negado: apenas o administrador master pode gerenciar usuários' });
      }

      // Buscar usuários - adminPermissions pode não existir ainda em alguns casos
      let users;
      try {
        users = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            cpf: true,
            balance: true,
            role: true,
            adminPermissions: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' },
        });
      } catch (dbError: any) {
        // Se o campo adminPermissions não existir, buscar sem ele
        if (dbError.message?.includes('adminPermissions') || dbError.message?.includes('Unknown column')) {
          fastify.log.warn({ msg: 'Campo adminPermissions não encontrado, buscando sem ele', error: dbError.message });
          users = await prisma.user.findMany({
            select: {
              id: true,
              name: true,
              email: true,
              cpf: true,
              balance: true,
              role: true,
              createdAt: true,
              updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
          });
          // Adicionar adminPermissions como null para todos
          users = users.map((u: any) => ({ ...u, adminPermissions: null }));
        } else {
          throw dbError;
        }
      }

      // Parse adminPermissions para cada usuário com tratamento de erro
      const usersWithParsedPermissions = users.map((user: any) => {
        let parsedPermissions = null;
        // Verificar se adminPermissions existe e não é null/undefined
        if (user.adminPermissions && typeof user.adminPermissions === 'string' && user.adminPermissions.trim() !== '') {
          try {
            parsedPermissions = JSON.parse(user.adminPermissions);
            // Validar se é um array
            if (!Array.isArray(parsedPermissions)) {
              fastify.log.warn({ msg: 'adminPermissions não é um array válido', userId: user.id, value: parsedPermissions });
              parsedPermissions = null;
            }
          } catch (parseError: any) {
            fastify.log.warn({ 
              msg: 'Erro ao fazer parse de adminPermissions', 
              userId: user.id, 
              value: user.adminPermissions,
              error: parseError?.message 
            });
            parsedPermissions = null;
          }
        }
        return {
          ...user,
          adminPermissions: parsedPermissions,
        };
      });

      return reply.send({ users: usersWithParsedPermissions });
    } catch (error: any) {
      fastify.log.error({ msg: 'Erro ao buscar usuários', error: error.message, stack: error.stack });
      return reply.code(500).send({ error: 'Internal server error', details: error.message });
    }
  });

  // Update user role and permissions (apenas admin master)
  fastify.put('/m/users/:id/role', async (request, reply) => {
    try {
      fastify.log.info({ msg: '[UPDATE USER ROLE] Iniciando atualização', body: request.body, params: request.params });
      
      const authUser = request.user as { id: string; role: string };
      
      if (!authUser || !authUser.id) {
        fastify.log.warn({ msg: '[UPDATE USER ROLE] Usuário não autenticado' });
        return reply.code(401).send({ error: 'Usuário não autenticado' });
      }

      // Verificar se é admin master (admin@zika.games)
      let currentUser;
      try {
        currentUser = await prisma.user.findUnique({
          where: { id: authUser.id },
          select: { email: true },
        });
      } catch (dbError: any) {
        fastify.log.error({ msg: '[UPDATE USER ROLE] Erro ao buscar usuário atual', error: dbError.message, stack: dbError.stack });
        return reply.code(500).send({ error: 'Erro ao verificar permissões', details: dbError.message });
      }

      if (!currentUser) {
        fastify.log.warn({ msg: '[UPDATE USER ROLE] Usuário atual não encontrado', userId: authUser.id });
        return reply.code(404).send({ error: 'Usuário não encontrado' });
      }

      if (currentUser.email.toLowerCase() !== 'admin@zika.games') {
        fastify.log.warn({ msg: '[UPDATE USER ROLE] Acesso negado', email: currentUser.email });
        return reply.code(403).send({ error: 'Acesso negado: apenas o administrador master pode gerenciar usuários' });
      }

      const { id } = request.params as { id: string };
      fastify.log.info({ msg: '[UPDATE USER ROLE] Validando body', body: request.body });
      
      let body;
      try {
        body = updateUserRoleSchema.parse(request.body);
        fastify.log.info({ msg: '[UPDATE USER ROLE] Body validado', body });
      } catch (zodError: any) {
        if (zodError instanceof z.ZodError) {
          fastify.log.warn({ msg: '[UPDATE USER ROLE] Erro de validação Zod', errors: zodError.errors });
          return reply.code(400).send({ error: 'Invalid data', details: zodError.errors });
        }
        throw zodError;
      }

      const updateData: any = {
        role: body.role,
      };

      // Se for ADMIN, salvar permissões como JSON string
      if (body.role === 'ADMIN') {
        if (body.adminPermissions && Array.isArray(body.adminPermissions) && body.adminPermissions.length > 0) {
          try {
            updateData.adminPermissions = JSON.stringify(body.adminPermissions);
            fastify.log.info({ msg: '[UPDATE USER ROLE] Permissões definidas', permissions: body.adminPermissions });
          } catch (stringifyError: any) {
            fastify.log.warn({ msg: '[UPDATE USER ROLE] Erro ao fazer stringify de adminPermissions', error: stringifyError.message });
            return reply.code(400).send({ error: 'Erro ao processar permissões', details: stringifyError.message });
          }
        } else {
          // ADMIN sem permissões definidas = acesso total (null)
          updateData.adminPermissions = null;
          fastify.log.info({ msg: '[UPDATE USER ROLE] ADMIN sem permissões específicas (acesso total)' });
        }
      } else if (body.role === 'USER') {
        // Se voltar para USER, remover permissões
        updateData.adminPermissions = null;
        fastify.log.info({ msg: '[UPDATE USER ROLE] Convertendo para USER, removendo permissões' });
      }

      fastify.log.info({ msg: '[UPDATE USER ROLE] Atualizando usuário', userId: id, updateData });
      
      let updatedUser;
      try {
        updatedUser = await prisma.user.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            name: true,
            email: true,
            cpf: true,
            balance: true,
            role: true,
            adminPermissions: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        fastify.log.info({ msg: '[UPDATE USER ROLE] Usuário atualizado com sucesso', userId: id });
      } catch (updateError: any) {
        fastify.log.error({ 
          msg: '[UPDATE USER ROLE] Erro ao atualizar no banco', 
          userId: id, 
          error: updateError.message, 
          code: updateError.code,
          stack: updateError.stack 
        });
        
        // Verificar se é erro de campo não encontrado
        if (updateError.message?.includes('adminPermissions') || updateError.message?.includes('Unknown column')) {
          return reply.code(500).send({ 
            error: 'Campo adminPermissions não existe no banco de dados. Execute: npx prisma db push ou npx prisma migrate dev',
            details: updateError.message 
          });
        }
        
        return reply.code(500).send({ error: 'Erro ao atualizar usuário', details: updateError.message });
      }

      // Parse adminPermissions para retornar como array com tratamento de erro
      let parsedPermissions = null;
      if (updatedUser.adminPermissions) {
        try {
          parsedPermissions = JSON.parse(updatedUser.adminPermissions);
        } catch (parseError: any) {
          fastify.log.warn({ msg: '[UPDATE USER ROLE] Erro ao fazer parse de adminPermissions', userId: id, error: parseError.message });
          parsedPermissions = null;
        }
      }

      const userResponse = {
        ...updatedUser,
        adminPermissions: parsedPermissions,
      };

      fastify.log.info({ msg: '[UPDATE USER ROLE] Retornando resposta', userId: id });
      return reply.send({ user: userResponse });
    } catch (error: any) {
      fastify.log.error({ 
        msg: '[UPDATE USER ROLE] Erro não tratado', 
        error: error.message, 
        stack: error.stack,
        name: error.name 
      });
      return reply.code(500).send({ error: 'Internal server error', details: error.message });
    }
  });
}

function getDurationBand(duration: number): string {
  if (duration <= 20) return '15 a 20';
  if (duration <= 25) return '21 a 25';
  if (duration <= 30) return '26 a 30';
  if (duration <= 35) return '31 a 35';
  if (duration <= 40) return '36 a 40';
  if (duration <= 45) return '41 a 45';
  if (duration <= 50) return '46 a 50';
  return '51+';
}

