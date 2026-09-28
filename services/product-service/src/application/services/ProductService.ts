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

    if (data.price < 0) {
      throw new Error('Product price cannot be negative');
    }

    if (data.stock !== undefined && data.stock < 0) {
      throw new Error('Product stock cannot be negative');
    }

    return this.productRepository.create({
      name: data.name.trim(),
      description: data.description,
      price: data.price,
      stock: data.stock
    });
  }

  async updateProduct(id: string, data: UpdateProductData) {
    if (data.price !== undefined && data.price < 0) {
      throw new Error('Product price cannot be negative');
    }

    if (data.stock !== undefined && data.stock < 0) {
      throw new Error('Product stock cannot be negative');
    }

    return this.productRepository.update(id, data);
  }

  async deleteProduct(id: string) {
    return this.productRepository.delete(id);
  }
}
