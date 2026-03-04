"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface Cliente {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  cantidadOrdenes: number;
  totalGastado: number;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clientes")
      .then((res) => res.json())
      .then((data) => {
        setClientes(data);
      })
      .catch((err) => console.error("Error cargando clientes:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-gray-400">Cargando clientes...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 dark:text-white">👥 Clientes</h1>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
          <h2 className="font-semibold dark:text-white">Listado de Registros ({clientes.length})</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Usuarios que han realizado al menos un proceso de checkout en la tienda.
          </p>
        </div>

        <div className="overflow-x-auto">
          {clientes.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Todavía no hay clientes registrados.
            </div>
          ) : (
            <table className="w-full text-sm text-left dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-zinc-950 text-gray-500 dark:text-gray-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">Cliente</th>
                  <th className="px-6 py-4 font-medium">Contacto</th>
                  <th className="px-6 py-4 font-medium">Fecha Alta</th>
                  <th className="px-6 py-4 font-medium text-center">Órdenes</th>
                  <th className="px-6 py-4 font-medium text-right">Total Gastado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{cliente.name}</div>
                      <div className="text-gray-500 text-xs">{cliente.id.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>{cliente.email}</div>
                      <div className="text-gray-500">{cliente.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(cliente.createdAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge variant={cliente.cantidadOrdenes > 0 ? "default" : "secondary"}>
                        {cliente.cantidadOrdenes}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                      ${cliente.totalGastado.toLocaleString("es-AR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
