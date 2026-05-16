import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { POST } from "@/app/api/automation/inbox-import/route";

const ROUTE_URL = "http://localhost/api/automation/inbox-import";

describe("Automation secret rejection", () => {
  const originalSecret = process.env.AUTOMATION_SECRET;

  beforeAll(() => {
    process.env.AUTOMATION_SECRET = "test-secret-abc123";
  });

  afterAll(() => {
    process.env.AUTOMATION_SECRET = originalSecret;
  });

  it("returns 403 when Authorization header is missing", async () => {
    const req = new Request(ROUTE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "hello" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe("FORBIDDEN");
  });

  it("returns 403 when Authorization header has wrong secret", async () => {
    const req = new Request(ROUTE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer wrong-secret",
      },
      body: JSON.stringify({ content: "hello" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe("FORBIDDEN");
  });

  it("returns 403 when AUTOMATION_SECRET env var is not set", async () => {
    delete process.env.AUTOMATION_SECRET;
    const req = new Request(ROUTE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-secret-abc123",
      },
      body: JSON.stringify({ content: "hello" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
    // Restore for the next test
    process.env.AUTOMATION_SECRET = "test-secret-abc123";
  });
});
