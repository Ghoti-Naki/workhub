import { describe } from "vitest";

/**
 * Wraps a test suite so it skips automatically when DATABASE_URL is not set.
 * Use instead of `describe` for any test that queries the database.
 */
export function describeWithDb(
  name: string,
  fn: () => void,
): ReturnType<typeof describe> {
  if (!process.env.DATABASE_URL) {
    return describe.skip(`${name} [no DATABASE_URL — skipped]`, fn);
  }
  return describe(name, fn);
}
