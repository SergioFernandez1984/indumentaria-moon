import NavbarModern from "@/components/ui-modern/NavbarModern";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavbarModern />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      <footer className="border-t mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
          © 2025 Indumentaria Moon · Todos los derechos reservados
        </div>
      </footer>
    </div>
  );
} 
