import type { Idioma } from "./i18n/diccionario";

const LOCALES: Record<Idioma, string> = {
  es: "es-ES",
  ca: "ca-ES",
  en: "en-GB"
};

export function formatearImporte(valor: number, idioma: Idioma): string {
  return new Intl.NumberFormat(LOCALES[idioma], {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(valor);
}

export function formatearFecha(iso: string, idioma: Idioma): string {
  if (!iso) return "";
  const fecha = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  return new Intl.DateTimeFormat(LOCALES[idioma], { day: "2-digit", month: "short", year: "numeric" }).format(fecha);
}

export function formatearFechaHora(iso: string, idioma: Idioma): string {
  const fecha = new Date(iso);
  return new Intl.DateTimeFormat(LOCALES[idioma], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(fecha);
}
