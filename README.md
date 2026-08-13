# AutoVD Framework

Full-stack test automation framework combining **Playwright** (web + API) and **Maestro** (mobile native).

## Quick Start

### Prerequisites
- Node.js 20+
- Android SDK (for Maestro Android emulators)
- Xcode (for Maestro iOS simulators — macOS only)
- Maestro CLI: `curl -Ls "https://get.maestro.mobile.dev" | bash`

### Setup
```bash
npm ci
npx playwright install
cp .env.example .env   # Update with your values
```

### Run Tests
```bash
npm run test:web        # Playwright web E2E
npm run test:api        # Playwright API tests
npm run test:mobile     # Maestro mobile E2E
npm run test:all        # Run everything
```

## Framework Structure
```
tests/
  api/          → Playwright API tests
  web/          → Playwright web E2E tests
  fixtures.ts   → Shared test fixtures
maestro/
  flows/        → Maestro YAML test flows
  scripts/      → JavaScript helpers (API seed, data gen)
  config/       → Environment & device configs
library/        → PlayVD wrapper + Page Objects
docs/           → Implementation guide
```

## Documentation
See [docs/MAESTRO_IMPLEMENTATION.md](./docs/MAESTRO_IMPLEMENTATION.md) for the full integration guide.
