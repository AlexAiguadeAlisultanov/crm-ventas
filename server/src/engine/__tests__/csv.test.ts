import { describe, expect, it } from "vitest";
import { calcularDigitoControlCIF } from "../cif.js";
import { parsearCSVEmpresas } from "../csv.js";

function cifValido(letra: string, sieteDigitos: string): string {
  return `${letra}${sieteDigitos}${calcularDigitoControlCIF(sieteDigitos)}`;
}

describe("parsearCSVEmpresas", () => {
  it("importa las filas correctas y sigue leyendo tras una fila con error", () => {
    const cif1 = cifValido("B", "1111111");
    const cif2 = cifValido("B", "2222222");
    const contenido = [
      "nombre,cif,sector,notas",
      `Comercial del Nord SL,${cif1},Distribución,Cliente desde 2022`,
      `Sin CIF SL,,Retail,`,
      `Metalúrgica Ebre SA,${cif2},Industria,`
    ].join("\n");

    const resultado = parsearCSVEmpresas(contenido);

    expect(resultado.validas).toHaveLength(2);
    expect(resultado.validas[0]?.nombre).toBe("Comercial del Nord SL");
    expect(resultado.errores).toHaveLength(1);
    expect(resultado.errores[0]?.linea).toBe(3);
  });

  it("respeta los campos entrecomillados con comas dentro", () => {
    const cif = cifValido("B", "3333333");
    const contenido = `nombre,cif,sector,notas\n"Fabricación, Envases y Cía",${cif},Envases,"Pedido grande, revisar en Q4"`;
    const resultado = parsearCSVEmpresas(contenido);
    expect(resultado.validas).toHaveLength(1);
    expect(resultado.validas[0]?.nombre).toBe("Fabricación, Envases y Cía");
    expect(resultado.validas[0]?.notas).toBe("Pedido grande, revisar en Q4");
  });

  it("informa de las columnas que faltan en la cabecera", () => {
    const resultado = parsearCSVEmpresas("nombre,cif\nEmpresa,12345678Z");
    expect(resultado.validas).toHaveLength(0);
    expect(resultado.errores[0]?.motivo).toContain("sector");
  });

  it("rechaza filas sin nombre o con CIF inválido, sin perder las buenas", () => {
    const cifOk = cifValido("B", "4444444");
    const contenido = [
      "nombre,cif,sector,notas",
      `,${cifOk},Sector,`,
      `Empresa Correcta SL,${cifOk},Sector,`,
      `Empresa Mala SL,000000000,Sector,`
    ].join("\n");
    const resultado = parsearCSVEmpresas(contenido);
    expect(resultado.validas).toHaveLength(1);
    expect(resultado.errores).toHaveLength(2);
  });
});
