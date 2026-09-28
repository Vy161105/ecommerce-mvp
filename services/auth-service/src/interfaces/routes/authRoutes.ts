import { Router } from 'express';

import { AuthController } from '../controllers/AuthController';

import { RegisterUser } from '../../application/use-cases/RegisterUser';
import { LoginUser } from '../../application/use-cases/LoginUser';

import { PostgresUserRepository } from '../../infrastructure/repositories/PostgresUserRepository';

const router = Router();

const userRepository = new PostgresUserRepository();

const controller = new AuthController(
  new RegisterUser(userRepository),
  new LoginUser(userRepository),
  userRepository
);

router.post('/register', controller.register);
router.post('/login', controller.login);

router.get('/users/:id', controller.getUserById);

export default router;