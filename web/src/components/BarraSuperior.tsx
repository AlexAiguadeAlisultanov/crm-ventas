import { useEffect, useRef, useState } from "react";
import { LogOut, Search } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IDIOMAS } from "../i18n/diccionario";
import { useI18n } from "../i18n/I18nContext";

interface Props {
  onAbrirBusqueda: () => void;
}

export function BarraSuperior({ onAbrirBusqueda }: Props) {
  const { t, idioma, cambiarIdioma } = useI18n();
  const { salir } = useAuth();
  const navRef = useRef<HTMLElement>(null);
  const [desbordado, setDesbordado] = useState(false);

  const enlace = (clase: { isActive: boolean }) => `nav-link${clase.isActive ? " activo" : ""}`;

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    function actualizar() {
      if (!nav) return;
      // Queda margen a la derecha mientras no se haya llegado al final del scroll.
      setDesbordado(nav.scrollWidth - nav.clientWidth - nav.scrollLeft > 4);
    }

    actualizar();
    nav.addEventListener("scroll", actualizar, { passive: true });
    window.addEventListener("resize", actualizar);
    return () => {
      nav.removeEventListener("scroll", actualizar);
      window.removeEventListener("resize", actualizar);
    };
  }, [idioma]);

  return (
    <header className="barra-superior">
      <span className="marca">
        CRM<span>·</span>Ventas
      </span>
      <nav ref={navRef} className={`nav-principal${desbordado ? " nav-principal-desbordado" : ""}`} aria-label="Navegación principal">
        <NavLink to="/hoy" className={enlace}>
          {t("nav.hoy")}
        </NavLink>
        <NavLink to="/empresas" className={enlace}>
          {t("nav.empresas")}
        </NavLink>
        <NavLink to="/pipeline" className={enlace}>
          {t("nav.pipeline")}
        </NavLink>
        <NavLink to="/prevision" className={enlace}>
          {t("nav.prevision")}
        </NavLink>
        <NavLink to="/importar" className={enlace}>
          {t("nav.importar")}
        </NavLink>
      </nav>
      <div className="barra-superior-acciones">
        <button className="boton boton-fantasma boton-icono" onClick={onAbrirBusqueda} aria-label={t("nav.buscar")} title={t("buscar.atajo")}>
          <Search size={18} />
        </button>
        <div className="selector-idioma" role="group" aria-label="Idioma">
          {IDIOMAS.map((op) => (
            <button key={op.codigo} className={op.codigo === idioma ? "activo" : ""} onClick={() => cambiarIdioma(op.codigo)}>
              {op.etiqueta}
            </button>
          ))}
        </div>
        <button className="boton boton-fantasma boton-icono" onClick={() => salir()} aria-label={t("nav.salir")} title={t("nav.salir")}>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
