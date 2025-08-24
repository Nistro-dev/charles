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

      this.sendSuccess(reply, {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      }, 'Connexion réussie');
    } catch (error) {
      this.handleError(reply, error, request);
    }
  }

  async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userData = request.body as CreateUserDto;
      const result = await this.authService.register(userData);

      this.sendCreated(reply, {
        user: result.user,
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