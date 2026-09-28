import {
  ShipmentRepository,
  ShipmentStatus
} from '../../infrastructure/repositories/ShipmentRepository';

export class ShipmentService {
  constructor(
    private readonly shipmentRepository: ShipmentRepository
  ) {}

  async createShipment(orderId: string) {
    if (!orderId) {
      throw new Error('orderId is required');
    }

    const existing = await this.shipmentRepository.findByOrderId(orderId);

    if (existing) {
      return existing;
    }

    return this.shipmentRepository.create(orderId);
  }

  async getShipmentById(id: string) {
    return this.shipmentRepository.findById(id);
  }

  async getShipmentByOrderId(orderId: string) {
    return this.shipmentRepository.findByOrderId(orderId);
  }

  async updateStatus(id: string, status: ShipmentStatus) {
    const allowedStatuses: ShipmentStatus[] = [
      'PENDING',
      'SHIPPING',
      'DELIVERED',
      'CANCELLED'
    ];

    if (!allowedStatuses.includes(status)) {
      throw new Error('Invalid shipment status');
    }

    return this.shipmentRepository.updateStatus(id, status);
  }
}