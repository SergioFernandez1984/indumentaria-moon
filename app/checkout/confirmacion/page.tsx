"use client"; 
 
 import { useSearchParams } from "next/navigation"; 
 import { Suspense } from "react"; 
 import { Button } from "@/components/ui/button"; 
 
 function ConfirmacionContent() { 
   const params = useSearchParams(); 
   const numeroOrden = params.get("orden"); 
 
   return ( 
     <div className="max-w-lg mx-auto px-4 py-20 text-center"> 
       <p className="text-6xl mb-6">🎉</p> 
       <h1 className="text-3xl font-bold mb-3">¡Pedido confirmado!</h1> 
       <p className="text-gray-500 mb-2">Tu número de orden es:</p> 
       <p className="text-2xl font-bold text-black mb-6 bg-gray-100 rounded-xl py-3 px-6 inline-block"> 
         {numeroOrden} 
       </p> 
       <p className="text-gray-500 mb-8"> 
         Te enviamos un email con los detalles del pedido y los datos para realizar el pago. 
       </p> 
       <a href="/productos"> 
         <Button className="w-full py-6 text-base"> 
           Seguir comprando 
         </Button> 
       </a> 
     </div> 
   ); 
 } 
 
 export default function ConfirmacionPage() { 
   return ( 
     <Suspense fallback={<p className="text-center py-20">Cargando...</p>}> 
       <ConfirmacionContent /> 
     </Suspense> 
   ); 
 } 
