"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

export default function CarritoIcon() {
  const items = useCartStore((s) => s.items);
  const cantidad = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link href="/carrito" className="relative inline-flex size-9 items-center justify-center border border-zinc-200" aria-label="Ver carrito">
      <ShoppingBag className="size-4" />
      {cantidad > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center bg-zinc-950 px-1 text-xs font-bold text-white">
          {cantidad > 99 ? "99+" : cantidad}
        </span>
      )}
    </Link>
  );
}
