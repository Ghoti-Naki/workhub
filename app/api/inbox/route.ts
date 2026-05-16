import { prisma } from "@/lib/prisma";
import { ok, created, VALIDATION_ERROR, INTERNAL_ERROR } from "@/lib/api-response";

const DEFAULT_PAGE_SIZE = 25;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE), 10)),
  );
  const skip = (page - 1) * pageSize;

  const [inboxItems, total] = await Promise.all([
    prisma.inboxItem.findMany({
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
      include: { project: true },
    }),
    prisma.inboxItem.count(),
  ]);

  return ok(inboxItems, { page, pageSize, total, hasMore: skip + inboxItems.length < total });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : null;
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const sourceType =
      typeof body.sourceType === "string" ? body.sourceType : "manual";
    const itemType =
      typeof body.itemType === "string" ? body.itemType : "capture";
    const projectId =
      typeof body.projectId === "string" ? body.projectId : null;

    if (!content) return VALIDATION_ERROR("Inbox item content is required.");

    const inboxItem = await prisma.inboxItem.create({
      data: { title, content, sourceType, itemType, projectId },
      include: { project: true },
    });

    return created(inboxItem);
  } catch {
    return INTERNAL_ERROR("Failed to create inbox item.");
  }
}
