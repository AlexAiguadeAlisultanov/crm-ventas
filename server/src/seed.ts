import crypto from "node:crypto";
import { db } from "./db.js";
import { calcularHash, generarSal } from "./auth.js";
import { calcularDigitoControlCIF } from "./engine/cif.js";
import { probabilidadPorDefecto } from "./engine/pipeline.js";
import type { Etapa, TipoActividad } from "./types.js";

function idNuevo(): string {
  return crypto.randomUUID();
}

function cifDe(letra: string, digitos: string): string {
  return `${letra}${digitos}${calcularDigitoControlCIF(digitos)}`;
}

function isoHaceDias(dias: number, horas = 10): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  fecha.setHours(horas, 0, 0, 0);
  return fecha.toISOString();
}

function isoEnDias(dias: number): string {
  return isoHaceDias(-dias);
}

function soloFechaEnDias(dias: number): string {
  return isoEnDias(dias).slice(0, 10);
}

function elegir<T>(lista: T[], indice: number): T {
  return lista[indice % lista.length]!;
}

const SECTORES = [
  "Distribución",
  "Industria",
  "Tecnología",
  "Retail",
  "Construcción",
  "Alimentación",
  "Logística",
  "Servicios profesionales",
  "Energía",
  "Automoción"
];

const EMPRESAS = [
  { nombre: "Comercial del Nord SL", cif: cifDe("B", "1000001"), sector: "Distribución" },
  { nombre: "Metalúrgica Ebre SA", cif: cifDe("A", "1000002"), sector: "Industria" },
  { nombre: "Tallers Vallès SL", cif: cifDe("B", "1000003"), sector: "Automoción" },
  { nombre: "Distribucions Maresme SL", cif: cifDe("B", "1000004"), sector: "Distribución" },
  { nombre: "Grup Segrià Alimentació SL", cif: cifDe("B", "1000005"), sector: "Alimentación" },
  { nombre: "Serveis Bages Consultoria SL", cif: cifDe("B", "1000006"), sector: "Servicios profesionales" },
  { nombre: "Construccions Osona SA", cif: cifDe("A", "1000007"), sector: "Construcción" },
  { nombre: "Logística Garraf SL", cif: cifDe("B", "1000008"), sector: "Logística" },
  { nombre: "Energia Solar Anoia SL", cif: cifDe("B", "1000009"), sector: "Energía" },
  { nombre: "Tecnologia Llobregat SL", cif: cifDe("B", "1000010"), sector: "Tecnología" },
  { nombre: "Envasos i Embalatges Priorat SL", cif: cifDe("B", "1000011"), sector: "Industria" },
  { nombre: "Retail Girona Centre SL", cif: cifDe("B", "1000012"), sector: "Retail" },
  { nombre: "Automocions Selva SA", cif: cifDe("A", "1000013"), sector: "Automoción" },
  { nombre: "Fusteria Industrial Ripollès SL", cif: cifDe("B", "1000014"), sector: "Industria" },
  { nombre: "Alimentació Fresca Empordà SL", cif: cifDe("B", "1000015"), sector: "Alimentación" },
  { nombre: "Consultoria Fiscal Baix Camp SL", cif: cifDe("B", "1000016"), sector: "Servicios profesionales" },
  { nombre: "Transports Urgell SL", cif: cifDe("B", "1000017"), sector: "Logística" },
  { nombre: "Instal·lacions Elèctriques Solsonès SL", cif: cifDe("B", "1000018"), sector: "Energía" },
  { nombre: "Software Andorra Ibèrica SL", cif: cifDe("B", "1000019"), sector: "Tecnología" },
  { nombre: "Materials Construcció Berguedà SA", cif: cifDe("A", "1000020"), sector: "Construcción" },
  { nombre: "Distribuidora Cervesera Conca SL", cif: cifDe("B", "1000021"), sector: "Alimentación" },
  { nombre: "Recanvis Industrials Pallars SL", cif: cifDe("B", "1000022"), sector: "Industria" },
  { nombre: "Botigues Moda Litoral SL", cif: cifDe("B", "1000023"), sector: "Retail" },
  { nombre: "Enginyeria Hidràulica Cerdanya SL", cif: cifDe("B", "1000024"), sector: "Servicios profesionales" },
  { nombre: "Parcs Fotovoltaics Terra Alta SL", cif: cifDe("B", "1000025"), sector: "Energía" }
];

const NOMBRES_CONTACTOS = [
  "Marc Puig", "Laura Soler", "Jordi Ferrer", "Núria Bosch", "David Roca",
  "Marta Vidal", "Pau Camps", "Anna Riera", "Oriol Costa", "Judit Martí",
  "Albert Serra", "Clara Vives", "Ramon Prat", "Sílvia Font", "Xavier Marí",
  "Elena Sáez", "Carlos Muñoz", "Isabel Gómez", "Ricard Bou", "Montse Vila"
];

const NOTAS_EMPRESA = [
  "Cliente desde hace dos años, factura puntual.",
  "Contactado en la feria del sector, primer contacto en frío.",
  "Referido por un cliente actual.",
  "Trabajan con la competencia, buscan segunda opción de proveedor.",
  "Sede en varias provincias, decisión centralizada en Barcelona.",
  ""
];

const MOTIVOS_PERDIDA = [
  "El cliente eligió a otro proveedor por precio.",
  "Se ha pospuesto el proyecto sin fecha.",
  "Presupuesto cancelado internamente.",
  "No hemos vuelto a tener respuesta tras tres intentos."
];

const NOMBRES_OPORTUNIDAD = [
  "Renovación de contrato anual",
  "Ampliación de licencias",
  "Proyecto de implantación",
  "Suministro trimestral",
  "Contrato de mantenimiento",
  "Nueva línea de producto",
  "Pedido de temporada",
  "Auditoría inicial y propuesta"
];

interface UsuarioSeed {
  id: string;
  email: string;
  nombre: string;
  rol: "comercial" | "director";
}

export function sembrarSiHaceFalta(): void {
  const yaHay = db.prepare("SELECT COUNT(*) AS total FROM usuarios").get() as { total: number };
  if (yaHay.total > 0) return;

  const usuarios: UsuarioSeed[] = [
    { id: idNuevo(), email: "sergi@empresa.test", nombre: "Sergi Alba", rol: "comercial" },
    { id: idNuevo(), email: "ana@empresa.test", nombre: "Ana Romero", rol: "comercial" },
    { id: idNuevo(), email: "direccion@empresa.test", nombre: "Marisa Comas", rol: "director" }
  ];
  const comerciales = usuarios.filter((u) => u.rol === "comercial");

  const insertarUsuario = db.prepare(
    "INSERT INTO usuarios (id, email, nombre, rol, hash, sal) VALUES (?, ?, ?, ?, ?, ?)"
  );
  for (const u of usuarios) {
    const sal = generarSal();
    insertarUsuario.run(u.id, u.email, u.nombre, u.rol, calcularHash("prova1234", sal), sal);
  }

  const insertarEmpresa = db.prepare(
    "INSERT INTO empresas (id, nombre, cif, sector, notas, creada_en) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const insertarContacto = db.prepare(
    "INSERT INTO contactos (id, empresa_id, nombre, email, telefono, cargo) VALUES (?, ?, ?, ?, ?, ?)"
  );

  const idsEmpresa: string[] = [];
  const nombresPorId = new Map<string, string>();
  EMPRESAS.forEach((empresa, i) => {
    const id = idNuevo();
    idsEmpresa.push(id);
    nombresPorId.set(id, empresa.nombre);
    insertarEmpresa.run(
      id,
      empresa.nombre,
      empresa.cif,
      empresa.sector,
      elegir(NOTAS_EMPRESA, i),
      isoHaceDias(200 + i * 3)
    );

    const contactosPorEmpresa = i % 3 === 0 ? 2 : 1;
    for (let c = 0; c < contactosPorEmpresa; c++) {
      const nombreContacto = elegir(NOMBRES_CONTACTOS, i * 2 + c);
      const dominio = empresa.nombre.split(" ")[0]!.toLowerCase().replace(/[^a-z]/g, "");
      insertarContacto.run(
        idNuevo(),
        id,
        nombreContacto,
        `${nombreContacto.split(" ")[0]!.toLowerCase()}@${dominio}.example`,
        `6${String(10000000 + i * 137 + c * 19).slice(0, 8)}`,
        c === 0 ? "Compras" : "Dirección financiera"
      );
    }
  });

  const insertarOportunidad = db.prepare(
    `INSERT INTO oportunidades
      (id, empresa_id, nombre, importe, probabilidad, etapa, fecha_cierre_prevista, propietario_id, creada_en, actualizada_en, motivo_perdida, ultima_actividad_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertarActividad = db.prepare(
    `INSERT INTO actividades (id, empresa_id, oportunidad_id, contacto_id, tipo, nota, fecha, creada_por, creada_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertarTarea = db.prepare(
    `INSERT INTO tareas (id, titulo, fecha_limite, hecha, propietario_id, oportunidad_id, empresa_id, creada_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const distribucion: Etapa[] = [
    ...Array(8).fill("prospecto"),
    ...Array(8).fill("cualificada"),
    ...Array(7).fill("propuesta"),
    ...Array(6).fill("negociacion"),
    ...Array(6).fill("ganada"),
    ...Array(5).fill("perdida")
  ];

  const tiposActividad: TipoActividad[] = ["llamada", "email", "reunion", "nota"];

  distribucion.forEach((etapa, i) => {
    const empresaId = elegir(idsEmpresa, i * 3 + 5);
    const comercial = elegir(comerciales, i);
    const importe = 1500 + ((i * 733) % 18000);
    const esFinal = etapa === "ganada" || etapa === "perdida";
    const creadaHaceDias = 20 + ((i * 11) % 160);
    // Las oportunidades estancadas (sin tocar hace tiempo) sirven para demostrar la vista de Hoy.
    const diasSinActividad = i % 5 === 0 ? 12 + (i % 9) : i % 4;
    const actualizadaHaceDias = esFinal ? Math.max(1, diasSinActividad) : diasSinActividad;
    const fechaCierre = esFinal ? soloFechaEnDias(-actualizadaHaceDias) : soloFechaEnDias(5 + ((i * 7) % 60));

    const oportunidadId = idNuevo();
    insertarOportunidad.run(
      oportunidadId,
      empresaId,
      `${elegir(NOMBRES_OPORTUNIDAD, i)} · ${(nombresPorId.get(empresaId) ?? "").split(" ")[0]}`,
      importe,
      probabilidadPorDefecto(etapa),
      etapa,
      fechaCierre,
      comercial.id,
      isoHaceDias(creadaHaceDias),
      isoHaceDias(actualizadaHaceDias),
      etapa === "perdida" ? elegir(MOTIVOS_PERDIDA, i) : null,
      isoHaceDias(diasSinActividad)
    );

    const numActividades = 1 + (i % 3);
    for (let a = 0; a < numActividades; a++) {
      const diasAtras = actualizadaHaceDias + a * 4 + 2;
      insertarActividad.run(
        idNuevo(),
        empresaId,
        oportunidadId,
        null,
        elegir(tiposActividad, i + a),
        elegir(
          [
            "Primera toma de contacto, interesados en conocer precios.",
            "Enviada propuesta con las condiciones habladas.",
            "Reunión para revisar el alcance del proyecto.",
            "Seguimiento para confirmar la decisión.",
            "Nota interna: pendiente de validación por su dirección financiera."
          ],
          i + a
        ),
        soloFechaEnDias(-(diasAtras)),
        comercial.id,
        isoHaceDias(diasAtras)
      );
    }

    // Tareas: unas cuantas oportunidades abiertas llevan la próxima acción pendiente.
    if (!esFinal && i % 2 === 0) {
      const diasParaTarea = (i % 6) - 2; // algunas ya vencidas, otras próximas
      insertarTarea.run(
        idNuevo(),
        elegir(
          ["Llamar para cerrar detalles", "Enviar propuesta actualizada", "Confirmar fecha de reunión", "Revisar condiciones con el cliente"],
          i
        ),
        soloFechaEnDias(diasParaTarea),
        0,
        comercial.id,
        oportunidadId,
        empresaId,
        isoHaceDias(diasSinActividad + 1)
      );
    }
  });
}
