import { Sequelize } from 'sequelize';
import { config } from './index';
import { DatabaseConfig } from '../types';

export class Database {
  private static instance: Database;
  private sequelize: Sequelize;

  private constructor() {
    const dbConfig: DatabaseConfig = {
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      username: config.database.user,
      password: config.database.password,
    };

    this.sequelize = new Sequelize({
      dialect: 'mysql',
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      username: dbConfig.username,
      password: dbConfig.password,
      logging: config.nodeEnv === 'development' ? console.log : false,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
        paranoid: true, // Soft deletes
      },
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      dialectOptions: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        supportBigNumbers: true,
        bigNumberStrings: true,
      },
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getSequelize(): Sequelize {
    return this.sequelize;
  }

  public async connect(): Promise<void> {
    try {
      await this.sequelize.authenticate();
      console.log('✅ Database connection established successfully.');
    } catch (error) {
      console.error('❌ Unable to connect to the database:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.sequelize.close();
      console.log('✅ Database connection closed successfully.');
    } catch (error) {
      console.error('❌ Error closing database connection:', error);
      throw error;
    }
  }

  public async sync(options?: { force?: boolean; alter?: boolean }): Promise<void> {
    try {
      await this.sequelize.sync(options);
      console.log('✅ Database synchronized successfully.');
    } catch (error) {
      console.error('❌ Error synchronizing database:', error);
      throw error;
    }
  }

  public async transaction<T>(callback: (transaction: any) => Promise<T>): Promise<T> {
    const transaction = await this.sequelize.transaction();
    try {
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export const database = Database.getInstance();
export const sequelize = database.getSequelize(); 