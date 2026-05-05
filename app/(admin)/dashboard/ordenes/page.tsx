"use client";

import { useEffect, useState } from "react";

interface Orden {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  createdAt: string;
  customer: { name: string; email: string; phone?: string } | null;
  shippingAddress?: { street: string; city: string; province: string; zipCode: string } | null;
  items: { quantity: number; unitPrice: number; variantSnapshot: { productName?: string; size?: string; color?: string } }[];
}

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  processing: "En preparacion",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-950 text-yellow-200",
  paid: "bg-green-950 text-green-200",
  processing: "bg-blue-950 text-blue-200",
  shipped: "bg-violet-950 text-violet-200",
  delivered: "bg-zinc-800 text-zinc-200",
  cancelled: "bg-red-950 text-red-200",
};

export default function OrdenesPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const data = await fetch("/api/ordenes").then((res) => res.json());
    setOrdenes(data);
    setLoading(false);
  };

  useEffect(() => {
    async function loadOrders() {
      const data = await fetch("/api/ordenes").then((res) => res.json());
      setOrdenes(data);
      setLoading(false);
    }

    loadOrders();
  }, []);

  const handleEstado = async (id: string, status: string) => {
    await fetch(`/api/ordenes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await reload();
  };

  if (loading) return <p className="text-gray-400">Cargando ordenes...</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Ventas</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Ordenes ({ordenes.length})</h1>
      </div>

      {ordenes.length === 0 && <p className="text-gray-400">No hay ordenes todavia.</p>}

      <div className="flex flex-col gap-4">
        {ordenes.map((orden) => (
          <article key={orden.id} className="border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-lg font-bold text-white">{orden.orderNumber}</p>
                <p className="text-sm text-gray-400">
                  {new Date(orden.createdAt).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-xs font-medium ${statusColors[orden.status] ?? "bg-zinc-800 text-zinc-200"}`}>
                  {statusLabels[orden.status] ?? orden.status}
                </span>
                <span className="text-lg font-bold text-white">${orden.total.toLocaleString("es-AR")}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <p className="mb-1 text-xs uppercase text-gray-500">Cliente</p>
                <p className="text-sm font-medium text-white">{orden.customer?.name ?? "Sin nombre"}</p>
                <p className="text-sm text-gray-400">{orden.customer?.email}</p>
                <p className="text-sm text-gray-400">{orden.customer?.phone}</p>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase text-gray-500">Envio</p>
                <p className="text-sm text-white">
                  {orden.shippingAddress?.street ?? "Sin direccion"}
                </p>
                <p className="text-sm text-gray-400">
                  {orden.shippingAddress?.city}, {orden.shippingAddress?.province} ({orden.shippingAddress?.zipCode})
                </p>
                <p className="text-sm text-gray-400">${orden.shippingCost.toLocaleString("es-AR")}</p>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase text-gray-500">Pago</p>
                <p className="text-sm font-medium text-white">
                  {orden.paymentMethod === "transfer" ? "Transferencia" : "Mercado Pago"}
                </p>
                <p className="text-sm text-gray-400">{statusLabels[orden.paymentStatus] ?? orden.paymentStatus}</p>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase text-gray-500">Productos</p>
                {orden.items.map((item, i) => (
                  <p key={i} className="text-sm text-gray-300">
                    {item.variantSnapshot?.productName} · {item.variantSnapshot?.size}/{item.variantSnapshot?.color} x{item.quantity}
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-5 border-t border-zinc-800 pt-4">
              <p className="mb-2 text-xs uppercase text-gray-500">Cambiar estado</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => handleEstado(orden.id, key)}
                    className={`border px-3 py-1 text-xs transition-colors ${
                      orden.status === key ? "border-white bg-white text-zinc-950" : "border-zinc-700 text-gray-300 hover:border-zinc-400"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
