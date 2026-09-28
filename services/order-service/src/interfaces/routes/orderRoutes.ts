import { Router } from 'express';

import { OrderController } from '../controllers/OrderController';
import { OrderService } from '../../application/services/OrderService';
import { OrderRepository } from '../../infrastructure/repositories/OrderRepository';
import { ProductClient } from '../../infrastructure/clients/ProductClient';
import { AuthClient } from '../../infrastructure/clients/AuthClient';

const router = Router();

const orderRepository = new OrderRepository();
const productClient = new ProductClient();
const authClient = new AuthClient();

const orderService = new OrderService(
  orderRepository,
  productClient,
  authClient
);

const orderController = new OrderController(orderService);

router.post('/', orderController.create);

router.get('/my', orderController.getMyOrders);

router.get('/:id', orderController.getById);

export default router;
