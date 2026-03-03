"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Cargando dashboard...</div>;
  if (!data) return <div className="p-8 text-red-500">Error al cargar el dashboard.</div>;

  const stats = [
    { label: "Ventas hoy", value: `$${data.metrics.salesToday.toLocaleString("es-AR")}`, icon: "💰" },
    { label: "Órdenes pendientes", value: data.metrics.pendingOrders.toString(), icon: "📦" },
    { label: "Productos activos", value: data.metrics.activeProducts.toString(), icon: "👗" },
    { label: "Clientes", value: data.metrics.totalCustomers.toString(), icon: "👥" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-gray-500 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold">Últimas órdenes</h2>
          <Link href="/dashboard/ordenes" className="text-xs text-blue-500 hover:underline">
            Ver todas
          </Link>
        </div>

        {data.recentOrders.length === 0 ? (
          <p className="text-gray-400 text-sm py-4">No hay órdenes todavía.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-bold text-sm">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">
                    {order.customer?.name || "Invitado"} · {new Date(order.createdAt).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">
                    ${order.total.toLocaleString("es-AR")}
                  </p>
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'paid' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status === 'pending' ? 'Pendiente' : 
                     order.status === 'paid' ? 'Pagado' : 
                     order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
