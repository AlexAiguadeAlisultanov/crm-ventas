import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, ErrorApi } from "../api";
import type { Usuario } from "../tipos";

interface ContextoAuth {
  usuario: Usuario | null;
  cargando: boolean;
  entrar: (email: string, password: string) => Promise<void>;
  salir: () => Promise<void>;
}

const AuthContext = createContext<ContextoAuth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api
      .get<Usuario>("/auth/sesion")
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false));
  }, []);

  const entrar = useCallback(async (email: string, password: string) => {
    try {
      const datos = await api.post<Usuario>("/auth/login", { email, password });
      setUsuario(datos);
    } catch (error) {
      if (error instanceof ErrorApi) throw error;
      throw new ErrorApi("No se ha podido conectar con el servidor.");
    }
  }, []);

  const salir = useCallback(async () => {
    await api.post("/auth/logout");
    setUsuario(null);
  }, []);

  const valor = useMemo(() => ({ usuario, cargando, entrar, salir }), [usuario, cargando, entrar, salir]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): ContextoAuth {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return contexto;
}
