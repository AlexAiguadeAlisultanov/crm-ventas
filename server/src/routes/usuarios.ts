import { Router } from "express";
import { db } from "../db.js";
import { requiereSesion } from "../auth.js";

export const rutasUsuarios = Router();
rutasUsuarios.use(requiereSesion);

rutasUsuarios.get("/", (_req, res) => {
  const filas = db.prepare("SELECT id, email, nombre, rol FROM usuarios ORDER BY nombre").all();
  res.json(filas);
});
