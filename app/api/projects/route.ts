import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      tasks: true,
      notes: true,
    },
  });

  return Response.json({
    data: projects,
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
    const goal = typeof body.goal === "string" ? body.goal.trim() : null;
    const priority =
      typeof body.priority === "string" ? body.priority : "medium";
    const status = typeof body.status === "string" ? body.status : "active";

    if (!title) {
      return Response.json(
        {
          data: null,
          meta: {},
          error: {
            code: "VALIDATION_ERROR",
            message: "Project title is required.",
          },
        },
        { status: 422 },
      );
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        goal,
        priority,
        status,
      },
    });

    return Response.json(
      {
        data: project,
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
          message: "Failed to create project.",
        },
      },
      { status: 500 },
    );
  }
}
