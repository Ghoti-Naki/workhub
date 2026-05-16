import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { describeWithDb } from "../helpers/db";
import { GET, POST } from "@/app/api/tasks/route";
import { PATCH, DELETE } from "@/app/api/tasks/[id]/route";

const BASE = "http://localhost/api/tasks";

describeWithDb("Tasks CRUD", () => {
  let taskId: string;

  afterAll(async () => {
    if (taskId) {
      await DELETE(new Request(`${BASE}/${taskId}`), {
        params: Promise.resolve({ id: taskId }),
      });
    }
  });

  it("POST /api/tasks — creates a task", async () => {
    const req = new Request(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test Task (vitest)",
        priority: "high",
        status: "todo",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.error).toBeNull();
    expect(body.data.title).toBe("Test Task (vitest)");
    taskId = body.data.id;
  });

  it("GET /api/tasks — lists tasks including new one", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    const found = (body.data as { id: string }[]).find(
      (t) => t.id === taskId,
    );
    expect(found).toBeDefined();
  });

  it("PATCH /api/tasks/[id] — marks task as done", async () => {
    const req = new Request(`${BASE}/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    });
    const res = await PATCH(req, {
      params: Promise.resolve({ id: taskId }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.status).toBe("done");
  });

  it("POST /api/tasks — returns 422 when title is missing", async () => {
    const req = new Request(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority: "low" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(422);
  });
});
