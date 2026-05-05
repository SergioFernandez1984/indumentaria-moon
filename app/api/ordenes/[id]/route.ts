import { NextResponse } from "next/server"; 
 import { prisma } from "@/lib/prisma"; 
 
 export async function GET( 
   request: Request, 
   { params }: { params: Promise<{ id: string }> } 
 ) { 
   try { 
     const { id } = await params; 
     const orden = await prisma.order.findUnique({ 
       where: { id }, 
       include: { 
         customer: true, 
         items: true, 
         shippingAddress: true, 
       }, 
     }); 
 
     if (!orden) { 
       return NextResponse.json( 
         { error: "Orden no encontrada" }, 
         { status: 404 } 
       ); 
     } 
 
     return NextResponse.json(orden); 
   } catch (error) { 
     return NextResponse.json( 
       { error: "Error al obtener orden" }, 
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
 
     const data: { status?: string; paymentStatus?: string } = {};
     if (body.status) data.status = body.status;
     if (body.paymentStatus) data.paymentStatus = body.paymentStatus;

     const orden = await prisma.order.update({ 
       where: { id }, 
       data, 
     }); 
 
     return NextResponse.json(orden); 
   } catch (error) { 
     return NextResponse.json( 
       { error: "Error al actualizar orden" }, 
       { status: 500 } 
     ); 
   } 
 } 
