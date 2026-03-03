export default function HomePage() { 
  return ( 
    <div> 
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
    </div> 
  ); 
} 
