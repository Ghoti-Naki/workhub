-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "recurrence" TEXT;

-- CreateIndex
CREATE INDEX "AiExtraction_sourceType_sourceId_outputType_idx" ON "AiExtraction"("sourceType", "sourceId", "outputType");

-- CreateIndex
CREATE INDEX "AiExtraction_status_createdAt_idx" ON "AiExtraction"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AiOutput_outputType_targetType_targetId_idx" ON "AiOutput"("outputType", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "AiOutput_createdAt_idx" ON "AiOutput"("createdAt");

-- CreateIndex
CREATE INDEX "Event_startsAt_idx" ON "Event"("startsAt");

-- CreateIndex
CREATE INDEX "Event_externalId_idx" ON "Event"("externalId");

-- CreateIndex
CREATE INDEX "FileRecord_projectId_idx" ON "FileRecord"("projectId");

-- CreateIndex
CREATE INDEX "FileRecord_createdAt_idx" ON "FileRecord"("createdAt");

-- CreateIndex
CREATE INDEX "InboxItem_status_createdAt_idx" ON "InboxItem"("status", "createdAt");

-- CreateIndex
CREATE INDEX "InboxItem_projectId_idx" ON "InboxItem"("projectId");

-- CreateIndex
CREATE INDEX "InboxItem_externalId_idx" ON "InboxItem"("externalId");

-- CreateIndex
CREATE INDEX "Note_projectId_idx" ON "Note"("projectId");

-- CreateIndex
CREATE INDEX "Note_createdAt_idx" ON "Note"("createdAt");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");

-- CreateIndex
CREATE INDEX "Task_status_createdAt_idx" ON "Task"("status", "createdAt");
