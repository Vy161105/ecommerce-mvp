export interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
}

export class ProductClient {
  private readonly baseUrl =
    process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

  async getProductById(productId: string): Promise<Product> {
    const response = await fetch(
      `${this.baseUrl}/products/${productId}`
    );

    if (!response.ok) {
      throw new Error('Product not found');
    }

    return (await response.json()) as Product;
  }

  async updateStock(
    productId: string,
    stock: number
  ): Promise<Product> {
    const response = await fetch(
      `${this.baseUrl}/products/${productId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stock
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update product stock');
    }

    return (await response.json()) as Product;
  }
}