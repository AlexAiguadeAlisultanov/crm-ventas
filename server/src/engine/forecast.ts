import { ETAPAS_EMBUDO, type Etapa, type Oportunidad } from "../types.js";

/** Importe ponderado por la probabilidad de cierre. */
export function importePonderado(oportunidad: Pick<Oportunidad, "importe" | "probabilidad">): number {
  return Math.round(oportunidad.importe * (oportunidad.probabilidad / 100) * 100) / 100;
}

/** Previsión total: suma ponderada de todo lo que sigue abierto o ya se ha ganado. */
export function previsionTotal(oportunidades: Oportunidad[]): number {
  return oportunidades
    .filter((o) => o.etapa !== "perdida")
    .reduce((suma, o) => suma + importePonderado(o), 0);
}

/** Previsión ponderada agrupada por mes de cierre previsto (clave AAAA-MM). */
export function previsionPorMes(oportunidades: Oportunidad[]): Record<string, number> {
  const resultado: Record<string, number> = {};
  for (const o of oportunidades) {
    if (o.etapa === "perdida") continue;
    const mes = o.fechaCierrePrevista.slice(0, 7);
    resultado[mes] = Math.round(((resultado[mes] ?? 0) + importePonderado(o)) * 100) / 100;
  }
  return resultado;
}

/** Previsión ponderada agrupada por comercial. */
export function previsionPorComercial(oportunidades: Oportunidad[]): Record<string, number> {
  const resultado: Record<string, number> = {};
  for (const o of oportunidades) {
    if (o.etapa === "perdida") continue;
    resultado[o.propietarioId] = Math.round(((resultado[o.propietarioId] ?? 0) + importePonderado(o)) * 100) / 100;
  }
  return resultado;
}

export interface EscalonEmbudo {
  etapa: Etapa;
  cantidad: number;
  tasaConversion: number | null;
}

/**
 * Embudo de conversión: cuántas oportunidades han llegado, como mínimo, a cada
 * etapa (una negociación cuenta también para prospecto y cualificada, porque
 * ya pasó por ahí), y qué proporción avanza de un escalón al siguiente.
 */
export function embudoConversion(oportunidades: Oportunidad[]): EscalonEmbudo[] {
  const indiceEtapa: Record<Etapa, number> = Object.fromEntries(
    ETAPAS_EMBUDO.map((etapa, i) => [etapa, i])
  ) as Record<Etapa, number>;

  return ETAPAS_EMBUDO.map((etapa, i) => {
    const cantidad = oportunidades.filter((o) => {
      if (o.etapa === "perdida") return false;
      return indiceEtapa[o.etapa] >= i;
    }).length;
    return { etapa, cantidad, tasaConversion: null as number | null };
  }).map((escalon, i, todos) => {
    if (i === 0) return escalon;
    const anterior = todos[i - 1]!;
    const tasaConversion = anterior.cantidad === 0 ? 0 : Math.round((escalon.cantidad / anterior.cantidad) * 1000) / 10;
    return { ...escalon, tasaConversion };
  });
}

/** Ciclo medio de venta en días, contando solo las oportunidades ganadas. */
export function cicloMedioVentaDias(oportunidades: Oportunidad[]): number | null {
  const ganadas = oportunidades.filter((o) => o.etapa === "ganada");
  if (ganadas.length === 0) return null;
  const dias = ganadas.map((o) => {
    const inicio = new Date(o.creadaEn).getTime();
    const fin = new Date(o.actualizadaEn).getTime();
    return Math.max(0, (fin - inicio) / (1000 * 60 * 60 * 24));
  });
  const media = dias.reduce((a, b) => a + b, 0) / dias.length;
  return Math.round(media);
}
