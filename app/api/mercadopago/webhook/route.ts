import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN ?? "",
});

export async function POST(request: Request) {
  try {
    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Mercado Pago no configurado" }, { status: 500 });
    }

    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    const topic = url.searchParams.get("topic") || url.searchParams.get("type") || body.type;
    const paymentId = url.searchParams.get("id") || body?.data?.id || body.id;

    if (topic !== "payment" || !paymentId) {
      return NextResponse.json({ received: true });
    }

    const payment = new Payment(client);
    const paymentInfo = await payment.get({ id: String(paymentId) });
    const orderNumber = paymentInfo.external_reference;

    if (!orderNumber) {
      return NextResponse.json({ received: true });
    }

    if (paymentInfo.status === "approved") {
      await prisma.order.update({
        where: { orderNumber },
        data: {
          status: "paid",
          paymentStatus: "paid",
          paymentId: String(paymentId),
        },
      });
    } else if (paymentInfo.status === "rejected" || paymentInfo.status === "cancelled") {
      await prisma.order.update({
        where: { orderNumber },
        data: {
          paymentStatus: "failed",
          paymentId: String(paymentId),
        },
      });
    } else {
      await prisma.order.update({
        where: { orderNumber },
        data: {
          paymentStatus: "pending_confirmation",
          paymentId: String(paymentId),
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error procesando webhook" }, { status: 500 });
  }
}
