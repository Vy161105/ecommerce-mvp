import { Request, Response } from 'express';
import { ProductService } from '../../application/services/ProductService';

export class ProductController {
  constructor(
    private readonly productService: ProductService
  ) {}

  getAll = async (_req: Request, res: Response) => {
    try {
      const products = await this.productService.getAllProducts();

      return res.status(200).json(products);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: 'Internal server error'
      });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const product = await this.productService.getProductById(
        String(req.params.id)
      );

      if (!product) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      return res.status(200).json(product);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: 'Internal server error'
      });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const { name, description, price, stock } = req.body;

      if (!name || price === undefined) {
        return res.status(400).json({
          message: 'name and price are required'
        });
      }

      const product = await this.productService.createProduct({
        name,
        description,
        price: Number(price),
        stock: stock !== undefined ? Number(stock) : 0
      });

      return res.status(201).json(product);
    } catch (error) {
      console.error(error);

      if (
        error instanceof Error &&
        (
          error.message.includes('required') ||
          error.message.includes('cannot be negative')
        )
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

  update = async (req: Request, res: Response) => {
    try {
      const { name, description, price, stock } = req.body;

      const product = await this.productService.updateProduct(
        String(req.params.id),
        {
          name,
          description,
          price: price !== undefined ? Number(price) : undefined,
          stock: stock !== undefined ? Number(stock) : undefined
        }
      );

      if (!product) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      return res.status(200).json(product);
    } catch (error) {
      console.error(error);

      if (
        error instanceof Error &&
        error.message.includes('cannot be negative')
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

  delete = async (req: Request, res: Response) => {
    try {
      const product = await this.productService.deleteProduct(
        String(req.params.id)
      );

      if (!product) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      return res.status(204).send();
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: 'Internal server error'
      });
    }
  };
}
