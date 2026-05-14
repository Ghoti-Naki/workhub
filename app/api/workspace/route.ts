import { prisma } from "@/lib/prisma";

export async function GET() {
  let workspace = await prisma.workspaceSettings.findFirst();

  if (!workspace) {
    workspace = await prisma.workspaceSettings.create({
      data: {
        workspaceName: "AI Work Hub",
        timezone: "Asia/Jakarta",
      },
    });
  }

  return Response.json({
    data: workspace,
    meta: {},
    error: null,
  });
}
