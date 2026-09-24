interface Fila {
  etiqueta: string;
  valor: number;
  textoValor: string;
}

interface Props {
  filas: Fila[];
  colorBarra?: string;
}

/** Gráfico de barras horizontal hecho a mano en SVG, sin librerías de terceros. */
export function GraficoBarras({ filas, colorBarra = "var(--acento)" }: Props) {
  const maximo = Math.max(1, ...filas.map((f) => f.valor));
  const alturaFila = 28;
  const alto = filas.length * alturaFila;

  return (
    <svg viewBox={`0 0 100 ${alto}`} width="100%" height={alto} preserveAspectRatio="none" role="img" aria-label="Gráfico de barras">
      {filas.map((f, i) => {
        const y = i * alturaFila;
        const ancho = (f.valor / maximo) * 62;
        return (
          <g key={f.etiqueta} transform={`translate(0, ${y})`}>
            <text x="0" y={alturaFila / 2 + 3} fontSize="4.5" fill="var(--texto-secundario)">
              {f.etiqueta}
            </text>
            <rect x="22" y={alturaFila / 2 - 4} width="62" height="8" rx="4" fill="var(--bg-hover)" />
            <rect x="22" y={alturaFila / 2 - 4} width={Math.max(1, ancho)} height="8" rx="4" fill={colorBarra} />
            <text x="86" y={alturaFila / 2 + 3} fontSize="4.5" fill="var(--texto)" fontWeight={600}>
              {f.textoValor}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
