import { describe, it, expect } from "vitest";
import { checkRateLimit, getRequestIp } from "@/lib/rateLimit";

// Access the module-level Map to reset between tests
// We do this via re-import trick: just test observable behavior (timing)

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const key = `test:${Math.random()}`;
    const result = checkRateLimit(key, 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.retryAfter).toBe(0);
  });

  it("blocks after exceeding max requests", () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      checkRateLimit(key, 3, 60_000);
    }
    const result = checkRateLimit(key, 3, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("uses separate buckets for different keys", () => {
    const keyA = `test-a:${Math.random()}`;
    const keyB = `test-b:${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      checkRateLimit(keyA, 3, 60_000);
    }
    // keyA should be blocked
    expect(checkRateLimit(keyA, 3, 60_000).allowed).toBe(false);
    // keyB should still be allowed
    expect(checkRateLimit(keyB, 3, 60_000).allowed).toBe(true);
  });
});

describe("getRequestIp", () => {
  it("extracts IP from x-forwarded-for header", () => {
    const req = new Request("http://localhost/", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getRequestIp(req)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("http://localhost/", {
      headers: { "x-real-ip": "9.10.11.12" },
    });
    expect(getRequestIp(req)).toBe("9.10.11.12");
  });

  it("returns 'unknown' when no IP headers are present", () => {
    const req = new Request("http://localhost/");
    expect(getRequestIp(req)).toBe("unknown");
  });
});
