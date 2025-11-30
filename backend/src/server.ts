import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';
import prisma from './lib/prisma.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import walletRoutes from './routes/wallet.js';
import gameRoutes from './routes/games.js';
import betRoutes from './routes/bets.js';
import adminRoutes from './routes/admin.js';
import proxyRoutes from './routes/proxy.js';
import championshipRoutes from './routes/championship.js';

dotenv.config();

const app = Fastify({
  logger: true,
});

// CORS
await app.register(cors, {
  origin: true,
  credentials: true,
});

// JWT
await app.register(jwt, {
  secret: process.env.JWT_SECRET || 'zikabet-super-secret-jwt-key-change-in-production',
});

// Authentication middleware
app.decorate('authenticate', async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
    const decoded = request.user as { sub: string; role: string };
    request.user = {
      id: decoded.sub,
      role: decoded.role,
    };
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});

// Admin middleware
app.decorate('requireAdmin', async (request: any, reply: any) => {
  if (request.user?.role !== 'ADMIN') {
    reply.code(403).send({ error: 'Forbidden: Admin access required' });
  }
});

// Routes
await app.register(proxyRoutes); // Registrar proxy primeiro para garantir que /x está disponível
await app.register(authRoutes);
await app.register(userRoutes);
await app.register(walletRoutes);
await app.register(gameRoutes);
await app.register(betRoutes);
await app.register(adminRoutes);
try {
  await app.register(championshipRoutes);
} catch (error) {
  console.error('❌ Erro ao registrar rotas de campeonato:', error);
  console.error('❌ Stack:', error instanceof Error ? error.stack : 'N/A');
  throw error;
}

// Health check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Start server
const port = Number(process.env.PORT) || 3333;
const host = '0.0.0.0';

try {
  await app.listen({ port, host });
  console.log(`🚀 Server running on http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await app.close();
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await app.close();
  await prisma.$disconnect();
});
