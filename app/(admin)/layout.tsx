import Link from "next/link";
import { BarChart3, FileText, Package, ShoppingBag, Users } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/dashboard/productos", label: "Productos", icon: Package },
  { href: "/dashboard/publicaciones", label: "Publicaciones", icon: FileText },
  { href: "/dashboard/ordenes", label: "Ordenes", icon: ShoppingBag },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-gray-100 md:flex">
      <aside className="border-b border-zinc-800 bg-zinc-950 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="border-b border-zinc-800 p-6">
          <h1 className="text-xl font-bold">Moon Admin</h1>
          <p className="mt-1 text-xs text-gray-400">Panel de gestion</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto p-4 md:flex-col">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-3 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-zinc-900 hover:text-white"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden border-t border-zinc-800 p-4 md:block">
          <p className="text-xs text-gray-500">Indumentaria Moon v1.0</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
