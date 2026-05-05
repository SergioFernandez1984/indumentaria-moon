import Link from "next/link";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

async function getProductos() {
  const productos = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
      variants: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return productos;
}

export default async function ProductosPage() {
  const productos = await getProductos();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Productos</h1>

      {productos.length === 0 && (
        <p className="text-gray-400">No hay productos disponibles.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map((p) => (
          <Link
            key={p.id}
            href={`/productos/${p.slug}`}
            className="group cursor-pointer"
          >
            <div className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-3 relative">
              {p.images[0] ? (
                <img
                  src={p.images[0].url}
                  alt={p.images[0].altText ?? p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">
                  👗
                </div>
              )}
            </div>
            <h3 className="font-medium text-sm">{p.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-bold text-sm">
                ${(p.salePrice ?? p.basePrice).toLocaleString("es-AR")}
              </span>
              {p.salePrice && (
                <span className="text-gray-400 text-xs line-through">
                  ${p.basePrice.toLocaleString("es-AR")}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 
