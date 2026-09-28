import express from 'express';
import dotenv from 'dotenv';
import { pool } from './infrastructure/database/postgres';
import productRoutes from './interfaces/routes/productRoutes';

dotenv.config();

const app = express();

app.use(express.json());
app.use('/products', productRoutes);

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');

    res.json({
      service: 'product-service',
      status: 'UP',
      database: 'UP'
    });
  } catch (error) {
    console.error(error);

    res.status(503).json({
      service: 'product-service',
      status: 'UP',
      database: 'DOWN'
    });
  }
});

const PORT = Number(process.env.PORT || 3002);

app.listen(PORT, () => {
  console.log(`product-service listening on port ${PORT}`);
});
