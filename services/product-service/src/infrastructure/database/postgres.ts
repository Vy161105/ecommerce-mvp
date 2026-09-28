import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.PRODUCT_DB_HOST,
  port: Number(process.env.PRODUCT_DB_PORT),
  database: process.env.PRODUCT_DB_NAME,
  user: process.env.PRODUCT_DB_USER,
  password: process.env.PRODUCT_DB_PASSWORD
});
