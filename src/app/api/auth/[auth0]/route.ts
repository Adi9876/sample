import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.endsWith("/login")) {
    return auth0.startInteractiveLogin({});
  }

  if (path.endsWith("/callback")) {
    const response = await auth0.middleware(request);
    return response;
  }

  if (path.endsWith("/logout")) {
    return NextResponse.redirect(new URL("/api/auth/logout", request.url));
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.endsWith("/callback")) {
    const response = await auth0.middleware(request);
    return response;
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function HEAD() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function OPTIONS() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
