import { NextResponse } from "next/server";

import { COOKIE_ADMIN } from "@/lib/security/session-token";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const res = NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  res.cookies.delete(COOKIE_ADMIN);
  return res;
}

export async function GET(request: Request) {
  return POST(request);
}
