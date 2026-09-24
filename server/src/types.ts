export type Rol = "comercial" | "director";

export type Etapa =
  | "prospecto"
  | "cualificada"
  | "propuesta"
  | "negociacion"
  | "ganada"
  | "perdida";

export const ETAPAS: Etapa[] = [
  "prospecto",
  "cualificada",
  "propuesta",
  "negociacion",
  "ganada",
  "perdida"
];

export const ETAPAS_EMBUDO: Etapa[] = [
  "prospecto",
  "cualificada",
  "propuesta",
  "negociacion",
  "ganada"
];

export const PROBABILIDAD_POR_ETAPA: Record<Etapa, number> = {
  prospecto: 10,
  cualificada: 30,
  propuesta: 60,
  negociacion: 80,
  ganada: 100,
  perdida: 0
};

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
