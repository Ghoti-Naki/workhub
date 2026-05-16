import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json(
    { data: { ok: true }, meta: {}, error: null },
    { status: 200 },
  );
  response.cookies.delete(COOKIE_NAME);
  return response;
}
