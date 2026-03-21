import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkBasicAuth } from "@/middleware/basic-auth";

export function proxy(request: NextRequest) {
  const authResponse = checkBasicAuth(request);
  return authResponse ?? NextResponse.next();
}
