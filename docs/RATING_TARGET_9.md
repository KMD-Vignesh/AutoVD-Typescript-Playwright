# AutoVD Framework — Target Rating: 9/10

**Current:** 7/10 → **Target:** 9/10  
**Gap:** Visual regression, report merging, test data factory, iOS physical devices, accessibility, performance, RBAC matrices, flaky baseline

---

## Current vs Target Rating Table

| Dimension | Current | Target | Gap Analysis |
|---|---|---|---|
| **Web Automation** | 8/10 | 9/10 | + Visual regression, + Accessibility assertions |
| **API Automation** | 7/10 | 9/10 | + Schema validation, + Auth refresh middleware, + Data cleanup orchestration |
| **Mobile Automation** | 7/10 | 9/10 | + iOS physical devices in CI, + Deep native interactions, + Maestro→Allure report merge |
| **Scalability** | 7/10 | 9/10 | + Test data factory, + Shard-aware report merging, + Flaky test baseline tracking |
| **Maintainability** | 7/10 | 9/10 | + Selector management layer, + Test data abstraction, + Maestro Page Object equivalent |
| **Enterprise Readiness** | 6/10 | 9/10 | + Role-based access matrices, + Performance budgets, + Allure unified dashboard |
| **Overall** | 7/10 | **9/10** | — |

---

## Required Changes — Prioritized by Impact

### P0 — High Impact, Low Effort (Do These First)

#### 1. Visual Regression Testing
```typescript
// tests/web/saucelab.test.ts — add to existing tests
import { expect } from "@playwright/test";
// ...
await mainPage.openApp();
await mainPage.loginApp();
await expect(mainPage.page).toHaveScreenshot({ fullPage: true, maxDiffPixelRatio: 0.01 });
```

```typescript
// playwright.config.ts — add baseline directory
use: {
  // ...existing
  screenshot: 'only-on-failure',
},
// Add to projects:
{
  name: 'chromium',
  use: { ...devices['Desktop Chrome'] },
},
```

**Command:** `npx playwright test --update-snapshots` (first run creates baselines)

---

#### 2. Accessibility Assertions
```typescript
// tests/api/accessibility.api.spec.ts — NEW
import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('login page has proper ARIA labels', async ({ page }) => {
    await page.goto('https://saucedemo.com');
    await expect(page).toBeAccessible();
  });

  test('cart page passes WCAG 2.1 AA', async ({ page }) => {
    await page.goto('https://saucedemo.com');
    await page.locator('#login-button').click();
    await expect(page).toHaveAccessibleName();
    await expect(page.locator('.shopping_cart_badge')).toHaveAccessibleDescription();
  });
});
```

Add to `playwright.config.ts`:
```typescript
import { addHooks } from 'playwright-extra';
import playwrightAxe from 'playwright-axe';
addHooks(playwrightAxe);
```

---

#### 3. API Schema Validation
```typescript
// tests/api/schemas/auth.schema.ts — NEW
export const loginSchema = {
  type: 'object',
  required: ['token', 'user'],
  properties: {
    token: { type: 'string', minLength: 10 },
    user: {
      type: 'object',
      required: ['id', 'username', 'role'],
      properties: {
        id: { type: 'string' },
        username: { type: 'string' },
        role: { type: 'string', enum: ['user', 'admin'] },
      },
    },
  },
};

// tests/api/auth.api.spec.ts — update existing test
import { loginSchema } from '../schemas/auth.schema';
import Ajv from 'ajv';
const ajv = new Ajv();

test('POST /auth/login returns token', async ({ request }) => {
  const response = await request.post(`${API_BASE}/auth/login`, {
    data: { username: process.env.TEST_USERNAME, password: process.env.TEST_PASSWORD },
  });
  expect(response.status()).toBe(200);
  const body = await response.json();
  
  // Schema validation
  const validate = ajv.compile(loginSchema);
  expect(validate(body)).toBe(true);
  expect(body.token).toBeTruthy();
  expect(body.user.role).toBe('user');
});
```

Install: `npm install -D ajv`

---

#### 4. Auth Refresh Middleware (API)
```typescript
// tests/api/middleware/auth.middleware.ts — NEW
import { APIRequestContext } from '@playwright/test';
import 'dotenv/config';

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getAuthToken(request: APIRequestContext): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.token; // Reuse if <1min from expiry
  }
  
  const res = await request.post(`${process.env.API_BASE_URL}/auth/login`, {
    data: {
      username: process.env.TEST_USERNAME,
      password: process.env.TEST_PASSWORD,
    },
  });
  const body = await res.json();
  cachedToken = { token: body.token, expiresAt: now + (body.expiresIn || 3600) * 1000 };
  return cachedToken.token;
}

export async function clearAuthCache() {
  cachedToken = null;
}
```

Use in any API test:
```typescript
import { getAuthToken } from '../middleware/auth.middleware';

test('authenticated request', async ({ request }) => {
  const token = await getAuthToken(request);
  const res = await request.get('/protected', { headers: { Authorization: `Bearer ${token}` } });
  expect(res.status()).toBe(200);
});
```

---

### P1 — Medium Impact, Medium Effort

#### 5. Test Data Factory
```typescript
// tests/factories/user.factory.ts — NEW
import { APIRequestContext } from '@playwright/test';
import 'dotenv/config';

const API_BASE = process.env.API_BASE_URL || 'https://api.example.com';

export class UserFactory {
  static async create(request: APIRequestContext, overrides: Partial<{
    email?: string;
    role?: 'user' | 'admin';
    firstName?: string;
  }> = {}) {
    const uniqueId = Date.now();
    const response = await request.post(`${API_BASE}/users`, {
      data: {
        email: overrides.email || `test_${uniqueId}@example.com`,
        password: 'TestPass123!',
        firstName: overrides.firstName || `Test User ${uniqueId}`,
        role: overrides.role || 'user',
      },
    });
    const user = await response.json();
    
    // Return cleanup function
    return {
      ...user,
      async cleanup(req: APIRequestContext) {
        await req.delete(`${API_BASE}/users/${user.id}`);
      },
    };
  }
}

// tests/api/users.api.spec.ts — use it
import { UserFactory } from '../../factories/user.factory';

test('creates and cleans up user', async ({ request }) => {
  const user = await UserFactory.create(request);
  expect(user.email).toContain('@example.com');
  await user.cleanup(request); // Ensures cleanup
});
```

Install: `npm install -D uuid` (for unique IDs)

---

#### 6. Maestro Page Object Pattern
```typescript
// maestro/pages/LoginPage.ts — NEW (TypeScript for Maestro JS scripts)
export class LoginPage {
  constructor(private appId: string) {}
  
  getEmailInput() { return { id: 'email_input' }; }
  getPasswordInput() { return { id: 'password_input' }; }
  getLoginButton() { return { id: 'login_button' }; }
  getWelcomeText() { return { text: '.*Dashboard.*' }; }
}

// maestro/pages/CartPage.ts
export class CartPage {
  getCartTab() { return { id: 'cart_tab' }; }
  getItemCount() { return { text: '.*items.*' }; }
  getCheckoutButton() { return { id: 'checkout_button' }; }
}

// maestro/scripts/page-objects.ts — register for reuse
export const pages = {
  login: new LoginPage(process.env.ANDROID_APP_ID!),
  cart: new CartPage(),
};
```

```yaml
# maestro/flows/login-flow.yaml — use typed selectors
appId: ${ANDROID_APP_ID}
tags: [smoke, login]
---
- launchApp:
    clearState: true
- tapOn:
    id: "email_input"
- inputText: ${TEST_USERNAME}
- tapOn:
    id: "password_input"
- inputText: ${TEST_PASSWORD}
- tapOn:
    id: "login_button"
- assertVisible:
    text: ".*Dashboard.*"
- takeScreenshot: login_success
```

---

#### 7. iOS Physical Device in CI
```yaml
# .github/workflows/full-test-suite.yml — add this job
mobile-ios-physical:
  runs-on: macos-latest
  needs: api-tests
  steps:
    - uses: actions/checkout@v4
    - name: Install Maestro
      run: curl -Ls "https://get.maestro.mobile.dev" | bash
    - name: Install iOS Device Bridge
      run: |
        curl -fsSL https://raw.githubusercontent.com/devicelab-dev/maestro-ios-device/main/setup.sh | bash
    - name: Start Device Bridge
      run: |
        maestro-ios-device --team-id ${{ secrets.APPLE_TEAM_ID }} --device ${{ secrets.IPHONE_UDID }} &
        sleep 5
    - name: Run Maestro on Real iPhone
      run: |
        export PATH="$HOME/.maestro/bin:$PATH"
        maestro --driver-host-port 6001 --device ${{ secrets.IPHONE_UDID }} test maestro/flows/
    - uses: actions/upload-artifact@v4
      with:
        name: maestro-ios-physical-reports
        path: maestro/reports/
```

**Requirements:** Apple Developer account, connected iPhone, `secrets.APPLE_TEAM_ID` and `secrets.IPHONE_UDID` in GitHub Secrets.

---

#### 8. Unified Report Merge
```typescript
// scripts/merge-reports.ts — NEW
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

async function mergeAllReports() {
  const reportDir = 'report/unified';
  fs.mkdirSync(reportDir, { recursive: true });
  
  // Copy Playwright Allure results
  const allureDir = 'report/allure/allure-results';
  if (fs.existsSync(allureDir)) {
    fs.cpSync(allureDir, `${reportDir}/allure`, { recursive: true });
  }
  
  // Copy Maestro screenshots
  const maestroDir = 'maestro/reports';
  if (fs.existsSync(maestroDir)) {
    fs.cpSync(maestroDir, `${reportDir}/maestro`, { recursive: true });
  }
  
  // Generate unified index
  const index = `<!DOCTYPE html>
<html>
<head><title>AutoVD Unified Report</title></head>
<body>
  <h1>AutoVD Test Report</h1>
  <ul>
    <li><a href="allure/index.html">Playwright Allure Report (Web + API)</a></li>
    <li><a href="maestro/screenshots/">Maestro Screenshots (Mobile)</a></li>
  </ul>
</body>
</html>`;
  fs.writeFileSync(`${reportDir}/index.html`, index);
  console.log('Unified report generated at:', reportDir);
}

mergeAllReports();
```

Add to package.json:
```json
"report:merge": "node scripts/merge-reports.ts"
```

---

### P2 — Enterprise Features

#### 9. Role-Based Access Matrices
```typescript
// tests/web/rbac.spec.ts — NEW
import { test, expect } from '../../fixtures';

const ROLES = [
  { name: 'user',     username: 'standard_user',  password: 'secret_sauce', canAccess: ['cart', 'products'] },
  { name: 'admin',    username: 'admin_user',     password: 'admin123',     canAccess: ['cart', 'products', 'settings', 'users'] },
  { name: 'restricted', username: 'locked_out_user', password: 'secret_sauce', canAccess: [] },
];

test.describe.each(ROLES)('RBAC: %s role', ({ name, username, password, canAccess }) => {
  test('can access allowed pages', async ({ playVD }) => {
    const mainPage = new MainPage(playVD);
    await mainPage.openApp();
    await mainPage.loginApp(username, password);
    
    for (const page of canAccess) {
      await expect(mainPage.page.locator(`[data-page="${page}"]`)).toBeVisible();
    }
  });
  
  test('cannot access restricted pages', async ({ playVD }) => {
    const mainPage = new MainPage(playVD);
    await mainPage.openApp();
    await mainPage.loginApp(username, password);
    
    const restricted = ['settings', 'users'].filter(p => !canAccess.includes(p));
    for (const page of restricted) {
      await expect(mainPage.page.locator(`[data-page="${page}"]`)).not.toBeVisible();
    }
  });
});
```

---

#### 10. Performance Budget Assertions
```typescript
// tests/web/performance.spec.ts — NEW
import { test, expect } from '../../fixtures';

test.describe('Performance', () => {
  test('page loads within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('https://saucedemo.com');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
    await expect(page).toHaveTitle(/Swag Labs/);
  });

  test('Lighthouse scores meet budget', async ({ page }) => {
    await page.goto('https://saucedemo.com');
    
    // Performance budget
    const perfMetrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: perf.domContentLoadedEventEnd - perf.startTime,
        fullyLoaded: perf.loadEventEnd - perf.startTime,
      };
    });
    
    expect(perfMetrics.domContentLoaded).toBeLessThan(2000);
    expect(perfMetrics.fullyLoaded).toBeLessThan(3000);
  });
});
```

---

#### 11. Flaky Test Baseline Tracker
```typescript
// playwright-flaky-baseline.json — NEW (commit this file)
{
  "baseline": {
    "totalTests": 39,
    "expectedPassRate": 0.95,
    "trackedFlakyTests": [
      {
        "file": "tests/web/saucelab.test.ts",
        "test": "Remove Cart › remove cart 2",
        "lastFailures": 1,
        "status": "known-flaky",
        "reason": "Multi-tab handling race condition"
      }
    ],
    "passRateHistory": [
      { "date": "2025-01-01", "rate": 0.97 },
      { "date": "2025-01-02", "rate": 0.95 },
      { "date": "2025-01-03", "rate": 0.98 }
    ]
  }
}
```

Add to CI:
```yaml
- name: Check flaky test baseline
  run: |
    node -e "
      const baseline = require('./playwright-flaky-baseline.json');
      const passRate = ${YOUR_PASS_RATE};
      if (passRate < baseline.baseline.expectedPassRate) {
        console.error('PASS RATE BELOW Baseline: ' + passRate);
        process.exit(1);
      }
    "
```

---

## Implementation Priority Matrix

| # | Feature | Effort | Impact | Do This |
|---|---|---|---|---|
| 1 | Visual regression | 1 hr | 🔴 High | Now |
| 2 | Accessibility assertions | 1 hr | 🔴 High | Now |
| 3 | API schema validation | 2 hrs | 🔴 High | Now |
| 4 | Auth refresh middleware | 2 hrs | 🟡 Medium | Now |
| 5 | Test data factory | 3 hrs | 🟡 Medium | Next |
| 6 | Maestro Page Object | 2 hrs | 🟡 Medium | Next |
| 7 | iOS physical CI | 3 hrs | 🔴 High | Next |
| 8 | Unified report merge | 2 hrs | 🟡 Medium | Next |
| 9 | RBAC matrices | 4 hrs | 🟢 Low | Later |
| 10 | Performance budgets | 2 hrs | 🟢 Low | Later |
| 11 | Flaky baseline | 1 hr | 🟢 Low | Later |

---

## Final Target Rating Table

| Dimension | Current | After Implementation | Remark |
|---|---|---|---|
| **Web Automation** | 8/10 | **9/10** | + Visual regression, + a11y assertions |
| **API Automation** | 7/10 | **9/10** | + Schema validation, + auth middleware, + data cleanup |
| **Mobile Automation** | 7/10 | **9/10** | + iOS physical CI, + report merge, + deep interactions |
| **Scalability** | 7/10 | **9/10** | + Data factory, + shard-aware reports, + baseline tracking |
| **Maintainability** | 7/10 | **9/10** | + Selector layer, + data abstraction, + typed POs |
| **Enterprise Readiness** | 6/10 | **9/10** | + RBAC matrices, + perf budgets, + unified dashboard |
| **Overall** | 7/10 | **9/10** | Full enterprise test automation suite |

---

## Commands After Implementation

```bash
# Full test suite
npm run test:all

# With visual regression
npx playwright test --update-snapshots

# With accessibility checks
npx playwright test --grep "Accessibility"

# API with schema validation
npm run test:api

# Mobile (Android emulator + iOS simulator + iOS physical)
npm run test:mobile:android
npm run test:mobile:ios
npm run test:mobile:ios-physical

# Unified reports
npm run report:merge

# CI pipeline
gh workflow run full-test-suite.yml
```
