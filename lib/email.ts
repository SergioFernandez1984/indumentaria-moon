import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("RESEND_API_KEY no esta configurada. Se omite el envio de email.");
    return null;
  }

  return new Resend(apiKey);
}

export async function enviarConfirmacionOrden({
  email,
  nombre,
  numeroOrden,
  items,
  total,
  shippingCost,
  paymentMethod,
}: {
  email: string;
  nombre: string;
  numeroOrden: string;
  items: { productName: string; size: string; color: string; quantity: number; unitPrice: number }[];
  total: number;
  shippingCost: number;
  paymentMethod: string;
}) {
  const resend = getResendClient();
  if (!resend) return;

  const itemsHTML = items
    .map(
      (item) => `
       <tr>
         <td style="padding: 8px; border-bottom: 1px solid #eee;">
           ${item.productName} - Talle: ${item.size} / Color: ${item.color}
         </td>
         <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
           x${item.quantity}
         </td>
         <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
           $${(item.unitPrice * item.quantity).toLocaleString("es-AR")}
         </td>
       </tr>
     `
    )
    .join("");

  const pagoHTML =
    paymentMethod === "transfer"
      ? `
       <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 16px; margin: 16px 0;">
         <p style="margin: 0 0 8px; font-weight: bold; color: #166534;">Datos para la transferencia</p>
         <p style="margin: 0; color: #166534;">CBU: <strong>0000000000000000000000</strong></p>
         <p style="margin: 0; color: #166534;">Alias: <strong>MOON.INDUMENTARIA</strong></p>
         <p style="margin: 4px 0 0; color: #166534;">Titular: <strong>Moon Indumentaria</strong></p>
         <p style="margin: 8px 0 0; font-size: 13px; color: #166534;">Una vez realizada la transferencia envianos el comprobante por WhatsApp o email.</p>
       </div>
     `
      : `
       <div style="background: #eff6ff; border: 1px solid #93c5fd; padding: 16px; margin: 16px 0;">
         <p style="margin: 0; color: #1e40af;">Si pagaste por Mercado Pago, el pedido se actualiza automaticamente cuando se aprueba el pago.</p>
       </div>
     `;

  await resend.emails.send({
    from: "Indumentaria Moon <onboarding@resend.dev>",
    to: email,
    subject: `Pedido confirmado ${numeroOrden} - Indumentaria Moon`,
    html: `
       <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
         <div style="background: #111; padding: 24px; text-align: center;">
           <h1 style="color: white; margin: 0; font-size: 24px;">Indumentaria Moon</h1>
         </div>

         <div style="padding: 24px; border: 1px solid #eee; border-top: none;">
           <h2 style="margin: 0 0 8px;">Hola ${nombre}</h2>
           <p style="color: #666; margin: 0 0 16px;">Tu pedido fue confirmado exitosamente.</p>

           <div style="background: #f9f9f9; padding: 12px 16px; margin-bottom: 16px;">
             <p style="margin: 0; font-size: 14px; color: #666;">Numero de orden</p>
             <p style="margin: 4px 0 0; font-size: 20px; font-weight: bold;">${numeroOrden}</p>
           </div>

           <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
             <thead>
               <tr style="background: #f9f9f9;">
                 <th style="padding: 8px; text-align: left; font-size: 13px;">Producto</th>
                 <th style="padding: 8px; text-align: center; font-size: 13px;">Cant.</th>
                 <th style="padding: 8px; text-align: right; font-size: 13px;">Precio</th>
               </tr>
             </thead>
             <tbody>${itemsHTML}</tbody>
           </table>

           <div style="text-align: right; font-size: 14px; margin-bottom: 4px;">
             Envio: ${shippingCost === 0 ? "Gratis" : `$${shippingCost.toLocaleString("es-AR")}`}
           </div>
           <div style="text-align: right; font-size: 18px; font-weight: bold; margin-bottom: 16px;">
             Total: $${total.toLocaleString("es-AR")}
           </div>

           ${pagoHTML}

           <p style="color: #666; font-size: 13px; margin-top: 24px;">
             Dudas o comprobantes: <a href="mailto:indumentariamoon@gmail.com">indumentariamoon@gmail.com</a>
           </p>
         </div>
       </div>
     `,
  });
}
