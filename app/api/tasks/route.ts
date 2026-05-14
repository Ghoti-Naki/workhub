import { prisma } from "@/lib/prisma";

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
    include: {
      project: true,
    },
  });

  return Response.json({
    data: tasks,
    meta: {},
    error: null,
  });
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

    if (!title) {
      return Response.json(
        {
          data: null,
          meta: {},
          error: {
            code: "VALIDATION_ERROR",
            message: "Task title is required.",
          },
        },
        { status: 422 },
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        status,
        projectId,
      },
      include: {
        project: true,
      },
    });

    return Response.json(
      {
        data: task,
        meta: {},
        error: null,
      },
      { status: 201 },
    );
  } catch {
    return Response.json(
      {
        data: null,
        meta: {},
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create task.",
        },
      },
      { status: 500 },
    );
  }
}
