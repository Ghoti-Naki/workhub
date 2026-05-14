import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const outputType = searchParams.get("outputType");
    const targetType = searchParams.get("targetType");
    const targetId = searchParams.get("targetId");

    const outputs = await prisma.aiOutput.findMany({
      where: {
        ...(outputType ? { outputType } : {}),
        ...(targetType ? { targetType } : {}),
        ...(targetId ? { targetId } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    return Response.json({
      data: outputs,
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
          message: "Failed to load AI outputs.",
        },
      },
      { status: 500 },
    );
  }
}
