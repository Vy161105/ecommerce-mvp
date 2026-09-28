import { Request, Response } from 'express';
import { OrderService } from '../../application/services/OrderService';

export class OrderController {
  constructor(
    private readonly orderService: OrderService
  ) {}

  create = async (req: Request, res: Response) => {
    try {
      const userId = String(req.headers['x-user-id'] || '');
      const { items } = req.body;

      const order = await this.orderService.createOrder({
        userId,
        items
      });

      return res.status(201).json(order);
    } catch (error) {
      console.error('[OrderController] create:', error);

      if (error instanceof Error) {
        return res.status(400).json({
          message: error.message
        });
      }

      return res.status(500).json({
        message: 'Internal server error'
      });
    }
  };

  getMyOrders = async (req: Request, res: Response) => {
    try {
      const userId = String(req.headers['x-user-id'] || '');

      const orders = await this.orderService.getOrdersByUserId(userId);

      return res.status(200).json(orders);
    } catch (error) {
      console.error('[OrderController] getMyOrders:', error);

      return res.status(500).json({
        message: 'Internal server error'
      });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const userId = String(req.headers['x-user-id'] || '');

      const order = await this.orderService.getOrderById(
        String(req.params.id),
        userId
      );

      if (!order) {
        return res.status(404).json({
          message: 'Order not found'
        });
      }

      return res.status(200).json(order);
    } catch (error) {
      console.error('[OrderController] getById:', error);

      return res.status(500).json({
        message: 'Internal server error'
      });
    }
  };
}
