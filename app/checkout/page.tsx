"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    province: "",
    zipCode: "",
    paymentMethod: "transfer",
    notes: "",
  });

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="text-2xl font-bold mb-2">No tenés productos en el carrito</h1>
        <a href="/productos" className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors inline-block mt-4">
          Ver productos
        </a>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => { 
     e.preventDefault(); 
     setLoading(true); 
     setMensaje(""); 
 
     try { 
       // 1. Crear la orden 
       const res = await fetch("/api/ordenes", { 
         method: "POST", 
         headers: { "Content-Type": "application/json" }, 
         body: JSON.stringify({ 
           customer: { 
             name: form.name, 
             email: form.email, 
             phone: form.phone, 
           }, 
           address: { 
             street: form.street, 
             city: form.city, 
             province: form.province, 
             zipCode: form.zipCode, 
           }, 
           items: items.map((i) => ({ 
             variantId: i.variantId, 
             productId: i.productId, 
             quantity: i.quantity, 
             unitPrice: i.unitPrice, 
             productName: i.productName, 
             variantSize: i.variantSize, 
             variantColor: i.variantColor, 
           })), 
           paymentMethod: form.paymentMethod, 
           notes: form.notes, 
           subtotal: total(), 
           total: total(), 
         }), 
       }); 
 
       if (!res.ok) throw new Error(); 
       const orden = await res.json(); 
 
       // 2. Si eligió Mercado Pago, crear preferencia y redirigir 
       if (form.paymentMethod === "mercadopago") { 
         const mpRes = await fetch("/api/mercadopago", { 
           method: "POST", 
           headers: { "Content-Type": "application/json" }, 
           body: JSON.stringify({ 
             orderNumber: orden.orderNumber, 
             customer: { 
               name: form.name, 
               email: form.email, 
             }, 
             items: items.map((i) => ({ 
               variantId: i.variantId, 
               productName: i.productName, 
               variantSize: i.variantSize, 
               variantColor: i.variantColor, 
               quantity: i.quantity, 
               unitPrice: i.unitPrice, 
             })), 
           }), 
         }); 
 
         if (!mpRes.ok) throw new Error(); 
         const { init_point } = await mpRes.json(); 
         clearCart(); 
         window.location.href = init_point; 
         return; 
       } 
 
       // 3. Si eligió transferencia, ir a confirmación 
       clearCart(); 
       window.location.href = `/checkout/confirmacion?orden=${orden.orderNumber}`; 
     } catch { 
       setMensaje("❌ Error al procesar el pedido. Intentá de nuevo."); 
     } finally { 
       setLoading(false); 
     } 
   }; 

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Datos personales</h2>
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="name">Nombre completo *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="María García" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="maria@email.com" required />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="11 1234-5678" required />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Dirección de envío</h2>
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="street">Calle y número *</Label>
                <Input id="street" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} placeholder="Av. Corrientes 1234" required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Buenos Aires" required />
                </div>
                <div>
                  <Label htmlFor="province">Provincia *</Label>
                  <Input id="province" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} placeholder="CABA" required />
                </div>
                <div>
                  <Label htmlFor="zipCode">CP *</Label>
                  <Input id="zipCode" value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} placeholder="1043" required />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Método de pago</h2>
            <div className="flex flex-col gap-3">
              <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${form.paymentMethod === "transfer" ? "border-black bg-gray-50" : "hover:border-gray-300"}`}>
                <input type="radio" name="payment" value="transfer" checked={form.paymentMethod === "transfer"} onChange={() => setForm({ ...form, paymentMethod: "transfer" })} className="hidden" />
                <span className="text-2xl">🏦</span>
                <div>
                  <p className="font-medium">Transferencia bancaria</p>
                  <p className="text-sm text-gray-500">Sin costo adicional · Te enviamos el CBU por email</p>
                </div>
              </label>
              <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${form.paymentMethod === "mercadopago" ? "border-black bg-gray-50" : "hover:border-gray-300"}`}>
                <input type="radio" name="payment" value="mercadopago" checked={form.paymentMethod === "mercadopago"} onChange={() => setForm({ ...form, paymentMethod: "mercadopago" })} className="hidden" />
                <span className="text-2xl">💳</span>
                <div>
                  <p className="font-medium">Mercado Pago</p>
                  <p className="text-sm text-gray-500">Tarjeta de crédito, débito o cuotas</p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Notas del pedido (opcional)</h2>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Ej: Dejar en portería, aclaración de talle, etc."
              rows={3}
              className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {mensaje && <p className="text-sm">{mensaje}</p>}

          <Button type="submit" disabled={loading} className="w-full py-6 text-base">
            {loading ? "Procesando..." : "Confirmar pedido →"}
          </Button>
        </form>

        <div className="bg-white border rounded-xl p-6 h-fit">
          <h2 className="font-semibold mb-4">Tu pedido</h2>
          <div className="flex flex-col gap-3 mb-4">
            {items.map((item) => (
              <div key={item.variantId} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-gray-400">
                    {item.variantSize} {item.variantColor} · x{item.quantity}
                  </p>
                </div>
                <span>${(item.unitPrice * item.quantity).toLocaleString("es-AR")}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span>${total().toLocaleString("es-AR")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
