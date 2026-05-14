import { prisma } from "@/lib/prisma";

export async function createAutomationRun(input: {
  workflow: string;
  source: string;
  externalId?: string | null;
  idempotencyKey?: string | null;
  payload?: unknown;
}) {
  return prisma.automationRun.create({
    data: {
      workflow: input.workflow,
      source: input.source,
      externalId: input.externalId ?? null,
      idempotencyKey: input.idempotencyKey ?? null,
      payload: (input.payload ?? null) as any,
      status: "started",
    },
  });
}

export async function completeAutomationRun(
  runId: string,
  result?: unknown,
  message?: string,
) {
  return prisma.automationRun.update({
    where: { id: runId },
    data: {
      status: "success",
      result: (result ?? null) as any,
      message: message ?? null,
    },
  });
}

export async function failAutomationRun(
  runId: string,
  message: string,
  result?: unknown,
) {
  return prisma.automationRun.update({
    where: { id: runId },
    data: {
      status: "failed",
      message,
      result: (result ?? null) as any,
    },
  });
}
