import { NextResponse } from "next/server"; 
import { prisma } from "@/lib/prisma"; 

// GET /api/productos - Listar todos los productos activos 
export async function GET() { 
  try { 
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

    return NextResponse.json(productos); 
  } catch (error) { 
    console.error(error); 
    return NextResponse.json( 
      { error: "Error al obtener productos" }, 
      { status: 500 } 
    ); 
  } 
} 

// POST /api/productos - Crear un producto nuevo 
export async function POST(request: Request) { 
  try { 
    const body = await request.json(); 

    const producto = await prisma.product.create({ 
      data: { 
        name: body.name, 
        slug: body.name.toLowerCase().replace(/\s+/g, "-"), 
        description: body.description, 
        basePrice: body.basePrice, 
        salePrice: body.salePrice || null, 
        categoryId: body.categoryId || null, 
        isActive: true, 
      }, 
    }); 

    return NextResponse.json(producto, { status: 201 }); 
  } catch (error) { 
    console.error(error); 
    return NextResponse.json( 
      { error: "Error al crear producto" }, 
      { status: 500 } 
    ); 
  } 
} 
