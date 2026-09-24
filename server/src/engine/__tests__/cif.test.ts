import { describe, expect, it } from "vitest";
import { calcularDigitoControlCIF, validarIdentificadorFiscal } from "../cif.js";

describe("validarIdentificadorFiscal", () => {
  it("acepta un NIF con la letra correcta", () => {
    expect(validarIdentificadorFiscal("12345678Z")).toEqual({ valido: true, tipo: "NIF" });
  });

  it("rechaza un NIF con la letra equivocada", () => {
    const resultado = validarIdentificadorFiscal("12345678A");
    expect(resultado.valido).toBe(false);
  });

  it("acepta un NIF con espacios y guiones sueltos", () => {
    expect(validarIdentificadorFiscal(" 12345678-Z ")).toEqual({ valido: true, tipo: "NIF" });
  });

  it("acepta un NIE bien formado", () => {
    // X1234567 -> se sustituye la X por 0 -> 1234567 mod 23 = 19 -> letra L
    expect(validarIdentificadorFiscal("X1234567L")).toEqual({ valido: true, tipo: "NIE" });
  });

  it("rechaza un NIE con letra de control incorrecta", () => {
    expect(validarIdentificadorFiscal("X1234567A").valido).toBe(false);
  });

  it("valida un CIF de organización con control numérico (A, B, E, H)", () => {
    const sieteDigitos = "1234567";
    const digito = calcularDigitoControlCIF(sieteDigitos);
    const cif = `B${sieteDigitos}${digito}`;
    expect(validarIdentificadorFiscal(cif)).toEqual({ valido: true, tipo: "CIF" });
  });

  it("valida un CIF de organización con control alfabético (K, N, P, Q, R, S, W)", () => {
    const sieteDigitos = "7654321";
    const digito = calcularDigitoControlCIF(sieteDigitos);
    const letras = "JABCDEFGHI";
    const cif = `P${sieteDigitos}${letras[digito]}`;
    expect(validarIdentificadorFiscal(cif)).toEqual({ valido: true, tipo: "CIF" });
  });

  it("rechaza un CIF con el carácter de control equivocado", () => {
    expect(validarIdentificadorFiscal("B1234567X").valido).toBe(false);
  });

  it("rechaza un CIF cuya primera letra no existe", () => {
    expect(validarIdentificadorFiscal("I1234567" + calcularDigitoControlCIF("1234567")).valido).toBe(false);
  });

  it("rechaza cualquier cosa que no tenga forma de identificador fiscal", () => {
    expect(validarIdentificadorFiscal("hola").valido).toBe(false);
    expect(validarIdentificadorFiscal("").valido).toBe(false);
  });
});
