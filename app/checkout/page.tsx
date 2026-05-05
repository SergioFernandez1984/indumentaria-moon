"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Banknote, CreditCard, Lock, PackageCheck, ShoppingBag, Truck } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { ARGENTINA_PROVINCES, getShippingCost } from "@/lib/shipping";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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

  const subtotal = total();
  const shipping = useMemo(
    () => getShippingCost(subtotal, form.province, form.city),
    [subtotal, form.province, form.city]
  );
  const finalTotal = subtotal + shipping.cost;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="mx-auto mb-4 size-12 text-gray-300" />
        <h1 className="text-2xl font-bold mb-2">No tenes productos en el carrito</h1>
        <Link href="/productos">
          <Button className="mt-4 px-8 py-6">Ver productos</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");

    if (!shipping.allowed) {
      setMensaje(shipping.message);
      return;
    }

    setLoading(true);

    try {
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
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "No se pudo crear el pedido.");
      }

      const orden = await res.json();

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
            items: [
              ...items.map((i) => ({
                variantId: i.variantId,
                productName: i.productName,
                variantSize: i.variantSize,
                variantColor: i.variantColor,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
              })),
              ...(orden.shippingCost > 0
                ? [
                    {
                      variantId: `shipping-${orden.orderNumber}`,
                      productName: "Envio",
                      variantSize: "",
                      variantColor: form.province,
                      quantity: 1,
                      unitPrice: orden.shippingCost,
                    },
                  ]
                : []),
            ],
          }),
        });

        if (!mpRes.ok) throw new Error("No se pudo iniciar Mercado Pago.");
        const { init_point } = await mpRes.json();
        clearCart();
        window.location.href = init_point;
        return;
      }

      clearCart();
      window.location.href = `/checkout/confirmacion?orden=${orden.orderNumber}`;
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "Error al procesar el pedido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Compra segura</p>
        <h1 className="text-3xl font-bold">Finalizar pedido</h1>
        <p className="max-w-2xl text-sm text-gray-500">
          Enviamos a todo el pais excepto Ushuaia. Si tu compra supera los $
          {90000 .toLocaleString("es-AR")}, el envio es gratis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-6">
          <section className="border bg-white p-6">
            <h2 className="font-semibold mb-4">Datos personales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Nombre completo *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Maria Garcia" required />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="maria@email.com" required />
              </div>
              <div>
                <Label htmlFor="phone">Telefono *</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="11 1234-5678" required />
              </div>
            </div>
          </section>

          <section className="border bg-white p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="font-semibold">Direccion de envio</h2>
              <Truck className="size-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <Label htmlFor="street">Calle y numero *</Label>
                <Input id="street" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} placeholder="Av. Corrientes 1234" required />
              </div>
              <div>
                <Label htmlFor="city">Ciudad *</Label>
                <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Rosario" required />
              </div>
              <div>
                <Label>Provincia *</Label>
                <Select value={form.province} onValueChange={(province) => setForm({ ...form, province })} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Elegir provincia" />
                  </SelectTrigger>
                  <SelectContent>
                    {ARGENTINA_PROVINCES.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="zipCode">Codigo postal *</Label>
                <Input id="zipCode" value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} placeholder="2000" required />
              </div>
            </div>
            {(form.city || form.province) && (
              <p className={`mt-3 text-sm ${shipping.allowed ? "text-gray-500" : "text-red-600"}`}>
                {shipping.message}
              </p>
            )}
          </section>

          <section className="border bg-white p-6">
            <h2 className="font-semibold mb-4">Metodo de pago</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, paymentMethod: "transfer" })}
                className={`flex items-start gap-4 border p-4 text-left transition-colors ${form.paymentMethod === "transfer" ? "border-black bg-gray-50" : "hover:border-gray-300"}`}
              >
                <Banknote className="mt-0.5 size-5" />
                <span>
                  <span className="block font-medium">Transferencia</span>
                  <span className="text-sm text-gray-500">Te enviamos los datos por email.</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, paymentMethod: "mercadopago" })}
                className={`flex items-start gap-4 border p-4 text-left transition-colors ${form.paymentMethod === "mercadopago" ? "border-black bg-gray-50" : "hover:border-gray-300"}`}
              >
                <CreditCard className="mt-0.5 size-5" />
                <span>
                  <span className="block font-medium">Mercado Pago</span>
                  <span className="text-sm text-gray-500">Tarjetas, debito y dinero en cuenta.</span>
                </span>
              </button>
            </div>
          </section>

          <section className="border bg-white p-6">
            <Label htmlFor="notes">Notas del pedido</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Ej: aclaracion de talle, horario de entrega, referencia del domicilio."
              rows={3}
            />
          </section>

          {mensaje && <p className="text-sm text-red-600">{mensaje}</p>}

          <Button type="submit" disabled={loading || !shipping.allowed} className="w-full py-6 text-base">
            {loading ? "Procesando..." : "Confirmar pedido"}
          </Button>
        </form>

        <aside className="border bg-white p-6 h-fit lg:sticky lg:top-24">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <PackageCheck className="size-5" />
            Tu pedido
          </h2>
          <div className="flex flex-col gap-3 mb-4">
            {items.map((item) => (
              <div key={item.variantId} className="flex justify-between gap-4 text-sm">
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
          <div className="border-t pt-4 text-sm">
            <div className="mb-2 flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString("es-AR")}</span>
            </div>
            <div className="mb-4 flex justify-between text-gray-500">
              <span>Envio</span>
              <span>{shipping.cost === 0 ? "Gratis" : `$${shipping.cost.toLocaleString("es-AR")}`}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${finalTotal.toLocaleString("es-AR")}</span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
            <Lock className="size-4" />
            Pago protegido y pedido registrado.
          </div>
        </aside>
      </div>
    </div>
  );
}
