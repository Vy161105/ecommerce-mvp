import { Pool } from 'pg';

export const pool = new Pool({
  host: process.env.SHIPMENT_POSTGRES_HOST || 'localhost',
  port: Number(process.env.SHIPMENT_POSTGRES_PORT || 5436),
  user: process.env.SHIPMENT_POSTGRES_USER || 'postgres',
  password: process.env.SHIPMENT_POSTGRES_PASSWORD || 'postgres',
  database: process.env.SHIPMENT_POSTGRES_DB || 'shipment_db'
});