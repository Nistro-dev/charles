// Types de base
export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

// Types d'authentification
export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Types utilisateur
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive?: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

// Types de réponse API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types de validation
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Types de configuration
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  logLevel: string;
}

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenExpiresIn: string;
}

export interface CorsConfig {
  origin: string;
  credentials: boolean;
}

// Types de middleware
export interface AuthenticatedRequest {
  user: JwtPayload;
}

// Types de service
export interface IUserService {
  createUser(data: CreateUserDto): Promise<User>;
  findUserById(id: number): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  updateUser(id: number, data: UpdateUserDto): Promise<User>;
  deleteUser(id: number): Promise<void>;
  listUsers(page?: number, limit?: number): Promise<PaginatedResponse<User>>;
}

export interface IAuthService {
  login(credentials: LoginDto): Promise<{ user: User; tokens: AuthTokens }>;
  register(userData: CreateUserDto): Promise<{ user: User; tokens: AuthTokens }>;
  refreshToken(token: string): Promise<AuthTokens>;
  validateToken(token: string): Promise<JwtPayload>;
  logout(userId: number): Promise<void>;
}

// Types de repository
export interface IUserRepository {
  create(data: CreateUserDto): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByEmailWithPassword(email: string): Promise<any | null>;
  update(id: number, data: Partial<User>): Promise<User>;
  delete(id: number): Promise<void>;
  findAll(options?: { page?: number; limit?: number }): Promise<{ users: User[]; total: number }>;
}

// Types d'erreurs
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public readonly details?: ValidationError[]) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
  }
} 