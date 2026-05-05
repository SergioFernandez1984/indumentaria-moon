import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductGallery from "@/components/ui-modern/ProductGallery";
import AddToCartButton from "./AddToCartButton";

export const dynamic = "force-dynamic";

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  extraPrice: number;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;

  const producto = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      variants: true,
      category: true,
    },
  });

  if (!producto) notFound();

  const sizes: string[] = [...new Set(producto.variants.map((v: ProductVariant) => v.size))];
  const colors: string[] = [...new Set(producto.variants.map((v: ProductVariant) => v.color))];
  const stock = producto.variants.reduce((sum, variant) => sum + variant.stock, 0);

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      <ProductGallery images={producto.images} productName={producto.name} />

      <div className="flex flex-col gap-6">
        {producto.category && (
          <span className="text-sm uppercase tracking-[0.2em] text-zinc-400">{producto.category.name}</span>
        )}

        <div>
          <h1 className="text-4xl font-black">{producto.name}</h1>
          <p className="mt-2 text-sm text-zinc-500">
            {stock > 0 ? `${stock} unidades disponibles` : "Sin stock disponible"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold">
            ${(producto.salePrice ?? producto.basePrice).toLocaleString("es-AR")}
          </span>
          {producto.salePrice && (
            <span className="text-lg text-zinc-400 line-through">${producto.basePrice.toLocaleString("es-AR")}</span>
          )}
          {producto.salePrice && <span className="bg-red-100 px-2 py-1 text-xs font-medium text-red-600">OFERTA</span>}
        </div>

        {producto.description && <p className="leading-relaxed text-zinc-600">{producto.description}</p>}

        <AddToCartButton
          producto={{
            id: producto.id,
            name: producto.name,
            basePrice: producto.basePrice,
            salePrice: producto.salePrice,
            image: producto.images[0]?.url ?? "",
          }}
          sizes={sizes}
          colors={colors}
          variants={producto.variants.map((v: ProductVariant) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            stock: v.stock,
            extraPrice: v.extraPrice,
          }))}
        />
      </div>
    </div>
  );
}
