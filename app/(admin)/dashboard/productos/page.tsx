"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Producto {
  id: string;
  name: string;
  basePrice: number;
  salePrice: number | null;
  isActive: boolean;
  images: { url: string }[];
}

export default function ProductosPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    basePrice: "",
    salePrice: "",
  });
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);

  // Cargar productos al entrar
  useEffect(() => {
    fetch("/api/productos")
      .then((res) => res.json())
      .then(setProductos);
  }, []);

  const handleImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagen(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    try {
      // 1. Crear el producto
      const res = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          basePrice: parseFloat(form.basePrice),
          salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
        }),
      });

      if (!res.ok) throw new Error("Error al crear producto");
      const producto = await res.json();

      // 2. Subir imagen si hay una
      if (imagen) {
        const formData = new FormData();
        formData.append("file", imagen);
        formData.append("productId", producto.id);

        const imgRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!imgRes.ok) throw new Error("Error al subir imagen");
      }

      setMensaje("✅ Producto creado correctamente");
      setForm({ name: "", description: "", basePrice: "", salePrice: "" });
      setImagen(null);
      setPreview(null);

      // Recargar lista
      const updated = await fetch("/api/productos").then((r) => r.json());
      setProductos(updated);
    } catch (error) {
      setMensaje("❌ Error al crear el producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Productos</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="font-semibold mb-4">Nuevo producto</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Remera básica blanca"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descripción del producto..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="basePrice">Precio *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={form.basePrice}
                  onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                  placeholder="15000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="salePrice">Precio oferta</Label>
                <Input
                  id="salePrice"
                  type="number"
                  value={form.salePrice}
                  onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                  placeholder="12000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="imagen">Imagen del producto</Label>
              <Input
                id="imagen"
                type="file"
                accept="image/*"
                onChange={handleImagen}
                className="cursor-pointer"
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-2 rounded-lg w-full h-48 object-cover"
                />
              )}
            </div>

            {mensaje && <p className="text-sm">{mensaje}</p>}

            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Crear producto"}
            </Button>
          </form>
        </div>

        {/* Lista de productos */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="font-semibold mb-4">
            Productos ({productos.length})
          </h2>
          <div className="flex flex-col gap-3">
            {productos.length === 0 && (
              <p className="text-gray-400 text-sm">No hay productos todavía.</p>
            )}
            {productos.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                {p.images[0] ? (
                  <img
                    src={p.images[0].url}
                    alt={p.name}
                    className="w-14 h-14 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                    👗
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-gray-500 text-xs">
                    ${p.salePrice != null ? p.salePrice.toLocaleString("es-AR") : p.basePrice.toLocaleString("es-AR")} 
                  </p>
                </div>
                <a
                  href={`/dashboard/productos/${p.id}`}
                  className="text-xs text-blue-500 hover:underline"
                >
                  Editar
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
