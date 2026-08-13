/**
 * API Tests — Product & Cart endpoints
 * Run: npm run test:api
 * Requires: API_BASE_URL set in .env
 */
import { test, expect } from '@playwright/test';
import 'dotenv/config';

const API_BASE = process.env.API_BASE_URL || 'https://api.example.com';
const hasApi = API_BASE !== 'https://api.example.com';

if (!hasApi) {
  console.warn('⚠️  API_BASE_URL not configured — API tests will be skipped.');
}

let authToken: string;

test.describe('Products API', () => {
  if (!hasApi) {
    test.skip('requires API_BASE_URL', () => {});
  }

  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: {
        username: process.env.TEST_USERNAME || 'standard_user',
        password: process.env.TEST_PASSWORD || 'secret_sauce',
      },
    });
    const body = await res.json();
    authToken = body.token;
  });

  test('GET /products returns array', async ({ request }) => {
    const response = await request.get(`${API_BASE}/products`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(response.status()).toBe(200);
    const products = await response.json();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
  });

  test('GET /products/:id returns single product', async ({ request }) => {
    const list = await request
      .get(`${API_BASE}/products`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then((r) => r.json());

    const product = await request
      .get(`${API_BASE}/products/${list[0].id}`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then((r) => r.json());

    expect(product.id).toBe(list[0].id);
    expect(product.name).toBeTruthy();
    expect(product.price).toBeGreaterThan(0);
  });
});

test.describe('Cart API', () => {
  if (!hasApi) {
    test.skip('requires API_BASE_URL', () => {});
  }

  test('POST /cart/add adds item and returns 200', async ({ request }) => {
    // Get a product
    const products = await request
      .get(`${API_BASE}/products`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then((r) => r.json());

    const response = await request.post(`${API_BASE}/cart/add`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { productId: products[0].id, quantity: 2 },
    });

    expect(response.status()).toBe(200);
    const cart = await response.json();
    expect(cart.items).toBeDefined();
  });

  test('GET /cart returns current cart', async ({ request }) => {
    const response = await request.get(`${API_BASE}/cart`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(response.status()).toBe(200);
    const cart = await response.json();
    expect(cart).toHaveProperty('items');
    expect(cart).toHaveProperty('total');
  });
});
