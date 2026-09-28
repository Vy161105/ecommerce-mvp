import { pool } from '../database/postgres';
import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class PostgresUserRepository implements UserRepository {
  async existsByUsernameOrEmail(
    username: string,
    email: string
  ): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM app_user WHERE username = $1 OR email = $2 LIMIT 1',
      [username, email]
    );

    return result.rowCount !== 0;
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT
        uid,
        username,
        password,
        email,
        phone,
        rid,
        membership_points
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

  async findById(uid: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT
        uid,
        username,
        password,
        email,
        phone,
        rid,
        membership_points
       FROM app_user
       WHERE uid = $1
       LIMIT 1`,
      [uid]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows[0] as User;
  }

  async create(input: Omit<User, 'uid'>): Promise<User> {
    const result = await pool.query(
      `INSERT INTO app_user
        (username, password, email, phone, rid, membership_points)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING
        uid,
        username,
        password,
        email,
        phone,
        rid,
        membership_points`,
      [
        input.username,
        input.password,
        input.email,
        input.phone,
        input.rid,
        input.membership_points
      ]
    );

    return result.rows[0] as User;
  }

  async updateMembershipPoints(
    uid: string,
    membershipPoints: number
  ): Promise<User | null> {
    const result = await pool.query(
      `UPDATE app_user
       SET membership_points = $1
       WHERE uid = $2
       RETURNING
        uid,
        username,
        password,
        email,
        phone,
        rid,
        membership_points`,
      [membershipPoints, uid]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows[0] as User;
  }
}
