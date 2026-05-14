-- CreateTable
CREATE TABLE "AutomationRun" (
    "id" TEXT NOT NULL,
    "workflow" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'started',
    "externalId" TEXT,
    "idempotencyKey" TEXT,
    "message" TEXT,
    "payload" JSONB,
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AutomationRun_workflow_createdAt_idx" ON "AutomationRun"("workflow", "createdAt");

-- CreateIndex
CREATE INDEX "AutomationRun_source_createdAt_idx" ON "AutomationRun"("source", "createdAt");

-- CreateIndex
CREATE INDEX "AutomationRun_externalId_idx" ON "AutomationRun"("externalId");

-- CreateIndex
CREATE INDEX "AutomationRun_idempotencyKey_idx" ON "AutomationRun"("idempotencyKey");
