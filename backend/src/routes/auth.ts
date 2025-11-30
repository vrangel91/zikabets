import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { mapUser } from '../utils/mappers.js';

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export default async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post('/auth/register', async (request, reply) => {
    try {
      const body = registerSchema.parse(request.body);

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: body.email }, { cpf: body.cpf.replace(/\D/g, '') }],
        },
      });

      if (existingUser) {
        return reply.code(400).send({
          error: 'User already exists with this email or CPF',
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(body.password);

      // Create user
      const user = await prisma.user.create({
        data: {
          name: body.name,
          email: body.email,
          cpf: body.cpf.replace(/\D/g, ''),
          password: hashedPassword,
          role: 'USER',
        },
      });

      // Generate JWT
      const token = fastify.jwt.sign(
        {
          sub: user.id,
          role: user.role,
        },
        { expiresIn: '7d' },
      );

      const mappedUser = mapUser(user);
      const userResponse = {
        ...mappedUser,
        adminPermissions: (mappedUser as any).adminPermissions
          ? JSON.parse((mappedUser as any).adminPermissions)
          : null,
      };

      return reply.code(201).send({
        user: userResponse,
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Invalid data', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Login
  fastify.post('/auth/login', async (request, reply) => {
    try {
      const body = loginSchema.parse(request.body);
      
      // Normalizar email (lowercase)
      const normalizedEmail = body.email.toLowerCase().trim();
      
      fastify.log.info({ msg: 'Login attempt', email: normalizedEmail });

      // Find user (buscar com email normalizado)
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        fastify.log.warn({ msg: 'User not found', email: normalizedEmail });
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await comparePassword(body.password, user.password);

      if (!isValidPassword) {
        fastify.log.warn({ msg: 'Invalid password', email: normalizedEmail, userId: user.id });
        return reply.code(401).send({ error: 'Invalid credentials' });
      }
      
      fastify.log.info({ msg: 'Login successful', userId: user.id, email: normalizedEmail });

      // Generate JWT
      const token = fastify.jwt.sign(
        {
          sub: user.id,
          role: user.role,
        },
        { expiresIn: '7d' },
      );

      const mappedUser = mapUser(user);
      const userResponse = {
        ...mappedUser,
        adminPermissions: (mappedUser as any).adminPermissions
          ? JSON.parse((mappedUser as any).adminPermissions)
          : null,
      };

      return reply.send({
        user: userResponse,
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Invalid data', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}

