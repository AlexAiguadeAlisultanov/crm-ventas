interface Escalon {
  etiqueta: string;
  cantidad: number;
  tasaConversion: number | null;
}

interface Props {
  escalones: Escalon[];
}

/** Embudo de conversión hecho a mano en SVG: cada escalón más estrecho que el anterior. */
export function GraficoEmbudo({ escalones }: Props) {
  const maximo = Math.max(1, ...escalones.map((e) => e.cantidad));
  const alturaFila = 40;
  const alto = escalones.length * alturaFila;

  return (
    <svg viewBox={`0 0 100 ${alto}`} width="100%" height={alto} preserveAspectRatio="none" role="img" aria-label="Embudo de conversión">
      {escalones.map((e, i) => {
        const y = i * alturaFila;
        const ancho = 12 + (e.cantidad / maximo) * 76;
        const x = (100 - ancho) / 2;
        return (
          <g key={e.etiqueta} transform={`translate(0, ${y})`}>
            <rect x={x} y={6} width={ancho} height={20} rx="6" fill="var(--acento-suave)" stroke="var(--acento-borde)" />
            <text x="50" y="19" fontSize="4.6" fill="var(--texto)" fontWeight={600} textAnchor="middle">
              {e.etiqueta} · {e.cantidad}
            </text>
            {e.tasaConversion !== null && (
              <text x="50" y="34" fontSize="3.8" fill="var(--texto-terciario)" textAnchor="middle">
                {e.tasaConversion}%
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
