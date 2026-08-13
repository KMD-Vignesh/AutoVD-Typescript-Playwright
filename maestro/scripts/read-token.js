// Read auth token saved by Playwright API test (.auth-token.json)
// Falls back to manual login if token file not found

const fs = require('fs');
const path = require('path');

const tokenFile = path.join(__dirname, '..', '..', '.auth-token.json');

try {
  const data = JSON.parse(fs.readFileSync(tokenFile, 'utf8'));
  output.token = data.token;
  output.userId = data.user?.id || null;
  console.log('Token loaded from API test:', output.token ? 'YES' : 'NO');
} catch (e) {
  output.token = null;
  console.log('No auth token file found — will use manual login');
}
