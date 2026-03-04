import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AddToCartButton from "./AddToCartButton";
import ProductGallery from "@/components/ui-modern/ProductGallery";

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
}

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;

  const producto = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      category: true,
    },
  });

  if (!producto) notFound();

  const sizes: string[] = [...new Set<string>(
    producto.variants.map((v: ProductVariant) => v.size)
  )];
  const colors: string[] = [...new Set<string>(
    producto.variants.map((v: ProductVariant) => v.color)
  )];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Galería de Imágenes */}
      <div className="flex flex-col gap-3">
        <ProductGallery images={producto.images} productName={producto.name} />
      </div>

      {/* Info del producto */}
      <div className="flex flex-col gap-6">
        {producto.category && (
          <span className="text-sm text-gray-400 uppercase tracking-wider">
            {producto.category.name}
          </span>
        )}

        <h1 className="text-3xl font-bold">{producto.name}</h1>

        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold">
            ${(producto.salePrice ?? producto.basePrice).toLocaleString("es-AR")}
          </span>
          {producto.salePrice && (
            <span className="text-gray-400 line-through text-lg">
              ${producto.basePrice.toLocaleString("es-AR")}
            </span>
          )}
          {producto.salePrice && (
            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
              OFERTA
            </span>
          )}
        </div>

        {producto.description && (
          <p className="text-gray-600 leading-relaxed">{producto.description}</p>
        )}

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
          }))}
        />
      </div>
    </div>
  );
}
