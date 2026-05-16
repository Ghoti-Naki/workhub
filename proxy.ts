import { NextRequest, NextResponse } from "next/server";
import { isValidSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Pass through: login page, auth API, automation webhook, Next.js internals
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/automation/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get(COOKIE_NAME);
  const authenticated =
    sessionCookie != null &&
    (await isValidSessionToken(sessionCookie.value));

  if (authenticated) {
    return NextResponse.next();
  }

  // API requests get a 401; page requests get redirected to /login
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        data: null,
        meta: {},
        error: { code: "UNAUTHORIZED", message: "Authentication required." },
      },
      { status: 401 },
    );
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
