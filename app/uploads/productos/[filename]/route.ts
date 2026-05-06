import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "productos");

function contentTypeFor(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
}

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const safeName = path.basename(filename);

  if (safeName !== filename || !/\.(jpe?g|png|webp|gif)$/i.test(safeName)) {
    return NextResponse.json({ error: "Imagen invalida." }, { status: 400 });
  }

  try {
    const file = await readFile(path.join(UPLOAD_DIR, safeName));
    return new NextResponse(file, {
      headers: {
        "Content-Type": contentTypeFor(safeName),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Imagen no encontrada." }, { status: 404 });
  }
}
