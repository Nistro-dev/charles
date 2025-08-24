import { UserRepository } from '../repositories/UserRepository';
import { IUserService, CreateUserDto, UpdateUserDto, User, PaginatedResponse } from '../types';
import { NotFoundError, ValidationError } from '../types';

export class UserService implements IUserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(data: CreateUserDto): Promise<User> {
    try {
      // Validate input
      this.validateCreateUserData(data);

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new ValidationError('User with this email already exists');
      }

      // Create user
      return await this.userRepository.create(data);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to create user');
    }
  }

  async findUserById(id: number): Promise<User | null> {
    try {
      if (!id || id <= 0) {
        throw new ValidationError('Invalid user ID');
      }

      return await this.userRepository.findById(id);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to find user');
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      if (!email || !this.isValidEmail(email)) {
        throw new ValidationError('Invalid email address');
      }

      return await this.userRepository.findByEmail(email);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to find user');
    }
  }

  async updateUser(id: number, data: UpdateUserDto): Promise<User> {
    try {
      if (!id || id <= 0) {
        throw new ValidationError('Invalid user ID');
      }

      // Validate update data
      this.validateUpdateUserData(data);

      // Check if user exists
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        throw new NotFoundError('User');
      }

      // Check if email is being updated and if it's already taken
      if (data.email && data.email !== existingUser.email) {
        const userWithEmail = await this.userRepository.findByEmail(data.email);
        if (userWithEmail) {
          throw new ValidationError('Email is already taken');
        }
      }

      // Update user
      return await this.userRepository.update(id, data);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to update user');
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      if (!id || id <= 0) {
        throw new ValidationError('Invalid user ID');
      }

      // Check if user exists
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        throw new NotFoundError('User');
      }

      await this.userRepository.delete(id);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to delete user');
    }
  }

  async listUsers(page: number = 1, limit: number = 10): Promise<PaginatedResponse<User>> {
    try {
      // Validate pagination parameters
      if (page < 1) page = 1;
      if (limit < 1 || limit > 100) limit = 10;

      const { users, total } = await this.userRepository.findAll({ page, limit });
      const totalPages = Math.ceil(total / limit);

      return {
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      throw new Error('Failed to list users');
    }
  }

  async getActiveUsers(): Promise<User[]> {
    try {
      return await this.userRepository.findActiveUsers();
    } catch (error) {
      throw new Error('Failed to get active users');
    }
  }

  async getUsersByRole(role: string): Promise<User[]> {
    try {
      if (!role) {
        throw new ValidationError('Role is required');
      }

      return await this.userRepository.findByRole(role);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to get users by role');
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    try {
      if (!query || query.trim().length < 2) {
        throw new ValidationError('Search query must be at least 2 characters long');
      }

      return await this.userRepository.searchUsers(query.trim());
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to search users');
    }
  }

  private validateCreateUserData(data: CreateUserDto): void {
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

  private validateUpdateUserData(data: UpdateUserDto): void {
    const errors: string[] = [];

    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Valid email is required');
    }

    if (data.firstName && data.firstName.length < 2) {
      errors.push('First name must be at least 2 characters long');
    }

    if (data.lastName && data.lastName.length < 2) {
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