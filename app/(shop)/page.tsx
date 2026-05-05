import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ShopHomePage() {
  return (
    <section className="py-20">
      <div className="max-w-2xl">
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-zinc-500">Nueva coleccion</p>
        <h1 className="mb-4 text-5xl font-black">Indumentaria Moon</h1>
        <p className="mb-8 text-lg text-zinc-500">
          Descubri productos seleccionados, elegi talle y color, y finaliza tu compra con envio a domicilio.
        </p>
        <Link href="/productos" className="inline-flex items-center gap-2 bg-zinc-950 px-8 py-3 font-bold text-white">
          Ver productos
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
