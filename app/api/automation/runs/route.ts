import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workflow = searchParams.get("workflow");
    const source = searchParams.get("source");

    const runs = await prisma.automationRun.findMany({
      where: {
        ...(workflow ? { workflow } : {}),
        ...(source ? { source } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return Response.json({
      data: runs,
      meta: {},
      error: null,
    });
  } catch {
    return Response.json(
      {
        data: null,
        meta: {},
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to load automation runs.",
        },
      },
      { status: 500 },
    );
  }
}
