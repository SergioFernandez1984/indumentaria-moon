"use client";

import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl">
            🛒
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-8">
          Parece que todavía no has agregado nada a tu carrito.
        </p>
        <Link href="/productos">
          <Button className="px-8 py-6 text-lg">
            Ver productos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <ShoppingBag className="w-8 h-8" />
        Tu Carrito
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Lista de items */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex gap-4 p-4 border rounded-xl bg-white shadow-sm"
            >
              <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{item.productName}</h3>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {item.variantSize && `Talle: ${item.variantSize}`}
                    {item.variantSize && item.variantColor && " | "}
                    {item.variantColor && `Color: ${item.variantColor}`}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-bold text-lg">
                    ${(item.unitPrice * item.quantity).toLocaleString("es-AR")}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <Link
            href="/productos"
            className="text-sm text-gray-500 hover:text-black transition-colors underline underline-offset-4"
          >
            ← Seguir comprando
          </Link>
        </div>

        {/* Resumen de compra */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border shadow-sm sticky top-8">
            <h2 className="text-xl font-bold mb-6">Resumen</h2>
            
            <div className="flex flex-col gap-4 text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${total().toLocaleString("es-AR")}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span className="text-green-600 font-medium">Gratis</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold">
                  ${total().toLocaleString("es-AR")}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-right">
                Incluye impuestos (si aplica)
              </p>
            </div>

            <Link href="/checkout">
              <Button className="w-full py-7 text-lg font-bold">
                Finalizar Compra
              </Button>
            </Link>

            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>🔒 Pago 100% seguro</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>🚚 Envíos a todo el país</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
