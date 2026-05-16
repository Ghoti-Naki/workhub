/**
 * POST /api/files/upload
 *
 * Accepts multipart/form-data with fields:
 *   file      — the file binary (required)
 *   projectId — optional project to link
 *   summary   — optional description
 *
 * Saves the file to /public/uploads/ with a unique prefix so names never
 * collide. Creates a FileRecord row and returns it. Max 10 MB.
 */
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { created, VALIDATION_ERROR, INTERNAL_ERROR } from "@/lib/api-response";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_PREFIXES = [
  "image/",
  "text/",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats",
  "application/vnd.ms-",
  "application/json",
  "application/zip",
];

function isAllowed(mime: string): boolean {
  return ALLOWED_MIME_PREFIXES.some((prefix) => mime.startsWith(prefix));
}

function safeName(original: string): string {
  return original.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) return VALIDATION_ERROR("file field is required.");
    if (!file.name) return VALIDATION_ERROR("File must have a name.");
    if (file.size > MAX_BYTES) return VALIDATION_ERROR("File exceeds 10 MB limit.");
    if (!isAllowed(file.type)) return VALIDATION_ERROR(`File type "${file.type}" is not allowed.`);

    const projectId = formData.has("projectId") ? String(formData.get("projectId")) || null : null;
    const summary = formData.has("summary") ? String(formData.get("summary")).trim() || null : null;

    const uid = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const filename = `${uid}_${safeName(file.name)}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadsDir, { recursive: true });
    await writeFile(path.join(uploadsDir, filename), Buffer.from(await file.arrayBuffer()));

    const ext = path.extname(file.name).slice(1).toLowerCase() || null;
    const record = await prisma.fileRecord.create({
      data: {
        name: file.name,
        fileType: ext,
        mimeType: file.type || null,
        externalUrl: `/uploads/${filename}`,
        summary,
        projectId,
      },
    });

    return created(record);
  } catch {
    return INTERNAL_ERROR("Failed to upload file.");
  }
}
