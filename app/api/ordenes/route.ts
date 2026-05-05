import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarConfirmacionOrden } from "@/lib/email";
import { getShippingCost } from "@/lib/shipping";

function generarNumeroOrden(): string {
  const fecha = new Date();
  const year = fecha.getFullYear();
  const rand = Math.floor(Math.random() * 900000) + 100000;
  return `MOON-${year}-${rand}`;
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

interface OrderRequestItem {
  variantId?: unknown;
  productId?: unknown;
  quantity?: unknown;
  unitPrice?: unknown;
  productName?: unknown;
  variantSize?: unknown;
  variantColor?: unknown;
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
  } catch {
    return NextResponse.json({ error: "Error al obtener ordenes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customerInput = body.customer ?? {};
    const addressInput = body.address ?? {};
    const itemsInput: OrderRequestItem[] = Array.isArray(body.items) ? body.items : [];

    const customer = {
      email: cleanString(customerInput.email).toLowerCase(),
      name: cleanString(customerInput.name),
      phone: cleanString(customerInput.phone),
    };
    const address = {
      street: cleanString(addressInput.street),
      city: cleanString(addressInput.city),
      province: cleanString(addressInput.province),
      zipCode: cleanString(addressInput.zipCode),
    };

    if (!customer.email || !customer.name || !customer.phone) {
      return NextResponse.json({ error: "Faltan datos del cliente." }, { status: 400 });
    }
    if (!address.street || !address.city || !address.province || !address.zipCode) {
      return NextResponse.json({ error: "Faltan datos de envio." }, { status: 400 });
    }
    if (itemsInput.length === 0) {
      return NextResponse.json({ error: "El carrito esta vacio." }, { status: 400 });
    }

    const requestedItems = itemsInput.map((item) => ({
      variantId: cleanString(item.variantId),
      productId: cleanString(item.productId),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      productName: cleanString(item.productName),
      variantSize: cleanString(item.variantSize),
      variantColor: cleanString(item.variantColor),
    }));

    if (requestedItems.some((item) => !item.variantId || item.quantity < 1)) {
      return NextResponse.json({ error: "Hay productos invalidos en el carrito." }, { status: 400 });
    }

    const variantIds = requestedItems.map((item) => item.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    if (variants.length !== requestedItems.length) {
      return NextResponse.json(
        { error: "Uno de los productos ya no esta disponible. Actualiza el carrito." },
        { status: 400 }
      );
    }

    const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
    const subtotal = requestedItems.reduce((sum, item) => {
      const variant = variantsById.get(item.variantId);
      const unitPrice = variant?.product.salePrice ?? variant?.product.basePrice ?? item.unitPrice;
      return sum + unitPrice * item.quantity;
    }, 0);

    const shipping = getShippingCost(subtotal, address.province, address.city);
    if (!shipping.allowed) {
      return NextResponse.json({ error: shipping.message }, { status: 400 });
    }

    for (const item of requestedItems) {
      const variant = variantsById.get(item.variantId);
      if (!variant || variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `No hay stock suficiente de ${item.productName}.` },
          { status: 400 }
        );
      }
    }

    const orderNumber = generarNumeroOrden();

    const orden = await prisma.$transaction(async (tx) => {
      const existingCustomer = await tx.customer.findUnique({
        where: { email: customer.email },
      });

      const savedCustomer =
        existingCustomer ??
        (await tx.customer.create({
          data: {
            email: customer.email,
            name: customer.name,
            phone: customer.phone,
          },
        }));

      const savedAddress = await tx.address.create({
        data: {
          customerId: savedCustomer.id,
          street: address.street,
          city: address.city,
          province: address.province,
          zipCode: address.zipCode,
        },
      });

      for (const item of requestedItems) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.order.create({
        data: {
          orderNumber,
          customerId: savedCustomer.id,
          shippingAddressId: savedAddress.id,
          status: "pending",
          paymentStatus: "pending",
          paymentMethod: cleanString(body.paymentMethod) || "transfer",
          subtotal,
          shippingCost: shipping.cost,
          discount: 0,
          total: subtotal + shipping.cost,
          notes: cleanString(body.notes) || null,
          items: {
            create: requestedItems.map((item) => {
              const variant = variantsById.get(item.variantId);
              const unitPrice = variant?.product.salePrice ?? variant?.product.basePrice ?? item.unitPrice;

              return {
                variantId: item.variantId,
                quantity: item.quantity,
                unitPrice,
                variantSnapshot: {
                  productName: variant?.product.name ?? item.productName,
                  size: variant?.size ?? item.variantSize,
                  color: variant?.color ?? item.variantColor,
                },
              };
            }),
          },
        },
      });
    });

    try {
      await enviarConfirmacionOrden({
        email: customer.email,
        nombre: customer.name,
        numeroOrden: orden.orderNumber,
        total: orden.total,
        shippingCost: orden.shippingCost,
        paymentMethod: orden.paymentMethod ?? "transfer",
        items: requestedItems.map((item) => ({
          productName: item.productName,
          size: item.variantSize || "Unico",
          color: item.variantColor || "Unico",
          quantity: item.quantity,
          unitPrice: variantsById.get(item.variantId)?.product.salePrice ?? variantsById.get(item.variantId)?.product.basePrice ?? item.unitPrice,
        })),
      });
    } catch (emailError) {
      console.error("Error al enviar email:", emailError);
    }

    return NextResponse.json(orden, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear orden" }, { status: 500 });
  }
}
