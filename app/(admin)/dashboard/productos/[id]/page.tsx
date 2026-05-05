"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ImagePlus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  const [mensajeProducto, setMensajeProducto] = useState("");
  const [formProducto, setFormProducto] = useState({
    name: "",
    description: "",
    basePrice: "",
    salePrice: "",
    isActive: true,
  });
  const [formVariante, setFormVariante] = useState({
    size: "",
    color: "",
    stock: "1",
    extraPrice: "0",
  });
  const [newImages, setNewImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const reload = async () => {
    const data = await fetch(`/api/productos/${id}`).then((res) => res.json());
    setProducto(data);
    setFormProducto({
      name: data.name,
      description: data.description ?? "",
      basePrice: data.basePrice.toString(),
      salePrice: data.salePrice?.toString() ?? "",
      isActive: data.isActive,
    });
    setLoading(false);
  };

  useEffect(() => {
    reload().catch(() => setLoading(false));
  }, [id]);

  const handleUpdateProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMensajeProducto("");
    try {
      const res = await fetch(`/api/productos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formProducto.name,
          description: formProducto.description,
          basePrice: parseFloat(formProducto.basePrice),
          salePrice: formProducto.salePrice ? parseFloat(formProducto.salePrice) : null,
          isActive: formProducto.isActive,
        }),
      });
      if (!res.ok) throw new Error();
      setMensajeProducto("Producto actualizado.");
      await reload();
    } catch {
      setMensajeProducto("No se pudo actualizar el producto.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddVariante = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/productos/${id}/variantes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formVariante),
    });
    if (res.ok) {
      setFormVariante({ size: "", color: "", stock: "1", extraPrice: "0" });
      await reload();
    }
  };

  const handleUpdateVariante = async (variant: Variante) => {
    await fetch(`/api/productos/${id}/variantes`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(variant),
    });
    await reload();
  };

  const handleDeleteVariante = async (variantId: string) => {
    if (!confirm("Eliminar esta variante?")) return;
    await fetch(`/api/productos/${id}/variantes?variantId=${variantId}`, { method: "DELETE" });
    await reload();
  };

  const handleUploadNewImages = async () => {
    if (newImages.length === 0) return;
    setUploadingImages(true);
    try {
      await Promise.all(
        newImages.map(async (img, index) => {
          const formData = new FormData();
          formData.append("file", img);
          formData.append("productId", id);
          formData.append("isPrimary", String((producto?.images.length ?? 0) === 0 && index === 0));

          const imgRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          if (!imgRes.ok) throw new Error("Error al subir imagen");
        })
      );
      setNewImages([]);
      await reload();
    } finally {
      setUploadingImages(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-400">Cargando producto...</div>;
  if (!producto) return <div className="p-8 text-gray-400">Producto no encontrado.</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/dashboard/productos" className="mb-3 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
            <ArrowLeft className="size-4" />
            Volver
          </Link>
          <h1 className="text-2xl font-bold text-white">Editar producto</h1>
          <p className="text-sm text-gray-400">{producto.name}</p>
        </div>
        <span className={`w-fit px-3 py-1 text-xs font-medium ${producto.isActive ? "bg-green-950 text-green-200" : "bg-zinc-800 text-zinc-300"}`}>
          {producto.isActive ? "Publicado" : "Pausado"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_0.9fr]">
        <section className="border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-5 font-semibold text-white">Datos principales</h2>
          <form onSubmit={handleUpdateProducto} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input id="edit-name" value={formProducto.name} onChange={(e) => setFormProducto({ ...formProducto, name: e.target.value })} required />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="edit-description">Descripcion</Label>
              <Textarea id="edit-description" value={formProducto.description} onChange={(e) => setFormProducto({ ...formProducto, description: e.target.value })} rows={5} />
            </div>
            <div>
              <Label htmlFor="edit-price">Precio</Label>
              <Input id="edit-price" type="number" value={formProducto.basePrice} onChange={(e) => setFormProducto({ ...formProducto, basePrice: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="edit-sale">Precio oferta</Label>
              <Input id="edit-sale" type="number" value={formProducto.salePrice} onChange={(e) => setFormProducto({ ...formProducto, salePrice: e.target.value })} />
            </div>
            <label className="md:col-span-2 flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={formProducto.isActive}
                onChange={(e) => setFormProducto({ ...formProducto, isActive: e.target.checked })}
              />
              Producto visible en la tienda
            </label>
            {mensajeProducto && <p className="md:col-span-2 text-sm text-gray-300">{mensajeProducto}</p>}
            <Button type="submit" disabled={saving} className="md:col-span-2">
              <Save className="size-4" />
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </section>

        <section className="border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-5 font-semibold text-white">Imagenes</h2>
          <div className="grid grid-cols-3 gap-3">
            {producto.images.map((img) => (
              <img key={img.id} src={img.url} alt="" className="aspect-[3/4] w-full object-cover" />
            ))}
            {producto.images.length === 0 && <div className="col-span-3 bg-zinc-800 p-8 text-center text-sm text-gray-400">Sin imagenes</div>}
          </div>
          <div className="mt-5 border-t border-zinc-800 pt-5">
            <Label htmlFor="new-images">Agregar imagenes</Label>
            <Input id="new-images" type="file" multiple accept="image/*" onChange={(e) => setNewImages(Array.from(e.target.files || []))} className="mt-2" />
            <Button type="button" onClick={handleUploadNewImages} disabled={uploadingImages || newImages.length === 0} variant="secondary" className="mt-3">
              <ImagePlus className="size-4" />
              {uploadingImages ? "Subiendo..." : "Subir seleccionadas"}
            </Button>
          </div>
        </section>
      </div>

      <section className="border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-5 font-semibold text-white">Variantes, talles y stock</h2>
        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {producto.variants.map((variant) => (
            <div key={variant.id} className="border border-zinc-800 bg-zinc-950 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="font-bold text-white">{variant.size} / {variant.color}</p>
                <button onClick={() => handleDeleteVariante(variant.id)} className="text-gray-500 hover:text-red-400" aria-label="Eliminar variante">
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Stock</Label>
                  <Input
                    type="number"
                    value={variant.stock}
                    onChange={(e) =>
                      setProducto((prev) =>
                        prev
                          ? {
                              ...prev,
                              variants: prev.variants.map((v) => (v.id === variant.id ? { ...v, stock: Number(e.target.value) } : v)),
                            }
                          : prev
                      )
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Precio extra</Label>
                  <Input
                    type="number"
                    value={variant.extraPrice}
                    onChange={(e) =>
                      setProducto((prev) =>
                        prev
                          ? {
                              ...prev,
                              variants: prev.variants.map((v) => (v.id === variant.id ? { ...v, extraPrice: Number(e.target.value) } : v)),
                            }
                          : prev
                      )
                    }
                  />
                </div>
              </div>
              <Button type="button" size="sm" variant="secondary" className="mt-3 w-full" onClick={() => handleUpdateVariante(variant)}>
                Actualizar variante
              </Button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddVariante} className="grid grid-cols-2 gap-3 border-t border-zinc-800 pt-5 md:grid-cols-5">
          <div>
            <Label htmlFor="v-size">Talle</Label>
            <Input id="v-size" value={formVariante.size} onChange={(e) => setFormVariante({ ...formVariante, size: e.target.value })} placeholder="S, M, L" required />
          </div>
          <div>
            <Label htmlFor="v-color">Color</Label>
            <Input id="v-color" value={formVariante.color} onChange={(e) => setFormVariante({ ...formVariante, color: e.target.value })} placeholder="Negro" required />
          </div>
          <div>
            <Label htmlFor="v-stock">Stock</Label>
            <Input id="v-stock" type="number" value={formVariante.stock} onChange={(e) => setFormVariante({ ...formVariante, stock: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="v-extra">Precio extra</Label>
            <Input id="v-extra" type="number" value={formVariante.extraPrice} onChange={(e) => setFormVariante({ ...formVariante, extraPrice: e.target.value })} />
          </div>
          <Button type="submit" className="self-end">
            Agregar
          </Button>
        </form>
      </section>
    </div>
  );
}
