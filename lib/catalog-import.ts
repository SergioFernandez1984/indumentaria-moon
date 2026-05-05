export interface CatalogImportRow {
  name: string;
  description?: string;
  basePrice: number;
  salePrice?: number | null;
  category?: string;
  sizes?: string[];
  colors?: string[];
  stock?: number;
  imageUrls?: string[];
  isActive?: boolean;
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitList(value?: string) {
  if (!value) return [];
  return value
    .split(/[|,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseMoney(value?: string) {
  if (!value) return null;
  const normalized = value.replace(/\./g, "").replace(",", ".").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

export function parseCatalogCsv(csv: string): CatalogImportRow[] {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());

  return lines.slice(1).map((line, index) => {
    const cells = parseCsvLine(line);
    const record = Object.fromEntries(headers.map((header, i) => [header, cells[i] ?? ""]));

    const basePrice = parseMoney(record.basePrice || record.precio);
    if (!record.name && !record.nombre) {
      throw new Error(`Fila ${index + 2}: falta el nombre del producto.`);
    }
    if (basePrice == null) {
      throw new Error(`Fila ${index + 2}: falta un precio valido.`);
    }

    return {
      name: record.name || record.nombre,
      description: record.description || record.descripcion || "",
      basePrice,
      salePrice: parseMoney(record.salePrice || record.precioOferta),
      category: record.category || record.categoria || "",
      sizes: splitList(record.sizes || record.talles),
      colors: splitList(record.colors || record.colores),
      stock: Number(record.stock || 0),
      imageUrls: splitList(record.imageUrls || record.imagenes),
      isActive: record.isActive ? record.isActive !== "false" : true,
    };
  });
}

export const CATALOG_CSV_TEMPLATE =
  "name,description,basePrice,salePrice,category,sizes,colors,stock,imageUrls\n" +
  '"Remera basica","Algodon peinado, calce regular",15000,,Remeras,"S|M|L","Blanco|Negro",5,"https://...jpg|https://...jpg"';
