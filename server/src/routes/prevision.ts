import { Router } from "express";
import { db } from "../db.js";
import { requiereSesion } from "../auth.js";
import {
  cicloMedioVentaDias,
  embudoConversion,
  previsionPorComercial,
  previsionPorMes,
  previsionTotal
} from "../engine/forecast.js";
import { puedeVerPrevisionGlobal } from "../engine/permisos.js";
import { mapOportunidad } from "../serializadores.js";

export const rutasPrevision = Router();
rutasPrevision.use(requiereSesion);

rutasPrevision.get("/", (req, res) => {
  const usuario = req.usuario!;
  const verGlobal = puedeVerPrevisionGlobal(usuario);
  const filas = db.prepare("SELECT * FROM oportunidades").all() as any[];
  const oportunidades = filas.map(mapOportunidad);
  const propias = verGlobal ? oportunidades : oportunidades.filter((o) => o.propietarioId === usuario.id);

  res.json({
    ambito: verGlobal ? "equipo" : "propio",
    total: previsionTotal(propias),
    porMes: previsionPorMes(propias),
    porComercial: verGlobal ? previsionPorComercial(oportunidades) : null,
    embudo: embudoConversion(propias),
    cicloMedioDias: cicloMedioVentaDias(propias)
  });
});
