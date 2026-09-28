import { useEffect, useMemo, useState, type DragEvent, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { api, ErrorApi } from "../api";
import { Modal } from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { formatearFecha, formatearImporte } from "../format";
import { useI18n } from "../i18n/I18nContext";
import type { ClaveTexto } from "../i18n/diccionario";
import { ETAPAS, type Empresa, type Etapa, type Oportunidad, type Usuario } from "../tipos";

const CLAVE_ETAPA: Record<Etapa, ClaveTexto> = {
  prospecto: "pipeline.etapa.prospecto",
  cualificada: "pipeline.etapa.cualificada",
  propuesta: "pipeline.etapa.propuesta",
  negociacion: "pipeline.etapa.negociacion",
  ganada: "pipeline.etapa.ganada",
  perdida: "pipeline.etapa.perdida"
};

const ETAPAS_FINALES: Etapa[] = ["ganada", "perdida"];
const UMBRAL_ESTANCADA_DIAS = 7;

function diasDesde(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function Pipeline() {
  const { t, idioma } = useI18n();
  const { usuario } = useAuth();
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtroComercial, setFiltroComercial] = useState("");
  const [modalNueva, setModalNueva] = useState(false);
  const [modalPerdida, setModalPerdida] = useState<{ oportunidad: Oportunidad } | null>(null);
  const [oportunidadAbierta, setOportunidadAbierta] = useState<Oportunidad | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [columnaSobre, setColumnaSobre] = useState<Etapa | null>(null);
  const [arrastrando, setArrastrando] = useState<string | null>(null);

  function cargar() {
    api.get<Oportunidad[]>("/oportunidades").then(setOportunidades);
    api.get<Empresa[]>("/empresas").then(setEmpresas);
    api.get<Usuario[]>("/usuarios").then(setUsuarios);
  }

  useEffect(cargar, []);

  useEffect(() => {
    if (!aviso) return;
    const id = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(id);
  }, [aviso]);

  const nombreEmpresa = useMemo(() => {
    const mapa = new Map(empresas.map((e) => [e.id, e.nombre]));
    return (id: string) => mapa.get(id) ?? "";
  }, [empresas]);

  const comerciales = usuarios.filter((u) => u.rol === "comercial");

  const visibles = filtroComercial ? oportunidades.filter((o) => o.propietarioId === filtroComercial) : oportunidades;

  function puedeEditar(o: Oportunidad): boolean {
    return !!usuario && (usuario.rol === "director" || o.propietarioId === usuario.id);
  }

  async function aplicarMovimiento(oportunidad: Oportunidad, nuevaEtapa: Etapa, motivoPerdida?: string) {
    try {
      const actualizada = await api.post<Oportunidad>(`/oportunidades/${oportunidad.id}/mover`, {
        etapa: nuevaEtapa,
        motivoPerdida
      });
      setOportunidades((actual) => actual.map((o) => (o.id === actualizada.id ? actualizada : o)));
    } catch (err) {
      setAviso(err instanceof ErrorApi ? err.message : t("comun.error"));
    }
  }

  function pedirMovimiento(oportunidad: Oportunidad, nuevaEtapa: Etapa) {
    if (nuevaEtapa === oportunidad.etapa) return;
    if (!puedeEditar(oportunidad)) {
      setAviso(t("pipeline.soloPropias"));
      return;
    }
    if (ETAPAS_FINALES.includes(oportunidad.etapa) && usuario?.rol !== "director") {
      setAviso(t("pipeline.soloDirectorReabre"));
      return;
    }
    if (nuevaEtapa === "perdida") {
      setModalPerdida({ oportunidad });
      return;
    }
    aplicarMovimiento(oportunidad, nuevaEtapa);
  }

  return (
    <div className="pila" style={{ gap: 24 }}>
      <div className="pila" style={{ gap: 8 }}>
        <div className="cabecera-pagina" style={{ marginBottom: 0 }}>
          <div>
            <span className="numero-seccion">03</span>
            <h1 className="titulo-pagina">{t("pipeline.titulo")}</h1>
          </div>
          <div className="fila pipeline-filtros">
            {comerciales.length > 1 && (
              <select className="entrada selector-comercial" value={filtroComercial} onChange={(e) => setFiltroComercial(e.target.value)}>
                <option value="">{t("pipeline.todos")}</option>
                {comerciales.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            )}
            <button className="boton boton-primario" onClick={() => setModalNueva(true)}>
              <Plus size={16} /> {t("pipeline.nuevaOportunidad")}
            </button>
          </div>
        </div>

        <p className="texto-terciario">{t("pipeline.arrastra")}</p>
      </div>

      {aviso && (
        <div className="tarjeta" style={{ padding: "10px 14px", borderColor: "var(--error)" }} role="alert">
          <p className="mensaje-error">{aviso}</p>
        </div>
      )}

      <div className="kanban">
        {ETAPAS.map((etapa) => {
          const tarjetas = visibles.filter((o) => o.etapa === etapa);
          return (
            <div className="columna-kanban" key={etapa}>
              <div className="columna-kanban-cabecera">
                <span className="columna-kanban-titulo">{t(CLAVE_ETAPA[etapa])}</span>
                <span className="texto-terciario">{tarjetas.length}</span>
              </div>
              <div
                className={`columna-kanban-cuerpo${columnaSobre === etapa ? " zona-destino" : ""}`}
                onDragOver={(e: DragEvent) => {
                  e.preventDefault();
                  setColumnaSobre(etapa);
                }}
                onDragLeave={() => setColumnaSobre((actual) => (actual === etapa ? null : actual))}
                onDrop={(e: DragEvent) => {
                  e.preventDefault();
                  setColumnaSobre(null);
                  const id = e.dataTransfer.getData("text/plain");
                  const oportunidad = oportunidades.find((o) => o.id === id);
                  if (oportunidad) pedirMovimiento(oportunidad, etapa);
                }}
              >
                {tarjetas.length === 0 && <p className="texto-terciario" style={{ padding: "8px 4px" }}>{t("pipeline.vacio")}</p>}
                {tarjetas.map((o) => {
                  const dias = diasDesde(o.ultimaActividadEn);
                  const estancada = !ETAPAS_FINALES.includes(o.etapa) && dias >= UMBRAL_ESTANCADA_DIAS;
                  const editable = puedeEditar(o);
                  return (
                    <div
                      key={o.id}
                      className={`tarjeta-oportunidad etapa-${o.etapa}${estancada ? " estancada" : ""}${arrastrando === o.id ? " arrastrando" : ""}`}
                      draggable={editable}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", o.id);
                        setArrastrando(o.id);
                      }}
                      onDragEnd={() => setArrastrando(null)}
                      onClick={() => setOportunidadAbierta(o)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setOportunidadAbierta(o);
                      }}
                    >
                      <span className="tarjeta-oportunidad-empresa">{nombreEmpresa(o.empresaId)}</span>
                      <span className="tarjeta-oportunidad-nombre">{o.nombre}</span>
                      <div className="tarjeta-oportunidad-fila">
                        <span className="tarjeta-oportunidad-importe">{formatearImporte(o.importe, idioma)}</span>
                        <span>{o.probabilidad}%</span>
                      </div>
                      <div className="tarjeta-oportunidad-fila">
                        <span>{formatearFecha(o.fechaCierrePrevista, idioma)}</span>
                        <span className={estancada ? "texto-secundario" : undefined} style={estancada ? { color: "var(--aviso)" } : undefined}>
                          {dias} {t("comun.dias")}
                        </span>
                      </div>
                      <select
                        className="entrada"
                        style={{ fontSize: "var(--fs-1)", padding: "5px 8px" }}
                        value={o.etapa}
                        aria-label={t("pipeline.moverA")}
                        disabled={!editable || (ETAPAS_FINALES.includes(o.etapa) && usuario?.rol !== "director")}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => pedirMovimiento(o, e.target.value as Etapa)}
                      >
                        {ETAPAS.map((op) => (
                          <option key={op} value={op}>
                            {t(CLAVE_ETAPA[op])}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {modalPerdida && (
        <ModalPerdida
          oportunidad={modalPerdida.oportunidad}
          onCerrar={() => setModalPerdida(null)}
          onConfirmar={async (motivo) => {
            await aplicarMovimiento(modalPerdida.oportunidad, "perdida", motivo);
            setModalPerdida(null);
          }}
        />
      )}

      {modalNueva && (
        <NuevaOportunidadModal
          empresas={empresas}
          usuarios={comerciales}
          esDirector={usuario?.rol === "director"}
          onCerrar={() => setModalNueva(false)}
          onCreada={() => {
            setModalNueva(false);
            cargar();
          }}
        />
      )}

      {oportunidadAbierta && (
        <DetalleOportunidadModal
          oportunidad={oportunidadAbierta}
          empresaNombre={nombreEmpresa(oportunidadAbierta.empresaId)}
          editable={puedeEditar(oportunidadAbierta)}
          esDirector={usuario?.rol === "director"}
          comerciales={comerciales}
          onCerrar={() => setOportunidadAbierta(null)}
          onActualizada={(o) => {
            setOportunidades((actual) => actual.map((x) => (x.id === o.id ? o : x)));
            setOportunidadAbierta(null);
          }}
        />
      )}
    </div>
  );
}

function ModalPerdida({
  oportunidad,
  onCerrar,
  onConfirmar
}: {
  oportunidad: Oportunidad;
  onCerrar: () => void;
  onConfirmar: (motivo: string) => Promise<void>;
}) {
  const { t } = useI18n();
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      await onConfirmar(motivo);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal titulo={oportunidad.nombre} onCerrar={onCerrar}>
      <form className="pila" onSubmit={enviar}>
        <div className="campo">
          <label htmlFor="motivo-perdida">{t("pipeline.motivoPerdida")}</label>
          <textarea
            id="motivo-perdida"
            className="entrada"
            placeholder={t("pipeline.motivoPlaceholder")}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="fila" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="boton boton-fantasma" onClick={onCerrar}>
            {t("comun.cancelar")}
          </button>
          <button type="submit" className="boton boton-peligro" disabled={enviando || !motivo.trim()}>
            {enviando ? t("comun.guardando") : t("pipeline.confirmarPerdida")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function NuevaOportunidadModal({
  empresas,
  usuarios,
  esDirector,
  onCerrar,
  onCreada
}: {
  empresas: Empresa[];
  usuarios: Usuario[];
  esDirector: boolean;
  onCerrar: () => void;
  onCreada: () => void;
}) {
  const { t } = useI18n();
  const { usuario } = useAuth();
  const [empresaId, setEmpresaId] = useState(empresas[0]?.id ?? "");
  const [nombre, setNombre] = useState("");
  const [importe, setImporte] = useState("");
  const [fechaCierrePrevista, setFechaCierrePrevista] = useState("");
  const [propietarioId, setPropietarioId] = useState(usuario?.id ?? "");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      await api.post("/oportunidades", {
        empresaId,
        nombre,
        importe: Number(importe),
        fechaCierrePrevista,
        propietarioId: esDirector ? propietarioId : undefined
      });
      onCreada();
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : t("comun.error"));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal titulo={t("pipeline.nuevaOportunidad")} onCerrar={onCerrar}>
      <form className="pila" onSubmit={enviar}>
        <div className="campo">
          <label htmlFor="op-empresa">{t("empresas.titulo")}</label>
          <select id="op-empresa" className="entrada" value={empresaId} onChange={(e) => setEmpresaId(e.target.value)} required>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="op-nombre">{t("empresas.nombre")}</label>
          <input id="op-nombre" className="entrada" value={nombre} onChange={(e) => setNombre(e.target.value)} required autoFocus />
        </div>
        <div className="campo">
          <label htmlFor="op-importe">{t("comun.importe")}</label>
          <input id="op-importe" className="entrada" type="number" min={0} step={1} value={importe} onChange={(e) => setImporte(e.target.value)} required />
        </div>
        <div className="campo">
          <label htmlFor="op-fecha">{t("hoy.fechaLimite")}</label>
          <input id="op-fecha" className="entrada" type="date" value={fechaCierrePrevista} onChange={(e) => setFechaCierrePrevista(e.target.value)} required />
        </div>
        {esDirector && (
          <div className="campo">
            <label htmlFor="op-propietario">{t("pipeline.propietario")}</label>
            <select id="op-propietario" className="entrada" value={propietarioId} onChange={(e) => setPropietarioId(e.target.value)}>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
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

function DetalleOportunidadModal({
  oportunidad,
  empresaNombre,
  editable,
  esDirector,
  comerciales,
  onCerrar,
  onActualizada
}: {
  oportunidad: Oportunidad;
  empresaNombre: string;
  editable: boolean;
  esDirector: boolean;
  comerciales: Usuario[];
  onCerrar: () => void;
  onActualizada: (o: Oportunidad) => void;
}) {
  const { t, idioma } = useI18n();
  const [importe, setImporte] = useState(String(oportunidad.importe));
  const [probabilidad, setProbabilidad] = useState(String(oportunidad.probabilidad));
  const [fechaCierrePrevista, setFechaCierrePrevista] = useState(oportunidad.fechaCierrePrevista);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const actualizada = await api.put<Oportunidad>(`/oportunidades/${oportunidad.id}`, {
        importe: Number(importe),
        probabilidad: Number(probabilidad),
        fechaCierrePrevista
      });
      onActualizada(actualizada);
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : t("comun.error"));
    } finally {
      setGuardando(false);
    }
  }

  async function reasignar(uid: string) {
    const actualizada = await api.post<Oportunidad>(`/oportunidades/${oportunidad.id}/reasignar`, { propietarioId: uid });
    onActualizada(actualizada);
  }

  return (
    <Modal titulo={`${oportunidad.nombre} · ${empresaNombre}`} onCerrar={onCerrar}>
      {oportunidad.motivoPerdida && (
        <p className="texto-secundario">
          {t("pipeline.motivoPerdida")}: {oportunidad.motivoPerdida}
        </p>
      )}
      <form className="pila" onSubmit={guardar}>
        <div className="campo">
          <label htmlFor="d-importe">{t("comun.importe")}</label>
          <input
            id="d-importe"
            className="entrada"
            type="number"
            min={0}
            value={importe}
            disabled={!editable}
            onChange={(e) => setImporte(e.target.value)}
          />
        </div>
        <div className="campo">
          <label htmlFor="d-prob">{t("pipeline.probabilidad")}</label>
          <input
            id="d-prob"
            className="entrada"
            type="number"
            min={0}
            max={100}
            value={probabilidad}
            disabled={!editable}
            onChange={(e) => setProbabilidad(e.target.value)}
          />
        </div>
        <div className="campo">
          <label htmlFor="d-fecha">{t("hoy.fechaLimite")}</label>
          <input
            id="d-fecha"
            className="entrada"
            type="date"
            value={fechaCierrePrevista}
            disabled={!editable}
            onChange={(e) => setFechaCierrePrevista(e.target.value)}
          />
        </div>
        {esDirector && (
          <div className="campo">
            <label htmlFor="d-propietario">{t("pipeline.reasignar")}</label>
            <select id="d-propietario" className="entrada" value={oportunidad.propietarioId} onChange={(e) => reasignar(e.target.value)}>
              {comerciales.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
        {error && <p className="mensaje-error">{error}</p>}
        <div className="fila" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="boton boton-fantasma" onClick={onCerrar}>
            {t("comun.cerrar")}
          </button>
          {editable && (
            <button type="submit" className="boton boton-primario" disabled={guardando}>
              {guardando ? t("comun.guardando") : t("comun.guardar")}
            </button>
          )}
        </div>
      </form>
      <p className="texto-terciario">{formatearFecha(oportunidad.creadaEn, idioma)}</p>
    </Modal>
  );
}
