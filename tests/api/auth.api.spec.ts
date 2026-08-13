/**
 * API Tests — Auth & User endpoints
 * Run: npm run test:api
 */
import { test, expect } from '@playwright/test';
import 'dotenv/config';

const API_BASE = process.env.API_BASE_URL || 'https://api.example.com';

test.describe('Auth API', () => {
  test('POST /auth/login returns token', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/login`, {
      data: {
        username: process.env.TEST_USERNAME || 'standard_user',
        password: process.env.TEST_PASSWORD || 'secret_sauce',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.token).toBeTruthy();
    expect(body.user).toBeDefined();
    expect(body.user.id).toBeTruthy();
    expect(body.user.role).toBeTruthy();
  });

  test('POST /auth/login rejects invalid credentials', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/login`, {
      data: {
        username: 'standard_user',
        password: 'wrong_password',
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test('GET /auth/me returns user with valid token', async ({ request }) => {
    // Login first to get token
    const loginRes = await request.post(`${API_BASE}/auth/login`, {
      data: {
        username: process.env.TEST_USERNAME || 'standard_user',
        password: process.env.TEST_PASSWORD || 'secret_sauce',
      },
    });
    const { token } = await loginRes.json();

    // Use token for protected endpoint
    const meRes = await request.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(meRes.status()).toBe(200);
    const user = await meRes.json();
    expect(user.username).toBe(process.env.TEST_USERNAME || 'standard_user');
  });
});

test.describe('Users API', () => {
  test('GET /users returns list', async ({ request }) => {
    const response = await request.get(`${API_BASE}/users`);
    expect(response.status()).toBe(200);
    const users = await response.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
  });

  test('POST /users creates user and returns 201', async ({ request }) => {
    const email = `test_${Date.now()}@example.com`;
    const response = await request.post(`${API_BASE}/users`, {
      data: {
        email,
        password: 'TestPass123!',
        firstName: 'Auto',
        lastName: 'Tester',
      },
    });

    expect(response.status()).toBe(201);
    const user = await response.json();
    expect(user.email).toBe(email);
    expect(user.id).toBeTruthy();

    // Cleanup: delete created user
    await request.delete(`${API_BASE}/users/${user.id}`);
  });
});
