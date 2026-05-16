/**
 * Shared DB availability check for conditional test skipping.
 *
 * Tests that require a live database use describe.skipIf(!DB_AVAILABLE) so
 * they show up in the test report as "skipped" rather than silently absent.
 * Set DATABASE_URL in your environment (or .env) to enable them.
 */
export const DB_AVAILABLE = !!process.env.DATABASE_URL;
