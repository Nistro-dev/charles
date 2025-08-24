import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth';

export async function routes(fastify: FastifyInstance) {
  // Register all route modules
  await fastify.register(authRoutes, { prefix: '/auth' });

  // Health check route
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });
} 