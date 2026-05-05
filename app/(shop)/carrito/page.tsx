"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { SHIPPING_COPY } from "@/lib/shipping";

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const subtotal = total();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto mb-6 size-14 text-zinc-300" />
        <h1 className="mb-4 text-2xl font-bold">Tu carrito esta vacio</h1>
        <p className="mb-8 text-zinc-500">Cuando agregues productos, los vas a ver aca antes de finalizar la compra.</p>
        <Link href="/productos">
          <Button className="px-8 py-6 text-base">Ver productos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl py-8">
      <div className="mb-8 flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Carrito</p>
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <ShoppingBag className="size-7" />
          Tu compra
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div key={item.variantId} className="grid grid-cols-[5rem_1fr] gap-4 border border-zinc-200 bg-white p-4 md:grid-cols-[6rem_1fr_auto]">
                <div className="aspect-[3/4] overflow-hidden bg-zinc-100">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-zinc-200" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{item.productName}</h3>
                      <p className="mt-1 text-sm text-zinc-500">
                        {item.variantSize && `Talle: ${item.variantSize}`}
                        {item.variantSize && item.variantColor && " · "}
                        {item.variantColor && `Color: ${item.variantColor}`}
                      </p>
                    </div>
                    <button onClick={() => removeItem(item.variantId)} className="text-zinc-400 hover:text-red-600" aria-label="Quitar producto">
                      <Trash2 className="size-5" />
                    </button>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <div className="inline-flex items-center border border-zinc-200">
                      <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="p-2 hover:bg-zinc-100" aria-label="Restar unidad">
                        <Minus className="size-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="p-2 hover:bg-zinc-100" aria-label="Sumar unidad">
                        <Plus className="size-4" />
                      </button>
                    </div>
                    <p className="font-bold">${(item.unitPrice * item.quantity).toLocaleString("es-AR")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link href="/productos" className="mt-6 inline-block text-sm font-semibold text-zinc-500 underline underline-offset-4 hover:text-zinc-950">
            Seguir comprando
          </Link>
        </div>

        <aside className="h-fit border border-zinc-200 bg-white p-6 lg:sticky lg:top-24">
          <h2 className="mb-6 text-xl font-bold">Resumen</h2>
          <div className="mb-6 flex flex-col gap-4 text-sm text-zinc-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString("es-AR")}</span>
            </div>
            <div className="flex justify-between">
              <span>Envio</span>
              <span>Se calcula en checkout</span>
            </div>
          </div>

          <div className="mb-8 border-t border-zinc-200 pt-4">
            <div className="flex items-end justify-between">
              <span className="text-lg font-bold">Total parcial</span>
              <span className="text-2xl font-bold">${subtotal.toLocaleString("es-AR")}</span>
            </div>
            <p className="mt-2 text-right text-xs text-zinc-400">
              Envio gratis desde ${SHIPPING_COPY.freeFrom.toLocaleString("es-AR")}.
            </p>
          </div>

          <Link href="/checkout">
            <Button className="w-full py-7 text-base font-bold">Finalizar compra</Button>
          </Link>

          <div className="mt-6 flex items-start gap-2 text-xs text-zinc-500">
            <Truck className="mt-0.5 size-4" />
            Enviamos a todas las provincias excepto Ushuaia.
          </div>
        </aside>
      </div>
    </div>
  );
}
