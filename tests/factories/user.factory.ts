import { APIRequestContext } from '@playwright/test';
import Ajv from 'ajv';
import { env } from '../../library/config/env';
import { getAuthToken } from '../api/middleware/auth.middleware';
import { userSchema } from '../api/schemas';

const ajv = new Ajv({ allErrors: true });
const API_BASE = env.apiBaseUrl;

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
