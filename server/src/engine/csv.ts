import { validarIdentificadorFiscal } from "./cif.js";

export interface EmpresaImportada {
  nombre: string;
  cif: string;
  sector: string;
  notas: string;
}

export interface ErrorImportacion {
  linea: number;
  motivo: string;
}

export interface ResultadoImportacion {
  validas: EmpresaImportada[];
  errores: ErrorImportacion[];
}

const COLUMNAS_ESPERADAS = ["nombre", "cif", "sector", "notas"];

/** Parsea una línea CSV respetando comillas y comas dentro de campos entrecomillados. */
function parsearLinea(linea: string): string[] {
  const campos: string[] = [];
  let actual = "";
  let entreComillas = false;
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];
    if (entreComillas) {
      if (c === '"' && linea[i + 1] === '"') {
        actual += '"';
        i++;
      } else if (c === '"') {
        entreComillas = false;
      } else {
        actual += c;
      }
    } else if (c === '"') {
      entreComillas = true;
    } else if (c === ",") {
      campos.push(actual.trim());
      actual = "";
    } else {
      actual += c;
    }
  }
  campos.push(actual.trim());
  return campos;
}

/**
 * Importa empresas desde un CSV con cabecera nombre,cif,sector,notas.
 * Cada línea se valida por separado: una fila mal escrita no tira las demás,
 * se recoge como error con su número de línea (contando la cabecera como 1).
 */
export function parsearCSVEmpresas(contenido: string): ResultadoImportacion {
  const lineas = contenido
    .split(/\r?\n/)
    .map((l) => l)
    .filter((l, i, arr) => !(l.trim() === "" && i === arr.length - 1));

  const validas: EmpresaImportada[] = [];
  const errores: ErrorImportacion[] = [];

  if (lineas.length === 0) {
    return { validas, errores: [{ linea: 1, motivo: "El archivo está vacío." }] };
  }

  const cabecera = parsearLinea(lineas[0]!).map((c) => c.toLowerCase());
  const faltantes = COLUMNAS_ESPERADAS.filter((c) => !cabecera.includes(c));
  if (faltantes.length > 0) {
    return {
      validas,
      errores: [{ linea: 1, motivo: `Faltan columnas en la cabecera: ${faltantes.join(", ")}.` }]
    };
  }

  const indice = Object.fromEntries(cabecera.map((c, i) => [c, i]));

  for (let i = 1; i < lineas.length; i++) {
    const linea = lineas[i]!;
    if (linea.trim() === "") continue;
    const numeroLinea = i + 1;
    const campos = parsearLinea(linea);

    const nombre = (campos[indice.nombre!] ?? "").trim();
    const cif = (campos[indice.cif!] ?? "").trim();
    const sector = (campos[indice.sector!] ?? "").trim();
    const notas = (campos[indice.notas!] ?? "").trim();

    if (!nombre) {
      errores.push({ linea: numeroLinea, motivo: "Falta el nombre de la empresa." });
      continue;
    }
    const validacion = validarIdentificadorFiscal(cif);
    if (!validacion.valido) {
      errores.push({ linea: numeroLinea, motivo: `CIF no válido (${cif || "vacío"}): ${validacion.motivo ?? ""}`.trim() });
      continue;
    }

    validas.push({ nombre, cif: cif.toUpperCase(), sector, notas });
  }

  return { validas, errores };
}
