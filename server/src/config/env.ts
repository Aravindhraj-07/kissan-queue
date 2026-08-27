import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/procurex',
  JWT_SECRET: process.env.JWT_SECRET || 'procurex_fallback_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  NO_SHOW_GRACE_MINUTES: parseInt(process.env.NO_SHOW_GRACE_MINUTES || '30', 10),
  AVG_PROCUREMENT_MINUTES: parseInt(process.env.AVG_PROCUREMENT_MINUTES || '12', 10),
};
