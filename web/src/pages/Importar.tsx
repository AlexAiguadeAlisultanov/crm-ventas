import { useRef, useState, type ChangeEvent } from "react";
import { Download, Upload } from "lucide-react";
import { api } from "../api";
import { useI18n } from "../i18n/I18nContext";
import type { ErrorImportacion, FilaImportacion } from "../tipos";

interface Previsualizacion {
  validas: FilaImportacion[];
  errores: ErrorImportacion[];
}

export function Importar() {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [csv, setCsv] = useState<string | null>(null);
  const [previa, setPrevia] = useState<Previsualizacion | null>(null);
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState<number | null>(null);

  async function alElegirArchivo(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    const texto = await archivo.text();
    setCsv(texto);
    setResultado(null);
    const datos = await api.post<Previsualizacion>("/empresas/importar/previsualizar", { csv: texto });
    setPrevia(datos);
  }

  async function confirmar() {
    if (!csv) return;
    setImportando(true);
    try {
      const respuesta = await api.post<{ importadas: number }>("/empresas/importar/confirmar", { csv });
      setResultado(respuesta.importadas);
      setPrevia(null);
      setCsv(null);
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setImportando(false);
    }
  }

  return (
    <div className="pila" style={{ gap: 24 }}>
      <div className="cabecera-pagina">
        <div>
          <span className="numero-seccion">05</span>
          <h1 className="titulo-pagina">{t("importar.titulo")}</h1>
        </div>
        <a className="boton boton-secundario" href="/api/empresas/exportar">
          <Download size={16} /> {t("importar.exportar")}
        </a>
      </div>

      <p className="texto-secundario">{t("importar.explicacion")}</p>

      <div className="fila">
        <input ref={inputRef} type="file" accept=".csv,text/csv" id="archivo-csv" style={{ display: "none" }} onChange={alElegirArchivo} />
        <label htmlFor="archivo-csv" className="boton boton-primario" style={{ cursor: "pointer" }}>
          <Upload size={16} /> {t("importar.elegirArchivo")}
        </label>
      </div>

      {resultado !== null && (
        <div className="tarjeta" style={{ padding: 16, borderColor: "var(--acento-borde)" }}>
          <p>
            {resultado} {t("importar.hecho")}
          </p>
        </div>
      )}

      {previa && (
        <section className="pila">
          <div className="espacio-entre">
            <h2 style={{ fontSize: "var(--fs-4)", fontWeight: 600 }}>{t("importar.previa")}</h2>
            <div className="fila">
              <span className="distintivo distintivo-exito">
                {previa.validas.length} {t("importar.validas")}
              </span>
              {previa.errores.length > 0 && (
                <span className="distintivo distintivo-error">
                  {previa.errores.length} {t("importar.errores")}
                </span>
              )}
            </div>
          </div>

          {previa.validas.length > 0 && (
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
                  {previa.validas.map((fila, i) => (
                    <tr key={i}>
                      <td>{fila.nombre}</td>
                      <td className="texto-secundario">{fila.cif}</td>
                      <td className="texto-secundario">{fila.sector}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {previa.errores.length > 0 && (
            <ul className="pila" style={{ gap: 6 }}>
              {previa.errores.map((error, i) => (
                <li key={i} className="texto-secundario">
                  {t("importar.linea")} {error.linea}: {error.motivo}
                </li>
              ))}
            </ul>
          )}

          <button className="boton boton-primario" style={{ alignSelf: "flex-start" }} onClick={confirmar} disabled={importando || previa.validas.length === 0}>
            {importando ? t("importar.importando") : t("importar.confirmar")}
          </button>
        </section>
      )}
    </div>
  );
}
