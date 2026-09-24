import type { Oportunidad, Usuario } from "../types.js";

/** Un comercial solo edita sus propias oportunidades; el director las edita todas. */
export function puedeEditarOportunidad(usuario: Usuario, oportunidad: Pick<Oportunidad, "propietarioId">): boolean {
  if (usuario.rol === "director") return true;
  return usuario.id === oportunidad.propietarioId;
}

/** Reasignar el propietario de una oportunidad es cosa del director. */
export function puedeReasignar(usuario: Usuario): boolean {
  return usuario.rol === "director";
}

/** La previsión agregada de todo el equipo solo la ve el director. */
export function puedeVerPrevisionGlobal(usuario: Usuario): boolean {
  return usuario.rol === "director";
}
