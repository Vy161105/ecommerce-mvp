import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.ORDER_POSTGRES_HOST || 'localhost',
  port: Number(process.env.ORDER_POSTGRES_PORT || 5435),
  user: process.env.ORDER_POSTGRES_USER || 'postgres',
  password: process.env.ORDER_POSTGRES_PASSWORD || 'postgres',
  database: process.env.ORDER_POSTGRES_DB || 'order_db'
});
