import { Router } from 'express';

import { ShipmentController } from '../controllers/ShipmentController';
import { ShipmentService } from '../../application/services/ShipmentService';
import { ShipmentRepository } from '../../infrastructure/repositories/ShipmentRepository';

const router = Router();

const shipmentRepository = new ShipmentRepository();
const shipmentService = new ShipmentService(shipmentRepository);
const shipmentController = new ShipmentController(shipmentService);

router.post('/', shipmentController.create);

router.get('/:id', shipmentController.getById);

router.get(
  '/order/:orderId',
  shipmentController.getByOrderId
);

router.patch(
  '/:id/status',
  shipmentController.updateStatus
);

export default router;