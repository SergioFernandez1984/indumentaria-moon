"use client"; 
 
 import { useCartStore } from "@/lib/cart-store"; 
 
 export default function CarritoIcon() { 
   const items = useCartStore((s) => s.items); 
   const cantidad = items.reduce((sum, item) => sum + item.quantity, 0); 
 
   return ( 
     <a href="/carrito" className="relative"> 
       <span className="text-2xl">🛒</span> 
       {cantidad > 0 && ( 
         <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"> 
           {cantidad > 99 ? "99+" : cantidad} 
         </span> 
       )} 
     </a> 
   ); 
 } 
