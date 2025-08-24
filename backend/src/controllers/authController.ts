import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/AuthService';
import { BaseController } from './BaseController';
import { LoginDto, CreateUserDto } from '../types';

export class AuthController extends BaseController {
  private authService: AuthService;

  constructor() {
    super();
    this.authService = new AuthService();
  }

  async login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const credentials = request.body as LoginDto;
      const result = await this.authService.login(credentials);

      console.log('🔍 AuthController login result:', result);

      const userData = result.user.toJSON ? result.user.toJSON() : result.user;
      console.log('🔍 AuthController userData:', userData);
      console.log('🔍 AuthController userData type:', typeof userData);
      console.log('🔍 AuthController userData keys:', Object.keys(userData));
      
      const responseData = {
        user: userData,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      };

      console.log('🔍 AuthController sending response:', responseData);
      console.log('🔍 AuthController responseData type:', typeof responseData);
      console.log('🔍 AuthController responseData keys:', Object.keys(responseData));
      console.log('🔍 AuthController responseData.user:', responseData.user);
      console.log('🔍 AuthController responseData.accessToken:', responseData.accessToken);
      console.log('🔍 AuthController responseData.refreshToken:', responseData.refreshToken);

      this.sendSuccess(reply, responseData, 'Connexion réussie');
    } catch (error) {
      console.error('❌ AuthController login error:', error);
      this.handleError(reply, error, request);
    }
  }

  async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userData = request.body as CreateUserDto;
      const result = await this.authService.register(userData);

      this.sendCreated(reply, {
        user: result.user.toJSON ? result.user.toJSON() : result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      }, 'Utilisateur inscrit avec succès');
    } catch (error) {
      this.handleError(reply, error, request);
    }
  }

  async refreshToken(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { refreshToken } = request.body as { refreshToken: string };
      
      if (!refreshToken) {
        this.sendError(reply, 'Token de rafraîchissement requis', 400);
        return;
      }

      const tokens = await this.authService.refreshToken(refreshToken);
      this.sendSuccess(reply, tokens, 'Token rafraîchi avec succès');
    } catch (error) {
      this.handleError(reply, error, request);
    }
  }

  async me(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userId = this.getUserId(request);
      const userService = new (await import('../services/UserService')).UserService();
      const user = await userService.findUserById(userId);

      if (!user) {
        this.sendError(reply, 'Utilisateur non trouvé', 404);
        return;
      }

      this.sendSuccess(reply, { user }, 'Profil utilisateur récupéré avec succès');
    } catch (error) {
      this.handleError(reply, error, request);
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userId = this.getUserId(request);
      await this.authService.logout(userId);
      this.sendSuccess(reply, null, 'Déconnexion réussie');
    } catch (error) {
      this.handleError(reply, error, request);
    }
  }

  async validateToken(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { token } = request.body as { token: string };
      
      if (!token) {
        this.sendError(reply, 'Token requis', 400);
        return;
      }

      const payload = await this.authService.validateToken(token);
      this.sendSuccess(reply, { payload }, 'Token valide');
    } catch (error) {
      this.handleError(reply, error, request);
    }
  }
} 