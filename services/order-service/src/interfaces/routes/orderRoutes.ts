import { Router } from 'express';

import { OrderController } from '../controllers/OrderController';
import { OrderService } from '../../application/services/OrderService';
import { OrderRepository } from '../../infrastructure/repositories/OrderRepository';
import { ProductClient } from '../../infrastructure/clients/ProductClient';

const router = Router();

const orderRepository = new OrderRepository();
const productClient = new ProductClient();
const orderService = new OrderService(orderRepository, productClient);
const orderController = new OrderController(orderService);

router.post('/', orderController.create);

router.get('/my', orderController.getMyOrders);

router.get('/:id', orderController.getById);

export default router;
