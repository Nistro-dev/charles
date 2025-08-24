import { FastifyRequest, FastifyReply } from 'fastify';
import { ApiResponse, AppError } from '../types';

export abstract class BaseController {
  protected sendSuccess<T>(
    reply: FastifyReply,
    data: T,
    message: string = 'Success',
    statusCode: number = 200
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
    };

    console.log('🔍 BaseController sendSuccess response (summary):', {
      hasData: response.data !== undefined && response.data !== null,
      message: response.message,
      statusCode,
    });
    reply.status(statusCode).send(response);
  }

  protected sendError(
    reply: FastifyReply,
    error: string | Error,
    statusCode: number = 500,
    details?: any
  ): void {
    const message = error instanceof Error ? error.message : error;
    
    const response: ApiResponse = {
      success: false,
      error: message,
      details,
    };

    reply.status(statusCode).send(response);
  }

  protected sendCreated<T>(
    reply: FastifyReply,
    data: T,
    message: string = 'Created successfully'
  ): void {
    this.sendSuccess(reply, data, message, 201);
  }

  protected sendNoContent(reply: FastifyReply): void {
    reply.status(204).send();
  }

  protected handleError(
    reply: FastifyReply,
    error: unknown,
    request: FastifyRequest
  ): void {
    request.log.error(error);

    if (error instanceof AppError) {
      this.sendError(reply, error, error.statusCode);
      return;
    }

    if (error instanceof Error) {
      this.sendError(reply, error.message, 500);
      return;
    }

    this.sendError(reply, 'Internal server error', 500);
  }

  protected getUserId(request: FastifyRequest): number {
    const user = (request as any).user;
    if (!user || !user.id) {
      throw new Error('User not authenticated');
    }
    return user.id;
  }

  protected getUserRole(request: FastifyRequest): string {
    const user = (request as any).user;
    if (!user || !user.role) {
      throw new Error('User not authenticated');
    }
    return user.role;
  }

  protected validatePaginationParams(page?: string, limit?: string): { page: number; limit: number } {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    if (isNaN(pageNum) || pageNum < 1) {
      throw new Error('Invalid page parameter');
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new Error('Invalid limit parameter (must be between 1 and 100)');
    }

    return { page: pageNum, limit: limitNum };
  }
} 