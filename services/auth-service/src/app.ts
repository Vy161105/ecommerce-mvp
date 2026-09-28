import express from 'express';
import authRoutes from './interfaces/routes/authRoutes';
import { pool } from './infrastructure/database/postgres';

export const app = express();
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ service: 'auth-service', status: 'UP' });
  } catch {
    res.status(503).json({ service: 'auth-service', status: 'DOWN' });
  }
});

app.use('/api/auth', authRoutes);
