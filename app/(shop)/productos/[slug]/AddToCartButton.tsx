"use client";

import { useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";

interface Variant {
  id: string;
  size: string;
  color: string;
  stock: number;
  extraPrice?: number;
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

  const availableColors = useMemo(() => {
    if (!selectedSize) return colors;
    return [...new Set(variants.filter((v) => v.size === selectedSize).map((v) => v.color))];
  }, [colors, selectedSize, variants]);

  const variantSeleccionada = variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );
  const price = (producto.salePrice ?? producto.basePrice) + (variantSeleccionada?.extraPrice ?? 0);

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      setMensaje("Selecciona un talle.");
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      setMensaje("Selecciona un color.");
      return;
    }
    if (!variantSeleccionada) {
      setMensaje("Esa combinacion no esta disponible.");
      return;
    }
    if (variantSeleccionada.stock === 0) {
      setMensaje("Sin stock disponible.");
      return;
    }

    addItem({
      variantId: variantSeleccionada.id,
      productId: producto.id,
      productName: producto.name,
      variantSize: selectedSize,
      variantColor: selectedColor,
      imageUrl: producto.image,
      unitPrice: price,
      quantity: 1,
    });

    setMensaje("Agregado al carrito.");
    setTimeout(() => setMensaje(""), 2000);
  };

  return (
    <div className="flex flex-col gap-5">
      {sizes.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Talle</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => {
                  setSelectedSize(size);
                  setSelectedColor("");
                }}
                className={`min-w-12 border px-4 py-2 text-sm transition-colors ${
                  selectedSize === size ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 hover:border-zinc-500"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Color</p>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => {
              const option = variants.find((v) => v.size === selectedSize && v.color === color);
              const disabled = selectedSize ? !option || option.stock === 0 : false;

              return (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  disabled={disabled}
                  className={`min-w-20 border px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    selectedColor === color ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 hover:border-zinc-500"
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {variantSeleccionada && (
        <p className="text-sm text-zinc-500">
          Stock disponible: {variantSeleccionada.stock} · Precio: ${price.toLocaleString("es-AR")}
        </p>
      )}

      {mensaje && <p className="text-sm text-zinc-600">{mensaje}</p>}

      <Button onClick={handleAddToCart} className="w-full py-6 text-base">
        <ShoppingBag className="size-4" />
        Agregar al carrito
      </Button>
    </div>
  );
}
