export class ErrorApi extends Error {}

async function peticion<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const respuesta = await fetch(`/api${ruta}`, {
    credentials: "include",
    headers: opciones.body ? { "Content-Type": "application/json" } : undefined,
    ...opciones
  });

  if (respuesta.status === 204) return undefined as T;

  const esJson = respuesta.headers.get("content-type")?.includes("application/json");
  const cuerpo = esJson ? await respuesta.json() : await respuesta.text();

  if (!respuesta.ok) {
    const mensaje = esJson && cuerpo && typeof cuerpo === "object" && "error" in cuerpo ? String(cuerpo.error) : "Error de red";
    throw new ErrorApi(mensaje);
  }
  return cuerpo as T;
}

export const api = {
  get: <T>(ruta: string) => peticion<T>(ruta),
  post: <T>(ruta: string, datos?: unknown) => peticion<T>(ruta, { method: "POST", body: datos ? JSON.stringify(datos) : undefined }),
  put: <T>(ruta: string, datos?: unknown) => peticion<T>(ruta, { method: "PUT", body: datos ? JSON.stringify(datos) : undefined }),
  del: <T>(ruta: string) => peticion<T>(ruta, { method: "DELETE" })
};
