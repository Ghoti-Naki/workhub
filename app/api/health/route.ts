import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json(
      { ok: true, service: "ai-work-hub-api", db: "ok" },
      { status: 200 },
    );
  } catch {
    return Response.json(
      { ok: false, service: "ai-work-hub-api", db: "unavailable" },
      { status: 503 },
    );
  }
}
