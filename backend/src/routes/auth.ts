import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

export async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post('/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Register a new user',
      body: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          firstName: { type: 'string', minLength: 2 },
          lastName: { type: 'string', minLength: 2 },
        },
      },
      response: {
        201: {
          type: 'object',
          additionalProperties: false,
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              additionalProperties: true,
              properties: {
                user: { type: 'object', additionalProperties: true },
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
              },
              required: ['user', 'accessToken', 'refreshToken']
            },
          },
          required: ['success', 'data']
        },
      },
    },
  }, (req, reply) => new AuthController().register(req, reply));

  // Login
  fastify.post('/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Login user',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          additionalProperties: false,
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              additionalProperties: true,
              properties: {
                user: { type: 'object', additionalProperties: true },
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
              },
              required: ['user', 'accessToken', 'refreshToken']
            },
          },
          required: ['success', 'data']
        },
      },
    },
  }, (req, reply) => new AuthController().login(req, reply));

  // Get current user
  fastify.get('/me', {
    preHandler: authenticate,
    schema: {
      tags: ['Auth'],
      summary: 'Get current user',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          additionalProperties: false,
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              additionalProperties: true,
              properties: {
                user: { type: 'object', additionalProperties: true },
              },
              required: ['user']
            },
          },
          required: ['success', 'data']
        },
      },
    },
  }, (req, reply) => new AuthController().me(req, reply));
} 