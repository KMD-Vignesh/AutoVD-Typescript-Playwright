/**
 * P1 #8 — Unified Report Merge Script
 * Combines Playwright Allure + Maestro screenshots into one report.
 */
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const REPORT_DIR = path.join(__dirname, '..', 'report', 'unified');
const ALLURE_DIR = path.join(__dirname, '..', 'report', 'allure', 'allure-results');
const MAESTRO_DIR = path.join(__dirname, '..', 'maestro', 'reports');
const SCREENSHOTS_DIR = path.join(MAESTRO_DIR, 'screenshots');
const VIDEOS_DIR = path.join(MAESTRO_DIR, 'videos');

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyRecursive(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function generateSummary(allureExists: boolean, maestroExists: boolean): string {
  const date = new Date().toISOString().split('T')[0];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AutoVD Unified Test Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; background: #f5f5f5; }
    h1 { color: #1a1a2e; border-bottom: 3px solid #16213e; padding-bottom: 10px; }
    .summary { background: white; border-radius: 8px; padding: 24px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .metric { display: inline-block; margin: 10px 20px; text-align: center; }
    .metric .number { font-size: 36px; font-weight: bold; color: #16213e; }
    .metric .label { font-size: 14px; color: #666; }
    .pass { color: #27ae60; }
    .fail { color: #e74c3c; }
    .skip { color: #f39c12; }
    a { display: block; padding: 16px; margin: 8px 0; background: white; border-radius: 8px; text-decoration: none; color: #1a1a2e; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: transform 0.2s; }
    a:hover { transform: translateX(4px); }
    .section-title { font-size: 18px; font-weight: 600; margin: 24px 0 12px; color: #16213e; }
    footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <h1>🚀 AutoVD Test Report</h1>
  <p style="color: #666;">Generated: ${date}</p>

  <div class="summary">
    <div class="metric">
      <div class="number">3 Layers</div>
      <div class="label">Test Coverage</div>
    </div>
    <div class="metric">
      <div class="number">${allureExists ? '✅' : '⏭️'} ${maestroExists ? '✅' : '⏭️'}</div>
      <div class="label">Results Available</div>
    </div>
  </div>

  <div class="section-title">📊 Report Links</div>

  ${allureExists
    ? `<a href="allure/index.html">📈 Playwright Allure Report — Web & API Tests</a>`
    : `<a href="#" style="opacity:0.5;pointer-events:none;">📈 Playwright Allure Report — No results yet (run: npm run test:web && npm run test:api)</a>`
  }

  ${maestroExists
    ? `<a href="maestro/screenshots/">📱 Maestro Mobile Reports — Screenshots & Videos</a>`
    : `<a href="#" style="opacity:0.5;pointer-events:none;">📱 Maestro Mobile Reports — No results yet (run: maestro test maestro/flows/)</a>`
  }

  <div class="section-title">🧪 Test Layers</div>
  <div class="summary" style="padding: 16px;">
    <table style="width:100%; border-collapse: collapse;">
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 8px 0;"><strong>Web E2E</strong></td>
        <td style="text-align:right;">Playwright + Allure</td>
        <td style="text-align:right;">${allureExists ? '<span class="pass">✅ Generated</span>' : '<span class="skip">⏭️ Pending</span>'}</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 8px 0;"><strong>API Tests</strong></td>
        <td style="text-align:right;">Playwright + Ajv Schema</td>
        <td style="text-align:right;">${allureExists ? '<span class="pass">✅ Generated</span>' : '<span class="skip">⏭️ Pending</span>'}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0;"><strong>Mobile E2E</strong></td>
        <td style="text-align:right;">Maestro YAML Flows</td>
        <td style="text-align:right;">${maestroExists ? '<span class="pass">✅ Generated</span>' : '<span class="skip">⏭️ Pending</span>'}</td>
      </tr>
    </table>
  </div>

  <div class="section-title">⚡ Quick Commands</div>
  <div class="summary" style="padding: 16px; font-family: monospace; font-size: 13px;">
    <div style="margin: 4px 0;"><code>npm run test:all</code> — Run all test layers</div>
    <div style="margin: 4px 0;"><code>npm run test:web</code> — Web E2E only</div>
    <div style="margin: 4px 0;"><code>npm run test:api</code> — API tests only</div>
    <div style="margin: 4px 0;"><code>npm run test:mobile</code> — Maestro mobile only</div>
    <div style="margin: 4px 0;"><code>npm run report:merge</code> — Regenerate this report</div>
  </div>

  <footer>
    AutoVD Framework · Built with Playwright + Maestro · ${date}
  </footer>
</body>
</html>`;
}

async function mergeReports() {
  console.log('🔄 Merging test reports...');

  // Clean and create report directory
  if (fs.existsSync(REPORT_DIR)) {
    fs.rmSync(REPORT_DIR, { recursive: true });
  }
  ensureDir(REPORT_DIR);

  // Copy Allure report
  const allureExists = fs.existsSync(ALLURE_DIR);
  if (allureExists) {
    const allureReportSrc = path.join(__dirname, '..', 'report', 'allure', 'allure-report');
    const allureReportDest = path.join(REPORT_DIR, 'allure');
    copyRecursive(allureReportSrc, allureReportDest);
    console.log('  ✅ Copied Allure report');
  }

  // Copy Maestro reports
  const maestroExists = fs.existsSync(MAESTRO_DIR);
  if (maestroExists) {
    const screenshotsDest = path.join(REPORT_DIR, 'maestro', 'screenshots');
    const videosDest = path.join(REPORT_DIR, 'maestro', 'videos');
    ensureDir(screenshotsDest);
    ensureDir(videosDest);
    if (fs.existsSync(SCREENSHOTS_DIR)) {
      copyRecursive(SCREENSHOTS_DIR, screenshotsDest);
    }
    if (fs.existsSync(VIDEOS_DIR)) {
      copyRecursive(VIDEOS_DIR, videosDest);
    }
    console.log('  ✅ Copied Maestro reports');
  }

  // Generate unified index
  const indexHtml = generateSummary(allureExists, maestroExists);
  fs.writeFileSync(path.join(REPORT_DIR, 'index.html'), indexHtml);
  console.log('  ✅ Generated unified index');

  console.log(`\n✅ Unified report available at: ${REPORT_DIR}/index.html`);
}

mergeReports().catch((err) => {
  console.error('❌ Report merge failed:', err.message);
  process.exit(1);
});
