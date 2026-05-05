import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CatalogImportRow, parseCatalogCsv, slugify } from "@/lib/catalog-import";

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

async function getOrCreateCategory(name?: string) {
  const cleanName = name?.trim();
  if (!cleanName) return null;
  const slug = slugify(cleanName);

  return prisma.category.upsert({
    where: { slug },
    update: { name: cleanName },
    create: { name: cleanName, slug },
  });
}

function buildVariants(row: CatalogImportRow) {
  const sizes = row.sizes && row.sizes.length > 0 ? row.sizes : ["Unico"];
  const colors = row.colors && row.colors.length > 0 ? row.colors : ["Unico"];
  const stock = Number.isFinite(row.stock) ? Number(row.stock) : 0;

  return sizes.flatMap((size) =>
    colors.map((color) => ({
      size,
      color,
      stock,
    }))
  );
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let rows: CatalogImportRow[] = [];

    if (contentType.includes("text/csv")) {
      rows = parseCatalogCsv(await request.text());
    } else {
      const body = await request.json();
      if (typeof body.csv === "string") {
        rows = parseCatalogCsv(body.csv);
      } else if (Array.isArray(body.rows)) {
        rows = body.rows;
      }
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: "No hay productos para importar." }, { status: 400 });
    }

    const created = [];

    for (const row of rows) {
      const category = await getOrCreateCategory(row.category);
      const product = await prisma.product.create({
        data: {
          name: row.name.trim(),
          slug: await uniqueSlug(row.name),
          description: row.description?.trim() || null,
          basePrice: Number(row.basePrice),
          salePrice: row.salePrice ? Number(row.salePrice) : null,
          isActive: row.isActive ?? true,
          categoryId: category?.id ?? null,
          variants: {
            create: buildVariants(row),
          },
          images:
            row.imageUrls && row.imageUrls.length > 0
              ? {
                  create: row.imageUrls.map((url, index) => ({
                    url,
                    altText: row.name,
                    sortOrder: index,
                    isPrimary: index === 0,
                  })),
                }
              : undefined,
        },
        include: { variants: true, images: true, category: true },
      });

      created.push(product);
    }

    return NextResponse.json({ created, count: created.length }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al importar productos";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
