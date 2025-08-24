import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME || 'thales_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
  },

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // API
  apiPrefix: '/api',
} as const; 