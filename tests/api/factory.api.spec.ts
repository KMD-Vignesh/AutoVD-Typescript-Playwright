/**
 * P1 #5 (continued) — API Tests Using Factories
 * Requires API_BASE_URL in .env
 */
import { test, expect } from '../fixtures';
import { UserFactory, ProductFactory, CartFactory } from '../factories';
import { getAuthToken } from './middleware/auth.middleware';
import { env, hasApi } from '../../library/config/env';

const API_BASE = env.apiBaseUrl;

if (!hasApi) {
  console.warn('⚠️  API_BASE_URL not configured — factory API tests will be skipped.');
}

const apiSuite = hasApi ? test.describe : test.describe.skip;

apiSuite('Factory-Based API Tests', () => {
  test('UserFactory creates and cleans up user', async ({ request }) => {
    const user = await UserFactory.create(request, {
      firstName: 'Factory User',
    });

    expect(user.user.email).toContain('@example.com');
    expect(user.user.role).toBe('user');
    await user.cleanup();
  });

  test('UserFactory creates admin user', async ({ request }) => {
    const user = await UserFactory.create(request, {
      role: 'admin',
      firstName: 'Admin User',
    });

    expect(user.user.role).toBe('admin');
    await user.cleanup();
  });

  test('ProductFactory creates and cleans up product', async ({ request }) => {
    const product = await ProductFactory.create(request, {
      name: 'Factory Headphones',
      price: 99.99,
    });

    expect(product.product.name).toBe('Factory Headphones');
    expect(product.product.price).toBe(99.99);
    await product.cleanup();
  });

  test('CartFactory creates cart with products', async ({ request }) => {
    const cart = await CartFactory.createWithProducts(request, 2);

    expect(cart.items.length).toBe(2);
    expect(cart.items.every((item) => item.productId && item.quantity >= 1)).toBe(true);
    await cart.cleanup();
  });

  test('Full flow: create user → add products to cart → verify total', async ({ request }) => {
    const token = await getAuthToken(request);
    const user = await UserFactory.create(request);

    const p1 = await ProductFactory.create(request, { name: 'Headphones', price: 99 });
    const p2 = await ProductFactory.create(request, { name: 'Charger', price: 29 });

    await request.post(`${API_BASE}/cart/add`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: p1.product.id, quantity: 1 },
    });
    await request.post(`${API_BASE}/cart/add`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: p2.product.id, quantity: 2 },
    });

    const cartRes = await request.get(`${API_BASE}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const cart = await cartRes.json();
    expect(cart.total).toBeGreaterThan(0);

    await user.cleanup();
    await p1.cleanup();
    await p2.cleanup();
  });
});
