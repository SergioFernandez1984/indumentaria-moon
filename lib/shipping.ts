export const ARGENTINA_PROVINCES = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Cordoba",
  "Corrientes",
  "Entre Rios",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquen",
  "Rio Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucuman",
] as const;

export type Province = (typeof ARGENTINA_PROVINCES)[number];

const FREE_SHIPPING_FROM = 90000;
const BASE_SHIPPING_COST = 6500;
const PATAGONIA_SHIPPING_COST = 8500;

const PATAGONIA = new Set<Province>([
  "Chubut",
  "La Pampa",
  "Neuquen",
  "Rio Negro",
  "Santa Cruz",
  "Tierra del Fuego",
]);

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function isUshuaia(city: string) {
  return normalize(city) === "ushuaia";
}

export function isValidProvince(province: string): province is Province {
  return ARGENTINA_PROVINCES.includes(province as Province);
}

export function getShippingCost(subtotal: number, province: string, city: string) {
  if (isUshuaia(city)) {
    return {
      allowed: false,
      cost: 0,
      message:
        "Por ahora no hacemos envios a Ushuaia. Escribinos y vemos una alternativa.",
    };
  }

  if (!isValidProvince(province)) {
    return {
      allowed: false,
      cost: 0,
      message: "Elegí una provincia valida para calcular el envio.",
    };
  }

  if (subtotal >= FREE_SHIPPING_FROM) {
    return {
      allowed: true,
      cost: 0,
      message: "Envio gratis por superar el minimo de compra.",
    };
  }

  const cost = PATAGONIA.has(province) ? PATAGONIA_SHIPPING_COST : BASE_SHIPPING_COST;

  return {
    allowed: true,
    cost,
    message: `Envio a ${province}: $${cost.toLocaleString("es-AR")}.`,
  };
}

export const SHIPPING_COPY = {
  freeFrom: FREE_SHIPPING_FROM,
  baseCost: BASE_SHIPPING_COST,
  patagoniaCost: PATAGONIA_SHIPPING_COST,
};
