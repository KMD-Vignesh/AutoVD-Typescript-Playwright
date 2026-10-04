import { APIRequestContext } from '@playwright/test';
import { env } from '../../library/config/env';
import { getAuthToken } from '../api/middleware/auth.middleware';

const API_BASE = env.apiBaseUrl;

export class CartFactory {
  constructor(
    public readonly cartId: string,
    public readonly items: Array<{ productId: string; quantity: number }>,
    private readonly request: APIRequestContext,
    private readonly token: string,
  ) {}

  static async createWithProducts(
    request: APIRequestContext,
    productCount: number = 3,
  ): Promise<CartFactory> {
    const token = await getAuthToken(request);

    const productsRes = await request.get(`${API_BASE}/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const products = await productsRes.json();

    const items: Array<{ productId: string; quantity: number }> = [];
    for (let i = 0; i < Math.min(productCount, products.length); i++) {
      items.push({ productId: products[i].id, quantity: 1 });
    }

    for (const item of items) {
      await request.post(`${API_BASE}/cart/add`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId: item.productId, quantity: item.quantity },
      });
    }

    const cartRes = await request.get(`${API_BASE}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const cart = await cartRes.json();

    return new CartFactory(cart.id || 'unknown', items, request, token);
  }

  async cleanup(): Promise<void> {
    await this.request
      .post(`${API_BASE}/cart/clear`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .catch(() => {});
  }
}
