/**
 * Auth Refresh Middleware
 * Token caching with automatic refresh before expiry.
 */
import { APIRequestContext } from '@playwright/test';
import 'dotenv/config';

const API_BASE = process.env.API_BASE_URL || 'https://api.example.com';

interface CachedToken {
  token: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;
const TOKEN_REFRESH_BUFFER_MS = 60_000;

export async function getAuthToken(request: APIRequestContext): Promise<string> {
  const now = Date.now();

  if (cachedToken && cachedToken.expiresAt > now + TOKEN_REFRESH_BUFFER_MS) {
    return cachedToken.token;
  }

  const response = await request.post(`${API_BASE}/auth/login`, {
    data: {
      username: process.env.TEST_USERNAME || 'standard_user',
      password: process.env.TEST_PASSWORD || 'secret_sauce',
    },
  });

  if (response.status() !== 200) {
    throw new Error(`Auth login failed: ${response.status()} ${await response.text()}`);
  }

  const body = await response.json();
  const expiresIn = (body.expiresIn as number) ?? 3600;

  cachedToken = {
    token: body.token,
    expiresAt: now + expiresIn * 1000,
  };

  return cachedToken.token;
}

export async function getAuthResponse(request: APIRequestContext): Promise<{
  token: string;
  user: Record<string, unknown>;
  expiresIn: number;
}> {
  const response = await request.post(`${API_BASE}/auth/login`, {
    data: {
      username: process.env.TEST_USERNAME || 'standard_user',
      password: process.env.TEST_PASSWORD || 'secret_sauce',
    },
  });

  if (response.status() !== 200) {
    throw new Error(`Auth login failed: ${response.status()}`);
  }

  return response.json() as Promise<{ token: string; user: Record<string, unknown>; expiresIn: number }>;
}

export function clearAuthCache(): void {
  cachedToken = null;
}

export async function getAuthHeaders(request: APIRequestContext): Promise<Record<string, string>> {
  const token = await getAuthToken(request);
  return { Authorization: `Bearer ${token}` };
}
