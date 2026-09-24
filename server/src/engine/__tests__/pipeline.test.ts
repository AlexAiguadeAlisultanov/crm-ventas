import { describe, expect, it } from "vitest";
import { diasSinActividad, estaEstancada, probabilidadPorDefecto, transicionOportunidad } from "../pipeline.js";

describe("transicionOportunidad", () => {
  it("permite mover una oportunidad abierta entre etapas normales", () => {
    expect(transicionOportunidad("prospecto", "cualificada", { rol: "comercial" })).toEqual({ permitido: true });
  });

  it("exige motivo para marcar una oportunidad como perdida", () => {
    const resultado = transicionOportunidad("negociacion", "perdida", { rol: "comercial" });
    expect(resultado.permitido).toBe(false);
  });

  it("acepta la pérdida si viene con motivo", () => {
    const resultado = transicionOportunidad("negociacion", "perdida", {
      rol: "comercial",
      motivoPerdida: "El cliente eligió a otro proveedor"
    });
    expect(resultado.permitido).toBe(true);
  });

  it("un comercial no puede reabrir una oportunidad ganada", () => {
    const resultado = transicionOportunidad("ganada", "negociacion", { rol: "comercial" });
    expect(resultado.permitido).toBe(false);
  });

  it("un comercial no puede reabrir una oportunidad perdida", () => {
    const resultado = transicionOportunidad("perdida", "prospecto", { rol: "comercial" });
    expect(resultado.permitido).toBe(false);
  });

  it("el director sí puede reabrir una oportunidad cerrada", () => {
    expect(transicionOportunidad("ganada", "negociacion", { rol: "director" })).toEqual({ permitido: true });
    expect(transicionOportunidad("perdida", "propuesta", { rol: "director" })).toEqual({ permitido: true });
  });

  it("quedarse en la misma etapa siempre está permitido", () => {
    expect(transicionOportunidad("ganada", "ganada", { rol: "comercial" })).toEqual({ permitido: true });
  });
});

describe("probabilidadPorDefecto", () => {
  it("asigna la probabilidad de cada etapa del embudo", () => {
    expect(probabilidadPorDefecto("prospecto")).toBe(10);
    expect(probabilidadPorDefecto("ganada")).toBe(100);
    expect(probabilidadPorDefecto("perdida")).toBe(0);
  });
});

describe("diasSinActividad y estaEstancada", () => {
  it("cuenta los días completos desde la última actividad", () => {
    const hace5dias = new Date("2026-09-20T10:00:00Z");
    const ahora = new Date("2026-09-25T10:00:00Z");
    expect(diasSinActividad(hace5dias.toISOString(), ahora)).toBe(5);
  });

  it("marca como estancada una oportunidad abierta que supera el umbral", () => {
    const hace10dias = new Date("2026-09-15T10:00:00Z");
    const ahora = new Date("2026-09-25T10:00:00Z");
    expect(estaEstancada(hace10dias.toISOString(), "propuesta", 7, ahora)).toBe(true);
    expect(estaEstancada(hace10dias.toISOString(), "propuesta", 15, ahora)).toBe(false);
  });

  it("una oportunidad cerrada nunca está estancada", () => {
    const hace30dias = new Date("2026-08-26T10:00:00Z");
    const ahora = new Date("2026-09-25T10:00:00Z");
    expect(estaEstancada(hace30dias.toISOString(), "ganada", 7, ahora)).toBe(false);
    expect(estaEstancada(hace30dias.toISOString(), "perdida", 7, ahora)).toBe(false);
  });
});
