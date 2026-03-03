import CarritoIcon from "@/components/CarritoIcon";

export default function HomePage() { 
  return ( 
    <div className="min-h-screen flex flex-col"> 
      <header className="border-b sticky top-0 bg-white z-50"> 
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between"> 
          <a href="/" className="text-2xl font-bold tracking-tight"> 
            🌙 Moon 
          </a> 
          <nav className="hidden md:flex gap-6 text-sm text-gray-600"> 
            <a href="/productos" className="hover:text-black transition-colors"> 
              Productos 
            </a> 
          </nav> 
          <CarritoIcon /> 
        </div> 
      </header> 

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8"> 
        <section className="text-center py-20"> 
          <h1 className="text-5xl font-bold mb-4">Nueva Colección</h1> 
          <p className="text-gray-500 text-lg mb-8"> 
            Descubrí las últimas tendencias de Indumentaria Moon 
          </p> 
          
          <a 
            href="/productos" 
            className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors" 
          > 
            Ver productos 
          </a> 
        </section> 
      </main> 

      <footer className="border-t mt-auto"> 
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-500"> 
          © 2025 Indumentaria Moon · Todos los derechos reservados 
        </div> 
      </footer> 
    </div> 
  ); 
} 
