import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { describeWithDb } from "../helpers/db";
import { GET, POST } from "@/app/api/projects/route";
import { GET as GET_ONE, PATCH, DELETE } from "@/app/api/projects/[id]/route";

const BASE = "http://localhost/api/projects";

describeWithDb("Projects CRUD", () => {
  let projectId: string;

  afterAll(async () => {
    if (projectId) {
      await DELETE(new Request(`${BASE}/${projectId}`), {
        params: Promise.resolve({ id: projectId }),
      });
    }
  });

  it("POST /api/projects — creates a project", async () => {
    const req = new Request(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test Project (vitest)",
        goal: "Verify CRUD works",
        priority: "medium",
        status: "active",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.error).toBeNull();
    expect(body.data.title).toBe("Test Project (vitest)");
    projectId = body.data.id;
  });

  it("GET /api/projects — lists projects including new one", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    const found = (body.data as { id: string }[]).find(
      (p) => p.id === projectId,
    );
    expect(found).toBeDefined();
  });

  it("GET /api/projects/[id] — returns single project", async () => {
    const res = await GET_ONE(new Request(`${BASE}/${projectId}`), {
      params: Promise.resolve({ id: projectId }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe(projectId);
  });

  it("PATCH /api/projects/[id] — updates the project", async () => {
    const req = new Request(`${BASE}/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paused" }),
    });
    const res = await PATCH(req, {
      params: Promise.resolve({ id: projectId }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.status).toBe("paused");
  });

  it("DELETE /api/projects/[id] — deletes the project", async () => {
    const res = await DELETE(new Request(`${BASE}/${projectId}`), {
      params: Promise.resolve({ id: projectId }),
    });
    expect(res.status).toBe(200);
    projectId = ""; // already cleaned up
  });
});

describe("GET /api/projects/[id] — not found", () => {
  it("returns 404 for a non-existent id when DB is available", async () => {
    if (!process.env.DATABASE_URL) return;
    const res = await GET_ONE(new Request(`${BASE}/nonexistent-id-xyz`), {
      params: Promise.resolve({ id: "nonexistent-id-xyz" }),
    });
    expect(res.status).toBe(404);
  });
});
