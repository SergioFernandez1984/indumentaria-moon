"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function ConfirmacionContent() {
  const params = useSearchParams();
  const numeroOrden = params.get("orden");

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <CheckCircle2 className="mx-auto mb-6 size-14 text-green-600" />
      <h1 className="mb-3 text-3xl font-bold">Pedido confirmado</h1>
      <p className="mb-2 text-zinc-500">Tu numero de orden es:</p>
      <p className="mb-6 inline-block bg-white px-6 py-3 text-2xl font-bold text-zinc-950">{numeroOrden}</p>
      <p className="mb-8 text-zinc-500">
        Te enviamos un email con los detalles del pedido. Si elegiste transferencia, tambien vas a recibir los datos de pago.
      </p>
      <Link href="/productos">
        <Button className="w-full py-6 text-base">Seguir comprando</Button>
      </Link>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<p className="py-20 text-center">Cargando...</p>}>
      <ConfirmacionContent />
    </Suspense>
  );
}
