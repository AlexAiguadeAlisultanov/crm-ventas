import { Router } from "express";
import { db } from "../db.js";
import { requiereSesion } from "../auth.js";

export const rutasBuscar = Router();
rutasBuscar.use(requiereSesion);

rutasBuscar.get("/", (req, res) => {
  const q = ((req.query.q as string) ?? "").trim();
  if (q.length < 2) {
    res.json({ empresas: [], contactos: [], oportunidades: [] });
    return;
  }
  const comodin = `%${q}%`;

  const empresas = db
    .prepare("SELECT id, nombre, sector FROM empresas WHERE nombre LIKE ? OR cif LIKE ? LIMIT 8")
    .all(comodin, comodin);

  const contactos = db
    .prepare(
      `SELECT contactos.id, contactos.nombre, contactos.empresa_id AS empresaId, empresas.nombre AS empresaNombre
       FROM contactos JOIN empresas ON empresas.id = contactos.empresa_id
       WHERE contactos.nombre LIKE ? OR contactos.email LIKE ? LIMIT 8`
    )
    .all(comodin, comodin);

  const oportunidades = db
    .prepare(
      `SELECT oportunidades.id, oportunidades.nombre, oportunidades.etapa, oportunidades.empresa_id AS empresaId, empresas.nombre AS empresaNombre
       FROM oportunidades JOIN empresas ON empresas.id = oportunidades.empresa_id
       WHERE oportunidades.nombre LIKE ? LIMIT 8`
    )
    .all(comodin);

  res.json({ empresas, contactos, oportunidades });
});
