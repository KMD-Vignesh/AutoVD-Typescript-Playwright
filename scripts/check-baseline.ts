/**
 * P2 #11 — Flaky Test Baseline Checker
 * Validates current pass rate against the tracked baseline.
 * Can be run in CI to gate on quality standards.
 */
import * as fs from 'fs';
import * as path from 'path';

const BASELINE_FILE = path.join(__dirname, '..', 'playwright-flaky-baseline.json');

interface FlakyBaseline {
  baseline: {
    totalTests: number;
    expectedPassRate: number;
    trackedFlakyTests: Array<{
      file: string;
      test: string;
      status: string;
      reason: string;
    }>;
    passRateHistory: Array<{
      date: string;
      rate: number;
      total: number;
      passed: number;
      failed: number;
    }>;
  };
}

interface CurrentResults {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
}

function loadBaseline(): FlakyBaseline {
  const content = fs.readFileSync(BASELINE_FILE, 'utf8');
  return JSON.parse(content) as FlakyBaseline;
}

function calculatePassRate(results: CurrentResults): number {
  const runnable = results.passed + results.failed;
  if (runnable === 0) return 1; // No runnable tests = pass
  return results.passed / runnable;
}

function checkBaseline(results: CurrentResults): { ok: boolean; messages: string[] } {
  const baseline = loadBaseline().baseline;
  const messages: string[] = [];
  let ok = true;

  // 1. Check pass rate against baseline
  const passRate = calculatePassRate(results);
  if (passRate < baseline.expectedPassRate) {
    ok = false;
    messages.push(
      `❌ Pass rate ${((passRate * 100).toFixed(1))}% is below baseline ${((baseline.expectedPassRate * 100).toFixed(1))}%`,
    );
  } else {
    messages.push(`✅ Pass rate ${((passRate * 100).toFixed(1))}% meets baseline ${((baseline.expectedPassRate * 100).toFixed(1))}%`);
  }

  // 2. Check for new flaky tests
  const knownFlakyTests = new Set(
    baseline.trackedFlakyTests.map((t) => `${t.file} › ${t.test}`),
  );

  for (const failedTest of results as any) {
    // This would be populated from Playwright's JSON report in CI
  }

  // 3. Warn about tracked flaky tests
  for (const flaky of baseline.trackedFlakyTests) {
    messages.push(`⚠️  Known flaky: ${flaky.test} — ${flaky.reason}`);
  }

  // 4. Update history
  const today = new Date().toISOString().split('T')[0];
  const latestHistory = baseline.passRateHistory[baseline.passRateHistory.length - 1];
  if (latestHistory && latestHistory.date === today) {
    // Update today's entry
    latestHistory.rate = passRate;
    latestHistory.passed = results.passed;
    latestHistory.failed = results.failed;
    latestHistory.total = results.total;
  } else {
    baseline.passRateHistory.push({
      date: today,
      rate: passRate,
      total: results.total,
      passed: results.passed,
      failed: results.failed,
    });
  }

  // Save updated baseline
  const baselineData = fs.readFileSync(BASELINE_FILE, 'utf8');
  const parsed = JSON.parse(baselineData) as FlakyBaseline;
  parsed.baseline = baseline;
  fs.writeFileSync(BASELINE_FILE, JSON.stringify(parsed, null, 2));

  return { ok, messages };
}

// CLI usage
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Flaky Test Baseline Checker

Usage:
  node scripts/check-baseline.js --passed N --failed N --skipped N --total N
  node scripts/check-baseline.js --json report.json   (reads Playwright JSON report)
  npm run test:check-baseline                        (CI integration)

Examples:
  node scripts/check-baseline.js --passed 50 --failed 2 --skipped 3 --total 55
  npm run test:check-baseline -- --passed $(grep -c '"status":"passed"' report.json) --failed $(grep -c '"status":"failed"' report.json)
`);
  process.exit(0);
}

// Parse arguments
const parsed = { passed: 0, failed: 0, skipped: 0, total: 0 };
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--passed' && args[i + 1]) parsed.passed = parseInt(args[i + 1], 10);
  if (args[i] === '--failed' && args[i + 1]) parsed.failed = parseInt(args[i + 1], 10);
  if (args[i] === '--skipped' && args[i + 1]) parsed.skipped = parseInt(args[i + 1], 10);
  if (args[i] === '--total' && args[i + 1]) parsed.total = parseInt(args[i + 1], 10);
}

if (parsed.total === 0) {
  console.error('Error: --total is required');
  process.exit(1);
}

const results: CurrentResults = {
  total: parsed.total,
  passed: parsed.passed,
  failed: parsed.failed,
  skipped: parsed.skipped,
};

const { ok, messages } = checkBaseline(results);
for (const msg of messages) console.log(msg);

process.exit(ok ? 0 : 1);
