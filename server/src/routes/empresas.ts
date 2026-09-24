import crypto from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { requiereSesion } from "../auth.js";
import { validarIdentificadorFiscal } from "../engine/cif.js";
import { parsearCSVEmpresas } from "../engine/csv.js";
import { mapActividad, mapContacto, mapEmpresa } from "../serializadores.js";

export const rutasEmpresas = Router();
rutasEmpresas.use(requiereSesion);

const esquemaEmpresa = z.object({
  nombre: z.string().trim().min(1, "Falta el nombre de la empresa."),
  cif: z.string().trim().min(1, "Falta el CIF."),
  sector: z.string().trim().default(""),
  notas: z.string().trim().default("")
});

rutasEmpresas.get("/", (req, res) => {
  const q = (req.query.q as string | undefined)?.trim();
  let filas;
  if (q) {
    filas = db
      .prepare(
        "SELECT * FROM empresas WHERE nombre LIKE ? OR cif LIKE ? OR sector LIKE ? ORDER BY nombre"
      )
      .all(`%${q}%`, `%${q}%`, `%${q}%`);
  } else {
    filas = db.prepare("SELECT * FROM empresas ORDER BY nombre").all();
  }
  res.json((filas as any[]).map(mapEmpresa));
});

rutasEmpresas.get("/exportar", (_req, res) => {
  const filas = db.prepare("SELECT * FROM empresas ORDER BY nombre").all() as any[];
  const cabecera = "nombre,cif,sector,notas";
  const escapar = (v: string) => (v.includes(",") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v);
  const cuerpo = filas.map((f) => [f.nombre, f.cif, f.sector, f.notas].map((c) => escapar(String(c ?? ""))).join(","));
  const csv = [cabecera, ...cuerpo].join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=empresas.csv");
  res.send(csv);
});

const esquemaCSV = z.object({ csv: z.string() });

rutasEmpresas.post("/importar/previsualizar", (req, res) => {
  const datos = esquemaCSV.safeParse(req.body);
  if (!datos.success) {
    res.status(400).json({ error: "Falta el contenido del archivo." });
    return;
  }
  const resultado = parsearCSVEmpresas(datos.data.csv);
  res.json(resultado);
});

rutasEmpresas.post("/importar/confirmar", (req, res) => {
  const datos = esquemaCSV.safeParse(req.body);
  if (!datos.success) {
    res.status(400).json({ error: "Falta el contenido del archivo." });
    return;
  }
  const resultado = parsearCSVEmpresas(datos.data.csv);
  const insertar = db.prepare(
    "INSERT INTO empresas (id, nombre, cif, sector, notas, creada_en) VALUES (?, ?, ?, ?, ?, ?)"
  );
  for (const empresa of resultado.validas) {
    insertar.run(crypto.randomUUID(), empresa.nombre, empresa.cif, empresa.sector, empresa.notas, new Date().toISOString());
  }
  res.json({ importadas: resultado.validas.length, errores: resultado.errores });
});

rutasEmpresas.get("/:id", (req, res) => {
  const fila = db.prepare("SELECT * FROM empresas WHERE id = ?").get(req.params.id) as any;
  if (!fila) {
    res.status(404).json({ error: "No se ha encontrado esa empresa." });
    return;
  }
  const contactos = (db.prepare("SELECT * FROM contactos WHERE empresa_id = ? ORDER BY nombre").all(req.params.id) as any[]).map(
    mapContacto
  );
  const actividades = (
    db.prepare("SELECT * FROM actividades WHERE empresa_id = ? ORDER BY fecha DESC, creada_en DESC").all(req.params.id) as any[]
  ).map(mapActividad);
  res.json({ ...mapEmpresa(fila), contactos, actividades });
});

rutasEmpresas.post("/", (req, res) => {
  const datos = esquemaEmpresa.safeParse(req.body);
  if (!datos.success) {
    res.status(400).json({ error: datos.error.issues[0]?.message ?? "Datos no válidos." });
    return;
  }
  const validacionCif = validarIdentificadorFiscal(datos.data.cif);
  if (!validacionCif.valido) {
    res.status(400).json({ error: `CIF no válido: ${validacionCif.motivo}` });
    return;
  }
  const id = crypto.randomUUID();
  db.prepare("INSERT INTO empresas (id, nombre, cif, sector, notas, creada_en) VALUES (?, ?, ?, ?, ?, ?)").run(
    id,
    datos.data.nombre,
    datos.data.cif.toUpperCase(),
    datos.data.sector,
    datos.data.notas,
    new Date().toISOString()
  );
  const fila = db.prepare("SELECT * FROM empresas WHERE id = ?").get(id);
  res.status(201).json(mapEmpresa(fila as any));
});

rutasEmpresas.put("/:id", (req, res) => {
  const existente = db.prepare("SELECT * FROM empresas WHERE id = ?").get(req.params.id);
  if (!existente) {
    res.status(404).json({ error: "No se ha encontrado esa empresa." });
    return;
  }
  const datos = esquemaEmpresa.safeParse(req.body);
  if (!datos.success) {
    res.status(400).json({ error: datos.error.issues[0]?.message ?? "Datos no válidos." });
    return;
  }
  const validacionCif = validarIdentificadorFiscal(datos.data.cif);
  if (!validacionCif.valido) {
    res.status(400).json({ error: `CIF no válido: ${validacionCif.motivo}` });
    return;
  }
  db.prepare("UPDATE empresas SET nombre = ?, cif = ?, sector = ?, notas = ? WHERE id = ?").run(
    datos.data.nombre,
    datos.data.cif.toUpperCase(),
    datos.data.sector,
    datos.data.notas,
    req.params.id
  );
  const fila = db.prepare("SELECT * FROM empresas WHERE id = ?").get(req.params.id);
  res.json(mapEmpresa(fila as any));
});

const esquemaContacto = z.object({
  nombre: z.string().trim().min(1, "Falta el nombre del contacto."),
  email: z.string().trim().default(""),
  telefono: z.string().trim().default(""),
  cargo: z.string().trim().default("")
});

rutasEmpresas.post("/:id/contactos", (req, res) => {
  const empresa = db.prepare("SELECT id FROM empresas WHERE id = ?").get(req.params.id);
  if (!empresa) {
    res.status(404).json({ error: "No se ha encontrado esa empresa." });
    return;
  }
  const datos = esquemaContacto.safeParse(req.body);
  if (!datos.success) {
    res.status(400).json({ error: datos.error.issues[0]?.message ?? "Datos no válidos." });
    return;
  }
  const id = crypto.randomUUID();
  db.prepare("INSERT INTO contactos (id, empresa_id, nombre, email, telefono, cargo) VALUES (?, ?, ?, ?, ?, ?)").run(
    id,
    req.params.id,
    datos.data.nombre,
    datos.data.email,
    datos.data.telefono,
    datos.data.cargo
  );
  const fila = db.prepare("SELECT * FROM contactos WHERE id = ?").get(id);
  res.status(201).json(mapContacto(fila as any));
});

const esquemaActividad = z.object({
  tipo: z.enum(["llamada", "email", "reunion", "nota"]),
  nota: z.string().trim().default(""),
  fecha: z.string().trim().min(1),
  oportunidadId: z.string().trim().nullable().optional(),
  contactoId: z.string().trim().nullable().optional()
});

rutasEmpresas.post("/:id/actividades", (req, res) => {
  const empresa = db.prepare("SELECT id FROM empresas WHERE id = ?").get(req.params.id);
  if (!empresa) {
    res.status(404).json({ error: "No se ha encontrado esa empresa." });
    return;
  }
  const datos = esquemaActividad.safeParse(req.body);
  if (!datos.success) {
    res.status(400).json({ error: datos.error.issues[0]?.message ?? "Datos no válidos." });
    return;
  }
  const id = crypto.randomUUID();
  const ahora = new Date().toISOString();
  db.prepare(
    `INSERT INTO actividades (id, empresa_id, oportunidad_id, contacto_id, tipo, nota, fecha, creada_por, creada_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    req.params.id,
    datos.data.oportunidadId ?? null,
    datos.data.contactoId ?? null,
    datos.data.tipo,
    datos.data.nota,
    datos.data.fecha,
    req.usuario!.id,
    ahora
  );
  if (datos.data.oportunidadId) {
    db.prepare("UPDATE oportunidades SET ultima_actividad_en = ? WHERE id = ?").run(ahora, datos.data.oportunidadId);
  }
  const fila = db.prepare("SELECT * FROM actividades WHERE id = ?").get(id);
  res.status(201).json(mapActividad(fila as any));
});
