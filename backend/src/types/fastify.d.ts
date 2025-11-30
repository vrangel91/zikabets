import 'fastify';
import { FastifyRequest, FastifyReply } from 'fastify';
import '@fastify/jwt';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string;
      role: string;
    };
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      id: string;
      role: string;
    };
  }
}

