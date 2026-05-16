import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/health/route";
import { DB_AVAILABLE } from "@/tests/helpers/db";

describe("GET /api/health", () => {
  it.skipIf(!DB_AVAILABLE)("returns 200 with service identifier when DB is up", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.service).toBe("ai-work-hub-api");
  });

  it("returns 503 when DB is unavailable", async () => {
    // This verifies the health route gracefully handles DB failures.
    // If DB_AVAILABLE is true this test still passes (503 only triggers on error).
    // If DB is unavailable, we expect exactly 503.
    const res = await GET();
    if (!DB_AVAILABLE) {
      expect(res.status).toBe(503);
    } else {
      expect([200, 503]).toContain(res.status);
    }
  });
});
