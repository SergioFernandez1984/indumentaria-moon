import NavbarModern from "@/components/ui-modern/NavbarModern";
import HeroModern from "@/components/ui-modern/HeroModern";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-white/30">
      <NavbarModern />

      <main className="flex-1 w-full flex items-center justify-center">
        <HeroModern />
      </main>

      <footer className="border-t border-white/5 py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent -z-10" />
        <div className="max-w-6xl mx-auto px-4 text-center text-sm font-medium text-gray-500">
          © 2026 Indumentaria Moon · Todos los derechos reservados
        </div>
      </footer>
    </div>
  );
}

