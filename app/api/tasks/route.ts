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

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
      skip,
      take: pageSize,
      include: { project: true },
    }),
    prisma.task.count(),
  ]);

  return ok(tasks, { page, pageSize, total, hasMore: skip + tasks.length < total });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : null;
    const priority =
      typeof body.priority === "string" ? body.priority : "medium";
    const status = typeof body.status === "string" ? body.status : "todo";
    const projectId =
      typeof body.projectId === "string" ? body.projectId : null;
    const dueDate =
      typeof body.dueDate === "string" ? body.dueDate : null;
    const recurrence =
      typeof body.recurrence === "string" ? body.recurrence : null;

    if (!title) return VALIDATION_ERROR("Task title is required.");

    const task = await prisma.task.create({
      data: { title, description, priority, status, projectId, dueDate, recurrence },
      include: { project: true },
    });

    return created(task);
  } catch {
    return INTERNAL_ERROR("Failed to create task.");
  }
}
