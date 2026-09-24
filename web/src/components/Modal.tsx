import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";

interface Props {
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
  ancho?: number;
}

export function Modal({ titulo, onCerrar, children, ancho }: Props) {
  const { t } = useI18n();

  useEffect(() => {
    function alTeclear(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [onCerrar]);

  return (
    <div className="velo-modal" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className="panel-modal" style={ancho ? { maxWidth: ancho } : undefined} role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="panel-modal-cabecera">
          <h2 style={{ fontSize: "var(--fs-4)", fontWeight: 600 }}>{titulo}</h2>
          <button className="boton boton-fantasma boton-icono" onClick={onCerrar} aria-label={t("comun.cerrar")}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
