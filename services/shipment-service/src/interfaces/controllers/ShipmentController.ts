import { Request, Response } from 'express';
import {
  ShipmentService
} from '../../application/services/ShipmentService';
import {
  ShipmentStatus
} from '../../infrastructure/repositories/ShipmentRepository';

export class ShipmentController {
  constructor(
    private readonly shipmentService: ShipmentService
  ) {}

  create = async (req: Request, res: Response) => {
    try {
      const { orderId } = req.body;

      const shipment = await this.shipmentService.createShipment(
        String(orderId || '')
      );

      return res.status(201).json(shipment);
    } catch (error) {
      console.error(error);

      if (
        error instanceof Error &&
        error.message === 'orderId is required'
      ) {
        return res.status(400).json({
          message: error.message
        });
      }

      return res.status(500).json({
        message: 'Internal server error'
      });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const shipment = await this.shipmentService.getShipmentById(
        String(req.params.id)
      );

      if (!shipment) {
        return res.status(404).json({
          message: 'Shipment not found'
        });
      }

      return res.status(200).json(shipment);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: 'Internal server error'
      });
    }
  };

  getByOrderId = async (req: Request, res: Response) => {
    try {
      const shipment =
        await this.shipmentService.getShipmentByOrderId(
          String(req.params.orderId)
        );

      if (!shipment) {
        return res.status(404).json({
          message: 'Shipment not found'
        });
      }

      return res.status(200).json(shipment);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: 'Internal server error'
      });
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    try {
      const status = String(req.body.status) as ShipmentStatus;

      const shipment = await this.shipmentService.updateStatus(
        String(req.params.id),
        status
      );

      if (!shipment) {
        return res.status(404).json({
          message: 'Shipment not found'
        });
      }

      return res.status(200).json(shipment);
    } catch (error) {
      console.error(error);

      if (
        error instanceof Error &&
        error.message === 'Invalid shipment status'
      ) {
        return res.status(400).json({
          message: error.message
        });
      }

      return res.status(500).json({
        message: 'Internal server error'
      });
    }
  };
}