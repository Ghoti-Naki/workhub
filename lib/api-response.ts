import type { ApiResponse } from "@/lib/types";

export function ok<T>(
  data: T,
  meta: Record<string, unknown> = {},
  status = 200,
): Response {
  const body: ApiResponse<T> = { data, meta, error: null };
  return Response.json(body, { status });
}

export function created<T>(data: T): Response {
  return ok(data, {}, 201);
}

export function apiError(
  code: string,
  message: string,
  status: number,
): Response {
  const body: ApiResponse<null> = { data: null, meta: {}, error: { code, message } };
  return Response.json(body, { status });
}

export const FORBIDDEN = () =>
  apiError("FORBIDDEN", "Invalid automation secret.", 403);

export const VALIDATION_ERROR = (message: string) =>
  apiError("VALIDATION_ERROR", message, 422);

export const INTERNAL_ERROR = (message: string) =>
  apiError("INTERNAL_SERVER_ERROR", message, 500);
