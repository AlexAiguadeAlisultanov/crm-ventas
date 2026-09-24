import { describe, expect, it } from "vitest";
import { puedeEditarOportunidad, puedeReasignar, puedeVerPrevisionGlobal } from "../permisos.js";
import type { Usuario } from "../../types.js";

const sergi: Usuario = { id: "sergi", email: "sergi@empresa.test", nombre: "Sergi", rol: "comercial" };
const ana: Usuario = { id: "ana", email: "ana@empresa.test", nombre: "Ana", rol: "comercial" };
const direccion: Usuario = { id: "direccion", email: "direccion@empresa.test", nombre: "Dirección", rol: "director" };

describe("puedeEditarOportunidad", () => {
  it("un comercial edita sus propias oportunidades", () => {
    expect(puedeEditarOportunidad(sergi, { propietarioId: "sergi" })).toBe(true);
  });

  it("un comercial no edita las de otro compañero", () => {
    expect(puedeEditarOportunidad(sergi, { propietarioId: "ana" })).toBe(false);
    expect(puedeEditarOportunidad(ana, { propietarioId: "sergi" })).toBe(false);
  });

  it("el director edita cualquier oportunidad", () => {
    expect(puedeEditarOportunidad(direccion, { propietarioId: "sergi" })).toBe(true);
    expect(puedeEditarOportunidad(direccion, { propietarioId: "ana" })).toBe(true);
  });
});

describe("puedeReasignar y puedeVerPrevisionGlobal", () => {
  it("solo el director reasigna oportunidades", () => {
    expect(puedeReasignar(sergi)).toBe(false);
    expect(puedeReasignar(direccion)).toBe(true);
  });

  it("solo el director ve la previsión de todo el equipo", () => {
    expect(puedeVerPrevisionGlobal(sergi)).toBe(false);
    expect(puedeVerPrevisionGlobal(direccion)).toBe(true);
  });
});
