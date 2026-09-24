import { useEffect, useState } from "react";
import { api } from "../api";
import { GraficoBarras } from "../components/GraficoBarras";
import { GraficoEmbudo } from "../components/GraficoEmbudo";
import { formatearImporte } from "../format";
import { useI18n } from "../i18n/I18nContext";
import type { ClaveTexto } from "../i18n/diccionario";
import type { Prevision as PrevisionDatos, Usuario } from "../tipos";

const CLAVE_ETAPA: Record<string, ClaveTexto> = {
  prospecto: "pipeline.etapa.prospecto",
  cualificada: "pipeline.etapa.cualificada",
  propuesta: "pipeline.etapa.propuesta",
  negociacion: "pipeline.etapa.negociacion",
  ganada: "pipeline.etapa.ganada"
};

const MESES_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function etiquetaMes(clave: string): string {
  const [anio, mes] = clave.split("-");
  const indice = Number(mes) - 1;
  return `${MESES_ES[indice] ?? mes} ${anio?.slice(2)}`;
}

export function Prevision() {
  const { t, idioma } = useI18n();
  const [datos, setDatos] = useState<PrevisionDatos | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  useEffect(() => {
    api.get<PrevisionDatos>("/prevision").then(setDatos);
    api.get<Usuario[]>("/usuarios").then(setUsuarios);
  }, []);

  if (!datos) return <p className="texto-secundario">{t("comun.cargando")}</p>;

  const filasMes = Object.entries(datos.porMes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, valor]) => ({ etiqueta: etiquetaMes(mes), valor, textoValor: formatearImporte(valor, idioma) }));

  const filasComercial = datos.porComercial
    ? Object.entries(datos.porComercial)
        .sort(([, a], [, b]) => b - a)
        .map(([id, valor]) => ({
          etiqueta: usuarios.find((u) => u.id === id)?.nombre ?? id,
          valor,
          textoValor: formatearImporte(valor, idioma)
        }))
    : [];

  const escalonesEmbudo = datos.embudo.map((e) => ({
    etiqueta: t(CLAVE_ETAPA[e.etapa] ?? "pipeline.etapa.prospecto"),
    cantidad: e.cantidad,
    tasaConversion: e.tasaConversion
  }));

  return (
    <div className="pila" style={{ gap: 32 }}>
      <div className="cabecera-pagina">
        <div>
          <span className="numero-seccion">04</span>
          <h1 className="titulo-pagina">{t("prevision.titulo")}</h1>
        </div>
        <span className="distintivo distintivo-acento">{datos.ambito === "equipo" ? t("prevision.equipo") : t("prevision.propia")}</span>
      </div>

      <div className="rejilla-3">
        <div className="tarjeta" style={{ padding: 20 }}>
          <p className="texto-terciario">{t("prevision.ponderada")}</p>
          <p style={{ fontSize: "var(--fs-6)", fontWeight: 600, marginTop: 4 }}>{formatearImporte(datos.total, idioma)}</p>
        </div>
        <div className="tarjeta" style={{ padding: 20 }}>
          <p className="texto-terciario">{t("prevision.cicloMedio")}</p>
          <p style={{ fontSize: "var(--fs-6)", fontWeight: 600, marginTop: 4 }}>
            {datos.cicloMedioDias === null ? "—" : `${datos.cicloMedioDias} ${t("comun.dias")}`}
          </p>
          {datos.cicloMedioDias === null && <p className="texto-terciario">{t("prevision.sinDatos")}</p>}
        </div>
      </div>

      <div className="rejilla-2">
        <section className="tarjeta pila" style={{ padding: 20 }}>
          <h2 style={{ fontSize: "var(--fs-4)", fontWeight: 600 }}>{t("prevision.porMes")}</h2>
          {filasMes.length === 0 ? <p className="texto-terciario">—</p> : <GraficoBarras filas={filasMes} />}
        </section>

        {filasComercial.length > 0 && (
          <section className="tarjeta pila" style={{ padding: 20 }}>
            <h2 style={{ fontSize: "var(--fs-4)", fontWeight: 600 }}>{t("prevision.porComercial")}</h2>
            <GraficoBarras filas={filasComercial} colorBarra="var(--exito)" />
          </section>
        )}
      </div>

      <section className="tarjeta pila" style={{ padding: 20 }}>
        <h2 style={{ fontSize: "var(--fs-4)", fontWeight: 600 }}>{t("prevision.embudo")}</h2>
        <GraficoEmbudo escalones={escalonesEmbudo} />
      </section>
    </div>
  );
}
