import bcrypt from 'bcrypt';
import { pool } from '../../infrastructure/database/postgres';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { RegisterUserDto } from '../dto/RegisterUserDto';

export class DuplicateUserError extends Error {
  constructor() {
    super('Username or email already exists');
    this.name = 'DuplicateUserError';
  }
}

export class RegisterUser {
  constructor(private readonly users: UserRepository) {}

  async execute(input: RegisterUserDto) {
    const existingUser = await pool.query(
      `
      SELECT uid
      FROM app_user
      WHERE username = $1 OR email = $2
      LIMIT 1
      `,
      [input.username, input.email]
    );

    if (existingUser.rows.length > 0) {
      throw new DuplicateUserError();
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const role = await pool.query(
      `SELECT rid FROM role WHERE rname = 'CUSTOMER' LIMIT 1`
    );

    if (role.rows.length === 0) {
      throw new Error('CUSTOMER role not found');
    }

    const user = await this.users.create({
      username: input.username,
      password: hashedPassword,
      email: input.email,
      phone: input.phone ?? null,
      rid: role.rows[0].rid,
      membership_points: 0,
      membership_tier: 'STANDARD'
    });

    return user;
  }
}
