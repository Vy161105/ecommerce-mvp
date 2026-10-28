import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'node:path';

export interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
}

const protoPath = path.resolve(__dirname, '../../../../../proto/product.proto');

const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const loaded = grpc.loadPackageDefinition(packageDefinition) as any;
const ProductGrpcService = loaded.product.ProductService;

export class ProductClient {
  private readonly client: any;

  constructor() {
    const address =
      process.env.PRODUCT_SERVICE_GRPC_URL || 'localhost:50051';

    this.client = new ProductGrpcService(
      address,
      grpc.credentials.createInsecure()
    );
  }

  private call<T>(method: string, request: object): Promise<T> {
    return new Promise((resolve, reject) => {
      this.client[method](request, (error: grpc.ServiceError | null, result: T) => {
        if (error) {
          reject(new Error(error.details || error.message));
          return;
        }

        resolve(result);
      });
    });
  }

  async getProductById(productId: string): Promise<Product> {
    return this.call<Product>('GetProductById', { id: productId });
  }

  async decrementStock(
    productId: string,
    quantity: number
  ): Promise<Product> {
    return this.call<Product>('DecrementStock', {
      id: productId,
      quantity
    });
  }

  async incrementStock(
    productId: string,
    quantity: number
  ): Promise<Product> {
    return this.call<Product>('IncrementStock', {
      id: productId,
      quantity
    });
  }
}
