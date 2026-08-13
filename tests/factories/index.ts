/**
 * Test Data Factory
 * Creates and cleans up test entities automatically.
 */
import { APIRequestContext } from '@playwright/test';
import 'dotenv/config';
import { getAuthToken } from '../api/middleware/auth.middleware';
import { userSchema, productSchema } from '../api/schemas';
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });
const API_BASE = process.env.API_BASE_URL || 'https://api.example.com';

export class UserFactory {
  private constructor(
    public readonly user: Record<string, unknown>,
    private readonly request: APIRequestContext,
    private readonly token: string,
  ) {}

  static async create(
    request: APIRequestContext,
    overrides: Partial<{
      email: string;
      role: 'user' | 'admin';
      firstName: string;
    }> = {},
  ): Promise<UserFactory> {
    const token = await getAuthToken(request);
    const uniqueId = Date.now();

    const response = await request.post(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        email: overrides.email || `test_${uniqueId}@example.com`,
        password: 'TestPass123!',
        firstName: overrides.firstName || `Test User ${uniqueId}`,
        lastName: 'Auto',
        role: overrides.role || 'user',
      },
    });

    if (response.status() !== 201) {
      throw new Error(`User creation failed: ${response.status()}`);
    }

    const user = await response.json();
    const validate = ajv.compile(userSchema);
    if (!validate(user)) {
      console.warn('User schema validation warning:', validate.errors);
    }

    return new UserFactory(user, request, token);
  }

  async cleanup(): Promise<void> {
    await this.request.delete(`${API_BASE}/users/${this.user.id}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }
}

export class ProductFactory {
  private constructor(
    public readonly product: Record<string, unknown>,
    private readonly request: APIRequestContext,
    private readonly token: string,
  ) {}

  static async create(
    request: APIRequestContext,
    overrides: Partial<{
      name: string;
      price: number;
      description: string;
    }> = {},
  ): Promise<ProductFactory> {
    const token = await getAuthToken(request);
    const uniqueId = Date.now();

    const response = await request.post(`${API_BASE}/products`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: overrides.name || `Test Product ${uniqueId}`,
        price: overrides.price || Math.round(Math.random() * 100 + 10),
        description: overrides.description || `Auto-generated test product`,
      },
    });

    if (response.status() !== 201) {
      throw new Error(`Product creation failed: ${response.status()}`);
    }

    const product = await response.json();
    const validate = ajv.compile(productSchema);
    if (!validate(product)) {
      console.warn('Product schema validation warning:', validate.errors);
    }

    return new ProductFactory(product, request, token);
  }

  async cleanup(): Promise<void> {
    await this.request.delete(`${API_BASE}/products/${this.product.id}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }
}

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
    await this.request.post(`${API_BASE}/cart/clear`, {
      headers: { Authorization: `Bearer ${this.token}` },
    }).catch(() => {});
  }
}
