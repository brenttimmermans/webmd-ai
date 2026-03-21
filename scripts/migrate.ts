import 'dotenv/config';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');

const sql = neon(connectionString);
const db = drizzle(sql);

async function main(): Promise<void> {
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
