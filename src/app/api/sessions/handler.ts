import { desc, ne } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { sessions } from '@/db/schema';
import { internalServerError } from '@/lib/api-errors';
import { db } from '@/lib/db';

export async function handleSessionsGet(): Promise<NextResponse> {
  try {
    const rows = await db
      .select({
        id: sessions.id,
        status: sessions.status,
        createdAt: sessions.createdAt,
        updatedAt: sessions.updatedAt,
      })
      .from(sessions)
      .where(ne(sessions.status, 'abandoned'))
      .orderBy(desc(sessions.updatedAt));

    return NextResponse.json(rows);
  } catch {
    return internalServerError('Failed to fetch sessions');
  }
}

export async function handleSessionsPost(): Promise<NextResponse> {
  try {
    const [session] = await db.insert(sessions).values({}).returning();

    if (!session) {
      return internalServerError('Failed to create session');
    }

    return NextResponse.json(session, { status: 201 });
  } catch {
    return internalServerError('Failed to create session');
  }
}
