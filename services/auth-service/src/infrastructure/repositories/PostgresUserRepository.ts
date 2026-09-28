import { pool } from '../database/postgres';
import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class PostgresUserRepository implements UserRepository {
  async existsByUsernameOrEmail(username: string, email: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM app_user WHERE username = $1 OR email = $2 LIMIT 1',
      [username, email]
    );

    return result.rowCount !== 0;
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT uid, username, password, email, phone, rid
       FROM app_user
       WHERE username = $1
       LIMIT 1`,
      [username]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows[0] as User;
  }

  async create(input: Omit<User, 'uid'>): Promise<User> {
    const result = await pool.query(
      `INSERT INTO app_user (username, password, email, phone, rid)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING uid, username, password, email, phone, rid`,
      [input.username, input.password, input.email, input.phone, input.rid]
    );

    return result.rows[0] as User;
  }
}