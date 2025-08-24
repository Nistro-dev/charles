import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@/types';
import { config } from '../config';
import { UserRepository } from '../repositories/UserRepository';
import { IAuthService, LoginDto, CreateUserDto, AuthTokens, JwtPayload, User } from '../types';
import { AuthenticationError, ValidationError } from '../types';

export class AuthService implements IAuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async login(credentials: LoginDto): Promise<{ user: any; tokens: AuthTokens }> {
    try {
      // Validate input
      if (!credentials.email || !credentials.password) {
        throw new ValidationError('Email and password are required');
      }

      // Find user by email
      const user = await this.userRepository.findByEmailWithPassword(credentials.email);
      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AuthenticationError('Account is deactivated');
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(credentials.password, user.password);
      if (!isValidPassword) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Generate tokens
      const tokens = await this.generateTokens(user as any);

      return { user, tokens };
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof ValidationError) {
        throw error;
      }
      throw new AuthenticationError('Login failed');
    }
  }

  async register(userData: CreateUserDto): Promise<{ user: any; tokens: AuthTokens }> {
    try {
      // Validate input
      this.validateRegistrationData(userData);

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new ValidationError('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Create user
      const user = await this.userRepository.create({
        ...userData,
        password: hashedPassword,
        role: userData.role || UserRole.USER,
        isActive: true,
      });

      // Generate tokens
      const tokens = await this.generateTokens(user as any);

      return { user, tokens };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Registration failed');
    }
  }

  async refreshToken(token: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      
      // Find user
      const user = await this.userRepository.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Generate new tokens
      return await this.generateTokens(user);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid refresh token');
      }
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError('Token refresh failed');
    }
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      
      // Check if user still exists and is active
      const user = await this.userRepository.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new AuthenticationError('Invalid token');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid token');
      }
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError('Token validation failed');
    }
  }

  async logout(userId: number): Promise<void> {
    try {
      // In a real application, you might want to:
      // 1. Add the token to a blacklist
      // 2. Update user's last logout time
      // 3. Clear refresh tokens
      
      // For now, we'll just validate that the user exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AuthenticationError('User not found');
      }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new Error('Logout failed');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private validateRegistrationData(data: CreateUserDto): void {
    const errors: string[] = [];

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Valid email is required');
    }

    if (!data.password || data.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (!data.firstName || data.firstName.length < 2) {
      errors.push('First name must be at least 2 characters long');
    }

    if (!data.lastName || data.lastName.length < 2) {
      errors.push('Last name must be at least 2 characters long');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 