import { NextResponse } from "next/server"; 
import { prisma } from "@/lib/prisma"; 
 
export async function GET( 
  request: Request, 
  { params }: { params: Promise<{ id: string }> } 
) { 
  try { 
    const { id } = await params; 
 
    const producto = await prisma.product.findUnique({ 
      where: { id }, 
      include: { 
        images: true, 
        variants: true, 
        category: true, 
      }, 
    }); 
 
    if (!producto) { 
      return NextResponse.json( 
        { error: "Producto no encontrado" }, 
        { status: 404 } 
      ); 
    } 
 
    return NextResponse.json(producto); 
  } catch (error) { 
    return NextResponse.json( 
      { error: "Error al obtener producto" }, 
      { status: 500 } 
    ); 
  } 
} 

export async function PUT( 
  request: Request, 
  { params }: { params: Promise<{ id: string }> } 
) { 
  try { 
    const { id } = await params; 
    const body = await request.json(); 

    const producto = await prisma.product.update({ 
      where: { id }, 
      data: { 
        name: body.name, 
        description: body.description, 
        basePrice: body.basePrice, 
        salePrice: body.salePrice || null, 
        isActive: body.isActive, 
      }, 
    }); 

    return NextResponse.json(producto); 
  } catch (error) { 
    console.error(error); 
    return NextResponse.json( 
      { error: "Error al actualizar producto" }, 
      { status: 500 } 
    ); 
  } 
} 
