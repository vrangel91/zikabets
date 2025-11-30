import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';
import { mapTransaction } from '../utils/mappers.js';

export default async function walletRoutes(fastify: FastifyInstance) {
  // Get balance
  fastify.get(
    '/wallet/balance',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const authUser = request.user as { id: string; role: string };
        const userId = authUser.id;

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { balance: true },
        });

        if (!user) {
          return reply.code(404).send({ error: 'User not found' });
        }

        return reply.send({ balance: user.balance });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Internal server error' });
      }
    },
  );

  // Get transactions
  fastify.get(
    '/wallet/transactions',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const user = request.user as { id: string; role: string };
        const userId = user.id;
        const limit = Number((request.query as any)?.limit) || 20;

        const transactions = await prisma.transaction.findMany({
          where: { userId },
          include: {
            game: {
              include: {
                teamA: true,
                teamB: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
        });

        return reply.send({
          transactions: transactions.map(mapTransaction),
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Internal server error' });
      }
    },
  );
}
