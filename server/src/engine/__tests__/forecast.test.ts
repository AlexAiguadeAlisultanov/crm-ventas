import { describe, expect, it } from "vitest";
import {
  cicloMedioVentaDias,
  embudoConversion,
  importePonderado,
  previsionPorComercial,
  previsionPorMes,
  previsionTotal
} from "../forecast.js";
import type { Oportunidad } from "../../types.js";

function crearOportunidad(datos: Partial<Oportunidad>): Oportunidad {
  return {
    id: "op-1",
    empresaId: "emp-1",
    nombre: "Oportunidad",
    importe: 1000,
    probabilidad: 50,
    etapa: "propuesta",
    fechaCierrePrevista: "2026-10-15",
    propietarioId: "u-1",
    creadaEn: "2026-09-01T00:00:00.000Z",
    actualizadaEn: "2026-09-20T00:00:00.000Z",
    motivoPerdida: null,
    ultimaActividadEn: "2026-09-20T00:00:00.000Z",
    ...datos
  };
}

describe("importePonderado", () => {
  it("multiplica el importe por la probabilidad", () => {
    expect(importePonderado({ importe: 2000, probabilidad: 30 })).toBe(600);
  });
});

describe("previsionTotal", () => {
  it("suma solo las oportunidades que no están perdidas", () => {
    const oportunidades = [
      crearOportunidad({ importe: 1000, probabilidad: 50 }), // 500
      crearOportunidad({ importe: 2000, probabilidad: 100, etapa: "ganada" }), // 2000
      crearOportunidad({ importe: 5000, probabilidad: 0, etapa: "perdida" }) // excluida
    ];
    expect(previsionTotal(oportunidades)).toBe(2500);
  });
});

describe("previsionPorMes", () => {
  it("agrupa por el mes de la fecha de cierre prevista", () => {
    const oportunidades = [
      crearOportunidad({ importe: 1000, probabilidad: 50, fechaCierrePrevista: "2026-10-05" }),
      crearOportunidad({ importe: 2000, probabilidad: 25, fechaCierrePrevista: "2026-10-20" }),
      crearOportunidad({ importe: 4000, probabilidad: 50, fechaCierrePrevista: "2026-11-01" })
    ];
    expect(previsionPorMes(oportunidades)).toEqual({
      "2026-10": 1000, // 500 + 500
      "2026-11": 2000
    });
  });
});

describe("previsionPorComercial", () => {
  it("agrupa por propietario de la oportunidad", () => {
    const oportunidades = [
      crearOportunidad({ importe: 1000, probabilidad: 50, propietarioId: "sergi" }),
      crearOportunidad({ importe: 3000, probabilidad: 50, propietarioId: "ana" })
    ];
    expect(previsionPorComercial(oportunidades)).toEqual({ sergi: 500, ana: 1500 });
  });
});

describe("embudoConversion", () => {
  it("cuenta cuántas oportunidades han llegado a cada etapa o más allá", () => {
    const oportunidades = [
      crearOportunidad({ etapa: "prospecto" }),
      crearOportunidad({ etapa: "cualificada" }),
      crearOportunidad({ etapa: "propuesta" }),
      crearOportunidad({ etapa: "ganada" }),
      crearOportunidad({ etapa: "perdida" })
    ];
    const embudo = embudoConversion(oportunidades);
    expect(embudo.find((e) => e.etapa === "prospecto")?.cantidad).toBe(4);
    expect(embudo.find((e) => e.etapa === "ganada")?.cantidad).toBe(1);
  });

  it("calcula la tasa de conversión entre escalones consecutivos", () => {
    const oportunidades = [
      crearOportunidad({ etapa: "prospecto" }),
      crearOportunidad({ etapa: "prospecto" }),
      crearOportunidad({ etapa: "cualificada" })
    ];
    const embudo = embudoConversion(oportunidades);
    const cualificada = embudo.find((e) => e.etapa === "cualificada");
    expect(cualificada?.cantidad).toBe(1);
    expect(cualificada?.tasaConversion).toBe(33.3);
  });
});

describe("cicloMedioVentaDias", () => {
  it("calcula la media de días entre la creación y el cierre de las ganadas", () => {
    const oportunidades = [
      crearOportunidad({ etapa: "ganada", creadaEn: "2026-08-01T00:00:00.000Z", actualizadaEn: "2026-08-11T00:00:00.000Z" }),
      crearOportunidad({ etapa: "ganada", creadaEn: "2026-08-01T00:00:00.000Z", actualizadaEn: "2026-08-21T00:00:00.000Z" }),
      crearOportunidad({ etapa: "perdida", creadaEn: "2026-08-01T00:00:00.000Z", actualizadaEn: "2026-08-02T00:00:00.000Z" })
    ];
    expect(cicloMedioVentaDias(oportunidades)).toBe(15);
  });

  it("devuelve null si no hay ninguna oportunidad ganada", () => {
    expect(cicloMedioVentaDias([crearOportunidad({ etapa: "prospecto" })])).toBeNull();
  });
});
