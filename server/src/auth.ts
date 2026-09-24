import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { db } from "./db.js";
import type { Rol, Usuario } from "./types.js";

const SECRETO = process.env.SESSION_SECRET ?? "clave-de-desarrollo-no-usar-en-produccion";
// La clave de desarrollo esta en el repositorio publico: en produccion firmaria cookies
// que cualquiera podria falsificar, asi que sin SESSION_SECRET no se arranca.
if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  throw new Error("Falta SESSION_SECRET en producción");
}
const NOMBRE_COOKIE = "sesion";
const DURACION_MS = 1000 * 60 * 60 * 24 * 7; // siete días

export function generarSal(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function calcularHash(password: string, sal: string): string {
  return crypto.scryptSync(password, sal, 64).toString("hex");
}

export function verificarPassword(password: string, sal: string, hash: string): boolean {
  const calculado = calcularHash(password, sal);
  const bufferCalculado = Buffer.from(calculado, "hex");
  const bufferGuardado = Buffer.from(hash, "hex");
  if (bufferCalculado.length !== bufferGuardado.length) return false;
  return crypto.timingSafeEqual(bufferCalculado, bufferGuardado);
}

function firmar(valor: string): string {
  const firma = crypto.createHmac("sha256", SECRETO).update(valor).digest("hex");
  return `${valor}.${firma}`;
}

function verificarFirma(cookie: string): string | null {
  const separador = cookie.lastIndexOf(".");
  if (separador === -1) return null;
  const valor = cookie.slice(0, separador);
  const firma = cookie.slice(separador + 1);
  const esperada = crypto.createHmac("sha256", SECRETO).update(valor).digest("hex");
  const bufA = Buffer.from(firma);
  const bufB = Buffer.from(esperada);
  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) return null;
  return valor;
}

export function crearSesion(res: Response, usuarioId: string): void {
  const expira = Date.now() + DURACION_MS;
  const contenido = `${usuarioId}:${expira}`;
  res.cookie(NOMBRE_COOKIE, firmar(contenido), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: DURACION_MS,
    path: "/"
  });
}

export function borrarSesion(res: Response): void {
  res.clearCookie(NOMBRE_COOKIE, { path: "/" });
}

function leerUsuarioIdDeCookie(req: Request): string | null {
  const cookie = req.cookies?.[NOMBRE_COOKIE];
  if (!cookie) return null;
  const contenido = verificarFirma(cookie);
  if (!contenido) return null;
  const [usuarioId, expiraTexto] = contenido.split(":");
  if (!usuarioId || !expiraTexto) return null;
  if (Date.now() > Number(expiraTexto)) return null;
  return usuarioId;
}

interface FilaUsuario {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
}

export function obtenerUsuarioPorId(id: string): Usuario | null {
  const fila = db
    .prepare("SELECT id, email, nombre, rol FROM usuarios WHERE id = ?")
    .get(id) as FilaUsuario | undefined;
  return fila ?? null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuario?: Usuario;
    }
  }
}

export function cargarUsuario(req: Request, _res: Response, next: NextFunction): void {
  const usuarioId = leerUsuarioIdDeCookie(req);
  if (usuarioId) {
    const usuario = obtenerUsuarioPorId(usuarioId);
    if (usuario) req.usuario = usuario;
  }
  next();
}

export function requiereSesion(req: Request, res: Response, next: NextFunction): void {
  if (!req.usuario) {
    res.status(401).json({ error: "Tienes que iniciar sesión." });
    return;
  }
  next();
}

export function requiereRol(...roles: Rol[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      res.status(401).json({ error: "Tienes que iniciar sesión." });
      return;
    }
    if (!roles.includes(req.usuario.rol)) {
      res.status(403).json({ error: "No tienes permiso para hacer esto." });
      return;
    }
    next();
  };
}
