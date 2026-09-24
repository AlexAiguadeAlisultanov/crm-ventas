# CRM de Ventas

Una herramienta para que un equipo comercial pequeño lleve sus clientes y sus
oportunidades sin depender de una hoja de cálculo. Guarda empresas y
contactos, mueve las oportunidades por un pipeline con seis etapas, avisa de
lo que toca hacer hoy y calcula la previsión de ventas ponderada por la
probabilidad de cada etapa.

## El problema que resuelve

Un comercial necesita saber, al entrar por la mañana, qué tareas tiene
pendientes y qué oportunidades llevan demasiado tiempo sin que nadie las
toque. Un director necesita ver la previsión de todo el equipo sin pedirle a
cada comercial una captura de su Excel. Este CRM junta las dos cosas: una
vista "Hoy" para el día a día y una vista de previsión para la dirección.

## Cuentas de demo

Todas con la contraseña `prova1234`. En la pantalla de acceso hay un botón
por cuenta que rellena el formulario solo.

| Correo | Rol |
|---|---|
| `sergi@empresa.test` | Comercial |
| `ana@empresa.test` | Comercial |
| `direccion@empresa.test` | Director comercial |

Un comercial ve todas las empresas y todas las oportunidades del equipo, pero
solo puede editar o mover las suyas. El director edita, reasigna y ve la
previsión de todos.

## Cómo arrancarlo

```bash
npm install       # instala la raíz, el servidor y la web
npm run dev        # API en el puerto 8005 y Vite con recarga en caliente
```

Para probar el build que se despliega de verdad:

```bash
npm run comprobar  # tipos de TypeScript en servidor y web, sin compilar
npm test           # reglas de negocio con Vitest
npm run build       # compila la web y el servidor
npm start           # un solo proceso, sirve la web y la API en el puerto 8005
```

La base de datos es un archivo SQLite (`datos/crm.sqlite`) que se crea solo la
primera vez que arranca el servidor. Si está vacía, se siembra con 25
empresas, sus contactos, unas 40 oportunidades repartidas entre las dos
cuentas comerciales y su historial de actividad, para que ninguna pantalla se
vea vacía al entrar. En Render el disco no persiste entre despliegues: cada
vez que el servicio se reinicia, la demo vuelve a sembrarse desde cero. Es
lo esperado, no un fallo.

## Qué hay dentro

- **Empresas**: ficha con CIF validado de verdad (el dígito o la letra de
  control, no solo el formato), sector, notas y una línea de tiempo con las
  llamadas, correos, reuniones y notas que se han ido registrando.
- **Pipeline**: tablero kanban con las seis etapas (prospecto, cualificada,
  propuesta, negociación, ganada, perdida). Las tarjetas se arrastran con el
  ratón, pero cada una lleva también un selector de etapa que funciona igual
  con teclado o con el dedo en el móvil. Marcar una oportunidad como perdida
  pide el motivo; ganada y perdida quedan cerradas salvo que el director las
  reabra.
- **Hoy**: las tareas pendientes del comercial que ha entrado y las
  oportunidades que llevan más de una semana sin ninguna actividad.
- **Previsión**: importe ponderado por la probabilidad de cada etapa,
  agrupado por mes de cierre previsto y, si quien mira es el director, por
  comercial. También la tasa de conversión por etapa y el ciclo medio de
  venta. Los gráficos son SVG escritos a mano, sin ninguna librería de
  gráficos de por medio.
- **Importar y exportar**: un CSV de empresas con vista previa antes de
  confirmar nada. Cada fila se valida por separado, así que una fila mal
  escrita no bloquea las demás: sale en la lista de errores con su número de
  línea.
- **Buscador (Ctrl+K)**: empresas, contactos y oportunidades desde cualquier
  pantalla.
- Interfaz en español, catalán e inglés. El idioma se recuerda en el
  navegador.

## Decisiones y por qué

**Las reglas de negocio viven en `server/src/engine/`, no en la interfaz.**
La validación del CIF, las transiciones de etapa, el cálculo de la previsión
y los permisos de edición son funciones puras, sin base de datos ni Express
de por medio. Por eso se pueden probar directamente con Vitest: 38 pruebas
que cubren el dígito de control del CIF, que ganada y perdida son etapas
finales salvo reapertura del director, el cálculo ponderado por mes y por
comercial, la conversión del embudo y la importación de un CSV con líneas
buenas y malas mezcladas.

**La sesión es una cookie firmada, no una tabla en la base de datos.** Lleva
el identificador del usuario y la fecha de caducidad, firmados con HMAC y
`SESSION_SECRET`. Así no hace falta limpiar sesiones caducadas a mano ni
depender de que el disco de Render persista entre despliegues.

**`node:sqlite` en vez de una librería externa.** Node 24 lo trae de serie,
así que no hay ningún módulo nativo que compilar al desplegar con Docker.

**Los gráficos de la previsión son SVG propios.** Son pocos datos y sencillos
de representar; meter una librería de gráficos entera para dos tipos de
barra no compensaba, y así el resultado sigue la misma paleta y tipografía
que el resto de la interfaz en vez de imponer la suya.

**El acento es un lima apagado (`#B8D94A`).** El resto del portfolio ya usa
cian, ámbar, verde césped, ámbar de papel y azul técnico; este color no se
repite con ninguno y funciona bien como color de estado (algo "en marcha"
tiene sentido en un pipeline de ventas) sin caer en el verde saturado que la
guía de estilo pide evitar.

## Lo que no lleva

No hay recuperación de contraseña ni alta de usuarios desde la interfaz: los
tres del equipo se crean al sembrar la base. No hay archivos adjuntos en las
actividades. La previsión no incluye escenarios ni objetivos por comercial,
solo lo que ya hay cargado en el pipeline.
