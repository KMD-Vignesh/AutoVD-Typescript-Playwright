<div align="center">

<h1>AutoVD-Typescript-Playwright</h1>

<p><strong>Full-stack test automation for web, API, and mobile</strong><br>
Playwright · TypeScript · Maestro · Allure · Accessibility &amp; visual checks</p>

<p>
  <a href="https://github.com/KMD-Vignesh/AutoVD-Typescript-Playwright"><img src="https://img.shields.io/badge/Node-20%2B-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node 20+"></a>
  <a href="https://github.com/KMD-Vignesh/AutoVD-Typescript-Playwright"><img src="https://img.shields.io/badge/Playwright-1.61-2EAD33?style=for-the-badge&logo=playwright&logoColor=white" alt="Playwright 1.61"></a>
  <a href="https://github.com/KMD-Vignesh/AutoVD-Typescript-Playwright"><img src="https://img.shields.io/badge/Allure-Report-FF6A00?style=for-the-badge" alt="Allure"></a>
  <a href="https://github.com/KMD-Vignesh/AutoVD-Typescript-Playwright/actions/workflows/full-test-suite.yml"><img src="https://github.com/KMD-Vignesh/AutoVD-Typescript-Playwright/actions/workflows/full-test-suite.yml/badge.svg" alt="Full Test Suite"></a>
  <a href="https://github.com/KMD-Vignesh/AutoVD-Typescript-Playwright/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-2EA44F?style=for-the-badge" alt="MIT License"></a>
</p>

</div>

## Intro

<div>

<img src="https://img.shields.io/badge/Vignesh&nbsp;D,&nbsp;QA&nbsp;Lead&nbsp;/&nbsp;Architect,Chennai,India-B2C6DB?style=for-the-badge" alt="Vignesh">

<p>
    <a href="https://www.linkedin.com/in/kmd-vignesh/"><img src="https://img.shields.io/badge/LinkedIn-0A75AD?style=for-the-badge" alt="LinkedIn"></a>
    <a href="https://github.com/KMD-Vignesh"><img src="https://img.shields.io/badge/GitHub-FF6A80?style=for-the-badge" alt="GitHub"></a>
    <a href="mailto:KMD.Vignesh@outlook.com"><img src="https://img.shields.io/badge/KMD.Vignesh@Outlook-2a9d8f?style=for-the-badge" alt="Email"></a>

</p>

</div>

## What It Is

A TypeScript test framework that covers the whole stack: Playwright for web and API, Maestro for native mobile, and Allure for reporting. Shared fixtures, page objects, and factories keep specs focused on behaviour.

- **Web, API, and mobile in one repo** — SauceDemo E2E, schema-validated API tests, and Maestro flows.
- **Quality checks beyond E2E** — visual regression, accessibility, performance, and RBAC specs.
- **Fixtures over boilerplate** — `tests/fixtures.ts` exposes an extended `test` with a `playVD` helper.
- **Allure with history** — `npm run test:web` cleans, runs, regenerates, and keeps prior trends.

## Framework Family

Seven implementations of the same layered idea. Pick the stack your team already uses; the concepts and reports stay familiar.

| Framework                       | Stack                         | Covers    | Repository                                                                                  |
| :------------------------------ | :---------------------------- | :-------- | :------------------------------------------------------------------------------------------ |
| **Java + Selenium**             | Java 17 · Selenium 4 · TestNG | UI + REST | [AutoVD-Java-Selenium](https://github.com/KMD-Vignesh/AutoVD-Java-Selenium)                 |
| **Java + Playwright**           | Java 17 · Playwright · TestNG | UI + REST | [AutoVD-Java-Playwright](https://github.com/KMD-Vignesh/AutoVD-Java-Playwright)             |
| **C# + Playwright**             | C# · Playwright · NUnit       | UI        | [AutoVD-CS-Playwright](https://github.com/KMD-Vignesh/AutoVD-CS-Playwright)                 |
| **Python + Selenium**           | Python · Selenium · pytest    | UI + REST | [AutoVD-Python-Selenium](https://github.com/KMD-Vignesh/AutoVD-Python-Selenium)             |
| **Python + Playwright**         | Python · Playwright · pytest  | UI        | [AutoVD-Python-Playwright](https://github.com/KMD-Vignesh/AutoVD-Python-Playwright)         |
| **TypeScript + Playwright** — this repo | TypeScript · Playwright | UI + REST | [AutoVD-Typescript-Playwright](https://github.com/KMD-Vignesh/AutoVD-Typescript-Playwright) |
| **TypeScript + Cypress**        | TypeScript · Cypress          | UI (E2E)  | [AutoVD-Typescript-Cypress](https://github.com/KMD-Vignesh/AutoVD-Typescript-Cypress)       |

## Quick Start

**Prerequisites:** Node.js 20+, npm, and Playwright browsers. Mobile tests also need the Maestro CLI plus an Android emulator or iOS simulator.

```bash
git clone https://github.com/KMD-Vignesh/AutoVD-Typescript-Playwright.git
cd AutoVD-Typescript-Playwright
npm ci
npx playwright install
cp .env.example .env
npm run test:web
```

`test:web` runs every web spec, regenerates the Allure report, and preserves report history. For a quick API run, set `API_BASE_URL` in `.env` and use `npm run test:api`.

Open the reports:

```bash
open report/allure/allure-report/index.html
open report/playwrightreport/index.html
```

On Linux use `xdg-open`; on Windows open the files from Explorer.

## Configuration

`.env` (copy from `.env.example`) is the single source for URLs, credentials, and mobile app IDs:

| Key | Example | What it does |
| :--- | :--- | :--- |
| `WEB_BASE_URL` | `https://saucedemo.com` | Web target |
| `API_BASE_URL` | `https://api.example.com` | API target; leave the placeholder to skip API tests |
| `TEST_USERNAME` / `TEST_PASSWORD` | `standard_user` / `secret_sauce` | Standard user |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | `admin_user` / `admin123` | RBAC tests |
| `ANDROID_APP_ID` / `IOS_APP_ID` | `com.example.shopping` | Maestro app targets |
| `MAESTRO_TOKEN` | empty | Maestro Cloud token, if used |
| `MAESTRO_IOS_DEVICE_PORT` | `6001` | iOS device bridge port |

`playwright.config.ts` adds two switches:

| Setting | Default | What it does |
| :--- | :--- | :--- |
| `BROWSER_MODE` | `single` | `all` runs Chromium, Firefox, and WebKit |
| `workers` | local auto / CI `1` | Parallelism |
| `retries` | local `0` / CI `2` | Retries |
| `reporter` | line, Allure, HTML | Report outputs |

API tests skip automatically when `API_BASE_URL` still points at the example host.

## Writing Tests

A web test uses the shared fixture and page objects:

```typescript
import { expect } from '@playwright/test';
import { test } from '../../library/interface/vdBase';
import { LoginPage } from '../../pages/login.page';
import { MainPage } from '../../pages/main.page';

test('adds three products to the cart', async ({ playVD }) => {
  const loginPage = new LoginPage(playVD);
  await loginPage.openApp();
  await loginPage.loginApp();

  const mainPage = new MainPage(playVD);
  expect(await mainPage.isMainPageLoaded()).toBe(true);
  await mainPage.addProductCart('Sauce Labs Bike Light');
  await mainPage.addProductCart('Sauce Labs Backpack');
});
```

An API test validates the response and its schema:

```typescript
import { test, expect } from '../fixtures';
import { loginRequestSchema, loginResponseSchema } from './schemas';

test('logs in through the API', async ({ request }) => {
  const response = await request.post('/login', { data: { username: 'standard_user' } });
  expect(response.status()).toBe(200);
  expect(loginRequestSchema).toBeDefined();
});
```

A Maestro flow is YAML and uses the same env values:

```yaml
appId: ${ANDROID_APP_ID}
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
```

## Framework Map

Read these in order. Everything else supports them.

| Path | What it does |
| :--- | :--- |
| `library/interface/vdBase.ts` | Custom `test` fixture exposing `playVD`. **Start here.** |
| `library/helper/vdPlay.ts` | Playwright helper: navigate, click, fill, tabs, dialogs, downloads, logs |
| `library/config/env.ts` | Typed `.env` access and `hasApi` guard |
| `pages/` | `LoginPage`, `MainPage` |
| `tests/web/` | E2E, visual, accessibility, performance, RBAC specs |
| `tests/api/` | API specs, schemas, auth middleware |
| `tests/factories/` | User, product, and cart data builders |
| `maestro/flows/` | Mobile flows: login, checkout, cart regression |
| `scripts/` | Report merge and flaky-baseline helpers |

A few things carry most of the work:

| Item | Use |
| :--- | :--- |
| `playVD.goto/openApp` | Navigate |
| `playVD.click/fill/getText` | Interact with a selector |
| `playVD.log(...)` | Add a step to the Allure report |
| `env.webBaseUrl` / `env.apiBaseUrl` | Read configuration |
| `tests/factories` | Build test data without duplication |
| `test:web:all` | Run every web spec without regenerating reports |

## How a Run Works

1. `library/config/env.ts` loads `.env`; missing values fall back to SauceDemo defaults.
2. Playwright starts the projects from `playwright.config.ts` — one browser in `single` mode, three in `all` mode, plus mobile viewports.
3. The `playVD` fixture wraps the page and logs each action.
4. Reporters write Allure results and Playwright HTML; `test:web` then regenerates Allure with prior history.
5. Maestro runs the mobile flows separately against an emulator or simulator.

## Project Layout

```text
AutoVD-Typescript-Playwright/
├── library/                 # vdBase fixture, PlayVD helper, env config
├── pages/                   # page objects
├── tests/
│   ├── web/                 # E2E, visual, a11y, performance, RBAC
│   ├── api/                 # specs, schemas, auth middleware
│   ├── factories/           # test data builders
│   └── fixtures.ts          # shared fixtures
├── maestro/                 # mobile flows, pages, scripts, config
├── scripts/                 # report merge and baseline checks
├── report/                  # generated: Allure and Playwright HTML
├── test-results/            # generated: traces, videos, screenshots
├── .env.example
└── playwright.config.ts
```

`report/`, `test-results/`, and `maestro/reports/` are generated and gitignored.

## Reports

| Output | Location |
| :--- | :--- |
| Allure HTML | `report/allure/allure-report/index.html` |
| Playwright HTML | `report/playwrightreport/index.html` |
| Traces, videos, failure screenshots | `test-results/` |
| Maestro output | `maestro/reports/` |

`npm run report:all` rebuilds Allure and merges reports; `npm run report:allure` rebuilds Allure only.

## Commands

| Command | Runs |
| :--- | :--- |
| `npm run test:web` | All web specs + Allure report |
| `npm run test:web:all` | All web specs, no report step |
| `npm run test:api` | API specs |
| `npm run test:mobile` | Maestro flows on all devices |
| `npm run test:all` | Web + API + mobile |
| `npm run test:visual:update` | Refresh visual snapshots |
| `npm run test:accessibility` | Accessibility specs |
| `npm run test:performance` | Performance specs |
| `npm run test:rbac` | RBAC specs |
| `npm run report:merge` | Merge Playwright reports |

## Troubleshooting

| Symptom | Fix |
| :--- | :--- |
| `Executable doesn't exist` | Run `npx playwright install`. |
| API tests are skipped | Set `API_BASE_URL` in `.env` to a real endpoint. |
| Allure report is empty | Run `npm run report:allure`; results live in `report/allure/allure-results`. |
| Only one browser runs | Set `BROWSER_MODE=all`. |
| Maestro cannot find a device | Start an emulator/simulator and check `maestro devices`. |
| Visual snapshots fail on another OS | Snapshot names include the platform; regenerate on the target OS. |
| CI cannot see `.env` | CI injects the same keys as secrets/env variables — see `full-test-suite.yml`. |

## Documentation

- [Maestro implementation guide](docs/MAESTRO_IMPLEMENTATION.md) — mobile setup, flows, and CI.

## License

MIT. See [`LICENSE`](LICENSE).
