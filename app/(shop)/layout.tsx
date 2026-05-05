import NavbarModern from "@/components/ui-modern/NavbarModern";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-50 text-zinc-950">
      <NavbarModern />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-zinc-500">
          © 2026 Indumentaria Moon · Envios a todo el pais excepto Ushuaia
        </div>
      </footer>
    </div>
  );
}
