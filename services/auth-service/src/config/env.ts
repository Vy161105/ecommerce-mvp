import 'dotenv/config';

export const env = {
  port: Number(process.env.AUTH_SERVICE_PORT ?? 3001),
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5433/auth_db',
};
