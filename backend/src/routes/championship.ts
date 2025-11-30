import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma.js';

const createChampionshipSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'FINISHED']).optional(),
  startPhase: z.enum(['GROUPS', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL']).default('GROUPS'),
  hasRoundOf16: z.boolean().default(false),
  hasQuarterFinals: z.boolean().default(false),
  hasSemiFinals: z.boolean().default(false),
  hasFinal: z.boolean().default(true),
});

const createGroupSchema = z.object({
  name: z.string().min(1),
});

const createTeamSchema = z.object({
  name: z.string().min(1),
  logo: z.string().optional(),
});

const createPlayerSchema = z.object({
  name: z.string().min(1),
});

const updateTeamSchema = z.object({
  name: z.string().min(1).optional(),
  logo: z.string().optional().nullable(),
  points: z.number().int().optional(),
  wins: z.number().int().optional(),
  losses: z.number().int().optional(),
  advanced: z.boolean().optional(),
});

const createMatchSchema = z.object({
  phase: z.enum(['GROUPS', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL']),
  teamAId: z.string().optional().nullable(),
  teamBId: z.string().optional().nullable(),
  scoreA: z.number().int().optional().nullable(),
  scoreB: z.number().int().optional().nullable(),
  matchDate: z.string().optional().nullable().or(z.literal('')),
}).transform((data) => ({
  ...data,
  matchDate: data.matchDate === '' || !data.matchDate ? null : data.matchDate,
}));

const updateMatchSchema = z.object({
  teamAId: z.string().optional().nullable(),
  teamBId: z.string().optional().nullable(),
  scoreA: z.number().int().optional().nullable(),
  scoreB: z.number().int().optional().nullable(),
  status: z.enum(['SCHEDULED', 'LIVE', 'FINISHED']).optional(),
  matchDate: z.string().optional().nullable().or(z.literal('')),
}).transform((data) => ({
  ...data,
  matchDate: data.matchDate === '' || !data.matchDate ? null : data.matchDate,
}));

export default async function championshipRoutes(fastify: FastifyInstance) {
  // Rotas públicas - visualização do campeonato (ANTES do hook de autenticação)
  // Registrar a rota pública primeiro
  fastify.get('/championship', async (request, reply) => {
    try {
      const championship = await prisma.championship.findFirst({
        where: { status: { in: ['ACTIVE', 'FINISHED'] } },
        include: {
          groups: {
            include: {
              teams: {
                include: {
                  players: true,
                },
                orderBy: [
                  { points: 'desc' },
                  { wins: 'desc' },
                ],
              },
            },
            orderBy: { name: 'asc' },
          },
          matches: {
            include: {
              teamA: true,
              teamB: true,
            },
            orderBy: [
              { phase: 'asc' },
              { matchDate: 'asc' },
            ],
          },
          config: true,
        },
      });

      if (!championship) {
        return reply.code(404).send({ error: 'Nenhum campeonato ativo encontrado' });
      }

      return reply.send({ championship });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Rotas admin - requerem autenticação
  // Registrar rotas admin em um plugin separado para aplicar o hook apenas nelas
  await fastify.register(async function adminChampionshipRoutes(fastify: FastifyInstance) {
    // Hook de autenticação apenas para rotas dentro deste plugin
    fastify.addHook('onRequest', async (request, reply) => {
      await fastify.authenticate(request, reply);
      const user = request.user as { id: string; role: string } | undefined;
      if (!user || user.role !== 'ADMIN') {
        return reply.code(403).send({ error: 'Forbidden: Admin access required' });
      }
    });

  // Criar campeonato
  fastify.post('/m/championship', async (request, reply) => {
    try {
      const body = createChampionshipSchema.parse(request.body);

      const championship = await prisma.championship.create({
        data: {
          name: body.name,
          description: body.description,
          status: 'DRAFT',
          startPhase: body.startPhase,
          config: {
            create: {
              hasRoundOf16: body.hasRoundOf16,
              hasQuarterFinals: body.hasQuarterFinals,
              hasSemiFinals: body.hasSemiFinals,
              hasFinal: body.hasFinal,
              startPhase: body.startPhase,
            },
          },
        },
        include: {
          config: true,
        },
      });

      return reply.code(201).send({ championship });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Invalid data', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Obter campeonato (admin - pode ver drafts)
  fastify.get('/m/championship', async (request, reply) => {
    try {
      const championship = await prisma.championship.findFirst({
        include: {
          groups: {
            include: {
              teams: {
                include: {
                  players: true,
                },
                orderBy: [
                  { points: 'desc' },
                  { wins: 'desc' },
                ],
              },
            },
            orderBy: { name: 'asc' },
          },
          matches: {
            include: {
              teamA: true,
              teamB: true,
            },
            orderBy: [
              { phase: 'asc' },
              { matchDate: 'asc' },
            ],
          },
          config: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!championship) {
        return reply.code(404).send({ error: 'Nenhum campeonato encontrado' });
      }

      return reply.send({ championship });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Atualizar campeonato
  fastify.put('/m/championship/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = createChampionshipSchema.partial().parse(request.body);

      const updateData: any = {};
      if (body.name !== undefined) updateData.name = body.name;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.startPhase !== undefined) updateData.startPhase = body.startPhase;
      if (body.status !== undefined) {
        updateData.status = body.status;
      }

      const championship = await prisma.championship.update({
        where: { id },
        data: updateData,
        include: {
          config: true,
        },
      });

      // Atualizar config se fornecido
      if (body.hasRoundOf16 !== undefined || body.hasQuarterFinals !== undefined || 
          body.hasSemiFinals !== undefined || body.hasFinal !== undefined || body.startPhase) {
        await prisma.championshipConfig.upsert({
          where: { championshipId: id },
          create: {
            championshipId: id,
            hasRoundOf16: body.hasRoundOf16 ?? false,
            hasQuarterFinals: body.hasQuarterFinals ?? false,
            hasSemiFinals: body.hasSemiFinals ?? false,
            hasFinal: body.hasFinal ?? true,
            startPhase: body.startPhase ?? 'GROUPS',
          },
          update: {
            hasRoundOf16: body.hasRoundOf16,
            hasQuarterFinals: body.hasQuarterFinals,
            hasSemiFinals: body.hasSemiFinals,
            hasFinal: body.hasFinal,
            startPhase: body.startPhase,
          },
        });
      }

      const updated = await prisma.championship.findUnique({
        where: { id },
        include: { config: true },
      });

      return reply.send({ championship: updated });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Invalid data', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Criar grupo
  fastify.post('/m/championship/:championshipId/groups', async (request, reply) => {
    try {
      const { championshipId } = request.params as { championshipId: string };
      const body = createGroupSchema.parse(request.body);

      const group = await prisma.championshipGroup.create({
        data: {
          championshipId,
          name: body.name,
        },
        include: {
          teams: {
            include: {
              players: true,
            },
          },
        },
      });

      return reply.code(201).send({ group });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Invalid data', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Deletar grupo
  fastify.delete('/m/championship/groups/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await prisma.championshipGroup.delete({ where: { id } });
      return reply.send({ message: 'Grupo deletado' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Criar time no grupo
  fastify.post('/m/championship/groups/:groupId/teams', async (request, reply) => {
    try {
      const { groupId } = request.params as { groupId: string };
      const body = createTeamSchema.parse(request.body);

      const team = await prisma.championshipTeam.create({
        data: {
          groupId,
          name: body.name,
          logo: body.logo,
        },
        include: {
          players: true,
        },
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

  // Atualizar time
  fastify.put('/m/championship/teams/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = updateTeamSchema.parse(request.body);

      const currentTeam = await prisma.championshipTeam.findUnique({ where: { id } });
      if (!currentTeam) {
        return reply.code(404).send({ error: 'Time não encontrado' });
      }

      const team = await prisma.championshipTeam.update({
        where: { id },
        data: {
          name: body.name,
          logo: body.logo,
          points: body.points,
          wins: body.wins,
          losses: body.losses,
          advanced: body.advanced,
        },
        include: {
          players: true,
        },
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

  // Deletar time
  fastify.delete('/m/championship/teams/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await prisma.championshipTeam.delete({ where: { id } });
      return reply.send({ message: 'Time deletado' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Adicionar jogador ao time
  fastify.post('/m/championship/teams/:teamId/players', async (request, reply) => {
    try {
      const { teamId } = request.params as { teamId: string };
      const body = createPlayerSchema.parse(request.body);

      const player = await prisma.championshipPlayer.create({
        data: {
          teamId,
          name: body.name,
        },
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

  // Deletar jogador
  fastify.delete('/m/championship/players/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await prisma.championshipPlayer.delete({ where: { id } });
      return reply.send({ message: 'Jogador deletado' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Criar partida
  fastify.post('/m/championship/:championshipId/matches', async (request, reply) => {
    try {
      const { championshipId } = request.params as { championshipId: string };
      let body;
      try {
        body = createMatchSchema.parse(request.body);
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error('❌ [CHAMPIONSHIP] Erro de validação:', error.errors);
          return reply.code(400).send({ 
            error: 'Invalid data', 
            details: error.errors 
          });
        }
        throw error;
      }

      const match = await prisma.championshipMatch.create({
        data: {
          championshipId,
          phase: body.phase,
          teamAId: body.teamAId,
          teamBId: body.teamBId,
          scoreA: body.scoreA,
          scoreB: body.scoreB,
          matchDate: body.matchDate ? (() => {
            // Converter formato datetime-local (YYYY-MM-DDTHH:mm) para Date
            const dateStr = body.matchDate;
            // datetime-local retorna YYYY-MM-DDTHH:mm (sem segundos e sem timezone)
            // Precisamos converter para um formato que o Date aceite
            // Se já tiver formato completo, usar diretamente
            try {
              // Tentar criar Date diretamente (aceita YYYY-MM-DDTHH:mm)
              const date = new Date(dateStr);
              // Verificar se a data é válida
              if (isNaN(date.getTime())) {
                console.warn('⚠️ [CHAMPIONSHIP] Data inválida:', dateStr);
                return null;
              }
              return date;
            } catch (error) {
              console.warn('⚠️ [CHAMPIONSHIP] Erro ao converter data:', dateStr, error);
              return null;
            }
          })() : null,
        },
        include: {
          teamA: {
            include: {
              players: true,
            },
          },
          teamB: {
            include: {
              players: true,
            },
          },
        },
      });

      return reply.code(201).send({ match });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Invalid data', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Atualizar partida
  fastify.put('/m/championship/matches/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      let body;
      try {
        body = updateMatchSchema.parse(request.body);
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error('❌ [CHAMPIONSHIP] Erro de validação:', error.errors);
          return reply.code(400).send({ 
            error: 'Invalid data', 
            details: error.errors 
          });
        }
        throw error;
      }

      const match = await prisma.championshipMatch.update({
        where: { id },
        data: {
          teamAId: body.teamAId,
          teamBId: body.teamBId,
          scoreA: body.scoreA,
          scoreB: body.scoreB,
          status: body.status,
          matchDate: body.matchDate ? (() => {
            // Converter formato datetime-local (YYYY-MM-DDTHH:mm) para Date
            const dateStr = body.matchDate;
            try {
              const date = new Date(dateStr);
              if (isNaN(date.getTime())) {
                console.warn('⚠️ [CHAMPIONSHIP] Data inválida:', dateStr);
                return undefined;
              }
              return date;
            } catch (error) {
              console.warn('⚠️ [CHAMPIONSHIP] Erro ao converter data:', dateStr, error);
              return undefined;
            }
          })() : undefined,
        },
        include: {
          teamA: {
            include: {
              players: true,
            },
          },
          teamB: {
            include: {
              players: true,
            },
          },
        },
      });

      // Se a partida foi finalizada e tem placar, atualizar estatísticas dos times
      if (body.status === 'FINISHED' && body.scoreA !== null && body.scoreB !== null && match.teamAId && match.teamBId) {
        const teamA = await prisma.championshipTeam.findUnique({ where: { id: match.teamAId } });
        const teamB = await prisma.championshipTeam.findUnique({ where: { id: match.teamBId } });

        if (teamA && teamB) {
          const scoreA = body.scoreA ?? 0;
          const scoreB = body.scoreB ?? 0;

          // Atualizar time A
          const teamAWins = scoreA > scoreB ? teamA.wins + 1 : teamA.wins;
          const teamALosses = scoreA < scoreB ? teamA.losses + 1 : teamA.losses;
          const teamAPoints = teamAWins * 3; // 3 pontos por vitória

          await prisma.championshipTeam.update({
            where: { id: match.teamAId },
            data: {
              wins: teamAWins,
              losses: teamALosses,
              points: teamAPoints,
            },
          });

          // Atualizar time B
          const teamBWins = scoreB > scoreA ? teamB.wins + 1 : teamB.wins;
          const teamBLosses = scoreB < scoreA ? teamB.losses + 1 : teamB.losses;
          const teamBPoints = teamBWins * 3; // 3 pontos por vitória

          await prisma.championshipTeam.update({
            where: { id: match.teamBId },
            data: {
              wins: teamBWins,
              losses: teamBLosses,
              points: teamBPoints,
            },
          });
        }
      }

      return reply.send({ match });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Invalid data', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Deletar partida
  fastify.delete('/m/championship/matches/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await prisma.championshipMatch.delete({ where: { id } });
      return reply.send({ message: 'Partida deletada' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  }); // Fechar o plugin de rotas admin
}

