import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const rutaDatos = process.env.CRM_DB_PATH ?? path.join(process.cwd(), "datos", "crm.sqlite");
fs.mkdirSync(path.dirname(rutaDatos), { recursive: true });

export const db = new DatabaseSync(rutaDatos);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

const ESQUEMA = `
CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('comercial','director')),
  hash TEXT NOT NULL,
  sal TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS empresas (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  cif TEXT NOT NULL,
  sector TEXT NOT NULL DEFAULT '',
  notas TEXT NOT NULL DEFAULT '',
  creada_en TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contactos (
  id TEXT PRIMARY KEY,
  empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  telefono TEXT NOT NULL DEFAULT '',
  cargo TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS oportunidades (
  id TEXT PRIMARY KEY,
  empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  importe REAL NOT NULL,
  probabilidad INTEGER NOT NULL,
  etapa TEXT NOT NULL,
  fecha_cierre_prevista TEXT NOT NULL,
  propietario_id TEXT NOT NULL REFERENCES usuarios(id),
  creada_en TEXT NOT NULL,
  actualizada_en TEXT NOT NULL,
  motivo_perdida TEXT,
  ultima_actividad_en TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS actividades (
  id TEXT PRIMARY KEY,
  empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  oportunidad_id TEXT REFERENCES oportunidades(id) ON DELETE CASCADE,
  contacto_id TEXT REFERENCES contactos(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL,
  nota TEXT NOT NULL DEFAULT '',
  fecha TEXT NOT NULL,
  creada_por TEXT NOT NULL REFERENCES usuarios(id),
  creada_en TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tareas (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  fecha_limite TEXT NOT NULL,
  hecha INTEGER NOT NULL DEFAULT 0,
  propietario_id TEXT NOT NULL REFERENCES usuarios(id),
  oportunidad_id TEXT REFERENCES oportunidades(id) ON DELETE CASCADE,
  empresa_id TEXT REFERENCES empresas(id) ON DELETE CASCADE,
  creada_en TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contactos_empresa ON contactos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_oportunidades_empresa ON oportunidades(empresa_id);
CREATE INDEX IF NOT EXISTS idx_oportunidades_propietario ON oportunidades(propietario_id);
CREATE INDEX IF NOT EXISTS idx_actividades_empresa ON actividades(empresa_id);
CREATE INDEX IF NOT EXISTS idx_actividades_oportunidad ON actividades(oportunidad_id);
CREATE INDEX IF NOT EXISTS idx_tareas_propietario ON tareas(propietario_id);
`;

export function iniciarEsquema(): void {
  db.exec(ESQUEMA);
}

export function baseVacia(): boolean {
  const fila = db.prepare("SELECT COUNT(*) AS total FROM usuarios").get() as { total: number };
  return fila.total === 0;
}
