import {
  CreateOrderInput,
  OrderRepository
} from '../../infrastructure/repositories/OrderRepository';

export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository
  ) {}

  async createOrder(input: CreateOrderInput) {
    if (!input.userId) {
      throw new Error('userId is required');
    }

    if (!input.items || input.items.length === 0) {
      throw new Error('order must contain at least one item');
    }

    for (const item of input.items) {
      if (!item.productId) {
        throw new Error('productId is required');
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new Error('quantity must be greater than 0');
      }

      if (item.unitPrice < 0) {
        throw new Error('unitPrice cannot be negative');
      }
    }

    return this.orderRepository.createOrder(input);
  }

  async getOrdersByUserId(userId: string) {
    return this.orderRepository.getOrdersByUserId(userId);
  }

  async getOrderById(orderId: string, userId: string) {
    return this.orderRepository.getOrderById(orderId, userId);
  }
}
