
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

  async decrementStock(
    productId: string,
    quantity: number
  ): Promise<Product> {
    const response = await fetch(
      `${this.baseUrl}/products/${productId}/decrement-stock`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      }
    );

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        result && typeof result.message === 'string'
          ? result.message
          : 'Failed to decrement product stock';

      throw new Error(message);
    }

    return result as Product;
  }

  async incrementStock(
    productId: string,
    quantity: number
  ): Promise<Product> {
    const response = await fetch(
      `${this.baseUrl}/products/${productId}/increment-stock`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      }
    );

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        result && typeof result.message === 'string'
          ? result.message
          : 'Failed to restore product stock';

      throw new Error(message);
    }

    return result as Product;
  }
}
