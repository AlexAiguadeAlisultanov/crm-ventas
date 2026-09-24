import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { borrarSesion, crearSesion, requiereSesion, verificarPassword } from "../auth.js";
import type { Rol } from "../types.js";

export const rutasAuth = Router();

const esquemaLogin = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

interface FilaUsuarioConHash {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
  hash: string;
  sal: string;
}

rutasAuth.post("/login", (req, res) => {
  const datos = esquemaLogin.safeParse(req.body);
  if (!datos.success) {
    res.status(400).json({ error: "Escribe un correo y una contraseña válidos." });
    return;
  }
  const fila = db
    .prepare("SELECT id, email, nombre, rol, hash, sal FROM usuarios WHERE email = ?")
    .get(datos.data.email.toLowerCase().trim()) as FilaUsuarioConHash | undefined;

  if (!fila || !verificarPassword(datos.data.password, fila.sal, fila.hash)) {
    res.status(401).json({ error: "El correo o la contraseña no son correctos." });
    return;
  }

  crearSesion(res, fila.id);
  res.json({ id: fila.id, email: fila.email, nombre: fila.nombre, rol: fila.rol });
});

rutasAuth.post("/logout", (_req, res) => {
  borrarSesion(res);
  res.status(204).end();
});

rutasAuth.get("/sesion", requiereSesion, (req, res) => {
  res.json(req.usuario);
});

// Solo para la demo pública: lista de cuentas y su rol, para los botones "Entrar como...".
rutasAuth.get("/cuentas-demo", (_req, res) => {
  const filas = db.prepare("SELECT email, nombre, rol FROM usuarios ORDER BY rol DESC").all();
  res.json(filas);
});

export { esquemaLogin };
