import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  try {
    const headersList = headers();
    const req = new NextRequest("http://localhost:3000", {
      headers: headersList,
    });
    const session = await auth0.getSession(req);

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json(session.user);
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
