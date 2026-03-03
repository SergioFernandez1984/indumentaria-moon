"use client"; 
 
 import { useState, useEffect } from "react"; 
 import { Badge } from "@/components/ui/badge"; 
 
 interface Orden { 
   id: string; 
   orderNumber: string; 
   status: string; 
   paymentStatus: string; 
   paymentMethod: string; 
   total: number; 
   createdAt: string; 
   customer: { name: string; email: string } | null; 
   items: { quantity: number; unitPrice: number; variantSnapshot: any }[]; 
 } 
 
 const statusLabels: Record<string, string> = { 
   pending: "Pendiente", 
   paid: "Pagado", 
   processing: "En proceso", 
   shipped: "Enviado", 
   delivered: "Entregado", 
   cancelled: "Cancelado", 
 }; 
 
 const statusColors: Record<string, string> = { 
   pending: "bg-yellow-100 text-yellow-800", 
   paid: "bg-green-100 text-green-800", 
   processing: "bg-blue-100 text-blue-800", 
   shipped: "bg-purple-100 text-purple-800", 
   delivered: "bg-gray-100 text-gray-800", 
   cancelled: "bg-red-100 text-red-800", 
 }; 
 
 export default function OrdenesPage() { 
   const [ordenes, setOrdenes] = useState<Orden[]>([]); 
   const [loading, setLoading] = useState(true); 
 
   useEffect(() => { 
     fetch("/api/ordenes") 
       .then((res) => res.json()) 
       .then((data) => { 
         setOrdenes(data); 
         setLoading(false); 
       }); 
   }, []); 
 
   const handleEstado = async (id: string, status: string) => { 
     await fetch(`/api/ordenes/${id}`, { 
       method: "PUT", 
       headers: { "Content-Type": "application/json" }, 
       body: JSON.stringify({ status }), 
     }); 
     const updated = await fetch("/api/ordenes").then((r) => r.json()); 
     setOrdenes(updated); 
   }; 
 
   if (loading) return <p className="text-gray-400">Cargando órdenes...</p>; 
 
   return ( 
     <div> 
       <h1 className="text-2xl font-bold mb-6">Órdenes ({ordenes.length})</h1> 
 
       {ordenes.length === 0 && ( 
         <p className="text-gray-400">No hay órdenes todavía.</p> 
       )} 
 
       <div className="flex flex-col gap-4"> 
         {ordenes.map((orden) => ( 
           <div key={orden.id} className="bg-white border rounded-xl p-6 shadow-sm"> 
             <div className="flex items-start justify-between mb-4"> 
               <div> 
                 <p className="font-bold text-lg">{orden.orderNumber}</p> 
                 <p className="text-sm text-gray-500"> 
                   {new Date(orden.createdAt).toLocaleDateString("es-AR", { 
                     day: "2-digit", month: "2-digit", year: "numeric", 
                     hour: "2-digit", minute: "2-digit", 
                   })} 
                 </p> 
               </div> 
               <div className="flex items-center gap-2"> 
                 <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[orden.status]}`}> 
                   {statusLabels[orden.status]} 
                 </span> 
                 <span className="text-lg font-bold"> 
                   ${orden.total.toLocaleString("es-AR")} 
                 </span> 
               </div> 
             </div> 
 
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"> 
               <div> 
                 <p className="text-xs text-gray-400 uppercase mb-1">Cliente</p> 
                 <p className="text-sm font-medium">{orden.customer?.name ?? "Sin nombre"}</p> 
                 <p className="text-sm text-gray-500">{orden.customer?.email}</p> 
               </div> 
               <div> 
                 <p className="text-xs text-gray-400 uppercase mb-1">Pago</p> 
                 <p className="text-sm font-medium"> 
                   {orden.paymentMethod === "transfer" ? "🏦 Transferencia" : "💳 Mercado Pago"} 
                 </p> 
                 <p className="text-sm text-gray-500">{statusLabels[orden.paymentStatus] ?? orden.paymentStatus}</p> 
               </div> 
               <div> 
                 <p className="text-xs text-gray-400 uppercase mb-1">Productos</p> 
                 {orden.items.map((item, i) => ( 
                   <p key={i} className="text-sm"> 
                     {item.variantSnapshot?.productName} x{item.quantity} 
                   </p> 
                 ))} 
               </div> 
             </div> 
 
             <div className="border-t pt-4"> 
               <p className="text-xs text-gray-400 uppercase mb-2">Cambiar estado</p> 
               <div className="flex gap-2 flex-wrap"> 
                 {Object.entries(statusLabels).map(([key, label]) => ( 
                   <button 
                     key={key} 
                     onClick={() => handleEstado(orden.id, key)} 
                     className={`text-xs px-3 py-1 rounded-full border transition-colors ${ 
                       orden.status === key 
                         ? "bg-black text-white border-black" 
                         : "hover:border-gray-400" 
                     }`} 
                   > 
                     {label} 
                   </button> 
                 ))} 
               </div> 
             </div> 
           </div> 
         ))} 
       </div> 
     </div> 
   ); 
 } 
