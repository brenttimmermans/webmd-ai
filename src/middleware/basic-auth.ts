import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const { APP_USERNAME, APP_PASSWORD } = process.env;

const BASIC_AUTH_REALM = "Webmd AI";

function unauthorizedResponse(): NextResponse {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": `Basic realm="${BASIC_AUTH_REALM}"` },
  });
}

export function checkBasicAuth(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Basic ")) {
    return unauthorizedResponse();
  }

  try {
    const base64 = authHeader.slice(6);
    const [username, password] = atob(base64).split(":");

    const isUsernameValid = APP_USERNAME && username === APP_USERNAME;
    const isPasswordValid = APP_PASSWORD && password === APP_PASSWORD;

    if (!isUsernameValid || !isPasswordValid) {
      return unauthorizedResponse();
    }

    return null;
  } catch {
    return unauthorizedResponse();
  }
}
