import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { mapBet } from '../utils/mappers.js';

const createBetSchema = z.object({
  gameId: z.string(),
  type: z.enum(['WINNER', 'DURATION', 'TOP_KILLER', 'LOWEST_DEATHS', 'ROSHAN_TOTAL', 'FIRST_ROSHAN', 'FIRST_FF']),
  selection: z.string(),
  amount: z.number().positive().max(10),
  isMultiple: z.boolean().optional().default(false),
  multipleId: z.string().optional(),
  adjustedOdds: z.number().positive().optional(),
});

export default async function betRoutes(fastify: FastifyInstance) {
  // Place bet
  fastify.post(
    '/bets',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const authUser = request.user as { id: string; role: string };
        const userId = authUser.id;
        // Normalizar dados antes da validação
        const rawBody = request.body as any;
        
        fastify.log.info({ msg: 'Raw bet body received', body: rawBody });
        
        // Validar campos obrigatórios
        if (!rawBody.gameId || !rawBody.type || !rawBody.selection || rawBody.amount === undefined) {
          fastify.log.error({
            msg: 'Missing required fields',
            fields: {
              gameId: !!rawBody.gameId,
              type: !!rawBody.type,
              selection: !!rawBody.selection,
              amount: rawBody.amount !== undefined,
            },
          });
          return reply.code(400).send({ 
            error: 'Missing required fields',
            required: ['gameId', 'type', 'selection', 'amount']
          });
        }
        
        const normalizedBody = {
          gameId: String(rawBody.gameId),
          type: rawBody.type,
          selection: String(rawBody.selection),
          amount: typeof rawBody.amount === 'string' ? parseFloat(rawBody.amount) : Number(rawBody.amount),
          isMultiple: rawBody.isMultiple === true || rawBody.isMultiple === 'true' || false,
          multipleId: rawBody.multipleId || undefined,
          adjustedOdds: rawBody.adjustedOdds !== undefined ? (typeof rawBody.adjustedOdds === 'string' ? parseFloat(rawBody.adjustedOdds) : Number(rawBody.adjustedOdds)) : undefined,
        };
        
        fastify.log.info({ msg: 'Normalized bet body', body: normalizedBody });
        
        // Validar amount
        if (isNaN(normalizedBody.amount) || normalizedBody.amount <= 0) {
          fastify.log.error({ msg: 'Invalid amount', amount: normalizedBody.amount });
          return reply.code(400).send({ 
            error: 'Invalid amount',
            details: 'Amount must be a positive number'
          });
        }
        
        if (normalizedBody.amount > 10) {
          fastify.log.error({ msg: 'Amount exceeds maximum', amount: normalizedBody.amount });
          return reply.code(400).send({ 
            error: 'Amount exceeds maximum',
            details: 'Maximum bet amount is R$ 10,00'
          });
        }
        
        // Validar type
        if (!['WINNER', 'DURATION', 'TOP_KILLER', 'LOWEST_DEATHS', 'ROSHAN_TOTAL', 'FIRST_ROSHAN', 'FIRST_FF'].includes(normalizedBody.type)) {
          fastify.log.error({ msg: 'Invalid bet type', type: normalizedBody.type });
          return reply.code(400).send({ 
            error: 'Invalid bet type',
            details: 'Type must be WINNER, DURATION, TOP_KILLER, LOWEST_DEATHS, ROSHAN_TOTAL, FIRST_ROSHAN, or FIRST_FF'
          });
        }
        
        let body;
        try {
          body = createBetSchema.parse(normalizedBody);
        } catch (error: any) {
          fastify.log.error({ msg: 'Schema validation error', error: error.errors || error });
          fastify.log.error({ msg: 'Received body', body: normalizedBody });
          return reply.code(400).send({ 
            error: 'Invalid bet data', 
            details: error.errors || error.message 
          });
        }

        // Check user balance
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { balance: true },
        });

        if (!user || user.balance < body.amount) {
          return reply.code(400).send({ error: 'Insufficient balance' });
        }

        // Check game exists and is open
        const game = await prisma.game.findUnique({
          where: { id: body.gameId },
          include: {
            teamA: true,
            teamB: true,
            odds: true,
          },
        });

        if (!game) {
          return reply.code(404).send({ error: 'Game not found' });
        }

        if (game.status !== 'SCHEDULED') {
          return reply.code(400).send({ error: 'Game is not open for betting' });
        }

        // Get odds
        let odds = 1.5;
        if (body.type === 'WINNER') {
          if (body.selection === game.teamAId) {
            odds = game.odds?.teamAOdds || 1.5;
          } else if (body.selection === game.teamBId) {
            odds = game.odds?.teamBOdds || 1.5;
          }
        } else if (body.type === 'DURATION') {
          const durationOddsStr = game.odds?.durationOdds;
          const durationOdds = durationOddsStr ? (JSON.parse(durationOddsStr) as Record<string, number>) : null;
          odds = durationOdds?.[body.selection] || 1.5;
        } else if (body.type === 'TOP_KILLER') {
          // Verificar se há odds específicas por jogador
          const topKillerPlayerOddsStr = game.odds?.topKillerPlayerOdds;
          if (topKillerPlayerOddsStr) {
            try {
              const topKillerPlayerOdds = JSON.parse(topKillerPlayerOddsStr) as Record<string, number>;
              odds = topKillerPlayerOdds[body.selection] || game.odds?.topKillerOdds || 2.0;
            } catch {
              odds = game.odds?.topKillerOdds || 2.0;
            }
          } else {
            odds = game.odds?.topKillerOdds || 2.0;
          }
        } else if (body.type === 'LOWEST_DEATHS') {
          // Verificar se há odds específicas por jogador
          const lowestDeathsPlayerOddsStr = game.odds?.lowestDeathsPlayerOdds;
          if (lowestDeathsPlayerOddsStr) {
            try {
              const lowestDeathsPlayerOdds = JSON.parse(lowestDeathsPlayerOddsStr) as Record<string, number>;
              odds = lowestDeathsPlayerOdds[body.selection] || game.odds?.lowestDeathsOdds || 2.0;
            } catch {
              odds = game.odds?.lowestDeathsOdds || 2.0;
            }
          } else {
            odds = game.odds?.lowestDeathsOdds || 2.0;
          }
        } else if (body.type === 'ROSHAN_TOTAL') {
          // Total de Roshan (Over/Under) - selection deve ser "over_2.5", "under_2.5", etc.
          const roshanTotalOddsStr = game.odds?.roshanTotalOdds;
          if (roshanTotalOddsStr) {
            try {
              const roshanTotalOdds = JSON.parse(roshanTotalOddsStr) as Record<string, number>;
              odds = roshanTotalOdds[body.selection] || 1.8;
            } catch {
              odds = 1.8;
            }
          } else {
            odds = 1.8;
          }
        } else if (body.type === 'FIRST_ROSHAN') {
          // Primeiro Roshan - selection deve ser teamAId ou teamBId
          const firstRoshanOddsStr = game.odds?.firstRoshanOdds;
          if (firstRoshanOddsStr) {
            try {
              const firstRoshanOdds = JSON.parse(firstRoshanOddsStr) as Record<string, number>;
              if (body.selection === game.teamAId) {
                odds = firstRoshanOdds['teamA'] || 1.5;
              } else if (body.selection === game.teamBId) {
                odds = firstRoshanOdds['teamB'] || 1.5;
              }
            } catch {
              odds = 1.5;
            }
          } else {
            odds = 1.5;
          }
        } else if (body.type === 'FIRST_FF') {
          // Primeiro !ff - selection deve ser teamAId ou teamBId
          const firstFFOddsStr = game.odds?.firstFFOdds;
          if (firstFFOddsStr) {
            try {
              const firstFFOdds = JSON.parse(firstFFOddsStr) as Record<string, number>;
              if (body.selection === game.teamAId) {
                odds = firstFFOdds['teamA'] || 1.5;
              } else if (body.selection === game.teamBId) {
                odds = firstFFOdds['teamB'] || 1.5;
              }
            } catch {
              odds = 1.5;
            }
          } else {
            odds = 1.5;
          }
        }

        // Validar odd total para apostas múltiplas (ajustar se necessário)
        if (body.isMultiple && body.multipleId) {
          // Buscar todas as apostas existentes com o mesmo multipleId
          const existingBets = await prisma.bet.findMany({
            where: {
              multipleId: body.multipleId,
              userId: userId,
            },
            select: {
              odds: true,
            },
          });

          // Se foi fornecida uma odd ajustada (para limitar múltiplas a 3.0), usar ela
          if (body.adjustedOdds !== undefined && body.adjustedOdds > 0) {
            odds = body.adjustedOdds;
          } else if (existingBets.length > 0) {
            // Se não foi fornecida odd ajustada mas já existem outras apostas, calcular e ajustar
            // Calcular odd total (multiplicação de todas as odds, incluindo a atual)
            let totalOdds = odds;
            for (const existingBet of existingBets) {
              totalOdds *= existingBet.odds;
            }

            // Se passar de 3.0, ajustar a odd atual proporcionalmente
            if (totalOdds > 3.0) {
              // Calcular o fator de ajuste necessário
              const adjustmentFactor = 3.0 / totalOdds;
              odds = odds * adjustmentFactor;
            }
          }
        } else if (body.adjustedOdds !== undefined && body.adjustedOdds > 0) {
          // Se não é múltipla mas foi fornecida odd ajustada, usar ela (caso raro)
          odds = body.adjustedOdds;
        }

        // Create bet
        const bet = await prisma.bet.create({
          data: {
            userId,
            gameId: body.gameId,
            type: body.type,
            selection: body.selection,
            amount: body.amount,
            odds,
            status: 'PENDING',
            isMultiple: body.isMultiple,
            multipleId: body.multipleId,
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
        });

        // Deduct balance
        await prisma.user.update({
          where: { id: userId },
          data: { balance: { decrement: body.amount } },
        });

        // Create transaction
        await prisma.transaction.create({
          data: {
            userId,
            gameId: body.gameId,
            type: 'BET',
            amount: body.amount,
            description: `Aposta em ${game.teamA.name} vs ${game.teamB.name}`,
          },
        });

        return reply.code(201).send({ bet: mapBet(bet) });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({ error: 'Invalid data', details: error.errors });
        }
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Internal server error' });
      }
    },
  );

  // Get user bets
  fastify.get(
    '/bets',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const authUser = request.user as { id: string; role: string };
        const userId = authUser.id;
        const status = (request.query as any)?.status;

        const bets = await prisma.bet.findMany({
          where: {
            userId,
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
        });

        return reply.send({ bets: bets.map(mapBet) });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Internal server error' });
      }
    },
  );

  // Get ranking of users by winning bets
  fastify.get(
    '/bets/ranking',
    async (request, reply) => {
      try {
        // Buscar todas as apostas ganhas
        const wonBets = await prisma.bet.findMany({
          where: {
            status: 'WON',
          },
          select: {
            id: true,
            userId: true,
            type: true,
            isMultiple: true,
            multipleId: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        // Mapa para armazenar pontos por usuário
        const userPoints = new Map<string, { userId: string; userName: string; userEmail: string; points: number }>();

        // Separar apostas únicas e múltiplas
        const singleBets: typeof wonBets = [];
        const multipleBetsMap = new Map<string, typeof wonBets>();

        for (const bet of wonBets) {
          if (bet.isMultiple && bet.multipleId) {
            if (!multipleBetsMap.has(bet.multipleId)) {
              multipleBetsMap.set(bet.multipleId, []);
            }
            multipleBetsMap.get(bet.multipleId)!.push(bet);
          } else {
            singleBets.push(bet);
          }
        }

        // Contar pontos de apostas únicas (1 ponto cada)
        for (const bet of singleBets) {
          const userId = bet.userId;
          if (!userPoints.has(userId)) {
            userPoints.set(userId, {
              userId,
              userName: bet.user.name,
              userEmail: bet.user.email,
              points: 0,
            });
          }
          userPoints.get(userId)!.points += 1;
        }

        // Processar apostas múltiplas
        for (const [multipleId, bets] of multipleBetsMap.entries()) {
          // Buscar TODAS as apostas do grupo (não apenas as ganhas)
          const allBetsInMultiple = await prisma.bet.findMany({
            where: {
              multipleId,
              userId: bets[0].userId,
            },
            select: {
              id: true,
              status: true,
              type: true,
            },
          });

          // Verificar se todas as apostas do grupo são WON
          const allWon = allBetsInMultiple.length > 0 && allBetsInMultiple.every(b => b.status === 'WON');
          
          if (allWon) {
            const userId = bets[0].userId;
            if (!userPoints.has(userId)) {
              userPoints.set(userId, {
                userId,
                userName: bets[0].user.name,
                userEmail: bets[0].user.email,
                points: 0,
              });
            }

            // Contar 1 ponto para cada tipo de mercado diferente na múltipla
            const uniqueTypes = new Set(allBetsInMultiple.map(b => b.type));
            userPoints.get(userId)!.points += uniqueTypes.size;
          }
        }

        // Converter para array e ordenar por pontos (decrescente)
        const ranking = Array.from(userPoints.values())
          .sort((a, b) => b.points - a.points)
          .map((user, index) => ({
            position: index + 1,
            ...user,
          }));

        return reply.send({ ranking });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Internal server error' });
      }
    },
  );
}

