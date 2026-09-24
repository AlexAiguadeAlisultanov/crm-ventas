import { PROBABILIDAD_POR_ETAPA, type Etapa, type Rol } from "../types.js";

const ETAPAS_FINALES: ReadonlySet<Etapa> = new Set(["ganada", "perdida"]);

export interface ContextoTransicion {
  rol: Rol;
  motivoPerdida?: string | null;
}

export interface ResultadoTransicion {
  permitido: boolean;
  motivo?: string;
}

/**
 * Decide si una oportunidad puede pasar de una etapa a otra.
 * Ganada y perdida son finales: solo el director puede reabrirlas.
 * Entrar en perdida exige motivo.
 */
export function transicionOportunidad(
  etapaActual: Etapa,
  etapaNueva: Etapa,
  contexto: ContextoTransicion
): ResultadoTransicion {
  if (etapaActual === etapaNueva) return { permitido: true };

  if (ETAPAS_FINALES.has(etapaActual) && contexto.rol !== "director") {
    return {
      permitido: false,
      motivo: "Esta oportunidad ya está cerrada. Solo el director comercial puede reabrirla."
    };
  }

  if (etapaNueva === "perdida" && !contexto.motivoPerdida?.trim()) {
    return { permitido: false, motivo: "Indica el motivo antes de marcarla como perdida." };
  }

  return { permitido: true };
}

/** Probabilidad por defecto al entrar en una etapa, salvo que se fije una a mano. */
export function probabilidadPorDefecto(etapa: Etapa): number {
  return PROBABILIDAD_POR_ETAPA[etapa];
}

/** Días transcurridos desde la última actividad registrada, para detectar oportunidades paradas. */
export function diasSinActividad(ultimaActividadEn: string, ahora: Date = new Date()): number {
  const ultima = new Date(ultimaActividadEn).getTime();
  const diferencia = ahora.getTime() - ultima;
  return Math.max(0, Math.floor(diferencia / (1000 * 60 * 60 * 24)));
}

export function estaEstancada(
  ultimaActividadEn: string,
  etapa: Etapa,
  umbralDias: number,
  ahora: Date = new Date()
): boolean {
  if (ETAPAS_FINALES.has(etapa)) return false;
  return diasSinActividad(ultimaActividadEn, ahora) >= umbralDias;
}
