const Database = require('better-sqlite3');
const { createClient } = require('@libsql/client');
const path = require('path');
const fs = require('fs');

// Simple env loader since dotenv might not be working
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const localDbPath = path.join(process.cwd(), 'data', 'videos.db');
const localDb = new Database(localDbPath);

const tursoClient = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
});

async function migrate() {
  console.log('🚀 Starting migration (JS) from local SQLite to Turso...');

  const tables = localDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();

  for (const { name: tableName } of tables) {
    console.log(`📦 Migrating table: ${tableName}`);

    const schema = localDb.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name = ?`).get(tableName);
    
    // Create table
    try {
        await tursoClient.execute(schema.sql);
        console.log(`✅ Table ${tableName} ensured.`);
    } catch (e) {
        console.log(`⚠️ Table ${tableName} already exists or error: ${e.message}`);
    }

    const rows = localDb.prepare(`SELECT * FROM ${tableName}`).all();
    if (rows.length === 0) {
      console.log(`ℹ️ Table ${tableName} is empty.`);
      continue;
    }

    const BATCH_SIZE = 25;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const queries = batch.map(row => {
        const columns = Object.keys(row);
        const placeholders = columns.map(() => '?').join(', ');
        return {
          sql: `INSERT OR REPLACE INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`,
          args: Object.values(row)
        };
      });

      await tursoClient.batch(queries, "write");
      console.log(`   📤 Migrated ${i + 1} to ${Math.min(i + BATCH_SIZE, rows.length)} of ${rows.length}`);
    }
  }

  console.log('🎉 Migration completed successfully!');
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
