import { pool } from '../database/postgres';

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderInput {
  userId: string;
  items: CreateOrderItemInput[];
}

export class OrderRepository {
  async createOrder(input: CreateOrderInput) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const totalAmount = input.items.reduce(
        (total, item) => total + item.unitPrice * item.quantity,
        0
      );

      const orderResult = await client.query(
        `
        INSERT INTO orders (user_id, status, total_amount)
        VALUES ($1, 'PENDING', $2)
        RETURNING *
        `,
        [input.userId, totalAmount]
      );

      const order = orderResult.rows[0];

      const items = [];

      for (const item of input.items) {
        const itemResult = await client.query(
          `
          INSERT INTO order_items
            (order_id, product_id, quantity, unit_price)
          VALUES ($1, $2, $3, $4)
          RETURNING *
          `,
          [
            order.id,
            item.productId,
            item.quantity,
            item.unitPrice
          ]
        );

        items.push(itemResult.rows[0]);
      }

      await client.query('COMMIT');

      return {
        ...order,
        items
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getOrdersByUserId(userId: string) {
    const ordersResult = await pool.query(
      `
      SELECT *
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    const orders = [];

    for (const order of ordersResult.rows) {
      const itemsResult = await pool.query(
        `
        SELECT *
        FROM order_items
        WHERE order_id = $1
        ORDER BY created_at ASC
        `,
        [order.id]
      );

      orders.push({
        ...order,
        items: itemsResult.rows
      });
    }

    return orders;
  }

  async getOrderById(orderId: string, userId: string) {
    const orderResult = await pool.query(
      `
      SELECT *
      FROM orders
      WHERE id = $1 AND user_id = $2
      `,
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = orderResult.rows[0];

    const itemsResult = await pool.query(
      `
      SELECT *
      FROM order_items
      WHERE order_id = $1
      ORDER BY created_at ASC
      `,
      [orderId]
    );

    return {
      ...order,
      items: itemsResult.rows
    };
  }
}
