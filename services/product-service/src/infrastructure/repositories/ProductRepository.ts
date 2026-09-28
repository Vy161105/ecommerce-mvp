import { pool } from '../database/postgres';

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  stock?: number;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
}

export class ProductRepository {
  async findAll() {
    const result = await pool.query(
      `SELECT
        id,
        name,
        description,
        price,
        stock,
        created_at,
        updated_at
       FROM products
       ORDER BY created_at DESC`
    );

    return result.rows;
  }

  async findById(id: string) {
    const result = await pool.query(
      `SELECT
        id,
        name,
        description,
        price,
        stock,
        created_at,
        updated_at
       FROM products
       WHERE id = $1`,
      [id]
    );

    return result.rows[0] ?? null;
  }

  async create(data: CreateProductData) {
    const result = await pool.query(
      `INSERT INTO products (
        name,
        description,
        price,
        stock
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        name,
        description,
        price,
        stock,
        created_at,
        updated_at`,
      [
        data.name,
        data.description ?? null,
        data.price,
        data.stock ?? 0
      ]
    );

    return result.rows[0];
  }

  async update(id: string, data: UpdateProductData) {
    const current = await this.findById(id);

    if (!current) {
      return null;
    }

    const result = await pool.query(
      `UPDATE products
       SET
         name = $1,
         description = $2,
         price = $3,
         stock = $4,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING
         id,
         name,
         description,
         price,
         stock,
         created_at,
         updated_at`,
      [
        data.name ?? current.name,
        data.description ?? current.description,
        data.price ?? current.price,
        data.stock ?? current.stock,
        id
      ]
    );

    return result.rows[0];
  }

  async delete(id: string) {
    const result = await pool.query(
      `DELETE FROM products
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    return result.rows[0] ?? null;
  }
}
