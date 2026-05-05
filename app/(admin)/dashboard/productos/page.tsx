"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, FileImage, FileSpreadsheet, PackagePlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CATALOG_CSV_TEMPLATE } from "@/lib/catalog-import";

interface Producto {
  id: string;
  name: string;
  basePrice: number;
  salePrice: number | null;
  isActive: boolean;
  images: { url: string }[];
  variants: { stock: number }[];
  category?: { name: string } | null;
}

const emptyProduct = {
  name: "",
  description: "",
  basePrice: "",
  salePrice: "",
};

export default function ProductosPage() {
  const [form, setForm] = useState(emptyProduct);
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [csv, setCsv] = useState(CATALOG_CSV_TEMPLATE);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [flyerFiles, setFlyerFiles] = useState<File[]>([]);
  const [analyzingFlyers, setAnalyzingFlyers] = useState(false);
  const [flyerMessage, setFlyerMessage] = useState("");
  const [analyzedCount, setAnalyzedCount] = useState(0);

  const totalStock = useMemo(
    () => productos.reduce((sum, product) => sum + product.variants.reduce((s, v) => s + v.stock, 0), 0),
    [productos]
  );

  const reloadProducts = async () => {
    const data = await fetch("/api/productos").then((res) => res.json());
    setProductos(data);
  };

  useEffect(() => {
    reloadProducts();
  }, []);

  const handleImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImagenes(files);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    try {
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

      if (imagenes.length > 0) {
        await Promise.all(
          imagenes.map(async (img, index) => {
            const formData = new FormData();
            formData.append("file", img);
            formData.append("productId", producto.id);
            formData.append("isPrimary", String(index === 0));

            const imgRes = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (!imgRes.ok) throw new Error("Error al subir imagen");
          })
        );
      }

      setMensaje("Producto creado. Ahora podes entrar a editar talles, colores y stock.");
      setForm(emptyProduct);
      setImagenes([]);
      setPreviews([]);
      await reloadProducts();
    } catch {
      setMensaje("No se pudo crear el producto.");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setImportMessage("");

    try {
      const res = await fetch("/api/productos/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo importar");
      setImportMessage(`Se importaron ${data.count} productos correctamente.`);
      await reloadProducts();
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : "No se pudo importar.");
    } finally {
      setImporting(false);
    }
  };

  const handleAnalyzeFlyers = async () => {
    if (flyerFiles.length === 0) return;

    setAnalyzingFlyers(true);
    setFlyerMessage("");
    setAnalyzedCount(0);

    const lines: string[] = [];
    const errors: string[] = [];

    for (const file of flyerFiles) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/productos/import/imagen", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "No se pudo analizar");
        lines.push(data.csvLine);
      } catch (error) {
        errors.push(`${file.name}: ${error instanceof Error ? error.message : "error"}`);
      } finally {
        setAnalyzedCount((count) => count + 1);
      }
    }

    setCsv(
      [
        "name,description,basePrice,salePrice,category,sizes,colors,stock,imageUrls",
        ...lines,
      ].join("\n")
    );
    setFlyerMessage(
      errors.length > 0
        ? `Se analizaron ${lines.length} imagenes y ${errors.length} quedaron con error. Revisá la planilla antes de importar.`
        : `Se analizaron ${lines.length} imagenes. Revisá la planilla y despues importá.`
    );
    setAnalyzingFlyers(false);
  };

  const downloadTemplate = () => {
    const blob = new Blob([CATALOG_CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "plantilla-productos-moon.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Catalogo</p>
        <h1 className="text-2xl font-bold text-white">Productos</h1>
        <p className="max-w-3xl text-sm text-gray-400">
          Carga productos manualmente o importa varios a la vez con una planilla. Despues podes ajustar imagenes, talles,
          colores y stock desde cada producto.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-gray-400">Productos activos</p>
          <p className="mt-2 text-3xl font-bold text-white">{productos.length}</p>
        </div>
        <div className="border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-gray-400">Unidades en stock</p>
          <p className="mt-2 text-3xl font-bold text-white">{totalStock}</p>
        </div>
        <div className="border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-gray-400">Carga recomendada</p>
          <p className="mt-2 text-lg font-semibold text-white">Planilla + imagenes</p>
        </div>
      </div>

      <section className="border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <FileImage className="size-5 text-gray-300" />
            <div>
              <h2 className="font-semibold text-white">Importar desde flyers</h2>
              <p className="text-sm text-gray-400">
                Subi muchas imagenes juntas. El sistema usa OCR local gratuito, guarda las imagenes en el servidor y arma una planilla para revisar.
              </p>
            </div>
          </div>
          <span className="text-xs text-gray-500">Gratis · OCR + revision manual</span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setFlyerFiles(Array.from(e.target.files || []))}
            className="cursor-pointer"
          />
          <Button type="button" onClick={handleAnalyzeFlyers} disabled={analyzingFlyers || flyerFiles.length === 0}>
            <Upload className="size-4" />
            {analyzingFlyers ? `Analizando ${analyzedCount}/${flyerFiles.length}` : `Analizar ${flyerFiles.length || ""} imagenes`}
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-8">
          {flyerFiles.slice(0, 16).map((file) => (
            <div key={`${file.name}-${file.size}`} className="aspect-[3/4] overflow-hidden bg-zinc-950">
              <img src={URL.createObjectURL(file)} alt={file.name} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>

        {flyerMessage && <p className="mt-4 text-sm text-gray-300">{flyerMessage}</p>}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-5 flex items-center gap-3">
            <PackagePlus className="size-5 text-gray-300" />
            <h2 className="font-semibold text-white">Nuevo producto rapido</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Remera basica blanca" required />
            </div>
            <div>
              <Label htmlFor="description">Descripcion</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Material, calce, cuidados, temporada..." rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="basePrice">Precio *</Label>
                <Input id="basePrice" type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} placeholder="15000" required />
              </div>
              <div>
                <Label htmlFor="salePrice">Precio oferta</Label>
                <Input id="salePrice" type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} placeholder="12000" />
              </div>
            </div>
            <div>
              <Label htmlFor="imagen">Imagenes</Label>
              <Input id="imagen" type="file" multiple accept="image/*" onChange={handleImagen} className="cursor-pointer" />
              {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {previews.map((preview) => (
                    <img key={preview} src={preview} alt="" className="aspect-[3/4] w-full object-cover" />
                  ))}
                </div>
              )}
            </div>
            {mensaje && <p className="text-sm text-gray-300">{mensaje}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Crear producto"}
            </Button>
          </form>
        </section>

        <section className="border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="size-5 text-gray-300" />
              <h2 className="font-semibold text-white">Importar por planilla</h2>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={downloadTemplate}>
              <Download className="size-4" />
              Plantilla
            </Button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Pega un CSV con columnas: name, description, basePrice, salePrice, category, sizes, colors, stock, imageUrls.
              Usa | para separar talles, colores o varias imagenes.
            </p>
            <Textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={10} className="font-mono text-xs" />
            {importMessage && <p className="text-sm text-gray-300">{importMessage}</p>}
            <Button type="button" onClick={handleImport} disabled={importing}>
              <Upload className="size-4" />
              {importing ? "Importando..." : "Importar productos"}
            </Button>
          </div>
        </section>
      </div>

      <section className="border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 font-semibold text-white">Listado</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {productos.length === 0 && <p className="text-sm text-gray-400">Todavia no hay productos cargados.</p>}
          {productos.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/productos/${p.id}`}
              className="flex items-center gap-3 border border-zinc-800 bg-zinc-950 p-3 transition-colors hover:border-zinc-600"
            >
              {p.images[0] ? (
                <img src={p.images[0].url} alt={p.name} className="h-16 w-12 object-cover" />
              ) : (
                <div className="h-16 w-12 bg-zinc-800" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{p.name}</p>
                <p className="text-xs text-gray-500">{p.category?.name ?? "Sin categoria"}</p>
                <p className="text-xs text-gray-400">
                  ${((p.salePrice ?? p.basePrice) || 0).toLocaleString("es-AR")} · Stock{" "}
                  {p.variants.reduce((sum, v) => sum + v.stock, 0)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
