import type { ReactNode } from "react";

interface Props {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

export function EstadoVacio({ titulo, descripcion, accion }: Props) {
  return (
    <div className="estado-vacio">
      <p style={{ fontWeight: 500, color: "var(--texto)" }}>{titulo}</p>
      {descripcion && <p className="texto-terciario">{descripcion}</p>}
      {accion}
    </div>
  );
}
