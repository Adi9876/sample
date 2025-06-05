import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const session = await auth0.getSession(request);
  if (!session) {
    return NextResponse.redirect(new URL("/api/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/trpc/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
