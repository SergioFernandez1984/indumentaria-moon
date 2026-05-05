export interface FlyerDraft {
  name: string;
  description: string;
  basePrice: number | null;
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
  imageUrls: string[];
  confidence: number;
  rawText: string;
}

const COLOR_WORDS = [
  "Blanco",
  "Negro",
  "Gris",
  "Marron",
  "Chocolate",
  "Camel",
  "Beige",
  "Rosa",
  "Fucsia",
  "Rojo",
  "Azul",
  "Celeste",
  "Verde",
  "Militar",
  "Lila",
  "Violeta",
  "Naranja",
  "Amarillo",
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value: string) {
  return normalize(value)
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function parsePrice(text: string) {
  const match = text.match(/\$?\s?(\d{1,3}(?:[.\s]\d{3})+|\d{4,6})/);
  if (!match) return null;
  const parsed = Number(match[1].replace(/[.\s]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseSizes(text: string) {
  const normalized = normalize(text).toLowerCase();
  if (/talle\s+unico|talle\s+unica|talle\s+u\b/.test(normalized)) return ["Unico"];

  const sizeMatch =
    normalized.match(/(?:talle|talles|abarca\s+del|abarca)\s*(?:del)?\s*([0-9xsmlxl\s\-–—al]+)/i) ??
    normalized.match(/\b([1-9](?:\s*[-–—]\s*[1-9]){1,5})\b/);

  if (!sizeMatch) return [];

  const raw = sizeMatch[1].replace(/\bal\b/g, "-");
  const range = raw.match(/(\d)\s*[-–—]\s*(\d)/);
  if (range && Number(range[2]) - Number(range[1]) > 1) {
    const start = Number(range[1]);
    const end = Number(range[2]);
    return Array.from({ length: end - start + 1 }, (_, index) => String(start + index));
  }

  return raw
    .split(/[-–—,\s]+/)
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
}

function parseColors(text: string) {
  const normalized = normalize(text).toLowerCase();
  return COLOR_WORDS.filter((color) => normalized.includes(normalize(color).toLowerCase()));
}

function inferCategory(name: string) {
  const normalized = normalize(name).toLowerCase();
  if (normalized.includes("vestido")) return "Vestidos";
  if (normalized.includes("conjunto")) return "Conjuntos";
  if (normalized.includes("remera") || normalized.includes("musculosa") || normalized.includes("top")) return "Remeras y tops";
  if (normalized.includes("short")) return "Shorts";
  if (normalized.includes("pantalon") || normalized.includes("palazzo")) return "Pantalones";
  return "Indumentaria";
}

function parseName(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => normalize(line))
    .filter(Boolean)
    .filter((line) => !/\$?\s?\d{1,3}(?:[.\s]\d{3})+/.test(line))
    .filter((line) => !/^talle\b|^abarca\b|cede bastante/i.test(line));

  const best = lines
    .filter((line) => /vestido|conjunto|remera|musculosa|top|short|pantalon|pollera/i.test(line))
    .sort((a, b) => b.length - a.length)[0];

  return titleCase(best ?? lines[0] ?? "Producto");
}

export function parseFlyerText(text: string, imageUrl = ""): FlyerDraft {
  const name = parseName(text);
  const price = parsePrice(text);
  const sizes = parseSizes(text);
  const colors = parseColors(text);

  return {
    name,
    description: "Producto importado desde publicacion. Revisar descripcion antes de publicar.",
    basePrice: price,
    category: inferCategory(name),
    sizes,
    colors,
    stock: 1,
    imageUrls: imageUrl ? [imageUrl] : [],
    confidence: [name !== "Producto", price != null, sizes.length > 0].filter(Boolean).length / 3,
    rawText: text.trim(),
  };
}

export function flyerDraftToCsvLine(draft: FlyerDraft) {
  const values = [
    draft.name,
    draft.description,
    draft.basePrice?.toString() ?? "",
    "",
    draft.category,
    draft.sizes.join("|"),
    draft.colors.join("|"),
    draft.stock.toString(),
    draft.imageUrls.join("|"),
  ];

  return values
    .map((value) => `"${String(value).replace(/"/g, '""')}"`)
    .join(",");
}
