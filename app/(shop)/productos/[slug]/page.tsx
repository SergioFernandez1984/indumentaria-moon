import { notFound } from "next/navigation"; 
import { prisma } from "@/lib/prisma"; 
import AddToCartButton from "./AddToCartButton"; 

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

  const sizes = [...new Set(producto.variants.map((v: { size: string }) => v.size))]; 
  const colors = [...new Set(producto.variants.map((v: { color: string }) => v.color))]; 

  return ( 
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12"> 
      {/* Imágenes */} 
      <div className="flex flex-col gap-3"> 
        {producto.images.length > 0 ? ( 
          <> 
            <div className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden"> 
              <img 
                src={producto.images[0].url} 
                alt={producto.images[0].altText ?? producto.name} 
                className="w-full h-full object-cover" 
              /> 
            </div> 
            {producto.images.length > 1 && ( 
              <div className="flex gap-2"> 
                {producto.images.slice(1).map((img: { id: string; url: string; altText: string | null }) => ( 
                  <div 
                    key={img.id} 
                    className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden" 
                  > 
                    <img 
                      src={img.url} 
                      alt={img.altText ?? producto.name} 
                      className="w-full h-full object-cover" 
                    /> 
                  </div> 
                ))} 
              </div> 
            )} 
          </> 
        ) : ( 
          <div className="aspect-[3/4] bg-gray-100 rounded-xl flex items-center justify-center text-8xl"> 
            👗 
          </div> 
        )} 
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
          variants={producto.variants.map((v) => ({ 
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
