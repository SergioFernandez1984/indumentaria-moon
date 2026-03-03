"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

interface Variante {
  id: string;
  size: string;
  color: string;
  stock: number;
  extraPrice: number;
}

interface Producto {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  salePrice: number | null;
  isActive: boolean;
  images: { id: string; url: string }[];
  variants: Variante[];
}

export default function ProductoEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [formProducto, setFormProducto] = useState({ 
    name: "", 
    description: "", 
    basePrice: "", 
    salePrice: "", 
  }); 
  const [mensajeProducto, setMensajeProducto] = useState(""); 

  const [formVariante, setFormVariante] = useState({
    size: "",
    color: "",
    stock: "0",
    extraPrice: "0",
  });
  const [addingVariant, setAddingVariant] = useState(false);

  useEffect(() => { 
    if (!id) return; 
    fetch(`/api/productos/${id}`) 
      .then((res) => { 
        if (!res.ok) throw new Error("Error al obtener producto"); 
        return res.json(); 
      }) 
      .then((data) => { 
        console.log("Producto cargado:", data); 
        setProducto(data); 
        setFormProducto({ 
          name: data.name, 
          description: data.description ?? "", 
          basePrice: data.basePrice.toString(), 
          salePrice: data.salePrice?.toString() ?? "", 
        }); 
        setLoading(false);
      }) 
      .catch((err) => {
        console.error(err);
        setLoading(false);
      }); 
  }, [id]);

  const handleUpdateProducto = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    setSaving(true);
    try { 
      const res = await fetch(`/api/productos/${id}`, { 
        method: "PUT", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ 
          name: formProducto.name, 
          description: formProducto.description, 
          basePrice: parseFloat(formProducto.basePrice), 
          salePrice: formProducto.salePrice ? parseFloat(formProducto.salePrice) : null, 
          isActive: producto?.isActive ?? true,
        }), 
      }); 
      if (!res.ok) throw new Error(); 
      setMensajeProducto("✅ Producto actualizado"); 
    } catch { 
      setMensajeProducto("❌ Error al actualizar"); 
    } finally {
      setSaving(false);
    }
  }; 

  const handleAddVariante = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingVariant(true);
    try {
      const res = await fetch(`/api/productos/${id}/variantes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formVariante),
      });
      if (!res.ok) throw new Error();
      const nueva = await res.json();
      setProducto((prev) => prev ? ({ ...prev, variants: [...prev.variants, nueva] }) : null);
      setFormVariante({ size: "", color: "", stock: "0", extraPrice: "0" });
    } catch {
      alert("Error al añadir variante");
    } finally {
      setAddingVariant(false);
    }
  };

  const handleDeleteVariante = async (variantId: string) => {
    if (!confirm("¿Seguro que querés eliminar esta variante?")) return;
    try {
      const res = await fetch(`/api/productos/${id}/variantes?variantId=${variantId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setProducto((prev) => prev ? ({
        ...prev,
        variants: prev.variants.filter((v) => v.id !== variantId),
      }) : null);
    } catch {
      alert("Error al eliminar variante");
    }
  };

  if (loading) return <div className="p-8">Cargando producto...</div>;
  if (!producto) return <div className="p-8">Producto no encontrado.</div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/productos" className="text-gray-500 hover:text-black">
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold">Editar: {producto.name}</h1>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border mb-8 max-w-lg"> 
        <h2 className="font-semibold mb-4">Editar producto</h2> 
        <form onSubmit={handleUpdateProducto} className="flex flex-col gap-4"> 
          <div> 
            <Label htmlFor="edit-name">Nombre</Label> 
            <Input 
              id="edit-name" 
              value={formProducto.name} 
              onChange={(e) => setFormProducto({ ...formProducto, name: e.target.value })} 
              required 
            /> 
          </div> 
          <div> 
            <Label htmlFor="edit-description">Descripción</Label> 
            <Textarea 
              id="edit-description" 
              value={formProducto.description} 
              onChange={(e) => setFormProducto({ ...formProducto, description: e.target.value })} 
              rows={4}
            /> 
          </div> 
          <div className="grid grid-cols-2 gap-4"> 
            <div> 
              <Label htmlFor="edit-price">Precio</Label> 
              <Input 
                id="edit-price" 
                type="number" 
                value={formProducto.basePrice} 
                onChange={(e) => setFormProducto({ ...formProducto, basePrice: e.target.value })} 
                required 
              /> 
            </div> 
            <div> 
              <Label htmlFor="edit-sale">Precio oferta</Label> 
              <Input 
                id="edit-sale" 
                type="number" 
                value={formProducto.salePrice} 
                onChange={(e) => setFormProducto({ ...formProducto, salePrice: e.target.value })} 
              /> 
            </div> 
          </div> 
          {mensajeProducto && <p className="text-sm">{mensajeProducto}</p>} 
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button> 
        </form> 
      </div> 

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          {/* Imágenes */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="font-semibold mb-4">Imágenes</h2>
            <div className="grid grid-cols-3 gap-4">
              {producto.images.map((img) => (
                <div key={img.id} className="aspect-[3/4] relative rounded-lg overflow-hidden border">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Variantes */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="font-semibold mb-4 text-lg">Variantes (Talle/Color/Stock)</h2>
            
            <div className="flex flex-col gap-3 mb-8">
              {producto.variants.length === 0 && (
                <p className="text-gray-400 text-sm">No hay variantes configuradas.</p>
              )}
              {producto.variants.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm uppercase">
                      {v.size} / {v.color}
                    </span>
                    <span className="text-xs text-gray-500">
                      {v.stock} en stock {v.extraPrice > 0 ? ` (+ $${v.extraPrice})` : ""}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => handleDeleteVariante(v.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold mb-4">Añadir nueva variante</h3>
              <form onSubmit={handleAddVariante} className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="v-size" className="text-xs">Talle</Label>
                  <Input
                    id="v-size"
                    value={formVariante.size}
                    onChange={(e) => setFormVariante({ ...formVariante, size: e.target.value })}
                    placeholder="S, M, L, 42..."
                    className="h-9"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="v-color" className="text-xs">Color</Label>
                  <Input
                    id="v-color"
                    value={formVariante.color}
                    onChange={(e) => setFormVariante({ ...formVariante, color: e.target.value })}
                    placeholder="Blanco, Negro..."
                    className="h-9"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="v-stock" className="text-xs">Stock inicial</Label>
                  <Input
                    id="v-stock"
                    type="number"
                    value={formVariante.stock}
                    onChange={(e) => setFormVariante({ ...formVariante, stock: e.target.value })}
                    className="h-9"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="v-extra" className="text-xs">Precio extra</Label>
                  <Input
                    id="v-extra"
                    type="number"
                    value={formVariante.extraPrice}
                    onChange={(e) => setFormVariante({ ...formVariante, extraPrice: e.target.value })}
                    className="h-9"
                  />
                </div>
                <Button type="submit" disabled={addingVariant} className="col-span-2 mt-2 h-9">
                  {addingVariant ? "Añadiendo..." : "Añadir variante"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
