import { useEffect, useRef, useState } from "react";
import { Building2, Search, User, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useI18n } from "../i18n/I18nContext";
import type { ResultadoBusqueda } from "../tipos";

interface Props {
  abierto: boolean;
  onCerrar: () => void;
}

const VACIO: ResultadoBusqueda = { empresas: [], contactos: [], oportunidades: [] };

export function BuscadorGlobal({ abierto, onCerrar }: Props) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [consulta, setConsulta] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusqueda>(VACIO);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (abierto) {
      setConsulta("");
      setResultados(VACIO);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [abierto]);

  useEffect(() => {
    if (!abierto || consulta.trim().length < 2) {
      setResultados(VACIO);
      return;
    }
    const id = setTimeout(() => {
      api.get<ResultadoBusqueda>(`/buscar?q=${encodeURIComponent(consulta.trim())}`).then(setResultados).catch(() => setResultados(VACIO));
    }, 200);
    return () => clearTimeout(id);
  }, [consulta, abierto]);

  useEffect(() => {
    function alTeclear(e: KeyboardEvent) {
      if (e.key === "Escape" && abierto) onCerrar();
    }
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const hayResultados = resultados.empresas.length + resultados.contactos.length + resultados.oportunidades.length > 0;

  function ir(ruta: string) {
    navigate(ruta);
    onCerrar();
  }

  return (
    <div className="velo-modal" style={{ paddingTop: "12vh" }} onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className="panel-modal" role="dialog" aria-modal="true" aria-label={t("nav.buscar")}>
        <div className="fila" style={{ border: "1px solid var(--borde-fuerte)", borderRadius: "var(--radio-s)", padding: "8px 12px" }}>
          <Search size={16} color="var(--texto-terciario)" />
          <input
            ref={inputRef}
            className="entrada"
            style={{ border: "none", padding: 0, background: "transparent" }}
            placeholder={t("buscar.placeholder")}
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
          />
        </div>

        {consulta.trim().length >= 2 && !hayResultados && <p className="texto-terciario">{t("buscar.sinResultados")}</p>}

        {resultados.empresas.length > 0 && (
          <section className="pila" style={{ gap: 6 }}>
            <p className="texto-terciario">{t("buscar.empresas")}</p>
            <ul className="pila" style={{ gap: 2 }}>
              {resultados.empresas.map((e) => (
                <li key={e.id}>
                  <button className="boton boton-fantasma" style={{ width: "100%", justifyContent: "flex-start" }} onClick={() => ir(`/empresas/${e.id}`)}>
                    <Building2 size={15} /> {e.nombre} <span className="texto-terciario">· {e.sector}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {resultados.contactos.length > 0 && (
          <section className="pila" style={{ gap: 6 }}>
            <p className="texto-terciario">{t("buscar.contactos")}</p>
            <ul className="pila" style={{ gap: 2 }}>
              {resultados.contactos.map((c) => (
                <li key={c.id}>
                  <button className="boton boton-fantasma" style={{ width: "100%", justifyContent: "flex-start" }} onClick={() => ir(`/empresas/${c.empresaId}`)}>
                    <User size={15} /> {c.nombre} <span className="texto-terciario">· {c.empresaNombre}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {resultados.oportunidades.length > 0 && (
          <section className="pila" style={{ gap: 6 }}>
            <p className="texto-terciario">{t("buscar.oportunidades")}</p>
            <ul className="pila" style={{ gap: 2 }}>
              {resultados.oportunidades.map((o) => (
                <li key={o.id}>
                  <button className="boton boton-fantasma" style={{ width: "100%", justifyContent: "flex-start" }} onClick={() => ir(`/empresas/${o.empresaId}`)}>
                    <Zap size={15} /> {o.nombre} <span className="texto-terciario">· {o.empresaNombre}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
