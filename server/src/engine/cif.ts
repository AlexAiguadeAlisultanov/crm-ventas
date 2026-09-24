// Validación de identificadores fiscales españoles: NIF, NIE y CIF.
// El objetivo no es aceptar cualquier formato parecido, sino comprobar de
// verdad el dígito o la letra de control, que es lo que evita que se cuele
// un CIF mal tecleado en la ficha de una empresa.

const LETRAS_NIF = "TRWAGMYFPDXBNJZSQVHLCKE";
const LETRAS_CIF_CONTROL = "JABCDEFGHI";

// Organizaciones cuyo carácter de control siempre es un dígito.
const CIF_CONTROL_NUMERICO = new Set(["A", "B", "E", "H"]);
// Organizaciones cuyo carácter de control siempre es una letra.
const CIF_CONTROL_ALFABETICO = new Set(["K", "N", "P", "Q", "R", "S", "W"]);
const LETRAS_CIF_VALIDAS = "ABCDEFGHJKLMNPQRSUVW";

export type TipoIdentificador = "NIF" | "NIE" | "CIF";

export interface ResultadoValidacion {
  valido: boolean;
  tipo: TipoIdentificador | null;
  motivo?: string;
}

function limpiar(valor: string): string {
  return valor.trim().toUpperCase().replace(/[\s-]/g, "");
}

function letraNIF(numero: number): string {
  return LETRAS_NIF[numero % 23] ?? "";
}

function validarNIF(valor: string): ResultadoValidacion {
  const numero = Number(valor.slice(0, 8));
  const letra = valor.slice(8);
  if (letra !== letraNIF(numero)) {
    return { valido: false, tipo: null, motivo: "La letra no coincide con el número del NIF." };
  }
  return { valido: true, tipo: "NIF" };
}

function validarNIE(valor: string): ResultadoValidacion {
  const prefijos: Record<string, string> = { X: "0", Y: "1", Z: "2" };
  const prefijo = prefijos[valor[0] ?? ""];
  if (prefijo === undefined) {
    return { valido: false, tipo: null, motivo: "Formato de NIE no reconocido." };
  }
  const numero = Number(prefijo + valor.slice(1, 8));
  const letra = valor.slice(8);
  if (letra !== letraNIF(numero)) {
    return { valido: false, tipo: null, motivo: "La letra no coincide con el número del NIE." };
  }
  return { valido: true, tipo: "NIE" };
}

/** Calcula el dígito de control (0-9) de las siete cifras centrales de un CIF. */
export function calcularDigitoControlCIF(sieteDigitos: string): number {
  let sumaPares = 0;
  let sumaImpares = 0;
  for (let i = 0; i < 7; i++) {
    const cifra = Number(sieteDigitos[i]);
    if (i % 2 === 0) {
      // Posiciones impares (1ª, 3ª, 5ª, 7ª): se duplican y se suman los dígitos del resultado.
      const doble = cifra * 2;
      sumaImpares += doble > 9 ? doble - 9 : doble;
    } else {
      sumaPares += cifra;
    }
  }
  const total = sumaPares + sumaImpares;
  return (10 - (total % 10)) % 10;
}

function validarCIFCompleto(valor: string): ResultadoValidacion {
  const letraOrganizacion = valor[0] ?? "";
  if (!LETRAS_CIF_VALIDAS.includes(letraOrganizacion)) {
    return { valido: false, tipo: null, motivo: "La primera letra del CIF no corresponde a ningún tipo de entidad." };
  }
  const sieteDigitos = valor.slice(1, 8);
  if (!/^\d{7}$/.test(sieteDigitos)) {
    return { valido: false, tipo: null, motivo: "El CIF debe tener siete cifras entre la letra y el carácter de control." };
  }
  const control = valor[8] ?? "";
  const digitoEsperado = calcularDigitoControlCIF(sieteDigitos);
  const letraEsperada = LETRAS_CIF_CONTROL[digitoEsperado] ?? "";

  const requiereNumero = CIF_CONTROL_NUMERICO.has(letraOrganizacion);
  const requiereLetra = CIF_CONTROL_ALFABETICO.has(letraOrganizacion);

  const coincideNumero = control === String(digitoEsperado);
  const coincideLetra = control === letraEsperada;

  if (requiereNumero && !coincideNumero) {
    return { valido: false, tipo: null, motivo: "El dígito de control del CIF no es correcto." };
  }
  if (requiereLetra && !coincideLetra) {
    return { valido: false, tipo: null, motivo: "La letra de control del CIF no es correcta." };
  }
  if (!requiereNumero && !requiereLetra && !coincideNumero && !coincideLetra) {
    return { valido: false, tipo: null, motivo: "El carácter de control del CIF no es correcto." };
  }
  return { valido: true, tipo: "CIF" };
}

/** Valida un NIF, NIE o CIF español comprobando su letra o dígito de control. */
export function validarIdentificadorFiscal(entrada: string): ResultadoValidacion {
  const valor = limpiar(entrada ?? "");
  if (/^\d{8}[A-Z]$/.test(valor)) return validarNIF(valor);
  if (/^[XYZ]\d{7}[A-Z]$/.test(valor)) return validarNIE(valor);
  if (/^[A-Z]\d{7}[0-9A-Z]$/.test(valor)) return validarCIFCompleto(valor);
  return { valido: false, tipo: null, motivo: "No tiene la forma de un NIF, NIE o CIF español." };
}
