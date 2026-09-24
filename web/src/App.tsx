import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { BarraSuperior } from "./components/BarraSuperior";
import { BuscadorGlobal } from "./components/BuscadorGlobal";
import { useAuth } from "./context/AuthContext";
import { useI18n } from "./i18n/I18nContext";
import { CompaniaDetalle } from "./pages/CompaniaDetalle";
import { Empresas } from "./pages/Empresas";
import { Hoy } from "./pages/Hoy";
import { Importar } from "./pages/Importar";
import { Login } from "./pages/Login";
import { Pipeline } from "./pages/Pipeline";
import { Prevision } from "./pages/Prevision";

export default function App() {
  const { usuario, cargando } = useAuth();
  const { t } = useI18n();
  const [busquedaAbierta, setBusquedaAbierta] = useState(false);

  useEffect(() => {
    function alTeclear(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setBusquedaAbierta(true);
      }
    }
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, []);

  if (cargando) {
    return (
      <div className="pantalla-login">
        <p className="texto-secundario">{t("comun.cargando")}</p>
      </div>
    );
  }

  if (!usuario) {
    return <Login />;
  }

  return (
    <div className="app-shell">
      <BarraSuperior onAbrirBusqueda={() => setBusquedaAbierta(true)} />
      <BuscadorGlobal abierto={busquedaAbierta} onCerrar={() => setBusquedaAbierta(false)} />
      <main className="contenido">
        <Routes>
          <Route path="/" element={<Navigate to="/hoy" replace />} />
          <Route path="/hoy" element={<Hoy />} />
          <Route path="/empresas" element={<Empresas />} />
          <Route path="/empresas/:id" element={<CompaniaDetalle />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/prevision" element={<Prevision />} />
          <Route path="/importar" element={<Importar />} />
          <Route path="*" element={<Navigate to="/hoy" replace />} />
        </Routes>
      </main>
    </div>
  );
}
