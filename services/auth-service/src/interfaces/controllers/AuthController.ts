import { Request, Response } from 'express';

import { RegisterUserSchema } from '../../application/dto/RegisterUserDto';
import {
  DuplicateUserError,
  RegisterUser
} from '../../application/use-cases/RegisterUser';

import { LoginUserSchema } from '../../application/dto/LoginUserDto';
import {
  InvalidCredentialsError,
  LoginUser
} from '../../application/use-cases/LoginUser';

import { UserRepository } from '../../domain/repositories/UserRepository';

export class AuthController {
  constructor(
    private readonly registerUser: RegisterUser,
    private readonly loginUser: LoginUser,
    private readonly userRepository: UserRepository
  ) {}

  register = async (req: Request, res: Response) => {
    const parsed = RegisterUserSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Invalid request',
        errors: parsed.error.flatten()
      });
    }

    try {
      const result = await this.registerUser.execute(parsed.data);

      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof DuplicateUserError) {
        return res.status(409).json({
          message: error.message
        });
      }

      console.error(error);

      return res.status(500).json({
        message: 'Internal server error'
      });
    }
  };

  login = async (req: Request, res: Response) => {
    const parsed = LoginUserSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Invalid request',
        errors: parsed.error.flatten()
      });
    }

    try {
      const result = await this.loginUser.execute(parsed.data);

      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        return res.status(401).json({
          message: error.message
        });
      }

      console.error(error);

      return res.status(500).json({
        message: 'Internal server error'
      });
    }
  };

  getUserById = async (req: Request, res: Response) => {
    try {
      const user = await this.userRepository.findById(
        String(req.params.id)
      );

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      return res.status(200).json({
        uid: user.uid,
        username: user.username,
        email: user.email,
        phone: user.phone,
        rid: user.rid,
        membership_points: user.membership_points
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: 'Internal server error'
      });
    }
  };
}