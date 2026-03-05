import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const preference = new Preference(client);
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const result = await preference.create({
      body: {
        items: body.items.map((item: any) => ({
          id: item.variantId,
          title: `${item.productName} - Talle: ${item.variantSize} / Color: ${item.variantColor}`,
          quantity: Number(item.quantity),
          unit_price: Number(item.unitPrice),
          currency_id: "ARS",
        })),
        payer: {
          name: body.customer.name,
          email: body.customer.email,
        },
        back_urls: {
          success: `${baseUrl}/checkout/confirmacion?orden=${body.orderNumber}`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/mercadopago/webhook?orden=${body.orderNumber}`,
        external_reference: body.orderNumber,
      },
    });

    return NextResponse.json({ init_point: result.init_point });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear preferencia de pago" },
      { status: 500 }
    );
  }
}