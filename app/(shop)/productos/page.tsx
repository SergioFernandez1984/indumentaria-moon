import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getProductos() {
  return prisma.product.findMany({
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
}

export default async function ProductosPage() {
  const productos = await getProductos();

  return (
    <div>
      <div className="mb-8 flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Catalogo</p>
        <h1 className="text-4xl font-black">Productos</h1>
        <p className="max-w-2xl text-sm text-zinc-500">
          Elegi talle y color desde cada producto. El stock se confirma al finalizar el pedido.
        </p>
      </div>

      {productos.length === 0 && (
        <div className="border border-zinc-200 bg-white p-10 text-center">
          <p className="font-semibold">Todavia no hay productos disponibles.</p>
          <p className="mt-2 text-sm text-zinc-500">Cuando cargues el catalogo desde el admin van a aparecer aca.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {productos.map((p) => {
          const stock = p.variants.reduce((sum, variant) => sum + variant.stock, 0);

          return (
            <Link key={p.id} href={`/productos/${p.slug}`} className="group bg-white">
              <div className="relative mb-3 aspect-[3/4] overflow-hidden bg-zinc-100">
                {p.images[0] ? (
                  <img
                    src={p.images[0].url}
                    alt={p.images[0].altText ?? p.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-zinc-200" />
                )}
                {stock === 0 && (
                  <span className="absolute left-2 top-2 bg-zinc-950 px-2 py-1 text-xs font-bold text-white">
                    Sin stock
                  </span>
                )}
              </div>
              <div className="px-1 pb-2">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">{p.category?.name ?? "Moon"}</p>
                <h3 className="mt-1 line-clamp-2 text-sm font-semibold">{p.name}</h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-bold">${(p.salePrice ?? p.basePrice).toLocaleString("es-AR")}</span>
                  {p.salePrice && <span className="text-xs text-zinc-400 line-through">${p.basePrice.toLocaleString("es-AR")}</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
