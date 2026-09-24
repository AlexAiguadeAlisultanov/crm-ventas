import type { Actividad, Contacto, Empresa, Oportunidad, Tarea, TipoActividad, Etapa } from "./types.js";

interface FilaEmpresa {
  id: string;
  nombre: string;
  cif: string;
  sector: string;
  notas: string;
  creada_en: string;
}

export function mapEmpresa(fila: FilaEmpresa): Empresa {
  return {
    id: fila.id,
    nombre: fila.nombre,
    cif: fila.cif,
    sector: fila.sector,
    notas: fila.notas,
    creadaEn: fila.creada_en
  };
}

interface FilaContacto {
  id: string;
  empresa_id: string;
  nombre: string;
  email: string;
  telefono: string;
  cargo: string;
}

export function mapContacto(fila: FilaContacto): Contacto {
  return {
    id: fila.id,
    empresaId: fila.empresa_id,
    nombre: fila.nombre,
    email: fila.email,
    telefono: fila.telefono,
    cargo: fila.cargo
  };
}

interface FilaOportunidad {
  id: string;
  empresa_id: string;
  nombre: string;
  importe: number;
  probabilidad: number;
  etapa: Etapa;
  fecha_cierre_prevista: string;
  propietario_id: string;
  creada_en: string;
  actualizada_en: string;
  motivo_perdida: string | null;
  ultima_actividad_en: string;
}

export function mapOportunidad(fila: FilaOportunidad): Oportunidad {
  return {
    id: fila.id,
    empresaId: fila.empresa_id,
    nombre: fila.nombre,
    importe: fila.importe,
    probabilidad: fila.probabilidad,
    etapa: fila.etapa,
    fechaCierrePrevista: fila.fecha_cierre_prevista,
    propietarioId: fila.propietario_id,
    creadaEn: fila.creada_en,
    actualizadaEn: fila.actualizada_en,
    motivoPerdida: fila.motivo_perdida,
    ultimaActividadEn: fila.ultima_actividad_en
  };
}

interface FilaActividad {
  id: string;
  empresa_id: string;
  oportunidad_id: string | null;
  contacto_id: string | null;
  tipo: TipoActividad;
  nota: string;
  fecha: string;
  creada_por: string;
  creada_en: string;
}

export function mapActividad(fila: FilaActividad): Actividad {
  return {
    id: fila.id,
    empresaId: fila.empresa_id,
    oportunidadId: fila.oportunidad_id,
    contactoId: fila.contacto_id,
    tipo: fila.tipo,
    nota: fila.nota,
    fecha: fila.fecha,
    creadaPor: fila.creada_por,
    creadaEn: fila.creada_en
  };
}

interface FilaTarea {
  id: string;
  titulo: string;
  fecha_limite: string;
  hecha: number;
  propietario_id: string;
  oportunidad_id: string | null;
  empresa_id: string | null;
  creada_en: string;
}

export function mapTarea(fila: FilaTarea): Tarea {
  return {
    id: fila.id,
    titulo: fila.titulo,
    fechaLimite: fila.fecha_limite,
    hecha: fila.hecha === 1,
    propietarioId: fila.propietario_id,
    oportunidadId: fila.oportunidad_id,
    empresaId: fila.empresa_id,
    creadaEn: fila.creada_en
  };
}
