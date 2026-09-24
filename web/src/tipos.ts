export type Rol = "comercial" | "director";

export type Etapa = "prospecto" | "cualificada" | "propuesta" | "negociacion" | "ganada" | "perdida";

export const ETAPAS: Etapa[] = ["prospecto", "cualificada", "propuesta", "negociacion", "ganada", "perdida"];

export type TipoActividad = "llamada" | "email" | "reunion" | "nota";

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
}

export interface Empresa {
  id: string;
  nombre: string;
  cif: string;
  sector: string;
  notas: string;
  creadaEn: string;
}

export interface Contacto {
  id: string;
  empresaId: string;
  nombre: string;
  email: string;
  telefono: string;
  cargo: string;
}

export interface Oportunidad {
  id: string;
  empresaId: string;
  nombre: string;
  importe: number;
  probabilidad: number;
  etapa: Etapa;
  fechaCierrePrevista: string;
  propietarioId: string;
  creadaEn: string;
  actualizadaEn: string;
  motivoPerdida: string | null;
  ultimaActividadEn: string;
}

export interface Actividad {
  id: string;
  empresaId: string;
  oportunidadId: string | null;
  contactoId: string | null;
  tipo: TipoActividad;
  nota: string;
  fecha: string;
  creadaPor: string;
  creadaEn: string;
}

export interface Tarea {
  id: string;
  titulo: string;
  fechaLimite: string;
  hecha: boolean;
  propietarioId: string;
  oportunidadId: string | null;
  empresaId: string | null;
  creadaEn: string;
}

export interface EmpresaDetalle extends Empresa {
  contactos: Contacto[];
  actividades: Actividad[];
}

export interface EscalonEmbudo {
  etapa: Etapa;
  cantidad: number;
  tasaConversion: number | null;
}

export interface Prevision {
  ambito: "propio" | "equipo";
  total: number;
  porMes: Record<string, number>;
  porComercial: Record<string, number> | null;
  embudo: EscalonEmbudo[];
  cicloMedioDias: number | null;
}

export interface ResultadoBusqueda {
  empresas: { id: string; nombre: string; sector: string }[];
  contactos: { id: string; nombre: string; empresaId: string; empresaNombre: string }[];
  oportunidades: { id: string; nombre: string; etapa: Etapa; empresaId: string; empresaNombre: string }[];
}

export interface FilaImportacion {
  nombre: string;
  cif: string;
  sector: string;
  notas: string;
}

export interface ErrorImportacion {
  linea: number;
  motivo: string;
}
