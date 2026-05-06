const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '../.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

console.log('--- GOOGLE_SERVICE_ACCOUNT_JSON content ---');
console.log(envConfig.GOOGLE_SERVICE_ACCOUNT_JSON);
console.log('--- End ---');

try {
    JSON.parse(envConfig.GOOGLE_SERVICE_ACCOUNT_JSON);
    console.log('JSON parsed successfully');
} catch (e) {
    console.log('JSON parse failed:', e.message);
}
