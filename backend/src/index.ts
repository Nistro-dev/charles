import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config';
import { database } from './database';
import { routes } from './routes';

const fastify = Fastify({
  logger: {
    level: config.logLevel,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Plugins
async function registerPlugins() {
  // CORS
  await fastify.register(cors, {
    origin: config.corsOrigin,
    credentials: true,
  });

  // Helmet pour la sécurité
  await fastify.register(helmet);

  // JWT
  await fastify.register(jwt, {
    secret: config.jwtSecret,
  });

  // Swagger
  await fastify.register(swagger, {
    swagger: {
      info: {
        title: 'Thales API',
        description: 'API documentation for Thales project',
        version: '1.0.0',
      },
      host: `localhost:${config.port}`,
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
  });
}

// Routes
async function registerRoutes() {
  await fastify.register(routes, { prefix: '/api' });
}

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Hook pour logger toutes les réponses
fastify.addHook('onSend', (request, reply, payload, done) => {
  console.log('🔍 Fastify onSend hook - URL:', request.url);
  console.log('🔍 Fastify onSend hook - Method:', request.method);
  console.log('🔍 Fastify onSend hook - Status:', reply.statusCode);
  console.log('🔍 Fastify onSend hook - Payload:', payload);
  done();
});

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  
  if (error.validation) {
    return reply.status(400).send({
      error: 'Validation Error',
      message: error.message,
      details: error.validation,
    });
  }

  return reply.status(500).send({
    error: 'Internal Server Error',
    message: 'Something went wrong',
  });
});

// Start server
async function start() {
  try {
    // Connect to database
    await database.authenticate();
    fastify.log.info('Database connected successfully');

    // Register plugins and routes
    await registerPlugins();
    await registerRoutes();

    // Start server
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    fastify.log.info(`Server is running on http://localhost:${config.port}`);
    fastify.log.info(`API Documentation available at http://localhost:${config.port}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start(); 