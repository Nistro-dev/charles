import { FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { AppError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError } from '../types';

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  request.log.error(error);

  // Handle known application errors
  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      success: false,
      error: error.message,
      statusCode: error.statusCode,
    });
    return;
  }

  // Handle validation errors
  if (error.validation) {
    reply.status(400).send({
      success: false,
      error: 'Validation Error',
      message: 'Invalid input data',
      details: error.validation,
      statusCode: 400,
    });
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    reply.status(401).send({
      success: false,
      error: 'Invalid token',
      message: 'The provided token is invalid',
      statusCode: 401,
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    reply.status(401).send({
      success: false,
      error: 'Token expired',
      message: 'The provided token has expired',
      statusCode: 401,
    });
    return;
  }

  // Handle database errors
  if (error.name === 'SequelizeValidationError') {
    reply.status(400).send({
      success: false,
      error: 'Database Validation Error',
      message: 'Invalid data provided',
      details: error.message,
      statusCode: 400,
    });
    return;
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    reply.status(409).send({
      success: false,
      error: 'Duplicate Entry',
      message: 'A record with this information already exists',
      statusCode: 409,
    });
    return;
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    reply.status(400).send({
      success: false,
      error: 'Foreign Key Constraint Error',
      message: 'Referenced record does not exist',
      statusCode: 400,
    });
    return;
  }

  // Handle connection errors
  if (error.code === 'ECONNREFUSED') {
    reply.status(503).send({
      success: false,
      error: 'Service Unavailable',
      message: 'Database connection failed',
      statusCode: 503,
    });
    return;
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : error.message;

  reply.status(statusCode).send({
    success: false,
    error: message,
    statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
} 