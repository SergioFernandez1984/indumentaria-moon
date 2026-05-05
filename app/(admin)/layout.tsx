import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/productos", label: "Productos" },
    { href: "/dashboard/publicaciones", label: "Publicaciones" },
    { href: "/dashboard/ordenes", label: "Ordenes" },
    { href: "/dashboard/clientes", label: "Clientes" },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col bg-gray-900 text-white">
        <div className="border-b border-gray-700 p-6">
          <h1 className="text-xl font-bold">Moon Admin</h1>
          <p className="mt-1 text-xs text-gray-400">Panel de gestion</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-700 p-4">
          <p className="text-xs text-gray-400">Indumentaria Moon v1.0</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-zinc-950 p-8 text-gray-100">
        {children}
      </main>
    </div>
  );
}
