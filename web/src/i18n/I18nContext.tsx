import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { type ClaveTexto, type Idioma, obtenerTexto } from "./diccionario";

const CLAVE_STORAGE = "crm-ventas:idioma";

interface ContextoI18n {
  idioma: Idioma;
  cambiarIdioma: (idioma: Idioma) => void;
  t: (clave: ClaveTexto) => string;
}

const I18nContext = createContext<ContextoI18n | null>(null);

function idiomaInicial(): Idioma {
  try {
    const guardado = localStorage.getItem(CLAVE_STORAGE);
    if (guardado === "es" || guardado === "ca" || guardado === "en") return guardado;
  } catch {
    // localStorage puede no estar disponible; nos quedamos con el idioma por defecto.
  }
  return "es";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [idioma, setIdioma] = useState<Idioma>(idiomaInicial);

  const cambiarIdioma = useCallback((nuevo: Idioma) => {
    setIdioma(nuevo);
    try {
      localStorage.setItem(CLAVE_STORAGE, nuevo);
    } catch {
      // Si el navegador bloquea localStorage, el idioma simplemente no se recuerda.
    }
  }, []);

  const t = useCallback((clave: ClaveTexto) => obtenerTexto(clave, idioma), [idioma]);

  const valor = useMemo(() => ({ idioma, cambiarIdioma, t }), [idioma, cambiarIdioma, t]);

  return <I18nContext.Provider value={valor}>{children}</I18nContext.Provider>;
}

export function useI18n(): ContextoI18n {
  const contexto = useContext(I18nContext);
  if (!contexto) throw new Error("useI18n debe usarse dentro de I18nProvider");
  return contexto;
}
