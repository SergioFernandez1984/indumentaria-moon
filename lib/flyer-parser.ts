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
  const compact = text.replace(/(?<=\d)\s+(?=\d)/g, "");
  const matches = [...compact.matchAll(/\$?\s?(\d{1,3}(?:[.\s]\d{2,3})+|\d{4,6})/g)];

  for (const match of matches) {
    const raw = match[1];
    const digits = raw.replace(/[.\s]/g, "");
    let parsed = Number(digits);

    if (!Number.isFinite(parsed)) continue;

    if (/\d{1,3}\.\d{2}$/.test(raw) && parsed < 10000) {
      parsed *= 10;
    }

    if (parsed > 200000 && digits.length === 6 && digits.startsWith("5")) {
      parsed = Number(digits.slice(1));
    }

    if (parsed >= 1000 && parsed <= 200000) return parsed;
  }

  return null;
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
    .filter((line) => /[a-zA-ZáéíóúñÁÉÍÓÚÑ]/.test(line))
    .filter((line) => line.replace(/[^a-zA-ZáéíóúñÁÉÍÓÚÑ]/g, "").length >= 3)
    .filter((line) => !/\$?\s?\d{1,3}(?:[.\s]\d{3})+/.test(line))
    .filter((line) => !/^talle\b|^abarca\b|cede bastante/i.test(line));

  const productLineIndex = lines.findIndex((line) =>
    /vestido|conjunto|remera|musculosa|top|short|pantalon|pollera/i.test(line)
  );

  if (productLineIndex >= 0) {
    const productLine = lines[productLineIndex];
    const nextLine = lines[productLineIndex + 1];
    const materialLine =
      nextLine && nextLine.length <= 24 && !/vestido|conjunto|remera|musculosa|top|short|pantalon|pollera/i.test(nextLine)
        ? ` ${nextLine}`
        : "";

    return titleCase(`${productLine}${materialLine}`);
  }

  return titleCase(lines[0] ?? "Producto");
}

export function parseFlyerText(text: string, imageUrl = ""): FlyerDraft {
  const name = parseName(text);
  const price = parsePrice(text);
  const sizeText = text
    .replace(/\$?\s?\d{1,3}(?:[.\s]\d{3})+|\$?\s?\d{4,6}/g, " ")
    .replace(/(\d)\s*al\s*(\d)/gi, "$1-$2");
  const sizes = parseSizes(sizeText);
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

export function validateFlyerDraft(draft: FlyerDraft) {
  const hasUsefulName = draft.name !== "Producto" && draft.name.length >= 3;
  const hasPrice = draft.basePrice != null && draft.basePrice > 0;

  if (!hasUsefulName && !hasPrice) {
    return "No pude leer nombre ni precio de esta imagen. Revisala manualmente o cargala como producto rapido.";
  }

  if (!hasUsefulName) {
    return "No pude leer un nombre confiable de esta imagen.";
  }

  if (!hasPrice) {
    return "No pude leer un precio confiable de esta imagen.";
  }

  return null;
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
