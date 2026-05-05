"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleDollarSign, Package, ShoppingBag, Users } from "lucide-react";

interface DashboardStats {
  metrics: {
    salesToday: number;
    pendingOrders: number;
    activeProducts: number;
    totalCustomers: number;
  };
  recentOrders: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
    customer?: { name: string };
  }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((stats) => {
        setData(stats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Cargando dashboard...</div>;
  if (!data) return <div className="p-8 text-red-400">Error al cargar el dashboard.</div>;

  const stats = [
    { label: "Ventas hoy", value: `$${data.metrics.salesToday.toLocaleString("es-AR")}`, icon: CircleDollarSign },
    { label: "Ordenes pendientes", value: data.metrics.pendingOrders.toString(), icon: ShoppingBag },
    { label: "Productos activos", value: data.metrics.activeProducts.toString(), icon: Package },
    { label: "Clientes", value: data.metrics.totalCustomers.toString(), icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Resumen</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-zinc-800 bg-zinc-900 p-6">
            <stat.icon className="mb-4 size-6 text-gray-400" />
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <section className="border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-semibold text-white">Ultimas ordenes</h2>
          <Link href="/dashboard/ordenes" className="text-xs text-gray-300 underline underline-offset-4 hover:text-white">
            Ver todas
          </Link>
        </div>

        {data.recentOrders.length === 0 ? (
          <p className="py-4 text-sm text-gray-400">No hay ordenes todavia.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between border border-zinc-800 p-4">
                <div>
                  <p className="text-sm font-bold text-white">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-400">
                    {order.customer?.name || "Invitado"} · {new Date(order.createdAt).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">${order.total.toLocaleString("es-AR")}</p>
                  <span className="text-[10px] uppercase text-gray-400">{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
