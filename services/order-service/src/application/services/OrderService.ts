import { publishOrderCreated } from '../../infrastructure/KafkaProducer';

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

    if (!Array.isArray(input.items) || input.items.length === 0) {
      throw new Error('order must contain at least one item');
    }

    const user = await this.authClient.getUserById(input.userId);
    const quantities = new Map<string, number>();

    for (const item of input.items) {
      if (!item.productId || typeof item.productId !== 'string') {
        throw new Error('productId is required');
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new Error('quantity must be greater than 0');
      }

      quantities.set(
        item.productId,
        (quantities.get(item.productId) ?? 0) + item.quantity
      );
    }

    const orderItems: CreateOrderInput['items'] = [];

    for (const [productId, quantity] of quantities) {
      const product = await this.productClient.getProductById(productId);

      if (product.stock < quantity) {
        throw new Error(`Insufficient stock for product ${productId}`);
      }

      let unitPrice = Number(product.price);

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        throw new Error(`Invalid price for product ${productId}`);
      }

      if (user.membership_points >= 100) {
        unitPrice *= 0.9;
      }

      orderItems.push({
        productId,
        quantity,
        unitPrice
      });
    }

    const reservedItems: CreateOrderInput['items'] = [];
    let createdOrderId: string | null = null;
    let createdShipmentId: string | null = null;

    try {
      // 1. Reserve stock.
      for (const item of orderItems) {
        await this.productClient.decrementStock(
          item.productId,
          item.quantity
        );

        reservedItems.push(item);
      }

      // 2. Create order.
      const order = await this.orderRepository.createOrder({
        userId: input.userId,
        items: orderItems
      });

      createdOrderId = order.id;

      // 3. Create shipment.
      const shipment = await this.shipmentClient.createShipment(order.id);
      createdShipmentId = shipment.id;
      await publishOrderCreated(order);

      return order;
    } catch (error) {
      // 4. Cancel shipment if it was created.
      if (createdShipmentId) {
        try {
          await this.shipmentClient.cancelShipment(createdShipmentId);
        } catch (cleanupError) {
          console.error(
            `Failed to cancel shipment ${createdShipmentId}:`,
            cleanupError
          );
        }
      }

      // 5. If an order was created, attempt to delete it.
      if (createdOrderId) {
        try {
          await this.orderRepository.deleteOrder(createdOrderId);
        } catch (cleanupError) {
          console.error(
            `Failed to delete order ${createdOrderId}:`,
            cleanupError
          );
        }
      }

      // 5. Restore reserved stock in reverse order.
      for (const item of [...reservedItems].reverse()) {
        try {
          await this.productClient.incrementStock(
            item.productId,
            item.quantity
          );
        } catch (rollbackError) {
          console.error(
            `Failed to restore stock for product ${item.productId}:`,
            rollbackError
          );
        }
      }

      throw error;
    }
  }

  async getOrdersByUserId(userId: string) {
    return this.orderRepository.getOrdersByUserId(userId);
  }

  async getOrderById(orderId: string, userId: string) {
    return this.orderRepository.getOrderById(orderId, userId);
  }
}
