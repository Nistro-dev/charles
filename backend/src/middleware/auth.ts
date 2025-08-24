import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthenticationError, AuthorizationError, UserRole } from '../types';

export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    await request.jwtVerify();
  } catch (error) {
    throw new AuthenticationError('Invalid or missing authentication token');
  }
}

export function requireRole(roles: UserRole[]): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      await request.jwtVerify();
      
      const userRole = (request.user as any)?.role;
      if (!userRole || !roles.includes(userRole)) {
        throw new AuthorizationError(`Access denied. Required roles: ${roles.join(', ')}`);
      }
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        throw error;
      }
      throw new AuthenticationError('Invalid or missing authentication token');
    }
  };
}

export function requireAdmin(): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return requireRole([UserRole.ADMIN]);
}

export function requireUser(): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return requireRole([UserRole.USER, UserRole.ADMIN]);
}

export async function optionalAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    await request.jwtVerify();
  } catch (error) {
    // Optional auth - don't throw error, just don't set user
    (request as any).user = null;
  }
}

export function validateUserAccess(userIdParam: string): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      await request.jwtVerify();
      
      const user = (request.user as any);
      const requestedUserId = parseInt((request.params as any)[userIdParam], 10);
      
      // Admin can access any user
      if (user.role === UserRole.ADMIN) {
        return;
      }
      
      // Users can only access their own data
      if (user.id !== requestedUserId) {
        throw new AuthorizationError('Access denied. You can only access your own data.');
      }
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        throw error;
      }
      throw new AuthenticationError('Invalid or missing authentication token');
    }
  };
} 