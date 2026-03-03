import { NextResponse } from "next/server"; 
 import { prisma } from "@/lib/prisma"; 
 import { enviarConfirmacionOrden } from "@/lib/email"; 
 
 function generarNumeroOrden(): string { 
   const fecha = new Date(); 
   const year = fecha.getFullYear(); 
   const rand = Math.floor(Math.random() * 9000) + 1000; 
   return `MOON-${year}-${rand}`; 
 } 
 
 export async function GET() { 
   try { 
     const ordenes = await prisma.order.findMany({ 
       include: { 
         customer: true, 
         items: true, 
         shippingAddress: true, 
       }, 
       orderBy: { createdAt: "desc" }, 
     }); 
     return NextResponse.json(ordenes); 
   } catch (error) { 
     return NextResponse.json( 
       { error: "Error al obtener órdenes" }, 
       { status: 500 } 
     ); 
   } 
 } 
 
 export async function POST(request: Request) { 
   try { 
     const body = await request.json(); 
 
     // 1. Buscar o crear cliente 
     let customer = await prisma.customer.findUnique({ 
       where: { email: body.customer.email }, 
     }); 
 
     if (!customer) { 
       customer = await prisma.customer.create({ 
         data: { 
           email: body.customer.email, 
           name: body.customer.name, 
           phone: body.customer.phone, 
         }, 
       }); 
     } 
 
     // 2. Crear dirección 
     const address = await prisma.address.create({ 
       data: { 
         customerId: customer.id, 
         street: body.address.street, 
         city: body.address.city, 
         province: body.address.province, 
         zipCode: body.address.zipCode, 
       }, 
     }); 
 
     // 3. Crear la orden 
     const orden = await prisma.order.create({ 
       data: { 
         orderNumber: generarNumeroOrden(), 
         customerId: customer.id, 
         shippingAddressId: address.id, 
         status: "pending", 
         paymentStatus: "pending", 
         paymentMethod: body.paymentMethod, 
         subtotal: body.subtotal, 
         shippingCost: 0, 
         discount: 0, 
         total: body.total, 
         notes: body.notes || null, 
         items: { 
           create: await Promise.all( 
             body.items.map(async (item: any) => { 
               // Verificar si el variantId existe realmente en la DB 
               const variantExists = await prisma.productVariant.findUnique({ 
                 where: { id: item.variantId }, 
               }); 
 
               // Si no existe, buscar o crear una variante por defecto para ese producto 
               let finalVariantId = item.variantId; 
               if (!variantExists) { 
                 const defaultVariant = await prisma.productVariant.upsert({ 
                   where: { sku: `default-${item.productId}` }, 
                   update: {}, 
                   create: { 
                     productId: item.productId, 
                     size: "Único", 
                     color: "Único", 
                     sku: `default-${item.productId}`, 
                     stock: 99, 
                   }, 
                 }); 
                 finalVariantId = defaultVariant.id; 
               } 
 
               return { 
                 variantId: finalVariantId, 
                 quantity: item.quantity, 
                 unitPrice: item.unitPrice, 
                 variantSnapshot: { 
                   productName: item.productName, 
                   size: item.variantSize, 
                   color: item.variantColor, 
                 }, 
               }; 
             }) 
           ), 
         }, 
       }, 
     }); 
 
     // Enviar email de confirmación 
     try { 
       await enviarConfirmacionOrden({ 
         email: body.customer.email, 
         nombre: body.customer.name, 
         numeroOrden: orden.orderNumber, 
         total: orden.total, 
         paymentMethod: orden.paymentMethod ?? "transfer", 
         items: body.items.map((item: any) => ({ 
           productName: item.productName, 
           size: item.variantSize ?? "Único", 
           color: item.variantColor ?? "Único", 
           quantity: item.quantity, 
           unitPrice: item.unitPrice, 
         })), 
       }); 
     } catch (emailError) { 
       console.error("Error al enviar email:", emailError); 
       // No bloqueamos la orden si el email falla 
     } 
 
     return NextResponse.json(orden, { status: 201 }); 
   } catch (error) { 
     console.error(error); 
     return NextResponse.json( 
       { error: "Error al crear orden" }, 
       { status: 500 } 
     ); 
   } 
 } 
