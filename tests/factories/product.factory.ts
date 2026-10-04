import { APIRequestContext } from '@playwright/test';
import Ajv from 'ajv';
import { env } from '../../library/config/env';
import { getAuthToken } from '../api/middleware/auth.middleware';
import { productSchema } from '../api/schemas';

const ajv = new Ajv({ allErrors: true });
const API_BASE = env.apiBaseUrl;

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
