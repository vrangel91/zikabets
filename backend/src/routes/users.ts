import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { mapUser } from '../utils/mappers.js';

const updateProfileSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
});

export default async function userRoutes(fastify: FastifyInstance) {
  // Get current user profile
  fastify.get(
    '/users/me',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const authUser = request.user as { id: string; role: string };
        const userId = authUser.id;

        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          return reply.code(404).send({ error: 'User not found' });
        }

        const mappedUser = mapUser(user);
        // Parse adminPermissions se existir
        const userResponse = {
          ...mappedUser,
          adminPermissions: (mappedUser as any).adminPermissions
            ? JSON.parse((mappedUser as any).adminPermissions)
            : null,
        };

        return reply.send({ user: userResponse });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Internal server error' });
      }
    },
  );

  // Update profile
  fastify.patch(
    '/users/me',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const authUser = request.user as { id: string; role: string };
        const userId = authUser.id;
        const body = updateProfileSchema.parse(request.body);

        // Check if email is already taken
        if (body.email) {
          const existingUser = await prisma.user.findFirst({
            where: {
              email: body.email,
              NOT: { id: userId },
            },
          });

          if (existingUser) {
            return reply.code(400).send({ error: 'Email already in use' });
          }
        }

        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            ...(body.name && { name: body.name }),
            ...(body.email && { email: body.email }),
          },
        });

        return reply.send({ user: mapUser(updatedUser) });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({ error: 'Invalid data', details: error.errors });
        }
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Internal server error' });
      }
    },
  );
}

