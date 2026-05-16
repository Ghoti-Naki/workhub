import { prisma } from "@/lib/prisma";

async function getOrCreateWorkspace() {
  const existing = await prisma.workspaceSettings.findFirst();
  if (existing) return existing;
  return prisma.workspaceSettings.create({
    data: { workspaceName: "AI Work Hub", timezone: "Asia/Jakarta" },
  });
}

export async function GET() {
  const workspace = await getOrCreateWorkspace();
  return Response.json({ data: workspace, meta: {}, error: null });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { workspaceName, timezone } = body as { workspaceName?: string; timezone?: string };

    if (workspaceName !== undefined && (typeof workspaceName !== "string" || workspaceName.trim().length === 0)) {
      return Response.json({ data: null, meta: {}, error: "workspaceName must be a non-empty string" }, { status: 400 });
    }
    if (timezone !== undefined && typeof timezone !== "string") {
      return Response.json({ data: null, meta: {}, error: "timezone must be a string" }, { status: 400 });
    }

    const workspace = await getOrCreateWorkspace();
    const updated = await prisma.workspaceSettings.update({
      where: { id: workspace.id },
      data: {
        ...(workspaceName !== undefined ? { workspaceName: workspaceName.trim() } : {}),
        ...(timezone !== undefined ? { timezone } : {}),
      },
    });

    return Response.json({ data: updated, meta: {}, error: null });
  } catch {
    return Response.json({ data: null, meta: {}, error: "Failed to update workspace settings" }, { status: 500 });
  }
}
