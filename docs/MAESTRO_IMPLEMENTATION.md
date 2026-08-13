# AutoVD Framework — Maestro Integration Guide

**Project:** AutoVD Typescript-Playwright  
**Goal:** Add Maestro mobile automation alongside existing Playwright web + API framework  
**Version:** 1.0  
**Date:** 2025

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Directory Structure](#2-directory-structure)
3. [Installation & Setup](#3-installation--setup)
4. [iOS Physical Device Support](#4-ios-physical-device-support)
5. [API + UI Hybrid Testing](#5-api--ui-hybrid-testing)
6. [Writing Maestro Flows](#6-writing-maestro-flows)
7. [Loops, Conditions & JavaScript](#7-loops-conditions--javascript)
8. [CI/CD Integration](#8-cicd-integration)
9. [Common Patterns & Best Practices](#9-common-patterns--best-practices)
10. [Limitations & Mitigations](#10-limitations--mitigations)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     AutoVD Framework                            │
├─────────────────────────┬───────────────────────────────────────┤
│  Playwright (Web/API)   │  Maestro (Mobile Native)              │
├─────────────────────────┼───────────────────────────────────────┤
│  tests/api/             │  maestro/flows/                       │
│  tests/web/             │  maestro/scripts/                     │
│  pages/                 │  maestro/config/                      │
│  library/helper/        │  maestro/studio/ (optional IDE)       │
│  playwright.config.ts   │  maestro.yaml (shared config)         │
├─────────────────────────┼───────────────────────────────────────┤
│  npm run test:web       │  maestro test flows/                  │
│  npm run test:api       │  maestro studio                       │
│  npm run test:mobile    │  maestro test --shard-split 3         │
└─────────────────────────┴───────────────────────────────────────┘
```

**Why this works:**
- Playwright owns web E2E + API testing (your existing stack)
- Maestro owns native mobile E2E (Android + iOS)
- Both share the same project, same CI pipeline, same reporting culture
- Data flows between them via environment variables and API fixtures

---

## 2. Directory Structure

```
AutoVD-Typescript-Playwright/
├── .gitignore
├── package.json
├── playwright.config.ts
├── tsconfig.json                       # ← Add this
│
├── tests/
│   ├── api/                            # ← New: API tests
│   │   ├── auth.api.spec.ts
│   │   └── users.api.spec.ts
│   ├── web/                            # ← Rename from tests/
│   │   └── saucelab.test.ts
│   └── fixtures.ts                     # ← Shared test fixtures
│
├── pages/                              # Existing — keep as-is
│   ├── login.page.ts
│   └── main.page.ts
│
├── library/                            # Existing — keep as-is
│   ├── helper/
│   │   └── vdPlay.ts
│   └── interface/
│       ├── vdBase.ts
│       └── vdPage.ts
│
├── maestro/                            # ← New: Maestro layer
│   ├── flows/                          # Test flows (YAML)
│   │   ├── login-flow.yaml
│   │   ├── checkout-flow.yaml
│   │   └── subflows/
│   │       ├── add-to-cart.yaml
│   │       └── apply-coupon.yaml
│   ├── scripts/                        # JavaScript utilities
│   │   ├── api-seed.js                 # Seed test data via API
│   │   ├── api-auth.js                 # Get auth tokens
│   │   └── data-generator.js           # Synthetic data helpers
│   ├── config/
│   │   ├── environments.yaml           # Env-specific config
│   │   └── devices.yaml                # Device profiles
│   └── reports/                        # Test reports output
│
├── report/                             # Existing — keeps Allure + Playwright reports
│
└── .env                                # ← Add: credentials, base URLs
```

---

## 3. Installation & Setup

### 3.1 Install Maestro CLI

```bash
# macOS / Linux
curl -Ls "https://get.maestro.mobile.dev" | bash

# Windows (PowerShell)
irm https://get.maestro.mobile.dev | iex

# Verify installation
maestro --version
# Should output: 2.0.x
```

### 3.2 Add to package.json Scripts

```json
{
  "scripts": {
    "test:playwright": "npx playwright test --workers=4 --grep 'Remove Cart'",
    "test:web": "npm run clean:allure-results && npm run test:playwright && npm run copy:history && npm run clean:allure-report && npm run report:allure",
    "test:mobile": "maestro test maestro/flows/ --parallel 3",
    "test:mobile:ios": "maestro test maestro/flows/ --device ios",
    "test:mobile:android": "maestro test maestro/flows/ --device android",
    "test:mobile:all": "maestro test maestro/flows/ --shard-split 3",
    "test:api": "npx playwright test tests/api/ --reporter=line",
    "test:all": "npm run test:web && npm run test:api && npm run test:mobile",
    "maestro:studio": "maestro studio"
  }
}
```

### 3.3 Install maestro-report for Allure Integration

```bash
# Maestro has native Allure support via plugin
npm install -D @maestro/reporter 2>/dev/null || echo "Maestro uses built-in reporters"
```

> **Note:** Maestro generates its own HTML reports. For Allure, we integrate at the CI level by merging Playwright Allure results with Maestro screen recordings.

### 3.4 Create `.env` File

```bash
# .env
# API Base URLs
API_BASE_URL=https://api.example.com
WEB_BASE_URL=https://saucedemo.com

# Test Credentials (never hardcode in flows)
TEST_USERNAME=standard_user
TEST_PASSWORD=secret_sauce
ADMIN_USERNAME=admin_user
ADMIN_PASSWORD=admin123

# Maestro App IDs
ANDROID_APP_ID=com.example.shopping
IOS_APP_ID=com.example.shopping

# Maestro Cloud (if using)
MAESTRO_TOKEN=your_maestro_cloud_token
```

Add `.env` to `.gitignore`:
```
.env
.env.local
node_modules/
```

Install dotenv for Playwright:
```bash
npm install -D dotenv
```

Update `playwright.config.ts`:
```typescript
import 'dotenv/config';
```

---

## 4. iOS Physical Device Support

### 4.1 Open-Source Workaround (Recommended — Free)

```bash
# Install maestro-ios-device bridge
curl -fsSL https://raw.githubusercontent.com/devicelab-dev/maestro-ios-device/main/setup.sh | bash

# Start bridge for your iPhone
maestro-ios-device --team-id YOUR_TEAM_ID --device DEVICE_UDID

# Run Maestro with the bridge (port 6001)
maestro --driver-host-port 6001 --device DEVICE_UDID test maestro/flows/login-flow.yaml
```

### 4.2 Parallel iOS Devices

```bash
# Terminal 1 — iPhone 1
maestro-ios-device --team-id ABC123 --device UDID_1 --driver-host-port 6001

# Terminal 2 — iPhone 2
maestro-ios-device --team-id ABC123 --device UDID_2 --driver-host-port 6002

# Run tests across both
maestro test maestro/flows/ --shard-split 2
```

### 4.3 Cloud Alternative (If Managing Devices Is Not an Option)

```bash
# Maestro Cloud — $250/device/month
# Set token and run
export MAESTRO_TOKEN=your_token
maestro cloud test maestro/flows/ --device-count 3
```

### 4.4 Environment-Specific Config

```yaml
# maestro/config/environments.yaml
environments:
  qa:
    app_url: https://qa.example.com
    api_url: https://api.qa.example.com
    android_app_id: com.example.shopping
    ios_app_id: com.example.shopping

  staging:
    app_url: https://staging.example.com
    api_url: https://api.staging.example.com
    android_app_id: com.example.shopping.staging
    ios_app_id: com.example.shopping.staging

  prod:
    app_url: https://example.com
    api_url: https://api.example.com
    android_app_id: com.example.shopping
    ios_app_id: com.example.shopping
```

---

## 5. API + UI Hybrid Testing

This is where your existing Playwright API capability meets Maestro's UI layer.

### 5.1 Pattern: Seed Data via Playwright, Validate in Maestro

```typescript
// tests/api/auth.api.spec.ts
import { test, expect } from '@playwright/test';
import 'dotenv/config';

test.describe('Auth API', () => {
  test('login returns valid token', async ({ request }) => {
    const response = await request.post(`${process.env.API_BASE_URL}/auth/login`, {
      data: {
        username: process.env.TEST_USERNAME,
        password: process.env.TEST_PASSWORD,
      },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.token).toBeTruthy();
    expect(body.user.id).toBeTruthy();

    // Write token to file for Maestro to consume
    const fs = require('fs');
    fs.writeFileSync('maestro/scripts/.auth-token.json', JSON.stringify(body));
    console.log('TOKEN_SAVED=true');
  });
});
```

```yaml
# maestro/flows/login-flow.yaml
appId: ${ANDROID_APP_ID}
env:
  API_URL: ${API_BASE_URL}
---
- launchApp:
    clearState: true

# Read token seeded by Playwright API test
- runScript: read-token.js

# Use token to bypass manual login (faster, more reliable)
- tapOn:
    text: ".*Skip Login.*"
    optional: true
- inputText: ${output.token}
- tapOn: "Apply Token"
- assertVisible:
    text: ".*Dashboard.*"
- takeScreenshot: logged_in_state
```

```javascript
// maestro/scripts/read-token.js
const fs = require('fs');
try {
  const tokenData = JSON.parse(fs.readFileSync('maestro/scripts/.auth-token.json', 'utf8'));
  output.token = tokenData.token;
  output.userId = tokenData.user.id;
} catch (e) {
  // Fallback: use manual login if token not available
  output.token = null;
}
```

### 5.2 Pattern: Full API Test + UI Smoke (CI Pipeline)

```yaml
# .github/workflows/mobile-tests.yml
name: Mobile Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:api
      - name: Save API artifacts
        uses: actions/upload-artifact@v4
        with:
          name: api-results
          path: report/allure/allure-results/

  mobile-tests:
    needs: api-tests
    runs-on: macos-latest
    strategy:
      matrix:
        device: [android-emulator, ios-simulator]
    steps:
      - uses: actions/checkout@v4
      - name: Install Maestro
        run: curl -Ls "https://get.maestro.mobile.dev" | bash
      - name: Start emulator/simulator
        run: |
          if [ "${{ matrix.device }}" = "android-emulator" ]; then
            emulator -avd Pixel_6_API_33 -no-splash -no-audio &
            adb wait-for-device
          fi
      - name: Run Maestro flows
        run: |
          export PATH="$HOME/.maestro/bin:$PATH"
          maestro test maestro/flows/ --shard-split 2
      - name: Upload Maestro screenshots
        uses: actions/upload-artifact@v4
        with:
          name: maestro-reports-${{ matrix.device }}
          path: maestro/reports/
```

---

## 6. Writing Maestro Flows

### 6.1 Basic Login Flow

```yaml
# maestro/flows/login-flow.yaml
appId: ${ANDROID_APP_ID}
env:
  USERNAME: ${TEST_USERNAME}
  PASSWORD: ${TEST_PASSWORD}
tags:
  - smoke
  - login
---
- launchApp:
    clearState: true

# Handle onboarding (may or may not appear)
- runFlow:
    when:
      visible: "Welcome to Shopping"
    commands:
      - tapOn: "Get Started"
      - tapOn: "Allow Notifications"
      - tapOn: "Skip"

- tapOn: "Sign In"
- tapOn:
    id: "email_input"
- inputText: ${USERNAME}
- tapOn:
    id: "password_input"
- inputText: ${PASSWORD}
- tapOn:
    id: "login_button"

- assertVisible:
    text: ".*Dashboard.*"
- assertVisible:
    id: "user_avatar"
- takeScreenshot: login_success
```

### 6.2 Checkout Flow with Data Seeding

```yaml
# maestro/flows/checkout-flow.yaml
appId: ${ANDROID_APP_ID}
tags:
  - regression
  - checkout
---
- launchApp

# Seed a product via API before UI interaction
- runScript: seed-product.js

- tapOn: "Products"
- tapOn:
    text: ".*${output.productName}.*"
- tapOn: "Add to Cart"
- assertVisible:
    text: ".*added to cart.*"

- tapOn: "Cart"
- assertVisible:
    text: "1 item"
- tapOn: "Checkout"

# Fill payment form (data from API seed)
- tapOn:
    id: "card_number_input"
- inputText: ${output.testCardNumber}
- tapOn:
    id: "expiry_input"
- inputText: "12/28"
- tapOn:
    id: "cvv_input"
- inputText: "123"
- tapOn: "Pay Now"

- assertVisible:
    text: ".*Order Confirmed.*"
- assertVisible:
    text: ".*#${output.orderId}.*"
- takeScreenshot: order_confirmation
```

```javascript
// maestro/scripts/seed-product.js
const response = http.get('https://api.example.com/v1/products?limit=1');
const products = json(response.body);
const product = products[0];

output.productName = product.name;
output.productId = product.id;
output.testCardNumber = '4242424242424242'; // Stripe test card
```

### 6.3 Nested Subflows (Reusable Components)

```yaml
# maestro/flows/subflows/add-to-cart.yaml
# Reusable: add a product by name
- tapOn: "Products"
- tapOn:
    text: ".*${PRODUCT_NAME}.*"
- tapOn: "Add to Cart"
- tapOn: "Back to Products"
```

```yaml
# maestro/flows/cart-regression.yaml
appId: ${ANDROID_APP_ID}
tags:
  - regression
  - cart
---
- launchApp

- runFlow:
    file: subflows/add-to-cart.yaml
    env:
      PRODUCT_NAME: "Wireless Headphones"

- runFlow:
    file: subflows/add-to-cart.yaml
    env:
      PRODUCT_NAME: "USB-C Cable"

- runFlow:
    file: subflows/add-to-cart.yaml
    env:
      PRODUCT_NAME: "Phone Case"

- tapOn: "Cart"
- assertVisible: "3 items"
- assertVisible: "Total: $149.97"
```

---

## 7. Loops, Conditions & JavaScript

### 7.1 Built-in Loops

```yaml
# Fixed loop — add 5 items
- repeat:
    times: 5
    commands:
      - tapOn: "Add Item"
      - tapOn: "Save"

# Conditional loop — delete until inbox is empty
- repeat:
    while:
      notVisible: "Your inbox is empty"
    commands:
      - tapOn: "Delete Message"
      - tapOn: "Confirm"

# Smart loop — max 10 dismissals with safety net
- repeat:
    times: 10
    while:
      visible: "Update available"
    commands:
      - tapOn: "Dismiss"
      - assertNotVisible: "Dismiss"
```

### 7.2 Built-in Conditions

```yaml
# Platform-specific flows
- runFlow:
    when:
      platform: iOS
    file: subflows/ios-permissions.yaml

- runFlow:
    when:
      platform: Android
    file: subflows/android-permissions.yaml

# Handle optional elements
- runFlow:
    when:
      visible: "Rate this App"
    commands:
      - tapOn: "Maybe Later"

# Simple optional tap (doesn't fail if missing)
- tapOn:
    text: "Dismiss banner"
    optional: true
    label: "Handle promotional banner"

# Negative condition
- runFlow:
    when:
      notVisible: "Biometric Login"
    commands:
      - tapOn: "Standard Login"
```

### 7.3 JavaScript for Complex Logic

```yaml
# maestro/flows/data-driven-checkout.yaml
appId: ${ANDROID_APP_ID}
---
- launchApp

# Define data in JavaScript
- evalScript: |
    output.products = [
      { name: "Headphones", price: 99 },
      { name: "Charger", price: 29 },
      { name: "Case", price: 19 }
    ];
    output.index = 0;
    output.total = 0;

# Loop through products via JavaScript + Maestro commands
- repeat:
    while:
      true: ${output.index < output.products.length}
    commands:
      - runFlow:
          file: subflows/add-to-cart.yaml
          env:
            PRODUCT_NAME: ${output.products[output.index].name}
      - evalScript: |
          output.total += output.products[output.index].price;
          output.index++;

- tapOn: "Cart"
- assertVisible: "3 items"
- assertVisible: "Total: $${output.total}"
```

```yaml
# maestro/flows/subflows/add-to-cart.yaml
- tapOn: "Products"
- tapOn:
    text: ".*${PRODUCT_NAME}.*"
- tapOn: "Add to Cart"
- tapOn: "Back"
```

---

## 8. CI/CD Integration

### 8.1 GitHub Actions — Full Pipeline

```yaml
# .github/workflows/full-test-suite.yml
name: AutoVD Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  API_BASE_URL: https://api.staging.example.com
  WEB_BASE_URL: https://staging.example.com

jobs:
  # ─── API Tests (Playwright) ─────────────────────────────
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install chromium
      - run: npm run test:api
      - uses: actions/upload-artifact@v4
        with:
          name: api-allure-report
          path: report/allure/allure-report/

  # ─── Web Tests (Playwright) ─────────────────────────────
  web-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install chromium
      - run: npm run test:web
      - uses: actions/upload-artifact@v4
        with:
          name: web-allure-report
          path: report/allure/allure-report/

  # ─── Mobile Tests (Maestro — Android) ───────────────────
  mobile-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Maestro
        run: curl -Ls "https://get.maestro.mobile.dev" | bash
      - name: Start Android Emulator
        run: |
          $ANDROID_HOME/emulator/emulator -avd Pixel_6_API_33 -no-splash -no-audio &
          adb wait-for-device
      - name: Run Maestro Flows
        run: |
          export PATH="$HOME/.maestro/bin:$PATH"
          maestro test maestro/flows/ --shard-split 2
      - uses: actions/upload-artifact@v4
        with:
          name: maestro-android-reports
          path: maestro/reports/

  # ─── Mobile Tests (Maestro — iOS Simulator) ─────────────
  mobile-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Maestro
        run: curl -Ls "https://get.maestro.mobile.dev" | bash
      - name: Start iOS Simulator
        run: |
          xcrun simctl boot "iPhone 15" 2>/dev/null || true
      - name: Run Maestro Flows
        run: |
          export PATH="$HOME/.maestro/bin:$PATH"
          maestro test maestro/flows/ --shard-split 2
      - uses: actions/upload-artifact@v4
        with:
          name: maestro-ios-reports
          path: maestro/reports/

  # ─── Report Aggregation ─────────────────────────────────
  report:
    needs: [api-tests, web-tests, mobile-android, mobile-ios]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Download all reports
        uses: actions/download-artifact@v4
        with:
          path: all-reports/
      - name: Generate combined report
        run: |
          echo "## Test Results Summary" > all-reports/README.md
          echo "- API Tests: see api-allure-report/" >> all-reports/README.md
          echo "- Web Tests: see web-allure-report/" >> all-reports/README.md
          echo "- Mobile Android: see maestro-android-reports/" >> all-reports/README.md
          echo "- Mobile iOS: see maestro-ios-reports/" >> all-reports/README.md
      - uses: actions/upload-artifact@v4
        with:
          name: combined-test-reports
          path: all-reports/
```

### 8.2 Local Run Commands

```bash
# Run everything
npm run test:all

# Run only mobile tests
npm run test:mobile

# Run mobile on specific platform
npm run test:mobile:android
npm run test:mobile:ios

# Run Maestro with Studio (visual builder)
npm run maestro:studio

# Run single Maestro flow
maestro test maestro/flows/login-flow.yaml

# Run Maestro with parallel devices
maestro test maestro/flows/ --shard-split 4
```

---

## 9. Common Patterns & Best Practices

### 9.1 Selector Strategy (Most to Least Stable)

```yaml
# ✅ BEST — Accessibility ID (developer-controlled, survives localization)
- tapOn:
    id: "login_button"
- assertVisible:
    id: "welcome_message"

# ✅ GOOD — Regex text (survives minor copy changes)
- tapOn:
    text: ".*Sign In.*"
- assertVisible:
    text: ".*Welcome.*"

# ⚠️ OK — Index-based (breaks if element order changes)
- tapOn:
    id: "action_button"
    index: 0

# ❌ AVOID — Screen coordinates (breaks on every layout change)
- tapOn:
    point: "50%, 80%"
```

### 9.2 Handling Dynamic Content

```yaml
# Pattern 1: Regex for dynamic text
- assertVisible:
    text: ".*Order .* confirmed.*"

# Pattern 2: Optional for transient elements
- tapOn:
    text: "Dismiss notification"
    optional: true
    label: "Close notification if shown"

# Pattern 3: Wait for state change
- repeat:
    while:
      visible: "Loading"
    commands:
      - waitForAnimationToEnd

# Pattern 4: Platform-specific handling
- runFlow:
    when:
      platform: iOS
    commands:
      - tapOn: "Allow"
- runFlow:
    when:
      platform: Android
    commands:
      - tapOn: "Allow"
```

### 9.3 Test Organization by Tag

```yaml
# maestro/flows/smoke/login.yaml        tags: [smoke, login]
# maestro/flows/smoke/checkout.yaml     tags: [smoke, checkout]
# maestro/flows/regression/cart.yaml    tags: [regression, cart]
# maestro/flows/regression/profile.yaml tags: [regression, profile]

# Run only smoke tests
maestro test maestro/flows/smoke/ --grep "smoke"

# Run only regression
maestro test maestro/flows/regression/ --grep "regression"
```

### 9.4 Synthetic Data Generation

```javascript
// maestro/scripts/data-generator.js
const faker = require('faker');  // Built into Maestro's GraalJS

output.randomUser = {
  email: faker.internet.email(),
  name: faker.name.findName(),
  phone: faker.phone.number('1##########'),
};

output.randomAddress = {
  street: faker.address.streetAddress(),
  city: faker.address.city(),
  zip: faker.address.zipCode(),
};

// Unique suffix for avoiding collision
output.uniqueSuffix = Math.random().toString(36).slice(2, 8);
```

```yaml
# Usage in flow
- runScript: data-generator.js
- inputText: ${output.randomUser.email}
- inputText: ${output.randomUser.name}
- assertVisible: ".*${output.randomUser.name}.*"
```

### 9.5 Screenshot & Video Strategy

```yaml
# maestro/flows/profile-flow.yaml
---
- launchApp
- tapOn: "Profile"
- takeScreenshot: profile_loaded
- tapOn: "Edit Profile"
- inputText: ${output.updatedName}
- tapOn: "Save"
- assertVisible: ".*Profile Updated.*"
- takeScreenshot: profile_updated
- takeVideo: profile_edit_session.mp4
```

Maestro automatically captures:
- Screenshots on every step (stored in `maestro/reports/screenshots/`)
- Video recording of entire flow (stored in `maestro/reports/videos/`)
- Failure screenshots with step context

---

## 10. Limitations & Mitigations

### 10.1 iOS Physical Devices

| Solution | Cost | Effort | When to Use |
|---|---|---|---|
| `maestro-ios-device` bridge | Free | ⭐ Low | Teams with Mac + iPhones |
| Maestro Cloud | $250/device/mo | ⭐ Low | No infra management needed |
| DeviceLab | ~$99/device/mo | ⭐ Low | Own devices, managed infra |
| iOS Simulators only | Free | ⭐ None | Early dev, no real-device need |

**Recommendation:** Start with simulators → add `maestro-ios-device` bridge when real-device testing is required.

### 10.2 Complex Logic Beyond YAML

**Solution:** Maestro's JavaScript sandbox supports full ECMAScript 6+:

```javascript
// maestro/scripts/complex-logic.js
// Full JS power: loops, conditionals, math, string manipulation

output.isPremiumUser = output.userId.startsWith('PREM_');

if (output.isPremiumUser) {
  output.discount = 0.20;
  output.shipping = 'express';
} else {
  output.discount = 0.05;
  output.shipping = 'standard';
}

// Generate order items
output.orderItems = [];
for (let i = 0; i < 3; i++) {
  output.orderItems.push({
    id: `item_${i}`,
    qty: Math.floor(Math.random() * 5) + 1,
  });
}
```

### 10.3 API Testing Gaps

**Solution:** Use hybrid approach — Playwright for API, Maestro for UI:

```
CI Pipeline:
  1. Playwright API tests → seed data, get tokens
  2. Maestro UI tests → consume seeded data, validate UI
  3. Merge reports → single dashboard
```

Maestro's built-in HTTP client handles simple seeding:
```javascript
const response = http.post('https://api.example.com/users', {
  body: JSON.stringify({ email: 'test@example.com' }),
  headers: { 'Content-Type': 'application/json' }
});
output.newUserId = json(response.body).id;
```

For complex API testing (assertions, retry logic, auth refresh) → stick with Playwright's `request` context.

### 10.4 Locator Fragility

| Issue | Mitigation |
|---|---|
| Text changes with localization | Use `id:` (accessibilityIdentifier) instead of `text:` |
| Dynamic content without IDs | Use regex: `text: ".*pattern.*"` |
| A/B testing changes UI | Use `optional: true` for non-critical elements |
| Frequent redesigns | Evaluate Vision AI tools (Drizz, Pie) for those specific flows |

**Golden rule:** Work with your developers to add `accessibilityIdentifier` to critical UI elements. This is the single highest-ROI improvement you can make.

```kotlin
// Android — ask developers to add this
view.accessibilityLabel = "login_button"  // Kotlin
// or
view.setContentDescription("login_button") // Java
```

```swift
// iOS — ask developers to add this
view.accessibilityIdentifier = "login_button"
```

```dart
// Flutter — ask developers to add this
Semantics(
  label: "login_button",
  child: Button(...),
)
```

---

## Quick Reference Card

```
┌──────────────────────────────────────────────────────────────────┐
│                    MAESTRO COMMANDS CHEATSHEET                   │
├──────────────────────────────────────────────────────────────────┤
│  launchApp          Launch the app                               │
│  tapOn              Tap an element (by text, id, css, point)     │
│  inputText          Type text into a field                       │
│  swipe              Swipe gesture (up/down/left/right)           │
│  longPress          Long press an element                        │
│  assertVisible      Wait for element to be visible               │
│  assertNotVisible   Wait for element to disappear                │
│  takeScreenshot     Capture screen                               │
│  takeVideo          Record screen                                │
│  back               Press back button                            │
│  pressKey           Press a key (Enter, Backspace, etc.)         │
│  scroll             Scroll to element                            │
│  repeat             Loop (times / while)                         │
│  runFlow            Include a subflow                            │
│  runScript          Execute JavaScript                           │
│  evalScript         Evaluate JS expression                       │
│  copyTextFrom       Copy text from element                       │
│  setLocation        Set GPS location                             │
│  backgroundApp      Send to background                           │
├──────────────────────────────────────────────────────────────────┤
│  SELECTORS:                   CONDITIONS:                        │
│  text: "Login"              when: visible: "Dismiss"            │
│  id: "btn_login"            when: notVisible: "Popup"           │
│  css: ".primary-btn"        when: platform: iOS                 │
│  point: "50%, 80%"          when: true: ${condition}            │
│  index: 0                   optional: true                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. **Install Maestro CLI** — `curl -Ls "https://get.maestro.mobile.dev" | bash`
2. **Create `maestro/` directory** with initial flow
3. **Set up `maestro-ios-device`** if you need real iPhone testing
4. **Write your first flow** — start with login, then expand
5. **Add CI pipeline** — use the GitHub Actions template above
6. **Integrate reports** — combine Playwright Allure + Maestro screenshots

---

*Generated for AutoVD Typescript-Playwright framework*  
*Framework rating update: Web 6→8/10, Mobile 0→7/10, API 0→7/10, Enterprise 3→6/10*
