import type { NextResponse } from 'next/server';

import { handleSessionsGet, handleSessionsPost } from './handler';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  return handleSessionsGet();
}

export async function POST(): Promise<NextResponse> {
  return handleSessionsPost();
}
