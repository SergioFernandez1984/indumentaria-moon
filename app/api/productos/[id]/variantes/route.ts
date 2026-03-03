import { NextResponse } from "next/server"; 
import { prisma } from "@/lib/prisma"; 

export async function POST( 
  request: Request, 
  { params }: { params: Promise<{ id: string }> } 
) { 
  try { 
    const { id } = await params; 
    const body = await request.json(); 

    const variante = await prisma.productVariant.create({ 
      data: { 
        productId: id, 
        size: body.size, 
        color: body.color, 
        colorHex: body.colorHex || null, 
        stock: parseInt(body.stock), 
        extraPrice: parseFloat(body.extraPrice) || 0, 
      }, 
    }); 

    return NextResponse.json(variante, { status: 201 }); 
  } catch (error) { 
    console.error(error); 
    return NextResponse.json( 
      { error: "Error al crear variante" }, 
      { status: 500 } 
    ); 
  } 
} 

export async function GET( 
  request: Request, 
  { params }: { params: Promise<{ id: string }> } 
) { 
  try { 
    const { id } = await params; 

    const variantes = await prisma.productVariant.findMany({ 
      where: { productId: id }, 
      orderBy: { createdAt: "asc" }, 
    }); 

    return NextResponse.json(variantes); 
  } catch (error) { 
    return NextResponse.json( 
      { error: "Error al obtener variantes" }, 
      { status: 500 } 
    ); 
  } 
} 

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get("variantId");

    if (!variantId) {
      return NextResponse.json({ error: "Falta ID de variante" }, { status: 400 });
    }

    await prisma.productVariant.delete({
      where: { id: variantId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al eliminar variante" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { variantId, stock, extraPrice } = body;

    if (!variantId) {
      return NextResponse.json({ error: "Falta ID de variante" }, { status: 400 });
    }

    const variante = await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        stock: parseInt(stock),
        extraPrice: parseFloat(extraPrice) || 0,
      },
    });

    return NextResponse.json(variante);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al actualizar variante" }, { status: 500 });
  }
}
