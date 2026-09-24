import crypto from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { requiereSesion } from "../auth.js";
import { mapTarea } from "../serializadores.js";

export const rutasTareas = Router();
rutasTareas.use(requiereSesion);

rutasTareas.get("/", (req, res) => {
  const filas = db
    .prepare("SELECT * FROM tareas WHERE propietario_id = ? ORDER BY hecha ASC, fecha_limite ASC")
    .all(req.usuario!.id) as any[];
  res.json(filas.map(mapTarea));
});

const esquemaCrear = z.object({
  titulo: z.string().trim().min(1, "Falta el título de la tarea."),
  fechaLimite: z.string().trim().min(1),
  oportunidadId: z.string().trim().nullable().optional(),
  empresaId: z.string().trim().nullable().optional()
});

rutasTareas.post("/", (req, res) => {
  const datos = esquemaCrear.safeParse(req.body);
  if (!datos.success) {
    res.status(400).json({ error: datos.error.issues[0]?.message ?? "Datos no válidos." });
    return;
  }
  const id = crypto.randomUUID();
  db.prepare(
    `INSERT INTO tareas (id, titulo, fecha_limite, hecha, propietario_id, oportunidad_id, empresa_id, creada_en)
     VALUES (?, ?, ?, 0, ?, ?, ?, ?)`
  ).run(id, datos.data.titulo, datos.data.fechaLimite, req.usuario!.id, datos.data.oportunidadId ?? null, datos.data.empresaId ?? null, new Date().toISOString());
  const fila = db.prepare("SELECT * FROM tareas WHERE id = ?").get(id);
  res.status(201).json(mapTarea(fila as any));
});

const esquemaEditar = z.object({
  titulo: z.string().trim().min(1).optional(),
  fechaLimite: z.string().trim().min(1).optional(),
  hecha: z.boolean().optional()
});

rutasTareas.put("/:id", (req, res) => {
  const tarea = db.prepare("SELECT * FROM tareas WHERE id = ?").get(req.params.id) as any;
  if (!tarea) {
    res.status(404).json({ error: "No se ha encontrado esa tarea." });
    return;
  }
  if (tarea.propietario_id !== req.usuario!.id && req.usuario!.rol !== "director") {
    res.status(403).json({ error: "Solo puedes editar tus propias tareas." });
    return;
  }
  const datos = esquemaEditar.safeParse(req.body);
  if (!datos.success) {
    res.status(400).json({ error: "Datos no válidos." });
    return;
  }
  db.prepare(
    `UPDATE tareas SET titulo = COALESCE(?, titulo), fecha_limite = COALESCE(?, fecha_limite), hecha = COALESCE(?, hecha) WHERE id = ?`
  ).run(
    datos.data.titulo ?? null,
    datos.data.fechaLimite ?? null,
    datos.data.hecha === undefined ? null : datos.data.hecha ? 1 : 0,
    req.params.id
  );
  const fila = db.prepare("SELECT * FROM tareas WHERE id = ?").get(req.params.id);
  res.json(mapTarea(fila as any));
});

rutasTareas.delete("/:id", (req, res) => {
  const tarea = db.prepare("SELECT * FROM tareas WHERE id = ?").get(req.params.id) as any;
  if (!tarea) {
    res.status(404).json({ error: "No se ha encontrado esa tarea." });
    return;
  }
  if (tarea.propietario_id !== req.usuario!.id && req.usuario!.rol !== "director") {
    res.status(403).json({ error: "Solo puedes borrar tus propias tareas." });
    return;
  }
  db.prepare("DELETE FROM tareas WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
