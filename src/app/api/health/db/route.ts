import { sql } from 'drizzle-orm';

import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const [{ version }] = await db.execute(sql`SELECT version()`);
  return Response.json({ ok: true, version });
}
