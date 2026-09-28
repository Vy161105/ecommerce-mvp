import bcrypt from 'bcrypt';
import { RegisterUserDto } from '../dto/RegisterUserDto';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { pool } from '../../infrastructure/database/postgres';

export class DuplicateUserError extends Error {}

export class RegisterUser {
  constructor(private readonly users: UserRepository) {}

  async execute(input: RegisterUserDto) {
    if (await this.users.existsByUsernameOrEmail(input.username, input.email)) {
      throw new DuplicateUserError('Username or email already exists');
    }

    const role = await pool.query("SELECT rid FROM role WHERE rname = 'CUSTOMER' LIMIT 1");
    if (role.rowCount === 0) throw new Error('Default CUSTOMER role is not configured');

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await this.users.create({
      username: input.username,
      password: passwordHash,
      email: input.email,
      phone: input.phone ?? null,
      rid: role.rows[0].rid
    });

    return {
      uid: user.uid,
      username: user.username,
      email: user.email,
      phone: user.phone
    };
  }
}
