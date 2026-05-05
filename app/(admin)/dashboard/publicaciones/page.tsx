"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Clipboard,
  ExternalLink,
  FileText,
  MessageSquareText,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProductImage = {
  url: string;
};

type ProductVariant = {
  size: string;
  color: string;
  stock: number;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  salePrice: number | null;
  images: ProductImage[];
  variants: ProductVariant[];
};

type GroupTarget = {
  id: string;
  name: string;
  url: string;
  channel: "Facebook" | "WhatsApp";
  notes?: string;
};

type PublishLog = {
  id: string;
  groupId: string;
  groupName: string;
  productName: string;
  variantName: string;
  publishedAt: string;
};

const groupsStorageKey = "moon-publication-groups";
const logStorageKey = "moon-publication-log";

const postAngles = [
  "Vidriera Patricia",
  "Directa",
  "Promo",
  "Envios",
  "Ultimas unidades",
  "Consulta por talle",
];

const defaultBrandName = "Indumentaria Moon";
const defaultPhone = "1122530890";
const defaultWhatsAppLink = "https://wa.link/os85q6";
const defaultPickupPoint = "YPF de Rodriguez";

function formatPrice(value: number) {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function parseGroups(raw: string): GroupTarget[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = "", url = "", channel = "Facebook", notes = ""] = line
        .split("|")
        .map((part) => part.trim());

      return {
        id: crypto.randomUUID(),
        name: name || "Grupo sin nombre",
        url,
        channel: channel.toLowerCase().includes("whatsapp") ? "WhatsApp" : "Facebook",
        notes,
      };
    });
}

function buildGroupText(groups: GroupTarget[]) {
  return groups
    .map((group) => [group.name, group.url, group.channel, group.notes].filter(Boolean).join(" | "))
    .join("\n");
}

function loadSavedGroups() {
  if (typeof window === "undefined") return [];

  try {
    const savedGroups = localStorage.getItem(groupsStorageKey);
    return savedGroups ? (JSON.parse(savedGroups) as GroupTarget[]) : [];
  } catch {
    return [];
  }
}

function loadSavedLogs() {
  if (typeof window === "undefined") return [];

  try {
    const savedLogs = localStorage.getItem(logStorageKey);
    return savedLogs ? (JSON.parse(savedLogs) as PublishLog[]) : [];
  } catch {
    return [];
  }
}

function buildPost(
  product: Product | undefined,
  angle: string,
  extra: string,
  origin: string,
  brandName: string,
  phone: string,
  whatsAppLink: string,
  pickupPoint: string
) {
  if (!product) return "";

  const price = product.salePrice ?? product.basePrice;
  const oldPrice =
    product.salePrice != null ? ` Antes ${formatPrice(product.basePrice)}.` : "";
  const stockVariants = product.variants
    .filter((variant) => variant.stock > 0)
    .slice(0, 8)
    .map((variant) => `${variant.size} ${variant.color}`.trim())
    .filter(Boolean);
  const sizes = stockVariants.length > 0 ? `\nTalles/colores disponibles: ${stockVariants.join(", ")}.` : "";
  const link = `${origin}/productos/${product.slug}`;
  const description = product.description ? `\n${product.description}` : "";
  const extraLine = extra.trim() ? `\n${extra.trim()}` : "";
  const brand = brandName.trim() || defaultBrandName;
  const contactPhone = phone.trim() || defaultPhone;
  const contactLink = whatsAppLink.trim() || defaultWhatsAppLink;
  const pickup = pickupPoint.trim() || defaultPickupPoint;

  const templates: Record<string, string> = {
    "Vidriera Patricia": `${brand}\n\nEntrega inmediata\n${contactPhone}\n\nAgendanos como ${brand} ${contactLink}.\nMandanos hola y te sumamos a los estados con ingresos semanales.\n\nHago punto de encuentro en la ${pickup}\n\nProducto destacado: ${product.name}\nPrecio: ${formatPrice(price)}.${oldPrice}${sizes}${extraLine}\n\nMas fotos y compra online: ${link}`,
    Directa: `${product.name}\n${description}\nPrecio: ${formatPrice(price)}.${oldPrice}${sizes}${extraLine}\nConsultanos por WhatsApp o compra directo aca: ${link}`,
    Promo: `Promo disponible: ${product.name}\n${description}\nHoy queda en ${formatPrice(price)}.${oldPrice}${sizes}${extraLine}\nMira fotos y detalles aca: ${link}`,
    Envios: `${product.name} con envios a todo el pais\n${description}\nPrecio: ${formatPrice(price)}.${oldPrice}${sizes}${extraLine}\nCompra online o consultanos: ${link}`,
    "Ultimas unidades": `Ultimas unidades de ${product.name}\n${description}\nPrecio: ${formatPrice(price)}.${oldPrice}${sizes}${extraLine}\nDejo el link con fotos y compra: ${link}`,
    "Consulta por talle": `${product.name}\n${description}\nPrecio: ${formatPrice(price)}.${oldPrice}${sizes}${extraLine}\nPasame tu talle/color y te confirmo stock. Tambien podes verlo aca: ${link}`,
  };

  return templates[angle] ?? templates.Directa;
}

export default function PublicacionesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [angle, setAngle] = useState(postAngles[0]);
  const [extra, setExtra] = useState("Ingresos semanales. Consultanos por talles y colores disponibles.");
  const [brandName, setBrandName] = useState(defaultBrandName);
  const [phone, setPhone] = useState(defaultPhone);
  const [whatsAppLink, setWhatsAppLink] = useState(defaultWhatsAppLink);
  const [pickupPoint, setPickupPoint] = useState(defaultPickupPoint);
  const [groups, setGroups] = useState<GroupTarget[]>([]);
  const [groupDraft, setGroupDraft] = useState("");
  const [logs, setLogs] = useState<PublishLog[]>([]);
  const [copied, setCopied] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    window.setTimeout(() => {
      const savedGroups = loadSavedGroups();
      setGroups(savedGroups);
      setGroupDraft(buildGroupText(savedGroups));
      setLogs(loadSavedLogs());
    }, 0);
  }, []);

  useEffect(() => {
    fetch("/api/productos")
      .then((res) => res.json())
      .then((data: Product[]) => {
        setProducts(data);
        if (data[0]) setSelectedProductId(data[0].id);
      })
      .finally(() => setLoadingProducts(false));
  }, []);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId),
    [products, selectedProductId]
  );

  const postText = useMemo(
    () =>
      buildPost(
        selectedProduct,
        angle,
        extra,
        typeof window === "undefined" ? "" : window.location.origin,
        brandName,
        phone,
        whatsAppLink,
        pickupPoint
      ),
    [selectedProduct, angle, extra, brandName, phone, whatsAppLink, pickupPoint]
  );

  const todayLogs = useMemo(
    () => logs.filter((log) => log.publishedAt.startsWith(getTodayKey())),
    [logs]
  );

  const publishedGroupIds = useMemo(
    () => new Set(todayLogs.map((log) => log.groupId)),
    [todayLogs]
  );

  function saveGroups() {
    const parsedGroups = parseGroups(groupDraft);
    setGroups(parsedGroups);
    localStorage.setItem(groupsStorageKey, JSON.stringify(parsedGroups));
  }

  async function copyPost() {
    await navigator.clipboard.writeText(postText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function openGroup(group: GroupTarget) {
    if (!group.url) return;
    window.open(group.url, "_blank", "noopener,noreferrer");
  }

  function markPublished(group: GroupTarget) {
    if (!selectedProduct) return;

    const nextLogs = [
      {
        id: crypto.randomUUID(),
        groupId: group.id,
        groupName: group.name,
        productName: selectedProduct.name,
        variantName: angle,
        publishedAt: new Date().toISOString(),
      },
      ...logs,
    ];

    setLogs(nextLogs);
    localStorage.setItem(logStorageKey, JSON.stringify(nextLogs));
  }

  function removeLog(logId: string) {
    const nextLogs = logs.filter((log) => log.id !== logId);
    setLogs(nextLogs);
    localStorage.setItem(logStorageKey, JSON.stringify(nextLogs));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Copiloto de publicaciones</h1>
          <p className="mt-1 text-sm text-gray-400">
            Prepara textos, abre grupos y registra donde ya se publico.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:w-72">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
            <p className="text-xs text-gray-500">Grupos</p>
            <p className="text-xl font-bold text-white">{groups.length}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
            <p className="text-xs text-gray-500">Hoy</p>
            <p className="text-xl font-bold text-white">{todayLogs.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
        <section className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="size-5 text-emerald-400" />
              <h2 className="font-semibold text-white">Publicacion</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="product">Producto</Label>
                <select
                  id="product"
                  value={selectedProductId}
                  onChange={(event) => setSelectedProductId(event.target.value)}
                  className="mt-2 h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-zinc-500"
                  disabled={loadingProducts || products.length === 0}
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="angle">Enfoque</Label>
                <select
                  id="angle"
                  value={angle}
                  onChange={(event) => setAngle(event.target.value)}
                  className="mt-2 h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-zinc-500"
                >
                  {postAngles.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="brandName">Nombre publicado</Label>
                <Input
                  id="brandName"
                  value={brandName}
                  onChange={(event) => setBrandName(event.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="whatsAppLink">Link de WhatsApp</Label>
                <Input
                  id="whatsAppLink"
                  value={whatsAppLink}
                  onChange={(event) => setWhatsAppLink(event.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="pickupPoint">Punto de encuentro</Label>
                <Input
                  id="pickupPoint"
                  value={pickupPoint}
                  onChange={(event) => setPickupPoint(event.target.value)}
                  className="mt-2"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="extra">Dato extra fijo para esta tanda</Label>
                <Input
                  id="extra"
                  value={extra}
                  onChange={(event) => setExtra(event.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[160px_1fr]">
              <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
                {selectedProduct?.images[0]?.url ? (
                  <img
                    src={selectedProduct.images[0].url}
                    alt={selectedProduct.name}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center text-sm text-gray-500">
                    Sin imagen
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="postText">Texto listo para copiar</Label>
                <Textarea
                  id="postText"
                  value={postText}
                  readOnly
                  rows={10}
                  className="mt-2 resize-none bg-zinc-950 text-gray-100"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button onClick={copyPost} disabled={!postText}>
                    {copied ? <Check /> : <Clipboard />}
                    {copied ? "Copiado" : "Copiar texto"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAngle(postAngles[(postAngles.indexOf(angle) + 1) % postAngles.length])}
                  >
                    <RotateCcw />
                    Cambiar enfoque
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MessageSquareText className="size-5 text-cyan-400" />
                <h2 className="font-semibold text-white">Grupos de trabajo</h2>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={saveGroups}>
                <Plus />
                Guardar lista
              </Button>
            </div>

            <Label htmlFor="groups">
              Pegalos como: Nombre | URL | Facebook o WhatsApp | nota opcional
            </Label>
            <Textarea
              id="groups"
              value={groupDraft}
              onChange={(event) => setGroupDraft(event.target.value)}
              rows={7}
              className="mt-2 resize-none bg-zinc-950 text-gray-100"
              placeholder="Ventas Zona Norte | https://facebook.com/groups/... | Facebook | ropa femenina"
            />
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-white">Tanda de hoy</h2>
            <div className="max-h-[520px] space-y-3 overflow-auto pr-1">
              {groups.length === 0 ? (
                <p className="text-sm text-gray-400">
                  Carga y guarda grupos para armar la rutina diaria.
                </p>
              ) : (
                groups.map((group) => {
                  const published = publishedGroupIds.has(group.id);

                  return (
                    <div key={group.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">{group.name}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {group.channel}
                            {group.notes ? ` - ${group.notes}` : ""}
                          </p>
                        </div>
                        {published && (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
                            Publicado
                          </span>
                        )}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => openGroup(group)}
                          disabled={!group.url}
                        >
                          <ExternalLink />
                          Abrir
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => markPublished(group)}
                          disabled={published || !selectedProduct}
                        >
                          <Check />
                          Marcar
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-white">Registro reciente</h2>
            <div className="space-y-2">
              {logs.slice(0, 8).map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{log.groupName}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {log.productName} - {new Date(log.publishedAt).toLocaleString("es-AR")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    onClick={() => removeLog(log.id)}
                    aria-label="Borrar registro"
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
              {logs.length === 0 && <p className="text-sm text-gray-400">Todavia no hay registros.</p>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
