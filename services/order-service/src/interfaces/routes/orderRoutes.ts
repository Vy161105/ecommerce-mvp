import { Router } from 'express';

import { OrderController } from '../controllers/OrderController';
import { OrderService } from '../../application/services/OrderService';
import { OrderRepository } from '../../infrastructure/repositories/OrderRepository';

const router = Router();

const orderRepository = new OrderRepository();
const orderService = new OrderService(orderRepository);
const orderController = new OrderController(orderService);

router.post('/', orderController.create);

router.get('/my', orderController.getMyOrders);

router.get('/:id', orderController.getById);

export default router;
