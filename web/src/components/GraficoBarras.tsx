interface Fila {
  etiqueta: string;
  valor: number;
  textoValor: string;
}

interface Props {
  filas: Fila[];
  colorBarra?: string;
}

/** Gráfico de barras horizontal en HTML/CSS: nada de texto dentro de un SVG
    estirado, que se deformaba hasta ser ilegible en pantallas anchas. */
export function GraficoBarras({ filas, colorBarra = "var(--acento)" }: Props) {
  const maximo = Math.max(1, ...filas.map((f) => f.valor));

  return (
    <div className="pila" style={{ gap: 10 }} role="img" aria-label="Gráfico de barras">
      {filas.map((f) => (
        <div className="grafico-barra-fila" key={f.etiqueta}>
          <span className="grafico-barra-etiqueta" title={f.etiqueta}>
            {f.etiqueta}
          </span>
          <div className="grafico-barra-pista">
            <div className="grafico-barra-relleno" style={{ width: `${Math.max(2, (f.valor / maximo) * 100)}%`, background: colorBarra }} />
          </div>
          <span className="grafico-barra-valor">{f.textoValor}</span>
        </div>
      ))}
    </div>
  );
}
