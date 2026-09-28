export interface Shipment {
  id: string;
  order_id: string;
  status: 'PENDING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

export class ShipmentClient {
  private readonly baseUrl =
    process.env.SHIPMENT_SERVICE_URL || 'http://localhost:3004';

  async createShipment(orderId: string): Promise<Shipment> {
    const response = await fetch(
      `${this.baseUrl}/api/shipments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create shipment');
    }

    return (await response.json()) as Shipment;
  }
}