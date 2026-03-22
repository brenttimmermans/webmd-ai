import type { NextResponse } from 'next/server';

import { handleSessionDelete, handleSessionGet } from './handler';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _req: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { id } = await context.params;
  return handleSessionGet(id);
}

export async function DELETE(
  _req: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { id } = await context.params;
  return handleSessionDelete(id);
}
