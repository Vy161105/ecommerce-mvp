import {
  CreateOrderInput,
  OrderRepository
} from '../../infrastructure/repositories/OrderRepository';

import { ProductClient } from '../../infrastructure/clients/ProductClient';
import { AuthClient } from '../../infrastructure/clients/AuthClient';
import { ShipmentClient } from '../../infrastructure/clients/ShipmentClient';

interface CreateOrderRequest {
  userId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productClient: ProductClient,
    private readonly authClient: AuthClient,
    private readonly shipmentClient: ShipmentClient
  ) {}

  async createOrder(input: CreateOrderRequest) {
    if (!input.userId) {
      throw new Error('userId is required');
    }

    if (!input.items || input.items.length === 0) {
      throw new Error('order must contain at least one item');
    }

    const user = await this.authClient.getUserById(input.userId);

    const orderItems: CreateOrderInput['items'] = [];

    for (const item of input.items) {
      if (!item.productId) {
        throw new Error('productId is required');
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new Error('quantity must be greater than 0');
      }

      const product = await this.productClient.getProductById(
        item.productId
      );

      if (product.stock < item.quantity) {
        throw new Error('Insufficient stock');
      }

      let unitPrice = Number(product.price);

      if (user.membership_points >= 100) {
        unitPrice = unitPrice * 0.9;
      }

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice
      });
    }

    const order = await this.orderRepository.createOrder({
      userId: input.userId,
      items: orderItems
    });

    for (const item of input.items) {
      const product = await this.productClient.getProductById(
        item.productId
      );

      await this.productClient.updateStock(
        item.productId,
        product.stock - item.quantity
      );
    }

    await this.shipmentClient.createShipment(order.id);

    return order;
  }

  async getOrdersByUserId(userId: string) {
    return this.orderRepository.getOrdersByUserId(userId);
  }

  async getOrderById(orderId: string, userId: string) {
    return this.orderRepository.getOrderById(orderId, userId);
  }
}