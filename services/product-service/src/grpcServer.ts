import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'node:path';
import { ProductRepository } from './infrastructure/repositories/ProductRepository';
import { ProductService } from './application/services/ProductService';

const protoPath = path.resolve(__dirname, '../proto/product.proto');

const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const loaded = grpc.loadPackageDefinition(packageDefinition) as any;
const productGrpc = loaded.product;

const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);

function toGrpcProduct(product: any) {
  return {
    id: String(product.id),
    name: product.name,
    price: String(product.price),
    stock: Number(product.stock)
  };
}

function handleError(
  error: unknown,
  callback: (error: grpc.ServiceError | null, value?: unknown) => void
) {
  const message = error instanceof Error ? error.message : 'Internal server error';

  let code = grpc.status.INTERNAL;
  if (message === 'Product not found') code = grpc.status.NOT_FOUND;
  if (message === 'Insufficient stock') code = grpc.status.FAILED_PRECONDITION;
  if (message === 'Quantity must be a positive integer') {
    code = grpc.status.INVALID_ARGUMENT;
  }

  callback({
    name: 'ProductGrpcError',
    message,
    code,
    details: message,
    metadata: new grpc.Metadata()
  });
}

const server = new grpc.Server();

server.addService(productGrpc.ProductService.service, {
  GetProductById: async (call: any, callback: any) => {
    try {
      const product = await productService.getProductById(call.request.id);

      if (!product) {
        return callback({
          name: 'ProductGrpcError',
          message: 'Product not found',
          code: grpc.status.NOT_FOUND,
          details: 'Product not found',
          metadata: new grpc.Metadata()
        });
      }

      callback(null, toGrpcProduct(product));
    } catch (error) {
      handleError(error, callback);
    }
  },

  DecrementStock: async (call: any, callback: any) => {
    try {
      const product = await productService.decrementStock(
        call.request.id,
        Number(call.request.quantity)
      );
      callback(null, toGrpcProduct(product));
    } catch (error) {
      handleError(error, callback);
    }
  },

  IncrementStock: async (call: any, callback: any) => {
    try {
      const product = await productService.incrementStock(
        call.request.id,
        Number(call.request.quantity)
      );
      callback(null, toGrpcProduct(product));
    } catch (error) {
      handleError(error, callback);
    }
  }
});

const port = Number(process.env.GRPC_PORT || 50051);

server.bindAsync(
  `0.0.0.0:${port}`,
  grpc.ServerCredentials.createInsecure(),
  (error) => {
    if (error) {
      console.error('Failed to start Product gRPC server:', error);
      process.exit(1);
    }

    console.log(`Product gRPC server listening on port ${port}`);
  }
);
