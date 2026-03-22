import { NextResponse } from 'next/server';

import type { ApiErrorCode, ApiErrorPayload } from '@/types/errors';

function jsonError(
  message: string,
  code: ApiErrorCode,
  status: number,
): NextResponse {
  return NextResponse.json({ error: message, code } satisfies ApiErrorPayload, {
    status,
  });
}

export function invalidRequestError(message = 'Invalid request'): NextResponse {
  return jsonError(message, 'INVALID_REQUEST', 400);
}

export function sessionNotFoundError(
  message = 'Session not found',
): NextResponse {
  return jsonError(message, 'SESSION_NOT_FOUND', 404);
}

export function internalServerError(
  message = 'Internal server error',
): NextResponse {
  return jsonError(message, 'INTERNAL_SERVER_ERROR', 500);
}
