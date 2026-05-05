import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/catalog-import";

async function uniqueSlug(name: string) {
  const base = slugify(name);
  let slug = base;
  let index = 2;

  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${base}-${index}`;
    index += 1;
  }

  return slug;
}

export async function GET() {
  try {
    const productos = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        images: {
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
          take: 1,
        },
        variants: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(productos);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const basePrice = Number(body.basePrice);

    if (!name || !Number.isFinite(basePrice)) {
      return NextResponse.json({ error: "Nombre y precio son obligatorios." }, { status: 400 });
    }

    const producto = await prisma.product.create({
      data: {
        name,
        slug: await uniqueSlug(name),
        description: body.description ? String(body.description).trim() : null,
        basePrice,
        salePrice: body.salePrice ? Number(body.salePrice) : null,
        categoryId: body.categoryId || null,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json(producto, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 });
  }
}
