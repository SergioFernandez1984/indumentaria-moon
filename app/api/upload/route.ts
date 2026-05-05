import { NextResponse } from "next/server";
import { saveProductImageLocally } from "@/lib/local-images";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const productId = formData.get("productId") as string | null;
    const isPrimaryStr = formData.get("isPrimary");
    const isPrimary = isPrimaryStr ? isPrimaryStr === "true" : true;

    if (!file || !productId) {
      return NextResponse.json({ error: "Falta imagen o producto." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const saved = await saveProductImageLocally(file, buffer);

    const { prisma } = await import("@/lib/prisma");
    const image = await prisma.productImage.create({
      data: {
        productId,
        url: saved.url,
        altText: file.name,
        isPrimary,
        sortOrder: 0,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al subir imagen" }, { status: 500 });
  }
}
