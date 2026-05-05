"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import CarritoIcon from "@/components/CarritoIcon";

export default function NavbarModern() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="relative flex h-16 w-44 items-center">
          <Image src="/logo.png" alt="Indumentaria Moon" fill className="object-contain" priority />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-zinc-600 md:flex">
          <Link href="/productos" className="transition-colors hover:text-zinc-950">
            Productos
          </Link>
          <Link href="/checkout" className="transition-colors hover:text-zinc-950">
            Checkout
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <CarritoIcon />
          <button className="inline-flex size-9 items-center justify-center border border-zinc-200 md:hidden" aria-label="Abrir menu">
            <Menu className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
