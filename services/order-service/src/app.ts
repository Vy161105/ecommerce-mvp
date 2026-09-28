import express from 'express';

import { pool } from './infrastructure/database/postgres';
import orderRoutes from './interfaces/routes/orderRoutes';

export const app = express();

app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');

    return res.status(200).json({
      service: 'order-service',
      status: 'UP',
      database: 'UP'
    });
  } catch (error) {
    console.error('[Order Service] Database error:', error);

    return res.status(503).json({
      service: 'order-service',
      status: 'DOWN',
      database: 'DOWN'
    });
  }
});

app.use('/api/orders', orderRoutes);
