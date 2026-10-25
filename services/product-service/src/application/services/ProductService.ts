
import {
  ProductRepository,
  CreateProductData,
  UpdateProductData
} from '../../infrastructure/repositories/ProductRepository';

export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository
  ) {}

  async getAllProducts() {
    return this.productRepository.findAll();
  }

  async getProductById(id: string) {
    return this.productRepository.findById(id);
  }

  async createProduct(data: CreateProductData) {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Product name is required');
    }

    if (!Number.isFinite(data.price) || data.price < 0) {
      throw new Error('Product price must be a valid non-negative number');
    }

    if (
      data.stock !== undefined &&
      (!Number.isInteger(data.stock) || data.stock < 0)
    ) {
      throw new Error('Product stock must be a non-negative integer');
    }

    return this.productRepository.create({
      name: data.name.trim(),
      description: data.description,
      price: data.price,
      stock: data.stock
    });
  }

  async updateProduct(id: string, data: UpdateProductData) {
    if (
      data.price !== undefined &&
      (!Number.isFinite(data.price) || data.price < 0)
    ) {
      throw new Error('Product price must be a valid non-negative number');
    }

    if (
      data.stock !== undefined &&
      (!Number.isInteger(data.stock) || data.stock < 0)
    ) {
      throw new Error('Product stock must be a non-negative integer');
    }

    return this.productRepository.update(id, data);
  }

  async decrementStock(id: string, quantity: number) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Quantity must be a positive integer');
    }

    const product = await this.productRepository.decrementStock(id, quantity);

    if (!product) {
      const existingProduct = await this.productRepository.findById(id);

      if (!existingProduct) {
        throw new Error('Product not found');
      }

      throw new Error('Insufficient stock');
    }

    return product;
  }

  async incrementStock(id: string, quantity: number) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Quantity must be a positive integer');
    }

    const product = await this.productRepository.incrementStock(id, quantity);

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  async deleteProduct(id: string) {
    return this.productRepository.delete(id);
  }
}
