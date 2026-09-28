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

export class AuthController {
  constructor(
    private readonly registerUser: RegisterUser,
    private readonly loginUser: LoginUser
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
}