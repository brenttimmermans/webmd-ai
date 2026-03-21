import { and, asc, eq, ne } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { messages, results, sessions } from '@/db/schema';
import {
  internalServerError,
  invalidRequestError,
  sessionNotFoundError,
} from '@/lib/api-errors';
import { db } from '@/lib/db';
import { isValidUuid } from '@/lib/uuid';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _req: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { id } = await context.params;

  if (!isValidUuid(id)) {
    return invalidRequestError('Invalid session ID');
  }

  try {
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, id), ne(sessions.status, 'abandoned')));

    if (!session) {
      return sessionNotFoundError();
    }

    const [sessionMessages, sessionResult] = await Promise.all([
      db
        .select({
          id: messages.id,
          role: messages.role,
          content: messages.content,
          createdAt: messages.createdAt,
        })
        .from(messages)
        .where(eq(messages.sessionId, id))
        .orderBy(asc(messages.createdAt)),
      db
        .select()
        .from(results)
        .where(eq(results.sessionId, id))
        .then((rows) => rows[0] ?? null),
    ]);

    const resultPayload = sessionResult
      ? {
          id: sessionResult.id,
          urgency: sessionResult.urgency,
          pathway: sessionResult.pathway,
          consultationType: sessionResult.consultationType,
          nextSteps: sessionResult.nextSteps,
          rawOutput: sessionResult.rawOutput,
          createdAt: sessionResult.createdAt,
        }
      : null;

    return NextResponse.json({
      id: session.id,
      status: session.status,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messages: sessionMessages,
      result: resultPayload,
    });
  } catch {
    return internalServerError('Failed to fetch session');
  }
}

export async function DELETE(
  _req: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { id } = await context.params;

  if (!isValidUuid(id)) {
    return invalidRequestError('Invalid session ID');
  }

  try {
    const [existing] = await db
      .select({ id: sessions.id })
      .from(sessions)
      .where(and(eq(sessions.id, id), ne(sessions.status, 'abandoned')));

    if (!existing) {
      return sessionNotFoundError();
    }

    await db
      .update(sessions)
      .set({ status: 'abandoned', updatedAt: new Date() })
      .where(eq(sessions.id, id));

    return NextResponse.json({ success: true });
  } catch {
    return internalServerError('Failed to delete session');
  }
}
