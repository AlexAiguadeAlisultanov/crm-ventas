import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { IDIOMAS } from "../i18n/diccionario";
import { useI18n } from "../i18n/I18nContext";

interface CuentaDemo {
  email: string;
  nombre: string;
  rol: "comercial" | "director";
}

export function Login() {
  const { entrar } = useAuth();
  const { t, idioma, cambiarIdioma } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cuentas, setCuentas] = useState<CuentaDemo[]>([]);

  useEffect(() => {
    api.get<CuentaDemo[]>("/auth/cuentas-demo").then(setCuentas).catch(() => setCuentas([]));
  }, []);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await entrar(email, password);
    } catch {
      setError(t("login.error"));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pantalla-login">
      <div className="tarjeta tarjeta-login">
        <div className="espacio-entre">
          <div>
            <h1 style={{ fontSize: "var(--fs-4)", fontWeight: 600 }}>{t("login.titulo")}</h1>
            <p className="texto-terciario">{t("login.subtitulo")}</p>
          </div>
          <div className="selector-idioma" role="group" aria-label="Idioma">
            {IDIOMAS.map((op) => (
              <button key={op.codigo} className={op.codigo === idioma ? "activo" : ""} onClick={() => cambiarIdioma(op.codigo)}>
                {op.etiqueta}
              </button>
            ))}
          </div>
        </div>

        <form className="pila" onSubmit={enviar}>
          <div className="campo">
            <label htmlFor="email">{t("login.email")}</label>
            <input id="email" className="entrada" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="campo">
            <label htmlFor="password">{t("login.password")}</label>
            <input id="password" className="entrada" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="mensaje-error">{error}</p>}
          <button className="boton boton-primario" type="submit" disabled={enviando}>
            {enviando ? t("login.entrando") : t("login.entrar")}
          </button>
        </form>

        {cuentas.length > 0 && (
          <div className="cuentas-demo">
            <p className="texto-terciario">{t("login.cuentasDemo")}</p>
            {cuentas.map((cuenta) => (
              <button
                key={cuenta.email}
                type="button"
                className="boton-cuenta-demo"
                onClick={() => {
                  setEmail(cuenta.email);
                  setPassword("prova1234");
                }}
              >
                <strong>{cuenta.nombre}</strong>
                <span className="texto-terciario">
                  {cuenta.email} · {cuenta.rol === "director" ? t("login.director") : t("login.comercial")}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
