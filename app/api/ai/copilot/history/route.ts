import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    await prisma.aiOutput.deleteMany({
      where: { outputType: "copilot_answer", targetType: "workspace" },
    });
    return Response.json({ data: null, meta: {}, error: null });
  } catch {
    return Response.json(
      { data: null, meta: {}, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to clear copilot history." } },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const outputs = await prisma.aiOutput.findMany({
      where: {
        outputType: "copilot_answer",
        targetType: "workspace",
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
          message: "Failed to load copilot history.",
        },
      },
      { status: 500 },
    );
  }
}
