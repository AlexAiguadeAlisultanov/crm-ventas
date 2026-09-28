interface Escalon {
  etiqueta: string;
  cantidad: number;
  tasaConversion: number | null;
}

interface Props {
  escalones: Escalon[];
}

/** Embudo de conversión en HTML/CSS: cada escalón más estrecho que el
    anterior, centrado. Antes era un SVG estirado sin mantener proporción,
    que deformaba el texto en pantallas anchas. */
export function GraficoEmbudo({ escalones }: Props) {
  const maximo = Math.max(1, ...escalones.map((e) => e.cantidad));

  return (
    <div className="embudo" role="img" aria-label="Embudo de conversión">
      {escalones.map((e) => {
        const ancho = 20 + (e.cantidad / maximo) * 80;
        return (
          <div className="embudo-escalon" key={e.etiqueta} style={{ width: `${ancho}%` }}>
            <span className="embudo-escalon-etiqueta">
              {e.etiqueta} · {e.cantidad}
            </span>
            {e.tasaConversion !== null && <span className="embudo-escalon-tasa">{e.tasaConversion}%</span>}
          </div>
        );
      })}
    </div>
  );
}
