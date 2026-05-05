import Link from "next/link";
import { ArrowRight, CreditCard, PackageCheck, Truck } from "lucide-react";
import NavbarModern from "@/components/ui-modern/NavbarModern";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50 text-zinc-950">
      <NavbarModern />

      <main>
        <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 md:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Indumentaria Moon
            </p>
            <h1 className="text-5xl font-black leading-none tracking-normal md:text-7xl">
              Moda comoda para todos los dias.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-zinc-600">
              Prendas seleccionadas, talles y colores claros, pago por transferencia o Mercado Pago y envio a todo el
              pais excepto Ushuaia.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 bg-zinc-950 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-zinc-800"
              >
                Ver productos
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/carrito"
                className="inline-flex items-center gap-2 border border-zinc-300 px-6 py-3 text-sm font-bold transition-colors hover:border-zinc-950"
              >
                Ir al carrito
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900&auto=format&fit=crop"
              alt="Look urbano"
              className="aspect-[3/4] w-full object-cover"
            />
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=900&auto=format&fit=crop"
              alt="Indumentaria seleccionada"
              className="mt-10 aspect-[3/4] w-full object-cover"
            />
          </div>
        </section>

        <section className="border-y border-zinc-200 bg-white">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-0 px-4 md:grid-cols-3">
            {[
              { icon: Truck, title: "Envios al pais", text: "Todas las provincias, excepto Ushuaia." },
              { icon: CreditCard, title: "Pagos simples", text: "Transferencia o Mercado Pago." },
              { icon: PackageCheck, title: "Stock por variante", text: "Control por talle y color." },
            ].map((item) => (
              <div key={item.title} className="border-zinc-200 py-8 md:border-r md:px-8 last:border-r-0">
                <item.icon className="mb-4 size-6" />
                <h2 className="font-bold">{item.title}</h2>
                <p className="mt-2 text-sm text-zinc-500">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-zinc-500">
        © 2026 Indumentaria Moon · Todos los derechos reservados
      </footer>
    </div>
  );
}
