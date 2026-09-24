import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { Mail, Phone, Plus, Zap } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { api, ErrorApi } from "../api";
import { EstadoVacio } from "../components/EstadoVacio";
import { Modal } from "../components/Modal";
import { formatearFecha, formatearFechaHora, formatearImporte } from "../format";
import { useI18n } from "../i18n/I18nContext";
import type { ClaveTexto } from "../i18n/diccionario";
import type { Actividad, Contacto, EmpresaDetalle, Oportunidad, TipoActividad, Usuario } from "../tipos";

const CLAVE_TIPO: Record<TipoActividad, ClaveTexto> = {
  llamada: "empresas.tipoLlamada",
  email: "empresas.tipoEmail",
  reunion: "empresas.tipoReunion",
  nota: "empresas.tipoNota"
};

const CLAVE_ETAPA: Record<string, ClaveTexto> = {
  prospecto: "pipeline.etapa.prospecto",
  cualificada: "pipeline.etapa.cualificada",
  propuesta: "pipeline.etapa.propuesta",
  negociacion: "pipeline.etapa.negociacion",
  ganada: "pipeline.etapa.ganada",
  perdida: "pipeline.etapa.perdida"
};

export function CompaniaDetalle() {
  const { id } = useParams<{ id: string }>();
  const { t, idioma } = useI18n();
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState<EmpresaDetalle | null>(null);
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [modalContacto, setModalContacto] = useState(false);
  const [modalActividad, setModalActividad] = useState(false);

  function cargar() {
    if (!id) return;
    api.get<EmpresaDetalle>(`/empresas/${id}`).then(setEmpresa);
    api.get<Oportunidad[]>("/oportunidades").then((todas) => setOportunidades(todas.filter((o) => o.empresaId === id)));
    api.get<Usuario[]>("/usuarios").then(setUsuarios);
  }

  useEffect(cargar, [id]);

  if (!empresa) return <p className="texto-secundario">{t("comun.cargando")}</p>;

  const nombreComercial = (uid: string) => usuarios.find((u) => u.id === uid)?.nombre ?? "";

  return (
    <div className="pila" style={{ gap: 32 }}>
      <div className="cabecera-pagina">
        <div>
          <span className="numero-seccion">02</span>
          <h1 className="titulo-pagina" style={{ fontSize: "var(--fs-5)", textTransform: "none" }}>
            {empresa.nombre}
          </h1>
          <p className="texto-secundario">
            {empresa.cif} · {empresa.sector || "—"}
          </p>
        </div>
      </div>

      {empresa.notas && <p className="texto-secundario">{empresa.notas}</p>}

      <div className="rejilla-2" style={{ alignItems: "start" }}>
        <section className="pila">
          <div className="espacio-entre">
            <h2 style={{ fontSize: "var(--fs-4)", fontWeight: 600 }}>{t("empresas.contactos")}</h2>
            <button className="boton boton-secundario" onClick={() => setModalContacto(true)}>
              <Plus size={15} /> {t("empresas.nuevoContacto")}
            </button>
          </div>
          {empresa.contactos.length === 0 ? (
            <p className="texto-terciario">—</p>
          ) : (
            <ul className="pila" style={{ gap: 8 }}>
              {empresa.contactos.map((c) => (
                <ContactoItem key={c.id} contacto={c} />
              ))}
            </ul>
          )}
        </section>

        <section className="pila">
          <h2 style={{ fontSize: "var(--fs-4)", fontWeight: 600 }}>{t("empresas.oportunidades")}</h2>
          {oportunidades.length === 0 ? (
            <p className="texto-terciario">{t("empresas.sinOportunidades")}</p>
          ) : (
            <ul className="pila" style={{ gap: 8 }}>
              {oportunidades.map((o) => (
                <li key={o.id} className="tarjeta" style={{ padding: 12 }}>
                  <div className="espacio-entre">
                    <div className="fila">
                      <Zap size={14} color="var(--acento)" />
                      <span style={{ fontWeight: 500 }}>{o.nombre}</span>
                    </div>
                    <span className="distintivo distintivo-neutro">{t(CLAVE_ETAPA[o.etapa]!)}</span>
                  </div>
                  <p className="texto-terciario" style={{ marginTop: 4 }}>
                    {formatearImporte(o.importe, idioma)} · {nombreComercial(o.propietarioId)} · {formatearFecha(o.fechaCierrePrevista, idioma)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="pila">
        <div className="espacio-entre">
          <h2 style={{ fontSize: "var(--fs-4)", fontWeight: 600 }}>{t("empresas.actividad")}</h2>
          <button className="boton boton-secundario" onClick={() => setModalActividad(true)}>
            <Plus size={15} /> {t("empresas.nuevaActividad")}
          </button>
        </div>
        {empresa.actividades.length === 0 ? (
          <EstadoVacio titulo={t("empresas.sinActividad")} />
        ) : (
          <ul className="pila" style={{ gap: 10 }}>
            {empresa.actividades.map((a, i) => (
              <ActividadItem key={a.id} actividad={a} indice={i} />
            ))}
          </ul>
        )}
      </section>

      {modalContacto && (
        <NuevoContactoModal
          empresaId={empresa.id}
          onCerrar={() => setModalContacto(false)}
          onCreado={() => {
            setModalContacto(false);
            cargar();
          }}
        />
      )}

      {modalActividad && (
        <NuevaActividadModal
          empresaId={empresa.id}
          oportunidades={oportunidades}
          onCerrar={() => setModalActividad(false)}
          onCreada={() => {
            setModalActividad(false);
            cargar();
          }}
        />
      )}

      <button className="boton boton-fantasma" onClick={() => navigate(-1)} style={{ alignSelf: "flex-start" }}>
        ← {t("nav.empresas")}
      </button>
    </div>
  );
}

function ContactoItem({ contacto }: { contacto: Contacto }) {
  return (
    <li className="tarjeta" style={{ padding: 12 }}>
      <p style={{ fontWeight: 500 }}>{contacto.nombre}</p>
      <p className="texto-terciario">{contacto.cargo}</p>
      <div className="fila" style={{ marginTop: 6, flexWrap: "wrap", gap: 12 }}>
        {contacto.email && (
          <span className="texto-terciario fila" style={{ gap: 4 }}>
            <Mail size={12} /> {contacto.email}
          </span>
        )}
        {contacto.telefono && (
          <span className="texto-terciario fila" style={{ gap: 4 }}>
            <Phone size={12} /> {contacto.telefono}
          </span>
        )}
      </div>
    </li>
  );
}

function ActividadItem({ actividad, indice }: { actividad: Actividad; indice: number }) {
  const { t, idioma } = useI18n();
  return (
    <li
      className="tarjeta entrada-escalonada"
      style={{ padding: 12, ["--indice" as string]: indice } as CSSProperties}
    >
      <div className="espacio-entre">
        <span className="distintivo distintivo-acento">{t(CLAVE_TIPO[actividad.tipo])}</span>
        <span className="texto-terciario">{formatearFechaHora(actividad.creadaEn, idioma)}</span>
      </div>
      {actividad.nota && <p style={{ marginTop: 6 }}>{actividad.nota}</p>}
    </li>
  );
}

function NuevoContactoModal({ empresaId, onCerrar, onCreado }: { empresaId: string; onCerrar: () => void; onCreado: () => void }) {
  const { t } = useI18n();
  const [nombre, setNombre] = useState("");
  const [cargo, setCargo] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      await api.post(`/empresas/${empresaId}/contactos`, { nombre, cargo, email, telefono });
      onCreado();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal titulo={t("empresas.nuevoContacto")} onCerrar={onCerrar}>
      <form className="pila" onSubmit={enviar}>
        <div className="campo">
          <label htmlFor="c-nombre">{t("empresas.nombre")}</label>
          <input id="c-nombre" className="entrada" value={nombre} onChange={(e) => setNombre(e.target.value)} required autoFocus />
        </div>
        <div className="campo">
          <label htmlFor="c-cargo">{t("empresas.cargo")}</label>
          <input id="c-cargo" className="entrada" value={cargo} onChange={(e) => setCargo(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="c-email">{t("login.email")}</label>
          <input id="c-email" className="entrada" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="c-telefono">{t("empresas.telefono")}</label>
          <input id="c-telefono" className="entrada" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
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

function NuevaActividadModal({
  empresaId,
  oportunidades,
  onCerrar,
  onCreada
}: {
  empresaId: string;
  oportunidades: Oportunidad[];
  onCerrar: () => void;
  onCreada: () => void;
}) {
  const { t } = useI18n();
  const [tipo, setTipo] = useState<TipoActividad>("llamada");
  const [nota, setNota] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [oportunidadId, setOportunidadId] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      await api.post(`/empresas/${empresaId}/actividades`, { tipo, nota, fecha, oportunidadId: oportunidadId || null });
      onCreada();
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : t("comun.error"));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal titulo={t("empresas.nuevaActividad")} onCerrar={onCerrar}>
      <form className="pila" onSubmit={enviar}>
        <div className="campo">
          <label htmlFor="a-tipo">{t("empresas.actividad")}</label>
          <select id="a-tipo" className="entrada" value={tipo} onChange={(e) => setTipo(e.target.value as TipoActividad)}>
            <option value="llamada">{t("empresas.tipoLlamada")}</option>
            <option value="email">{t("empresas.tipoEmail")}</option>
            <option value="reunion">{t("empresas.tipoReunion")}</option>
            <option value="nota">{t("empresas.tipoNota")}</option>
          </select>
        </div>
        {oportunidades.length > 0 && (
          <div className="campo">
            <label htmlFor="a-oportunidad">{t("empresas.oportunidades")}</label>
            <select id="a-oportunidad" className="entrada" value={oportunidadId} onChange={(e) => setOportunidadId(e.target.value)}>
              <option value="">—</option>
              {oportunidades.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="campo">
          <label htmlFor="a-fecha">{t("hoy.fechaLimite")}</label>
          <input id="a-fecha" className="entrada" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </div>
        <div className="campo">
          <label htmlFor="a-nota">{t("empresas.notaActividad")}</label>
          <textarea id="a-nota" className="entrada" value={nota} onChange={(e) => setNota(e.target.value)} autoFocus />
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
