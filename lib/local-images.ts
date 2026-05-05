import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const PUBLIC_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "productos");

function extensionFromMime(mimeType: string) {
  if (mimeType.includes("png")) return ".png";
  if (mimeType.includes("webp")) return ".webp";
  if (mimeType.includes("gif")) return ".gif";
  return ".jpg";
}

function safeName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function saveProductImageLocally(file: File, buffer: Buffer) {
  await mkdir(PUBLIC_UPLOAD_DIR, { recursive: true });

  const ext = path.extname(file.name) || extensionFromMime(file.type);
  const base = safeName(path.basename(file.name, ext)) || "producto";
  const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}-${base}${ext}`;
  const diskPath = path.join(PUBLIC_UPLOAD_DIR, fileName);

  await writeFile(diskPath, buffer);

  return {
    url: `/uploads/productos/${fileName}`,
    diskPath,
  };
}
