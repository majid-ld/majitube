import Database from 'better-sqlite3';
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const localDbPath = path.join(process.cwd(), 'data', 'videos.db');
const localDb = new Database(localDbPath);

const tursoClient = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migrate() {
  console.log('🚀 Starting migration from local SQLite to Turso...');

  // 1. Get all tables from local DB
  const tables = localDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[];

  for (const { name: tableName } of tables) {
    console.log(`📦 Migrating table: ${tableName}`);

    // Get schema
    const schema = localDb.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name = ?`).get(tableName) as { sql: string };
    
    // Create table in Turso if not exists
    await tursoClient.execute(schema.sql);
    console.log(`✅ Table ${tableName} ensured in Turso.`);

    // Get all rows
    const rows = localDb.prepare(`SELECT * FROM ${tableName}`).all() as any[];
    if (rows.length === 0) {
      console.log(`ℹ️ Table ${tableName} is empty, skipping data migration.`);
      continue;
    }

    // Insert rows into Turso
    // We'll do this in batches to avoid hitting limits
    const BATCH_SIZE = 50;
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
      console.log(`   📤 Migrated rows ${i + 1} to ${Math.min(i + BATCH_SIZE, rows.length)} of ${rows.length}`);
    }
  }

  console.log('🎉 Migration completed successfully!');
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
