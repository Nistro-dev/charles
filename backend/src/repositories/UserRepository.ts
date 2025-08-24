import { Op } from 'sequelize';
import { User } from '../models/User';
import { IUserRepository, CreateUserDto, User as UserType } from '../types';
import { NotFoundError } from '../types';

export class UserRepository implements IUserRepository {
  async create(data: CreateUserDto): Promise<UserType> {
    try {
      const user = await User.create(data);
      return user.toJSON() as UserType;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }
      throw error;
    }
  }

  async findById(id: number): Promise<UserType | null> {
    try {
      const user = await User.findByPk(id);
      return user ? user.toJSON() as UserType : null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to find user by ID: ${error.message}`);
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserType | null> {
    try {
      const user = await User.findOne({ where: { email } });
      return user ? user.toJSON() as UserType : null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to find user by email: ${error.message}`);
      }
      throw error;
    }
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    try {
      const user = await User.findOne({ where: { email } });
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to find user by email: ${error.message}`);
      }
      throw error;
    }
  }

  async update(id: number, data: Partial<UserType>): Promise<UserType> {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new NotFoundError('User');
      }

      await user.update(data);
      return user.toJSON() as UserType;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new Error(`Failed to update user: ${error.message}`);
      }
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new NotFoundError('User');
      }

      await user.destroy();
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new Error(`Failed to delete user: ${error.message}`);
      }
      throw error;
    }
  }

  async findAll(options?: { page?: number; limit?: number }): Promise<{ users: UserType[]; total: number }> {
    try {
      const { page = 1, limit = 10 } = options || {};
      const offset = (page - 1) * limit;

      const { rows: users, count: total } = await User.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      return {
        users: users.map(user => user.toJSON() as UserType),
        total,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to find users: ${error.message}`);
      }
      throw error;
    }
  }

  async findActiveUsers(): Promise<UserType[]> {
    try {
      const users = await User.findAll({
        where: { isActive: true },
        order: [['createdAt', 'DESC']],
      });

      return users.map(user => user.toJSON() as UserType);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to find active users: ${error.message}`);
      }
      throw error;
    }
  }

  async findByRole(role: string): Promise<UserType[]> {
    try {
      const users = await User.findAll({
        where: { role },
        order: [['createdAt', 'DESC']],
      });

      return users.map(user => user.toJSON() as UserType);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to find users by role: ${error.message}`);
      }
      throw error;
    }
  }

  async searchUsers(query: string): Promise<UserType[]> {
    try {
      const users = await User.findAll({
        where: {
          [Op.or]: [
            { firstName: { [Op.like]: `%${query}%` } },
            { lastName: { [Op.like]: `%${query}%` } },
            { email: { [Op.like]: `%${query}%` } },
          ],
        },
        order: [['createdAt', 'DESC']],
      });

      return users.map(user => user.toJSON() as UserType);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to search users: ${error.message}`);
      }
      throw error;
    }
  }
} 