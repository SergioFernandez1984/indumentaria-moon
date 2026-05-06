import { NextResponse } from "next/server";
import { createWorker, PSM } from "tesseract.js";
import path from "path";
import { flyerDraftToCsvLine, parseFlyerText, validateFlyerDraft } from "@/lib/flyer-parser";
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

    const worker = await createWorker("spa+eng", undefined, {
      workerPath: path.join(process.cwd(), "node_modules/tesseract.js/src/worker-script/node/index.js"),
    });
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      preserve_interword_spaces: "1",
    });

    const ocr = await worker.recognize(buffer);
    await worker.terminate();

    const draft = parseFlyerText(ocr.data.text, saved.url);
    const validationError = validateFlyerDraft(draft);

    if (validationError) {
      return NextResponse.json(
        {
          error: validationError,
          draft,
          rawText: draft.rawText,
          imageUrl: saved.url,
        },
        { status: 422 }
      );
    }

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
