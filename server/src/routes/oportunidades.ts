import crypto from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { requiereSesion } from "../auth.js";
import { puedeEditarOportunidad, puedeReasignar } from "../engine/permisos.js";
import { probabilidadPorDefecto, transicionOportunidad } from "../engine/pipeline.js";
import { mapOportunidad } from "../serializadores.js";
import { ETAPAS, type Etapa, type Oportunidad } from "../types.js";

export const rutasOportunidades = Router();
rutasOportunidades.use(requiereSesion);

function obtenerOportunidad(id: string): Oportunidad | null {
  const fila = db.prepare("SELECT * FROM oportunidades WHERE id = ?").get(id);
  return fila ? mapOportunidad(fila as any) : null;
}

rutasOportunidades.get("/", (req, res) => {
  const filas = db.prepare("SELECT * FROM oportunidades ORDER BY actualizada_en DESC").all() as any[];
  res.json(filas.map(mapOportunidad));
});

const esquemaCrear = z.object({
  empresaId: z.string().trim().min(1),
  nombre: z.string().trim().min(1, "Falta el nombre de la oportunidad."),
  importe: z.number().nonnegative(),
  etapa: z.enum(ETAPAS as [Etapa, ...Etapa[]]).default("prospecto"),
  fechaCierrePrevista: z.string().trim().min(1),
  propietarioId: z.string().trim().min(1).optional()
});

rutasOportunidades.post("/", (req, res) => {
  const datos = esquemaCrear.safeParse(req.body);
  if (!datos.success) {
    res.status(400).json({ error: datos.error.issues[0]?.message ?? "Datos no válidos." });
    return;
  }
  const empresa = db.prepare("SELECT id FROM empresas WHERE id = ?").get(datos.data.empresaId);
  if (!empresa) {
    res.status(404).json({ error: "No se ha encontrado esa empresa." });
    return;
  }
  const usuario = req.usuario!;
  let propietarioId = usuario.id;
  if (datos.data.propietarioId && datos.data.propietarioId !== usuario.id) {
    if (!puedeReasignar(usuario)) {
      res.status(403).json({ error: "Solo el director puede asignar la oportunidad a otro comercial." });
      return;
    }
    propietarioId = datos.data.propietarioId;
  }

  const id = crypto.randomUUID();
  const ahora = new Date().toISOString();
  db.prepare(
    `INSERT INTO oportunidades
      (id, empresa_id, nombre, importe, probabilidad, etapa, fecha_cierre_prevista, propietario_id, creada_en, actualizada_en, motivo_perdida, ultima_actividad_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)`
  ).run(
    id,
    datos.data.empresaId,
    datos.data.nombre,
    datos.data.importe,
    probabilidadPorDefecto(datos.data.etapa),
    datos.data.etapa,
    datos.data.fechaCierrePrevista,
    propietarioId,
    ahora,
    ahora,
    ahora
  );
  res.status(201).json(obtenerOportunidad(id));
});

const esquemaEditar = z.object({
  nombre: z.string().trim().min(1).optional(),
  importe: z.number().nonnegative().optional(),
  probabilidad: z.number().min(0).max(100).optional(),
  fechaCierrePrevista: z.string().trim().min(1).optional()
});

rutasOportunidades.put("/:id", (req, res) => {
  const oportunidad = obtenerOportunidad(req.params.id);
  if (!oportunidad) {
    res.status(404).json({ error: "No se ha encontrado esa oportunidad." });
    return;
  }
  if (!puedeEditarOportunidad(req.usuario!, oportunidad)) {
    res.status(403).json({ error: "Solo puedes editar tus propias oportunidades." });
    return;
  }
  const datos = esquemaEditar.safeParse(req.body);
  if (!datos.success) {
    res.status(400).json({ error: datos.error.issues[0]?.message ?? "Datos no válidos." });
    return;
  }
  db.prepare(
    `UPDATE oportunidades SET
      nombre = COALESCE(?, nombre),
      importe = COALESCE(?, importe),
      probabilidad = COALESCE(?, probabilidad),
      fecha_cierre_prevista = COALESCE(?, fecha_cierre_prevista),
      actualizada_en = ?
     WHERE id = ?`
  ).run(
    datos.data.nombre ?? null,
    datos.data.importe ?? null,
    datos.data.probabilidad ?? null,
    datos.data.fechaCierrePrevista ?? null,
    new Date().toISOString(),
    req.params.id
  );
  res.json(obtenerOportunidad(req.params.id));
});

const esquemaMover = z.object({
  etapa: z.enum(ETAPAS as [Etapa, ...Etapa[]]),
  motivoPerdida: z.string().trim().optional()
});

rutasOportunidades.post("/:id/mover", (req, res) => {
  const oportunidad = obtenerOportunidad(req.params.id);
  if (!oportunidad) {
    res.status(404).json({ error: "No se ha encontrado esa oportunidad." });
    return;
  }
  if (!puedeEditarOportunidad(req.usuario!, oportunidad)) {
    res.status(403).json({ error: "Solo puedes mover tus propias oportunidades." });
    return;
  }
  const datos = esquemaMover.safeParse(req.body);
  if (!datos.success) {
    res.status(400).json({ error: "Etapa no válida." });
    return;
  }
  const resultado = transicionOportunidad(oportunidad.etapa, datos.data.etapa, {
    rol: req.usuario!.rol,
    motivoPerdida: datos.data.motivoPerdida
  });
  if (!resultado.permitido) {
    res.status(400).json({ error: resultado.motivo });
    return;
  }
  const probabilidad =
    datos.data.etapa === oportunidad.etapa ? oportunidad.probabilidad : probabilidadPorDefecto(datos.data.etapa);
  db.prepare(
    `UPDATE oportunidades SET etapa = ?, probabilidad = ?, motivo_perdida = ?, actualizada_en = ? WHERE id = ?`
  ).run(
    datos.data.etapa,
    probabilidad,
    datos.data.etapa === "perdida" ? datos.data.motivoPerdida ?? null : null,
    new Date().toISOString(),
    req.params.id
  );
  res.json(obtenerOportunidad(req.params.id));
});

const esquemaReasignar = z.object({ propietarioId: z.string().trim().min(1) });

rutasOportunidades.post("/:id/reasignar", (req, res) => {
  if (!puedeReasignar(req.usuario!)) {
    res.status(403).json({ error: "Solo el director puede reasignar oportunidades." });
    return;
  }
  const oportunidad = obtenerOportunidad(req.params.id);
  if (!oportunidad) {
    res.status(404).json({ error: "No se ha encontrado esa oportunidad." });
    return;
  }
  const datos = esquemaReasignar.safeParse(req.body);
  if (!datos.success) {
    res.status(400).json({ error: "Falta el comercial al que asignarla." });
    return;
  }
  const comercial = db.prepare("SELECT id FROM usuarios WHERE id = ?").get(datos.data.propietarioId);
  if (!comercial) {
    res.status(404).json({ error: "No se ha encontrado ese usuario." });
    return;
  }
  db.prepare("UPDATE oportunidades SET propietario_id = ?, actualizada_en = ? WHERE id = ?").run(
    datos.data.propietarioId,
    new Date().toISOString(),
    req.params.id
  );
  res.json(obtenerOportunidad(req.params.id));
});
