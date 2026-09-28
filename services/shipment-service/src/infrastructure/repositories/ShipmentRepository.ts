import { pool } from '../database/postgres';

export type ShipmentStatus =
  | 'PENDING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Shipment {
  id: string;
  order_id: string;
  status: ShipmentStatus;
  created_at: Date;
  updated_at: Date;
}

export class ShipmentRepository {
  async create(orderId: string): Promise<Shipment> {
    const result = await pool.query(
      `INSERT INTO shipments (order_id, status)
       VALUES ($1, 'PENDING')
       RETURNING id, order_id, status, created_at, updated_at`,
      [orderId]
    );

    return result.rows[0] as Shipment;
  }

  async findById(id: string): Promise<Shipment | null> {
    const result = await pool.query(
      `SELECT id, order_id, status, created_at, updated_at
       FROM shipments
       WHERE id = $1
       LIMIT 1`,
      [id]
    );

    return result.rowCount === 0
      ? null
      : (result.rows[0] as Shipment);
  }

  async findByOrderId(orderId: string): Promise<Shipment | null> {
    const result = await pool.query(
      `SELECT id, order_id, status, created_at, updated_at
       FROM shipments
       WHERE order_id = $1
       LIMIT 1`,
      [orderId]
    );

    return result.rowCount === 0
      ? null
      : (result.rows[0] as Shipment);
  }

  async updateStatus(
    id: string,
    status: ShipmentStatus
  ): Promise<Shipment | null> {
    const result = await pool.query(
      `UPDATE shipments
       SET status = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING id, order_id, status, created_at, updated_at`,
      [status, id]
    );

    return result.rowCount === 0
      ? null
      : (result.rows[0] as Shipment);
  }
}