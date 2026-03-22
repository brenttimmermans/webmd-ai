import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { checkBasicAuth } from '@/middleware/basic-auth';

const ALLOW_LIST = ['/images'] as const;

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (ALLOW_LIST.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const authResponse = checkBasicAuth(request);
  return authResponse ?? NextResponse.next();
}
