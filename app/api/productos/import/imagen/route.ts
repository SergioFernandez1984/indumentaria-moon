import { NextResponse } from "next/server";
import { createWorker, PSM } from "tesseract.js";
import path from "path";
import sharp from "sharp";
import { flyerDraftToCsvLine, parseFlyerText, validateFlyerDraft } from "@/lib/flyer-parser";
import { saveProductImageLocally } from "@/lib/local-images";

export const runtime = "nodejs";
export const maxDuration = 60;

const workerPath = path.join(process.cwd(), "node_modules/tesseract.js/src/worker-script/node/index.js");

async function contrastWhiteText(buffer: Buffer, region: sharp.Region, threshold = 235) {
  const image = sharp(buffer).rotate().extract(region).grayscale().threshold(threshold).negate();
  const meta = await image.metadata();
  return image.resize({ width: Math.max(900, (meta.width ?? region.width) * 3) }).png().toBuffer();
}

async function redPriceBadge(buffer: Buffer) {
  const source = sharp(buffer).rotate();
  const { data, info } = await source.raw().toBuffer({ resolveWithObject: true });
  const mask = new Uint8Array(info.width * info.height);
  const seen = new Uint8Array(info.width * info.height);
  const components: Array<{ area: number; minX: number; minY: number; maxX: number; maxY: number }> = [];

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const index = (y * info.width + x) * info.channels;
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];

      if (red > 180 && green < 90 && blue < 90) {
        mask[y * info.width + x] = 1;
      }
    }
  }

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const startIndex = y * info.width + x;
      if (!mask[startIndex] || seen[startIndex]) continue;

      const queue: Array<[number, number]> = [[x, y]];
      let head = 0;
      let area = 0;
      let minX = x;
      let minY = y;
      let maxX = x;
      let maxY = y;
      seen[startIndex] = 1;

      while (head < queue.length) {
        const [cx, cy] = queue[head];
        head += 1;
        area += 1;
        minX = Math.min(minX, cx);
        minY = Math.min(minY, cy);
        maxX = Math.max(maxX, cx);
        maxY = Math.max(maxY, cy);

        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= info.width || ny >= info.height) continue;

          const nextIndex = ny * info.width + nx;
          if (mask[nextIndex] && !seen[nextIndex]) {
            seen[nextIndex] = 1;
            queue.push([nx, ny]);
          }
        }
      }

      components.push({ area, minX, minY, maxX, maxY });
    }
  }

  const badge = components
    .map((component) => ({
      ...component,
      width: component.maxX - component.minX + 1,
      height: component.maxY - component.minY + 1,
    }))
    .filter((component) => component.area > 1000 && component.width > 80 && component.height > 40)
    .filter((component) => component.width / component.height > 1.2)
    .sort((a, b) => b.area - a.area)[0];

  if (!badge) return null;

  const pad = 25;
  const left = Math.max(0, badge.minX - pad);
  const top = Math.max(0, badge.minY - pad);
  const width = Math.min(info.width - left, badge.width + pad * 2);
  const height = Math.min(info.height - top, badge.height + pad * 2);
  const crop = await source.extract({ left, top, width, height }).raw().toBuffer({ resolveWithObject: true });
  const output = Buffer.alloc(crop.info.width * crop.info.height * 3);

  for (let y = 0; y < crop.info.height; y += 1) {
    for (let x = 0; x < crop.info.width; x += 1) {
      const inputIndex = (y * crop.info.width + x) * crop.info.channels;
      const outputIndex = (y * crop.info.width + x) * 3;
      const red = crop.data[inputIndex];
      const green = crop.data[inputIndex + 1];
      const blue = crop.data[inputIndex + 2];
      const isWhiteText = red > 180 && green > 180 && blue > 180;
      const value = isWhiteText ? 0 : 255;

      output[outputIndex] = value;
      output[outputIndex + 1] = value;
      output[outputIndex + 2] = value;
    }
  }

  return sharp(output, { raw: { width: crop.info.width, height: crop.info.height, channels: 3 } })
    .resize({ width: Math.max(500, crop.info.width * 4) })
    .png()
    .toBuffer();
}

async function recognizeFlyerText(buffer: Buffer) {
  const meta = await sharp(buffer).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const worker = await createWorker("spa+eng", undefined, { workerPath });

  try {
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      preserve_interword_spaces: "1",
    });

    const full = await worker.recognize(buffer);
    const parts = [full.data.text];

    if (width > 0 && height > 0) {
      const titleImage = await contrastWhiteText(buffer, {
        left: 0,
        top: 0,
        width: Math.min(width, Math.round(width * 0.85)),
        height: Math.min(height, Math.round(height * 0.22)),
      });
      await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK });
      const title = await worker.recognize(titleImage);
      parts.push(title.data.text);

      const sizeImage = await contrastWhiteText(buffer, {
        left: 0,
        top: Math.round(height * 0.24),
        width: Math.min(width, Math.round(width * 0.45)),
        height: Math.min(height, Math.round(height * 0.24)),
      });
      await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT });
      const sizes = await worker.recognize(sizeImage);
      parts.push(sizes.data.text);
    }

    const priceImage = await redPriceBadge(buffer);
    if (priceImage) {
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.SINGLE_LINE,
        tessedit_char_whitelist: "0123456789.$",
      });
      const price = await worker.recognize(priceImage);
      parts.push(price.data.text);
    }

    return parts.join("\n");
  } finally {
    await worker.terminate();
  }
}

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
    const text = await recognizeFlyerText(buffer);
    const draft = parseFlyerText(text, saved.url);
    const validationError = validateFlyerDraft(draft);

    if (validationError) {
      draft.description = `REVISAR: ${validationError}`;
    }

    return NextResponse.json({
      draft,
      csvLine: flyerDraftToCsvLine(draft),
      warning: validationError,
      usedVision: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo analizar la imagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
