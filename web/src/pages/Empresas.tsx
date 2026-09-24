import { useEffect, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, ErrorApi } from "../api";
import { EstadoVacio } from "../components/EstadoVacio";
import { Modal } from "../components/Modal";
import { useI18n } from "../i18n/I18nContext";
import type { Empresa } from "../tipos";

export function Empresas() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);

  function cargar(q?: string) {
    api
      .get<Empresa[]>(`/empresas${q ? `?q=${encodeURIComponent(q)}` : ""}`)
      .then(setEmpresas)
      .finally(() => setCargando(false));
  }

  useEffect(() => cargar(), []);

  useEffect(() => {
    const id = setTimeout(() => cargar(busqueda), 200);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda]);

  return (
    <div className="pila" style={{ gap: 24 }}>
      <div className="cabecera-pagina">
        <div>
          <span className="numero-seccion">02</span>
          <h1 className="titulo-pagina">{t("empresas.titulo")}</h1>
        </div>
        <button className="boton boton-primario" onClick={() => setModalAbierto(true)}>
          <Plus size={16} /> {t("empresas.nueva")}
        </button>
      </div>

      <input
        className="entrada"
        style={{ maxWidth: 420 }}
        placeholder={t("empresas.buscar")}
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {cargando ? (
        <p className="texto-secundario">{t("comun.cargando")}</p>
      ) : empresas.length === 0 ? (
        <EstadoVacio titulo={busqueda ? t("empresas.sinResultados") : t("empresas.vacio")} />
      ) : (
        <div className="tabla-envoltorio">
          <table className="tabla">
            <thead>
              <tr>
                <th>{t("empresas.nombre")}</th>
                <th>{t("empresas.cif")}</th>
                <th>{t("empresas.sector")}</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map((empresa) => (
                <tr key={empresa.id} className="clicable" onClick={() => navigate(`/empresas/${empresa.id}`)}>
                  <td style={{ fontWeight: 500 }}>{empresa.nombre}</td>
                  <td className="texto-secundario">{empresa.cif}</td>
                  <td className="texto-secundario">{empresa.sector}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && (
        <NuevaEmpresaModal
          onCerrar={() => setModalAbierto(false)}
          onCreada={(empresa) => {
            setModalAbierto(false);
            navigate(`/empresas/${empresa.id}`);
          }}
        />
      )}
    </div>
  );
}

function NuevaEmpresaModal({ onCerrar, onCreada }: { onCerrar: () => void; onCreada: (empresa: Empresa) => void }) {
  const { t } = useI18n();
  const [nombre, setNombre] = useState("");
  const [cif, setCif] = useState("");
  const [sector, setSector] = useState("");
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const empresa = await api.post<Empresa>("/empresas", { nombre, cif, sector, notas });
      onCreada(empresa);
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : t("comun.error"));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal titulo={t("empresas.nueva")} onCerrar={onCerrar}>
      <form className="pila" onSubmit={enviar}>
        <div className="campo">
          <label htmlFor="emp-nombre">{t("empresas.nombre")}</label>
          <input id="emp-nombre" className="entrada" value={nombre} onChange={(e) => setNombre(e.target.value)} required autoFocus />
        </div>
        <div className="campo">
          <label htmlFor="emp-cif">{t("empresas.cif")}</label>
          <input id="emp-cif" className="entrada" value={cif} onChange={(e) => setCif(e.target.value)} required />
        </div>
        <div className="campo">
          <label htmlFor="emp-sector">{t("empresas.sector")}</label>
          <input id="emp-sector" className="entrada" value={sector} onChange={(e) => setSector(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="emp-notas">{t("empresas.notas")}</label>
          <textarea id="emp-notas" className="entrada" value={notas} onChange={(e) => setNotas(e.target.value)} />
        </div>
        {error && <p className="mensaje-error">{error}</p>}
        <div className="fila" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="boton boton-fantasma" onClick={onCerrar}>
            {t("comun.cancelar")}
          </button>
          <button type="submit" className="boton boton-primario" disabled={enviando}>
            {enviando ? t("comun.guardando") : t("comun.crear")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
