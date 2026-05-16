import { describe, it, expect, afterAll } from "vitest";
import { describeWithDb } from "../helpers/db";
import { GET, POST } from "@/app/api/notes/route";
import { PATCH, DELETE } from "@/app/api/notes/[id]/route";

const BASE = "http://localhost/api/notes";

describeWithDb("Notes CRUD", () => {
  let noteId: string;

  afterAll(async () => {
    if (noteId) {
      await DELETE(new Request(`${BASE}/${noteId}`), {
        params: Promise.resolve({ id: noteId }),
      });
    }
  });

  it("POST /api/notes — creates a note", async () => {
    const req = new Request(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test Note (vitest)",
        body: "This note was created by an automated test.",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.error).toBeNull();
    expect(json.data.title).toBe("Test Note (vitest)");
    noteId = json.data.id;
  });

  it("GET /api/notes — lists notes including new one", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    const found = (json.data as { id: string }[]).find(
      (n) => n.id === noteId,
    );
    expect(found).toBeDefined();
  });

  it("PATCH /api/notes/[id] — updates note body", async () => {
    const req = new Request(`${BASE}/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: "Updated body content." }),
    });
    const res = await PATCH(req, {
      params: Promise.resolve({ id: noteId }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.body).toBe("Updated body content.");
  });

  it("POST /api/notes — returns 422 when title is missing", async () => {
    const req = new Request(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: "No title provided." }),
    });
    const res = await POST(req);
    expect(res.status).toBe(422);
  });
});
