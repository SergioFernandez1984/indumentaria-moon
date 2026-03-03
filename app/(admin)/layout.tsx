export default function AdminLayout({ 
  children, 
}: { 
  children: React.ReactNode; 
}) { 
  return ( 
    <div className="min-h-screen flex"> 
      {/* Sidebar */} 
      <aside className="w-64 bg-gray-900 text-white flex flex-col"> 
        <div className="p-6 border-b border-gray-700"> 
          <h1 className="text-xl font-bold">🌙 Moon Admin</h1> 
          <p className="text-gray-400 text-xs mt-1">Panel de gestión</p> 
        </div> 
        <nav className="flex-1 p-4 flex flex-col gap-1"> 
          <a 
            href="/dashboard" 
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm" 
          > 
            📊 Dashboard 
          </a> 
          <a 
            href="/dashboard/productos" 
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm" 
          > 
            👗 Productos 
          </a> 
          <a 
            href="/dashboard/ordenes" 
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm" 
          > 
            📦 Órdenes 
          </a> 
          <a 
            href="/dashboard/clientes" 
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm" 
          > 
            👥 Clientes 
          </a> 
        </nav> 
        <div className="p-4 border-t border-gray-700"> 
          <p className="text-gray-400 text-xs">Indumentaria Moon v1.0</p> 
        </div> 
      </aside> 

      {/* Contenido principal */} 
      <main className="flex-1 bg-gray-50 p-8 overflow-auto"> 
        {children} 
      </main> 
    </div> 
  ); 
} 
