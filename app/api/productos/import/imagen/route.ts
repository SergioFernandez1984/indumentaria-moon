import { NextResponse } from "next/server";
import { recognize } from "tesseract.js";
import { flyerDraftToCsvLine, parseFlyerText } from "@/lib/flyer-parser";
import { saveProductImageLocally } from "@/lib/local-images";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se recibio ninguna imagen." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const saved = await saveProductImageLocally(file, buffer);
    const ocr = await recognize(buffer, "spa+eng");
    const draft = parseFlyerText(ocr.data.text, saved.url);

    return NextResponse.json({
      draft,
      csvLine: flyerDraftToCsvLine(draft),
      usedVision: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo analizar la imagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
