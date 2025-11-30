import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';
import { mapGame } from '../utils/mappers.js';

export default async function gameRoutes(fastify: FastifyInstance) {
  // List games
  fastify.get('/games', async (request, reply) => {
    try {
      const status = (request.query as any)?.status;

      const games = await prisma.game.findMany({
        where: status ? { status } : undefined,
        include: {
          teamA: true,
          teamB: true,
          odds: true,
        },
        orderBy: { startTime: 'asc' },
      });

      return reply.send({
        games: games.map(mapGame),
      });
    } catch (error: any) {
      fastify.log.error({ msg: 'Error fetching games', error: error.message, stack: error.stack });
      return reply.code(500).send({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  });

  // Get game by ID
  fastify.get('/games/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const game = await prisma.game.findUnique({
        where: { id },
        include: {
          teamA: true,
          teamB: true,
          odds: true,
        },
      });

      if (!game) {
        return reply.code(404).send({ error: 'Game not found' });
      }

      return reply.send({ game: mapGame(game) });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get ranking (teams)
  fastify.get('/games/ranking', async (request, reply) => {
    try {
      const teams = await prisma.team.findMany({
        include: {
          gamesAsTeamA: {
            where: { status: 'CLOSED' },
          },
          gamesAsTeamB: {
            where: { status: 'CLOSED' },
          },
        },
      });

      const ranking = teams
        .map((team) => {
          const winsAsA = team.gamesAsTeamA.filter((g) => g.winnerId === team.id).length;
          const winsAsB = team.gamesAsTeamB.filter((g) => g.winnerId === team.id).length;
          const totalWins = winsAsA + winsAsB;
          const totalGames = team.gamesAsTeamA.length + team.gamesAsTeamB.length;

          return {
            team: {
              id: team.id,
              name: team.name,
              logo: team.logo,
            },
            wins: totalWins,
            games: totalGames,
            winRate: totalGames > 0 ? (totalWins / totalGames) * 100 : 0,
          };
        })
        .sort((a, b) => b.wins - a.wins);

      return reply.send({ ranking });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get public statistics
  fastify.get('/games/stats', async (request, reply) => {
    try {
      // Total de jogos por status
      const gamesByStatus = await prisma.game.groupBy({
        by: ['status'],
        _count: true,
      });

      // Total de apostas por status
      const betsByStatus = await prisma.bet.groupBy({
        by: ['status'],
        _count: true,
        _sum: {
          amount: true,
        },
      });

      // Volume total de apostas
      const totalVolume = await prisma.bet.aggregate({
        _sum: {
          amount: true,
        },
      });

      // Volume de apostas hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayVolume = await prisma.bet.aggregate({
        where: {
          createdAt: {
            gte: today,
          },
        },
        _sum: {
          amount: true,
        },
      });

      // Total de usuários
      const totalUsers = await prisma.user.count({
        where: {
          role: 'USER',
        },
      });

      // Total de jogos ativos
      const activeGames = await prisma.game.count({
        where: {
          status: {
            in: ['SCHEDULED', 'LIVE'],
          },
        },
      });

      // Últimas apostas (últimas 10)
      const recentBets = await prisma.bet.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          game: {
            include: {
              teamA: true,
              teamB: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Volume de apostas por dia (últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const recentBetsForVolume = await prisma.bet.findMany({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          createdAt: true,
          amount: true,
        },
      });

      // Agrupar por dia
      const volumeByDay: Record<string, { amount: number; count: number }> = {};
      recentBetsForVolume.forEach((bet) => {
        const date = new Date(bet.createdAt).toISOString().split('T')[0];
        if (!volumeByDay[date]) {
          volumeByDay[date] = { amount: 0, count: 0 };
        }
        volumeByDay[date].amount += bet.amount || 0;
        volumeByDay[date].count += 1;
      });

      // Apostas por tipo
      const betsByType = await prisma.bet.groupBy({
        by: ['type'],
        _count: true,
      });

      return reply.send({
        stats: {
          totalGames: await prisma.game.count(),
          activeGames,
          totalBets: await prisma.bet.count(),
          totalUsers,
          totalVolume: totalVolume._sum.amount || 0,
          todayVolume: todayVolume._sum.amount || 0,
          gamesByStatus: gamesByStatus.reduce((acc, item) => {
            acc[item.status] = item._count;
            return acc;
          }, {} as Record<string, number>),
          betsByStatus: betsByStatus.reduce((acc, item) => {
            acc[item.status] = {
              count: item._count,
              volume: item._sum.amount || 0,
            };
            return acc;
          }, {} as Record<string, { count: number; volume: number }>),
          betsByType: betsByType.reduce((acc, item) => {
            acc[item.type] = item._count;
            return acc;
          }, {} as Record<string, number>),
          volumeByDay,
        },
        recentBets: recentBets.map((bet) => {
          // Formatar seleção baseado no tipo
          let selectionName = bet.selection;
          if (bet.type === 'WINNER') {
            // Para WINNER, bet.selection é o ID do time
            if (bet.selection === bet.game.teamA.id) {
              selectionName = bet.game.teamA.name;
            } else if (bet.selection === bet.game.teamB.id) {
              selectionName = bet.game.teamB.name;
            }
          } else if (bet.type === 'DURATION') {
            selectionName = `${bet.selection} min`;
          } else if (bet.type === 'TOP_KILLER' || bet.type === 'TOP_DEAD' || bet.type === 'LOWEST_DEATHS') {
            // Para jogadores, tentar buscar o nome do jogador
            // Por enquanto, manter o ID, mas adicionar campo para nome se disponível
            selectionName = bet.selection; // Será tratado no frontend se necessário
          }

          return {
            id: bet.id,
            amount: bet.amount,
            odds: bet.odds,
            status: bet.status,
            type: bet.type,
            selection: bet.selection,
            selectionName: selectionName,
            createdAt: bet.createdAt,
            game: {
              id: bet.game.id,
              teamA: bet.game.teamA.name,
              teamB: bet.game.teamB.name,
              teamAId: bet.game.teamA.id,
              teamBId: bet.game.teamB.id,
              status: bet.game.status,
            },
            user: {
              name: bet.user.name,
            },
          };
        }),
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}

