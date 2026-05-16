import { describe, it, expect, afterAll } from "vitest";
import { describeWithDb } from "../helpers/db";
import { POST as CREATE_INBOX } from "@/app/api/inbox/route";
import { PATCH as ARCHIVE_INBOX } from "@/app/api/inbox/[id]/route";
import { POST as CONVERT_INBOX } from "@/app/api/inbox/[id]/convert/route";

const BASE = "http://localhost/api/inbox";

describeWithDb("Inbox — capture and archive", () => {
  let itemId: string;

  afterAll(async () => {
    // Archive (soft-delete) the test item if it wasn't already archived by a test
    if (itemId) {
      await ARCHIVE_INBOX(
        new Request(`${BASE}/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "archived" }),
        }),
        { params: Promise.resolve({ id: itemId }) },
      );
    }
  });

  it("POST /api/inbox — creates an inbox item", async () => {
    const req = new Request(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test Capture (vitest)",
        content: "Something I need to process later.",
        sourceType: "manual",
        itemType: "capture",
      }),
    });
    const res = await CREATE_INBOX(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.error).toBeNull();
    expect(json.data.content).toBe("Something I need to process later.");
    itemId = json.data.id;
  });

  it("PATCH /api/inbox/[id] — archives the item", async () => {
    const req = new Request(`${BASE}/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
    const res = await ARCHIVE_INBOX(req, {
      params: Promise.resolve({ id: itemId }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.status).toBe("archived");
    itemId = ""; // cleaned up
  });
});

describeWithDb("Inbox — convert to task", () => {
  let itemId: string;

  afterAll(async () => {
    if (itemId) {
      await ARCHIVE_INBOX(
        new Request(`${BASE}/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "archived" }),
        }),
        { params: Promise.resolve({ id: itemId }) },
      );
    }
  });

  it("creates a source inbox item", async () => {
    const req = new Request(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Convert me to a task (vitest)",
        content: "This should become a task.",
        sourceType: "manual",
        itemType: "capture",
      }),
    });
    const res = await CREATE_INBOX(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    itemId = json.data.id;
  });

  it("POST /api/inbox/[id]/convert — converts item to task", async () => {
    const req = new Request(`${BASE}/${itemId}/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType: "task" }),
    });
    const res = await CONVERT_INBOX(req, {
      params: Promise.resolve({ id: itemId }),
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.error).toBeNull();
    expect(json.data).toBeDefined();
  });

  it("POST /api/inbox/[id]/convert — returns 400 for invalid targetType", async () => {
    const req = new Request(`${BASE}/${itemId}/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType: "invalid" }),
    });
    const res = await CONVERT_INBOX(req, {
      params: Promise.resolve({ id: itemId }),
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
