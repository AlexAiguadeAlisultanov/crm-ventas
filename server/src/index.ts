import path from "node:path";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import express from "express";
import { cargarUsuario } from "./auth.js";
import { iniciarEsquema } from "./db.js";
import { rutasAuth } from "./routes/auth.js";
import { rutasBuscar } from "./routes/buscar.js";
import { rutasEmpresas } from "./routes/empresas.js";
import { rutasOportunidades } from "./routes/oportunidades.js";
import { rutasPrevision } from "./routes/prevision.js";
import { rutasTareas } from "./routes/tareas.js";
import { rutasUsuarios } from "./routes/usuarios.js";
import { sembrarSiHaceFalta } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

iniciarEsquema();
sembrarSiHaceFalta();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cargarUsuario);

app.use("/api/auth", rutasAuth);
app.use("/api/empresas", rutasEmpresas);
app.use("/api/oportunidades", rutasOportunidades);
app.use("/api/tareas", rutasTareas);
app.use("/api/prevision", rutasPrevision);
app.use("/api/buscar", rutasBuscar);
app.use("/api/usuarios", rutasUsuarios);

const rutaWeb = path.join(__dirname, "..", "..", "web", "dist");
app.use(express.static(rutaWeb));
app.get("/*splat", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    next();
    return;
  }
  res.sendFile(path.join(rutaWeb, "index.html"));
});

app.use((_req, res) => {
  res.status(404).json({ error: "No se ha encontrado ese recurso." });
});

const puerto = Number(process.env.PORT ?? 8005);
app.listen(puerto, () => {
  console.log(`CRM de ventas escuchando en el puerto ${puerto}`);
});
