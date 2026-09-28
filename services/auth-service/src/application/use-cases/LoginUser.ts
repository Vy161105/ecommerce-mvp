import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';

import { LoginUserDto } from '../dto/LoginUserDto';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Username hoặc password không đúng');
    this.name = 'InvalidCredentialsError';
  }
}

export class LoginUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: LoginUserDto) {
    const user = await this.userRepository.findByUsername(input.username);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordValid = await bcrypt.compare(
      input.password,
      user.password
    );

    if (!passwordValid) {
      throw new InvalidCredentialsError();
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const expiresIn: SignOptions['expiresIn'] =
      (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '1d';

    const token = jwt.sign(
      {
        uid: user.uid,
        username: user.username,
        rid: user.rid
      },
      secret,
      {
        expiresIn
      }
    );

    return {
      accessToken: token
    };
  }
}