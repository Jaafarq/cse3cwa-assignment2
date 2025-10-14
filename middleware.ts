import { NextRequest, NextResponse } from "next/server";

// Simple request logger; could be extended to write to DB via Telemetry model
export function middleware(req: NextRequest) {
  console.log("[mw]", req.method, req.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
