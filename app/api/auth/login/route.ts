/**
 * POST /api/auth/login
 *
 * Single-user password gate. Compares the submitted password against
 * AUTH_PASSWORD using a constant-time comparison to prevent timing attacks.
 * On success, issues an HMAC-SHA256 signed session token in an httpOnly
 * cookie valid for COOKIE_MAX_AGE seconds. The cookie is marked Secure in
 * production. All session verification happens in the middleware (proxy.ts),
 * not per-route — this is the only route that issues tokens.
 */
import { NextRequest, NextResponse } from "next/server";
import {
  verifyPassword,
  createSessionToken,
  COOKIE_NAME,
  COOKIE_MAX_AGE,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const password = typeof body.password === "string" ? body.password : "";

    if (!verifyPassword(password)) {
      return NextResponse.json(
        {
          data: null,
          meta: {},
          error: { code: "UNAUTHORIZED", message: "Invalid password." },
        },
        { status: 401 },
      );
    }

    const token = await createSessionToken();

    const response = NextResponse.json(
      { data: { ok: true }, meta: {}, error: null },
      { status: 200 },
    );

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        data: null,
        meta: {},
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Login failed.",
        },
      },
      { status: 500 },
    );
  }
}
