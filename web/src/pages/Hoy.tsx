import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { AlertTriangle, Check, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { EstadoVacio } from "../components/EstadoVacio";
import { Modal } from "../components/Modal";
import { formatearFecha, formatearImporte } from "../format";
import { useI18n } from "../i18n/I18nContext";
import type { Empresa, Oportunidad, Tarea } from "../tipos";

const UMBRAL_ESTANCADA_DIAS = 7;

function diasDesde(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function esHoyOAntes(fechaISO: string): boolean {
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);
  return new Date(`${fechaISO}T00:00:00`) <= hoy;
}

export function Hoy() {
  const { t, idioma } = useI18n();
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  function cargar() {
    Promise.all([api.get<Tarea[]>("/tareas"), api.get<Oportunidad[]>("/oportunidades"), api.get<Empresa[]>("/empresas")]).then(
      ([t1, o1, e1]) => {
        setTareas(t1);
        setOportunidades(o1);
        setEmpresas(e1);
        setCargando(false);
      }
    );
  }

  useEffect(cargar, []);

  const nombreEmpresa = useMemo(() => {
    const mapa = new Map(empresas.map((e) => [e.id, e.nombre]));
    return (id: string | null) => (id ? mapa.get(id) ?? "" : "");
  }, [empresas]);

  const tareasPendientes = tareas
    .filter((tarea) => !tarea.hecha && esHoyOAntes(tarea.fechaLimite))
    .sort((a, b) => a.fechaLimite.localeCompare(b.fechaLimite));

  const estancadas = oportunidades
    .filter((o) => o.etapa !== "ganada" && o.etapa !== "perdida" && diasDesde(o.ultimaActividadEn) >= UMBRAL_ESTANCADA_DIAS)
    .sort((a, b) => diasDesde(b.ultimaActividadEn) - diasDesde(a.ultimaActividadEn));

  async function marcarHecha(id: string) {
    setTareas((actual) => actual.map((tarea) => (tarea.id === id ? { ...tarea, hecha: true } : tarea)));
    await api.put(`/tareas/${id}`, { hecha: true });
  }

  if (cargando) return <p className="texto-secundario">{t("comun.cargando")}</p>;

  return (
    <div className="pila" style={{ gap: 32 }}>
      <div className="cabecera-pagina">
        <div>
          <span className="numero-seccion">01</span>
          <h1 className="titulo-pagina">{t("hoy.titulo")}</h1>
        </div>
      </div>

      <section className="pila">
        <div className="espacio-entre">
          <h2 style={{ fontSize: "var(--fs-4)", fontWeight: 600 }}>{t("hoy.tareasPendientes")}</h2>
          <button className="boton boton-secundario" onClick={() => setModalAbierto(true)}>
            <Plus size={16} /> {t("hoy.nuevaTarea")}
          </button>
        </div>

        {tareasPendientes.length === 0 ? (
          <EstadoVacio titulo={t("hoy.sinTareas")} />
        ) : (
          <ul className="pila" style={{ gap: 8 }}>
            {tareasPendientes.map((tarea, i) => {
              const vencida = tarea.fechaLimite < new Date().toISOString().slice(0, 10);
              return (
                <li
                  key={tarea.id}
                  className="tarjeta entrada-escalonada"
                  style={{ padding: 14, ["--indice" as string]: i } as CSSProperties}
                >
                  <div className="espacio-entre">
                    <div>
                      <p style={{ fontWeight: 500 }}>{tarea.titulo}</p>
                      <p className="texto-terciario">
                        {tarea.empresaId && (
                          <Link to={`/empresas/${tarea.empresaId}`} style={{ color: "var(--acento)" }}>
                            {nombreEmpresa(tarea.empresaId)}
                          </Link>
                        )}
                        {tarea.empresaId ? " · " : ""}
                        {formatearFecha(tarea.fechaLimite, idioma)}
                        {vencida && (
                          <span className="distintivo distintivo-error" style={{ marginLeft: 8 }}>
                            {t("hoy.vencida")}
                          </span>
                        )}
                      </p>
                    </div>
                    <button className="boton boton-secundario" onClick={() => marcarHecha(tarea.id)}>
                      <Check size={15} /> {t("hoy.marcarHecha")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="pila">
        <h2 style={{ fontSize: "var(--fs-4)", fontWeight: 600 }}>{t("hoy.estancadas")}</h2>
        {estancadas.length === 0 ? (
          <EstadoVacio titulo={t("hoy.sinEstancadas")} />
        ) : (
          <div className="tabla-envoltorio">
            <table className="tabla">
              <thead>
                <tr>
                  <th>{t("empresas.titulo")}</th>
                  <th>{t("comun.importe")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {estancadas.map((o) => (
                  <tr key={o.id} className="clicable" onClick={() => (window.location.href = `/empresas/${o.empresaId}`)}>
                    <td style={{ fontWeight: 500 }}>{nombreEmpresa(o.empresaId)}</td>
                    <td>{formatearImporte(o.importe, idioma)}</td>
                    <td>
                      <span className="distintivo distintivo-aviso">
                        <AlertTriangle size={12} /> {diasDesde(o.ultimaActividadEn)} {t("comun.dias")} {t("pipeline.sinActividad")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalAbierto && (
        <NuevaTareaModal
          onCerrar={() => setModalAbierto(false)}
          onCreada={() => {
            setModalAbierto(false);
            cargar();
          }}
        />
      )}
    </div>
  );
}

function NuevaTareaModal({ onCerrar, onCreada }: { onCerrar: () => void; onCreada: () => void }) {
  const { t } = useI18n();
  const [titulo, setTitulo] = useState("");
  const [fechaLimite, setFechaLimite] = useState(new Date().toISOString().slice(0, 10));
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      await api.post("/tareas", { titulo, fechaLimite });
      onCreada();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal titulo={t("hoy.nuevaTarea")} onCerrar={onCerrar}>
      <form className="pila" onSubmit={enviar}>
        <div className="campo">
          <label htmlFor="titulo-tarea">{t("hoy.titulo.tarea")}</label>
          <input id="titulo-tarea" className="entrada" value={titulo} onChange={(e) => setTitulo(e.target.value)} required autoFocus />
        </div>
        <div className="campo">
          <label htmlFor="fecha-tarea">{t("hoy.fechaLimite")}</label>
          <input id="fecha-tarea" className="entrada" type="date" value={fechaLimite} onChange={(e) => setFechaLimite(e.target.value)} required />
        </div>
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
