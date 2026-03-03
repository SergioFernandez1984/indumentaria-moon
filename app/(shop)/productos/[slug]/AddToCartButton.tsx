"use client"; 
 
import { useState } from "react"; 
import { Button } from "@/components/ui/button"; 
import { useCartStore } from "@/lib/cart-store"; 
 
interface Variant { 
  id: string; 
  size: string; 
  color: string; 
  stock: number; 
} 
 
interface Props { 
  producto: { 
    id: string; 
    name: string; 
    basePrice: number; 
    salePrice: number | null; 
    image: string; 
  }; 
  sizes: string[]; 
  colors: string[]; 
  variants: Variant[]; 
} 
 
export default function AddToCartButton({ producto, sizes, colors, variants }: Props) { 
  const [selectedSize, setSelectedSize] = useState(""); 
  const [selectedColor, setSelectedColor] = useState(""); 
  const [mensaje, setMensaje] = useState(""); 
  const addItem = useCartStore((s) => s.addItem); 
 
  const variantSeleccionada = variants.find( 
    (v) => v.size === selectedSize && v.color === selectedColor 
  ); 
 
  const handleAddToCart = () => { 
    if (sizes.length > 0 && !selectedSize) { 
      setMensaje("⚠️ Seleccioná un talle"); 
      return; 
    } 
    if (colors.length > 0 && !selectedColor) { 
      setMensaje("⚠️ Seleccioná un color"); 
      return; 
    } 
    if (variantSeleccionada && variantSeleccionada.stock === 0) { 
      setMensaje("❌ Sin stock disponible"); 
      return; 
    } 
 
    addItem({ 
      variantId: variantSeleccionada?.id ?? producto.id, 
      productId: producto.id, 
      productName: producto.name, 
      variantSize: selectedSize, 
      variantColor: selectedColor, 
      imageUrl: producto.image, 
      unitPrice: producto.salePrice ?? producto.basePrice, 
      quantity: 1, 
    }); 
 
    setMensaje("✅ Agregado al carrito"); 
    setTimeout(() => setMensaje(""), 2000); 
  }; 
 
  return ( 
    <div className="flex flex-col gap-4"> 
      {/* Talles */} 
      {sizes.length > 0 && ( 
        <div> 
          <p className="text-sm font-medium mb-2">Talle</p> 
          <div className="flex gap-2 flex-wrap"> 
            {sizes.map((size) => ( 
              <button 
                key={size} 
                onClick={() => setSelectedSize(size)} 
                className={`px-4 py-2 border rounded-lg text-sm transition-colors ${ 
                  selectedSize === size 
                    ? "bg-black text-white border-black" 
                    : "hover:border-gray-400" 
                }`} 
              > 
                {size} 
              </button> 
            ))} 
          </div> 
        </div> 
      )} 
 
      {/* Colores */} 
      {colors.length > 0 && ( 
        <div> 
          <p className="text-sm font-medium mb-2">Color</p> 
          <div className="flex gap-2 flex-wrap"> 
            {colors.map((color) => ( 
              <button 
                key={color} 
                onClick={() => setSelectedColor(color)} 
                className={`px-4 py-2 border rounded-lg text-sm transition-colors ${ 
                  selectedColor === color 
                    ? "bg-black text-white border-black" 
                    : "hover:border-gray-400" 
                }`} 
              > 
                {color} 
              </button> 
            ))} 
          </div> 
        </div> 
      )} 
 
      {mensaje && <p className="text-sm">{mensaje}</p>} 
 
      <Button 
        onClick={handleAddToCart} 
        className="w-full py-6 text-base" 
      > 
        Agregar al carrito 
      </Button> 
    </div> 
  ); 
} 
