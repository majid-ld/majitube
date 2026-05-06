const fs = require('fs');
const path = require('path');

// Simulate Next.js .env loading (very basic)
function mockLoadEnv() {
    const envPath = path.join(__dirname, '../.env.local');
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    const env = {};
    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('#')) continue;
        const [key, ...rest] = line.split('=');
        env[key] = rest.join('=');
    }
    return env;
}

const env = mockLoadEnv();
console.log('--- Verification ---');
const json = env.GOOGLE_SERVICE_ACCOUNT_JSON;

if (!json) {
    console.error('ERROR: GOOGLE_SERVICE_ACCOUNT_JSON not found in .env.local');
    process.exit(1);
}

console.log('Variable found. Length:', json.length);
console.log('Starts with:', json.substring(0, 30));
console.log('Ends with:', json.substring(json.length - 20));

try {
    const parsed = JSON.parse(json);
    console.log('SUCCESS: JSON parsed successfully!');
    console.log('Project ID:', parsed.project_id);
    console.log('Client Email:', parsed.client_email);
} catch (e) {
    console.error('FAILURE: JSON parsing failed:', e.message);
    process.exit(1);
}
