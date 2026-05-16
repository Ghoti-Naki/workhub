/**
 * GET /api/export?entity=all|tasks|projects|notes&format=json|csv
 *
 * Returns a downloadable file of workspace data.
 * Supported combinations:
 *   entity=all  format=json  → one JSON file with all entities
 *   entity=tasks|projects|notes  format=csv  → CSV for that entity
 *   entity=tasks|projects|notes  format=json → JSON array for that entity
 */
import { prisma } from "@/lib/prisma";

type Entity = "all" | "tasks" | "projects" | "notes";
type Format = "json" | "csv";

function toCSV(rows: Record<string, unknown>[], columns: string[]): string {
  const escape = (v: unknown): string => {
    const s = v == null ? "" : String(v).replace(/\r?\n/g, " ");
    return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.join(",");
  const body = rows.map((row) => columns.map((col) => escape(row[col])).join(","));
  return [header, ...body].join("\r\n");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const entity = (searchParams.get("entity") ?? "all") as Entity;
  const format = (searchParams.get("format") ?? "json") as Format;

  try {
    if (entity === "all") {
      const [projects, tasks, notes, inboxItems, events] = await Promise.all([
        prisma.project.findMany({ orderBy: { createdAt: "asc" } }),
        prisma.task.findMany({ orderBy: { createdAt: "asc" } }),
        prisma.note.findMany({ orderBy: { createdAt: "asc" } }),
        prisma.inboxItem.findMany({ orderBy: { createdAt: "asc" } }),
        prisma.event.findMany({ orderBy: { startsAt: "asc" } }),
      ]);
      const payload = JSON.stringify({ projects, tasks, notes, inboxItems, events }, null, 2);
      return new Response(payload, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="workhub-export-${datestamp()}.json"`,
        },
      });
    }

    if (entity === "tasks") {
      const tasks = await prisma.task.findMany({ orderBy: { createdAt: "asc" }, include: { project: true } });
      if (format === "csv") {
        const rows = tasks.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description ?? "",
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : "",
          recurrence: t.recurrence ?? "",
          project: t.project?.title ?? "",
          createdAt: t.createdAt.toISOString(),
        }));
        return csvResponse(toCSV(rows, ["id","title","description","status","priority","dueDate","recurrence","project","createdAt"]), "tasks");
      }
      return jsonResponse(tasks, "tasks");
    }

    if (entity === "projects") {
      const projects = await prisma.project.findMany({ orderBy: { createdAt: "asc" } });
      if (format === "csv") {
        const rows = projects.map((p) => ({
          id: p.id,
          title: p.title,
          goal: p.goal ?? "",
          status: p.status,
          priority: p.priority,
          dueDate: p.dueDate ? p.dueDate.toISOString().slice(0, 10) : "",
          createdAt: p.createdAt.toISOString(),
        }));
        return csvResponse(toCSV(rows, ["id","title","goal","status","priority","dueDate","createdAt"]), "projects");
      }
      return jsonResponse(projects, "projects");
    }

    if (entity === "notes") {
      const notes = await prisma.note.findMany({ orderBy: { createdAt: "asc" }, include: { project: true } });
      if (format === "csv") {
        const rows = notes.map((n) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          project: n.project?.title ?? "",
          updatedAt: n.updatedAt.toISOString(),
        }));
        return csvResponse(toCSV(rows, ["id","title","body","project","updatedAt"]), "notes");
      }
      return jsonResponse(notes, "notes");
    }

    return new Response(JSON.stringify({ error: "Unknown entity" }), { status: 400, headers: { "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Export failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

function datestamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function csvResponse(csv: string, entity: string): Response {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="workhub-${entity}-${datestamp()}.csv"`,
    },
  });
}

function jsonResponse(data: unknown, entity: string): Response {
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="workhub-${entity}-${datestamp()}.json"`,
    },
  });
}
