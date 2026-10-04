import 'dotenv/config';

// ponytail: single source for URLs/creds — add fields here, never hardcode elsewhere.
export const env = {
  webBaseUrl: process.env.WEB_BASE_URL || 'https://saucedemo.com',
  apiBaseUrl: process.env.API_BASE_URL || 'https://api.example.com',
  username: process.env.TEST_USERNAME || 'standard_user',
  password: process.env.TEST_PASSWORD || 'secret_sauce',
} as const;

export const hasApi = env.apiBaseUrl !== 'https://api.example.com';
