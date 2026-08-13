/**
 * P0 #3 — API Tests with Schema Validation
 * All API tests enhanced with Ajv schema checks.
 * Skip automatically if API_BASE_URL not configured.
 */
import { test, expect } from '../fixtures';
import Ajv from 'ajv';
import 'dotenv/config';
import {
  loginRequestSchema,
  loginResponseSchema,
  userSchema,
  productSchema,
  cartSchema,
  errorResponseSchema,
} from './schemas';
import { getAuthToken, clearAuthCache } from './middleware/auth.middleware';

const ajv = new Ajv({ allErrors: true, strict: true });
const API_BASE = process.env.API_BASE_URL || 'https://api.example.com';
const hasApi = API_BASE !== 'https://api.example.com';

if (!hasApi) {
  console.warn('⚠️  API_BASE_URL not configured — API tests will be skipped. Set API_BASE_URL in .env');
}

// Wrap all API test suites in a conditional skip
const apiSuite = hasApi ? test.describe : test.describe.skip;

apiSuite('Auth API — with Schema Validation', () => {
  test.beforeEach(() => clearAuthCache());

  test('POST /auth/login returns valid token (schema validated)', async ({ request }) => {
    const validateRequest = ajv.compile(loginRequestSchema);
    const requestData = {
      username: process.env.TEST_USERNAME || 'standard_user',
      password: process.env.TEST_PASSWORD || 'secret_sauce',
    };
    expect(validateRequest(requestData)).toBe(true);

    const response = await request.post(`${API_BASE}/auth/login`, { data: requestData });
    expect(response.status()).toBe(200);

    const body = await response.json();
    const validateResponse = ajv.compile(loginResponseSchema);
    expect(validateResponse(body)).toBe(true);

    expect(body.token).toBeTruthy();
    expect(body.user.id).toBeTruthy();
    expect(body.user.role).toBe('user');
  });

  test('POST /auth/login rejects invalid credentials (401)', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/login`, {
      data: { username: 'standard_user', password: 'wrong_password' },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    const validateError = ajv.compile(errorResponseSchema);
    expect(validateError(body)).toBe(true);
  });

  test('GET /auth/me returns current user with valid token', async ({ request }) => {
    const token = await getAuthToken(request);

    const response = await request.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.username).toBe(process.env.TEST_USERNAME || 'standard_user');
  });

  test('GET /auth/me rejects expired token', async ({ request }) => {
    const response = await request.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: 'Bearer invalid_token_12345' },
    });

    expect(response.status()).toBe(401);
  });
});

apiSuite('Users API — with Schema Validation', () => {
  test('GET /users returns paginated list (schema validated)', async ({ request }) => {
    const token = await getAuthToken(request);
    const response = await request.get(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      const validateUser = ajv.compile(userSchema);
      expect(validateUser(body[0])).toBe(true);
    }
  });

  test('POST /users creates user (schema validated)', async ({ request }) => {
    const token = await getAuthToken(request);
    const uniqueId = Date.now();
    const response = await request.post(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        email: `test_${uniqueId}@example.com`,
        password: 'TestPass123!',
        firstName: 'Auto',
        lastName: 'Tester',
        role: 'user',
      },
    });

    expect(response.status()).toBe(201);
    const user = await response.json();
    const validateUser = ajv.compile(userSchema);
    expect(validateUser(user)).toBe(true);
    expect(user.email).toContain('@example.com');

    await request.delete(`${API_BASE}/users/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });
});

apiSuite('Products API — with Schema Validation', () => {
  test('GET /products returns array (schema validated)', async ({ request }) => {
    const token = await getAuthToken(request);
    const response = await request.get(`${API_BASE}/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    const products = await response.json();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);

    const validateProduct = ajv.compile(productSchema);
    products.forEach((p: Record<string, unknown>) => {
      expect(validateProduct(p)).toBe(true);
    });
  });

  test('GET /products/:id returns single product (schema validated)', async ({ request }) => {
    const token = await getAuthToken(request);

    const listRes = await request.get(`${API_BASE}/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const products = await listRes.json();
    const productId = products[0].id;

    const response = await request.get(`${API_BASE}/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    const product = await response.json();
    const validateProduct = ajv.compile(productSchema);
    expect(validateProduct(product)).toBe(true);
    expect(product.id).toBe(productId);
  });
});

apiSuite('Cart API — with Schema Validation', () => {
  test('POST /cart/add adds item (schema validated)', async ({ request }) => {
    const token = await getAuthToken(request);

    const products = await request
      .get(`${API_BASE}/products`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json());

    const response = await request.post(`${API_BASE}/cart/add`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: products[0].id, quantity: 2 },
    });

    expect(response.status()).toBe(200);
    const cart = await response.json();
    const validateCart = ajv.compile(cartSchema);
    expect(validateCart(cart)).toBe(true);
    expect(cart.items.some((i: any) => i.productId === products[0].id)).toBe(true);
  });

  test('GET /cart returns cart with total (schema validated)', async ({ request }) => {
    const token = await getAuthToken(request);
    const response = await request.get(`${API_BASE}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    const cart = await response.json();
    const validateCart = ajv.compile(cartSchema);
    expect(validateCart(cart)).toBe(true);
    expect(cart.total).toBeGreaterThanOrEqual(0);
  });
});
