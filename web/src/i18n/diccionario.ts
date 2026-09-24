export type Idioma = "es" | "ca" | "en";

export const IDIOMAS: { codigo: Idioma; etiqueta: string }[] = [
  { codigo: "es", etiqueta: "ES" },
  { codigo: "ca", etiqueta: "CA" },
  { codigo: "en", etiqueta: "EN" }
];

const textos = {
  // Login
  "login.titulo": { es: "CRM de Ventas", ca: "CRM de Vendes", en: "Sales CRM" },
  "login.subtitulo": {
    es: "Clientes, oportunidades y seguimiento comercial.",
    ca: "Clients, oportunitats i seguiment comercial.",
    en: "Accounts, deals and sales follow-up."
  },
  "login.email": { es: "Correo", ca: "Correu", en: "Email" },
  "login.password": { es: "Contraseña", ca: "Contrasenya", en: "Password" },
  "login.entrar": { es: "Entrar", ca: "Entra", en: "Sign in" },
  "login.entrando": { es: "Entrando…", ca: "Entrant…", en: "Signing in…" },
  "login.error": {
    es: "El correo o la contraseña no son correctos.",
    ca: "El correu o la contrasenya no són correctes.",
    en: "That email or password is not correct."
  },
  "login.cuentasDemo": { es: "Entrar como", ca: "Entra com a", en: "Sign in as" },
  "login.comercial": { es: "comercial", ca: "comercial", en: "sales rep" },
  "login.director": { es: "dirección comercial", ca: "direcció comercial", en: "sales director" },

  // Navegación
  "nav.hoy": { es: "Hoy", ca: "Avui", en: "Today" },
  "nav.empresas": { es: "Empresas", ca: "Empreses", en: "Companies" },
  "nav.pipeline": { es: "Pipeline", ca: "Pipeline", en: "Pipeline" },
  "nav.prevision": { es: "Previsión", ca: "Previsió", en: "Forecast" },
  "nav.importar": { es: "Importar", ca: "Importar", en: "Import" },
  "nav.buscar": { es: "Buscar", ca: "Cerca", en: "Search" },
  "nav.salir": { es: "Salir", ca: "Surt", en: "Sign out" },

  // Común
  "comun.cargando": { es: "Cargando…", ca: "Carregant…", en: "Loading…" },
  "comun.guardar": { es: "Guardar", ca: "Desa", en: "Save" },
  "comun.guardando": { es: "Guardando…", ca: "Desant…", en: "Saving…" },
  "comun.cancelar": { es: "Cancelar", ca: "Cancel·la", en: "Cancel" },
  "comun.crear": { es: "Crear", ca: "Crea", en: "Create" },
  "comun.cerrar": { es: "Cerrar", ca: "Tanca", en: "Close" },
  "comun.editar": { es: "Editar", ca: "Edita", en: "Edit" },
  "comun.eliminar": { es: "Eliminar", ca: "Elimina", en: "Delete" },
  "comun.dias": { es: "días", ca: "dies", en: "days" },
  "comun.importe": { es: "Importe", ca: "Import", en: "Amount" },
  "comun.error": {
    es: "Algo ha fallado. Prueba otra vez.",
    ca: "Alguna cosa ha fallat. Torna-ho a provar.",
    en: "Something went wrong. Try again."
  },

  // Empresas
  "empresas.titulo": { es: "Empresas", ca: "Empreses", en: "Companies" },
  "empresas.nueva": { es: "Nueva empresa", ca: "Nova empresa", en: "New company" },
  "empresas.buscar": { es: "Buscar por nombre, CIF o sector", ca: "Cerca per nom, CIF o sector", en: "Search by name, tax ID or sector" },
  "empresas.nombre": { es: "Nombre", ca: "Nom", en: "Name" },
  "empresas.cif": { es: "CIF", ca: "CIF", en: "Tax ID" },
  "empresas.sector": { es: "Sector", ca: "Sector", en: "Sector" },
  "empresas.notas": { es: "Notas", ca: "Notes", en: "Notes" },
  "empresas.vacio": {
    es: "Todavía no hay empresas. Crea la primera o importa un CSV.",
    ca: "Encara no hi ha empreses. Crea la primera o importa un CSV.",
    en: "No companies yet. Create the first one or import a CSV."
  },
  "empresas.sinResultados": { es: "Ninguna empresa coincide con la búsqueda.", ca: "Cap empresa coincideix amb la cerca.", en: "No company matches your search." },
  "empresas.cifInvalido": { es: "Ese CIF no es válido.", ca: "Aquest CIF no és vàlid.", en: "That tax ID is not valid." },
  "empresas.contactos": { es: "Contactos", ca: "Contactes", en: "Contacts" },
  "empresas.nuevoContacto": { es: "Añadir contacto", ca: "Afegeix contacte", en: "Add contact" },
  "empresas.cargo": { es: "Cargo", ca: "Càrrec", en: "Role" },
  "empresas.telefono": { es: "Teléfono", ca: "Telèfon", en: "Phone" },
  "empresas.oportunidades": { es: "Oportunidades", ca: "Oportunitats", en: "Deals" },
  "empresas.sinOportunidades": { es: "Esta empresa aún no tiene oportunidades abiertas.", ca: "Aquesta empresa encara no té oportunitats obertes.", en: "This company has no deals yet." },
  "empresas.actividad": { es: "Línea de tiempo", ca: "Línia de temps", en: "Timeline" },
  "empresas.nuevaActividad": { es: "Registrar actividad", ca: "Registra activitat", en: "Log activity" },
  "empresas.sinActividad": { es: "Todavía no se ha registrado ninguna actividad.", ca: "Encara no s'ha registrat cap activitat.", en: "No activity logged yet." },
  "empresas.tipoLlamada": { es: "Llamada", ca: "Trucada", en: "Call" },
  "empresas.tipoEmail": { es: "Email", ca: "Correu", en: "Email" },
  "empresas.tipoReunion": { es: "Reunión", ca: "Reunió", en: "Meeting" },
  "empresas.tipoNota": { es: "Nota", ca: "Nota", en: "Note" },
  "empresas.notaActividad": { es: "Qué ha pasado", ca: "Què ha passat", en: "What happened" },

  // Pipeline
  "pipeline.titulo": { es: "Pipeline", ca: "Pipeline", en: "Pipeline" },
  "pipeline.nuevaOportunidad": { es: "Nueva oportunidad", ca: "Nova oportunitat", en: "New deal" },
  "pipeline.moverA": { es: "Mover a", ca: "Mou a", en: "Move to" },
  "pipeline.propietario": { es: "Comercial", ca: "Comercial", en: "Owner" },
  "pipeline.probabilidad": { es: "Probabilidad", ca: "Probabilitat", en: "Probability" },
  "pipeline.todos": { es: "Todos los comerciales", ca: "Tots els comercials", en: "All owners" },
  "pipeline.sinActividad": { es: "sin actividad", ca: "sense activitat", en: "no activity" },
  "pipeline.estancada": { es: "estancada", ca: "estancada", en: "stalled" },
  "pipeline.motivoPerdida": { es: "Motivo de la pérdida", ca: "Motiu de la pèrdua", en: "Reason for losing it" },
  "pipeline.motivoPlaceholder": {
    es: "Explica en una frase por qué se pierde",
    ca: "Explica en una frase per què es perd",
    en: "One line on why it was lost"
  },
  "pipeline.confirmarPerdida": { es: "Marcar como perdida", ca: "Marca com a perduda", en: "Mark as lost" },
  "pipeline.reabrir": { es: "Reabrir", ca: "Reobre", en: "Reopen" },
  "pipeline.soloDirectorReabre": {
    es: "Solo el director puede reabrir una oportunidad cerrada.",
    ca: "Només el director pot reobrir una oportunitat tancada.",
    en: "Only the director can reopen a closed deal."
  },
  "pipeline.soloPropias": {
    es: "Solo puedes mover tus propias oportunidades.",
    ca: "Només pots moure les teves oportunitats.",
    en: "You can only move your own deals."
  },
  "pipeline.reasignar": { es: "Reasignar", ca: "Reassigna", en: "Reassign" },
  "pipeline.etapa.prospecto": { es: "Prospecto", ca: "Prospecte", en: "Prospect" },
  "pipeline.etapa.cualificada": { es: "Cualificada", ca: "Qualificada", en: "Qualified" },
  "pipeline.etapa.propuesta": { es: "Propuesta", ca: "Proposta", en: "Proposal" },
  "pipeline.etapa.negociacion": { es: "Negociación", ca: "Negociació", en: "Negotiation" },
  "pipeline.etapa.ganada": { es: "Ganada", ca: "Guanyada", en: "Won" },
  "pipeline.etapa.perdida": { es: "Perdida", ca: "Perduda", en: "Lost" },
  "pipeline.vacio": {
    es: "No hay ninguna oportunidad en esta etapa.",
    ca: "No hi ha cap oportunitat en aquesta etapa.",
    en: "No deals in this stage."
  },
  "pipeline.arrastra": {
    es: "Arrastra la tarjeta o usa el selector para cambiarla de etapa.",
    ca: "Arrossega la targeta o fes servir el selector per canviar-la d'etapa.",
    en: "Drag the card or use the selector to change its stage."
  },

  // Hoy
  "hoy.titulo": { es: "Hoy", ca: "Avui", en: "Today" },
  "hoy.tareasPendientes": { es: "Tareas pendientes", ca: "Tasques pendents", en: "Pending tasks" },
  "hoy.sinTareas": { es: "No tienes tareas pendientes. Buen momento para prospectar.", ca: "No tens tasques pendents. Bon moment per prospectar.", en: "No pending tasks. A good time to prospect." },
  "hoy.nuevaTarea": { es: "Nueva tarea", ca: "Nova tasca", en: "New task" },
  "hoy.titulo.tarea": { es: "Qué hay que hacer", ca: "Què cal fer", en: "What to do" },
  "hoy.fechaLimite": { es: "Fecha límite", ca: "Data límit", en: "Due date" },
  "hoy.vencida": { es: "vencida", ca: "vençuda", en: "overdue" },
  "hoy.hoyMismo": { es: "hoy", ca: "avui", en: "today" },
  "hoy.estancadas": { es: "Oportunidades estancadas", ca: "Oportunitats estancades", en: "Stalled deals" },
  "hoy.sinEstancadas": { es: "Ninguna oportunidad lleva demasiado tiempo sin novedades.", ca: "Cap oportunitat porta massa temps sense novetats.", en: "No deal has been idle for too long." },
  "hoy.marcarHecha": { es: "Marcar hecha", ca: "Marca feta", en: "Mark done" },

  // Previsión
  "prevision.titulo": { es: "Previsión", ca: "Previsió", en: "Forecast" },
  "prevision.ponderada": { es: "Previsión ponderada", ca: "Previsió ponderada", en: "Weighted forecast" },
  "prevision.porMes": { es: "Por mes de cierre previsto", ca: "Per mes de tancament previst", en: "By expected close month" },
  "prevision.porComercial": { es: "Por comercial", ca: "Per comercial", en: "By sales rep" },
  "prevision.embudo": { es: "Conversión por etapa", ca: "Conversió per etapa", en: "Conversion by stage" },
  "prevision.cicloMedio": { es: "Ciclo medio de venta", ca: "Cicle mitjà de venda", en: "Average sales cycle" },
  "prevision.sinDatos": { es: "Todavía no hay oportunidades ganadas para calcularlo.", ca: "Encara no hi ha oportunitats guanyades per calcular-ho.", en: "No won deals yet to calculate this." },
  "prevision.propia": { es: "Tu previsión", ca: "La teva previsió", en: "Your forecast" },
  "prevision.equipo": { es: "Previsión del equipo", ca: "Previsió de l'equip", en: "Team forecast" },

  // Importar
  "importar.titulo": { es: "Importar empresas", ca: "Importa empreses", en: "Import companies" },
  "importar.explicacion": {
    es: "Sube un CSV con las columnas nombre, cif, sector y notas. Revisa la vista previa antes de confirmar.",
    ca: "Puja un CSV amb les columnes nombre, cif, sector i notas. Revisa la vista prèvia abans de confirmar.",
    en: "Upload a CSV with the columns nombre, cif, sector and notas. Check the preview before confirming."
  },
  "importar.elegirArchivo": { es: "Elegir archivo CSV", ca: "Tria un fitxer CSV", en: "Choose CSV file" },
  "importar.exportar": { es: "Exportar empresas", ca: "Exporta empreses", en: "Export companies" },
  "importar.previa": { es: "Vista previa", ca: "Vista prèvia", en: "Preview" },
  "importar.validas": { es: "filas válidas", ca: "files vàlides", en: "valid rows" },
  "importar.errores": { es: "filas con error", ca: "files amb error", en: "rows with an error" },
  "importar.confirmar": { es: "Importar filas válidas", ca: "Importa les files vàlides", en: "Import valid rows" },
  "importar.importando": { es: "Importando…", ca: "Important…", en: "Importing…" },
  "importar.hecho": { es: "empresas importadas.", ca: "empreses importades.", en: "companies imported." },
  "importar.linea": { es: "línea", ca: "línia", en: "line" },

  // Buscar
  "buscar.placeholder": { es: "Buscar empresas, contactos u oportunidades…", ca: "Cerca empreses, contactes o oportunitats…", en: "Search companies, contacts or deals…" },
  "buscar.empresas": { es: "Empresas", ca: "Empreses", en: "Companies" },
  "buscar.contactos": { es: "Contactos", ca: "Contactes", en: "Contacts" },
  "buscar.oportunidades": { es: "Oportunidades", ca: "Oportunitats", en: "Deals" },
  "buscar.sinResultados": { es: "Sin resultados.", ca: "Sense resultats.", en: "No results." },
  "buscar.atajo": { es: "Ctrl K para buscar", ca: "Ctrl K per cercar", en: "Ctrl K to search" }
} as const satisfies Record<string, Record<Idioma, string>>;

export type ClaveTexto = keyof typeof textos;

export function obtenerTexto(clave: ClaveTexto, idioma: Idioma): string {
  return textos[clave][idioma];
}

export default textos;
