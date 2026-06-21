# Validación de Prototipo — PasteleriApp
**Fecha:** 21 de junio de 2026  
**Herramienta:** PasteleriApp (prototipo HTML de alta fidelidad)  
**Perfil de usuario simulado:** Dueña de pastelería artesanal  
**Modalidad:** Simulación de sesión con IA en rol de usuaria  

---

## TAREAS DE VALIDACIÓN

---

### Tarea 1 — Visualizar los datos generales del negocio

**Qué intento hacer:** Entender de un vistazo cómo está el negocio hoy: plata, pedidos, entregas.

**Qué miro primero:** El encabezado. Veo "PasteleriApp" y dos opciones: "Soy cliente" y "Panel emprendedora". Hago clic en "Panel emprendedora".

**Qué entiendo:** Hay tres tarjetas arriba con números grandes: "Entregas hoy: 1", "Ingresos del mes: $15.150", "Pedidos activos: 6". Debajo, una alerta roja/rosada que dice "Stock bajo: Harina (2 kg), Dulce de leche (0,5 kg)". Después un calendariito de las próximas 2 semanas con colores y debajo el kanban de pedidos.

**Qué me resulta claro:** Las tres tarjetas son inmediatas. Los números grandes con etiquetas chicas funcionan bien. La alerta de stock también es clara y no la paso por alto.

**Qué me genera duda o fricción:**
- "Ingresos del mes" — ¿es lo que cobré, lo que confirmé, o lo que tengo pendiente de cobrar? No lo sé solo con mirar. Para mí eso es crítico.
- "Pedidos activos: 6" incluye pedidos nuevos sin confirmar y pedidos ya en producción. Son cosas muy distintas. Un número solo no me dice si tengo todo bajo control o si hay 4 pedidos sin revisar.
- No veo fecha ni nombre del negocio en el panel. ¿Esto es de hoy? ¿Del mes? Falta contexto temporal arriba.

**Qué haría/clickeo:** Me quedo mirando las tres tarjetas y la alerta. Después bajo al kanban.

**Resultado de la tarea:** Completada con dificultad  
**Nivel de facilidad:** Medio  

**Comentario textual como usuaria:**  
*"Lo primero que veo está bien, los números son grandes y fáciles de leer. Pero la plata me genera duda: no sé si eso es lo que ya me pagaron o lo que están pendientes de pagar. Y los pedidos activos me dice 6 pero no me dice cuántos son urgentes. Igual, en 30 segundos ya tengo una idea general de cómo estoy. Eso está bien."*

**Evidencia observable para el equipo:** Screenshot `T1-T2-datos-generales-stats.png` — tarjetas muestran valores pero sin indicador de período o desglose de ingresos.

**Aprendizaje para el equipo:** La métrica de ingresos necesita una etiqueta más precisa (¿acumulado? ¿cobrado? ¿confirmado?). El contador "Pedidos activos" mezcla estados muy distintos.

**Acción recomendada:** Agregar tooltip o subetiqueta en "Ingresos del mes" que aclare qué incluye. Considerar dividir "Pedidos activos" en "sin revisar" + "en curso".

---

### Tarea 2 — Identificar cuántos pedidos hay para el día

**Qué intento hacer:** Saber cuántos pedidos me llegan / tengo que entregar hoy.

**Qué miro primero:** La tarjeta "Entregas hoy" que dice 1. Después bajo a la sección "Próximas entregas".

**Qué entiendo:** La tarjeta dice 1. En la sección de entregas veo "Hoy — 1" con Lucía Fernández, Torta pequeña, estado "Listo / Esperando retiro". También veo "Mañana — 3".

**Qué me resulta claro:** La sección "Próximas entregas" es muy útil. Ver el nombre, el producto y el estado en un vistazo es exactamente lo que necesito en la mañana. El badge de color por estado ayuda.

**Qué me genera duda o fricción:**
- La tarjeta dice "Entregas hoy: 1" pero no me dice nada de pedidos nuevos que llegaron hoy. Hay diferencia entre "qué entrego hoy" y "qué pedidos recibí hoy".
- El kanban tiene "Nuevo: 1" pero está lejos, abajo. Si tengo un pedido nuevo que revisar, quiero verlo en algún lugar visible arriba.
- "Pedidos activos: 6" en las tarjetas no me dice cuántos son para hoy.

**Qué haría/clickeo:** Leo la sección "Próximas entregas" y bajo al kanban para ver la columna "Nuevo".

**Resultado de la tarea:** Completada  
**Nivel de facilidad:** Alto  

**Comentario textual como usuaria:**  
*"La sección de próximas entregas me resuelve la tarea. Veo Lucía Fernández, torta pequeña, listo para retirar. Eso es lo que necesito saber a primera hora. El número de arriba confirma que es 1. Bien."*

**Evidencia observable para el equipo:** Screenshot `T1-T2-panel-dashboard.png` — sección "Próximas entregas" es legible y útil. La tarjeta superior funciona como resumen rápido.

**Aprendizaje para el equipo:** La sección de próximas entregas es el componente más valioso del panel. El flujo visual stats → alerta → entregas → kanban es coherente.

**Acción recomendada:** Evaluar si vale agregar una distinción entre "pedidos recibidos hoy" (nuevos) y "pedidos a entregar hoy" (listos/en producción).

---

### Tarea 3 — Identificar si existe algún insumo faltante

**Qué intento hacer:** Ver si me falta algo para producir.

**Qué miro primero:** La alerta naranja/rosa debajo de las tarjetas. No la busco: la veo sola.

**Qué entiendo:** Dice "⚠ Stock bajo: Harina (2 kg), Dulce de leche (0,5 kg) — revisá el inventario antes del próximo turno." Claro y directo.

**Qué me resulta claro:** La alerta es inmediata. El ícono de advertencia, el fondo rosado y el texto en negrita hacen que no me la pierda. Sé exactamente qué está bajo.

**Qué me genera duda o fricción:**
- "Stock bajo" y "faltante" son distintos. 2 kg de harina puede que alcance o no, depende de qué tengo que hacer. No sé si es un problema real o preventivo.
- No hay link directo al stock desde esa alerta. Tengo que ir a buscar la pestaña "Stock" manualmente.
- Si hubiera 5 insumos bajos, el texto quedaría muy largo en esa franja.

**Qué haría/clickeo:** Leo la alerta y después voy a la pestaña "Stock" para ver el detalle.

**Resultado de la tarea:** Completada  
**Nivel de facilidad:** Alto  

**Comentario textual como usuaria:**  
*"Eso lo veo al toque. La franja de aviso hace bien su trabajo. Igual, me gustaría poder hacer clic en 'Harina' y que me lleve directo al insumo en el stock, no tener que ir a buscarlo yo."*

**Evidencia observable para el equipo:** Screenshot `T3-alerta-stock-bajo.png` — alerta visible sin scroll desde el panel principal.

**Aprendizaje para el equipo:** La alerta funciona como punto de entrada a la gestión de stock. La fricción está en el paso siguiente: no hay navegación directa al detalle del insumo.

**Acción recomendada:** Hacer la alerta clicable — que lleve directo a la pestaña Stock con el insumo correspondiente resaltado.

---

### Tarea 4 — Cargar un nuevo insumo: azúcar impalpable, 500 gramos

**Qué intento hacer:** Registrar un insumo nuevo en el inventario.

**Qué miro primero:** Voy a la pestaña "Stock". Veo el botón "+ Agregar insumo" arriba a la derecha.

**Qué entiendo:** Al hacer clic aparece un formulario inline con campos: Nombre, Stock actual, Unidad, Stock mínimo, y los botones Guardar / ✕.

**Qué me resulta claro:** El formulario es simple y los campos son los que necesito. La unidad tiene un selector con opciones (g, kg, ml, l, unidad). Puedo elegir "g" para gramos. El botón "Guardar" es claro.

**Qué me genera duda o fricción:**
- El campo "Stock actual" acepta "500" pero la unidad está separada. Si escribo 500 y elijo "g", ¿guarda 500 g? No hay confirmación visual hasta que guardo.
- "Stock mínimo" no tiene ninguna explicación de para qué sirve. Alguien que no usó la app antes puede saltárselo sin entender las consecuencias (que el sistema no va a alertar sobre ese insumo).
- Después de guardar, el formulario se cierra y el insumo aparece en la tabla, pero sin ningún mensaje de confirmación ("Insumo guardado" o similar). Tuve que buscar en la tabla para confirmar que se guardó.
- El campo de unidad tiene "kg" como default. Si quiero gramos, tengo que cambiarlo.

**Qué haría/clickeo:** Clic en "+ Agregar insumo" → completo nombre "Azúcar impalpable", cantidad 500, cambio unidad a "g", pongo mínimo 100 → clic "Guardar".

**Resultado de la tarea:** Completada  
**Nivel de facilidad:** Alto  

**Comentario textual como usuaria:**  
*"Pude hacerlo sin problema. El formulario es chico y directo. Pero cuando guardé no vi ningún cartel de 'guardado'. Tuve que buscar en la tabla para ver si apareció. Para una emprendedora que está apurada, eso genera duda. ¿Se guardó o no? También me gustaría que el campo de mínimo tuviera alguna ayudita que diga 'cantidad por debajo de la cual te avisamos'."*

**Evidencia observable para el equipo:** Screenshots `T4-form-azucar-impalpable-completo.png` y `T4-azucar-guardado-resultado.png` — insumo aparece en tabla pero sin feedback explícito post-guardado.

**Aprendizaje para el equipo:** El flujo de carga es funcional pero le falta feedback de confirmación. El campo "Stock mínimo" necesita contexto.

**Acción recomendada:** Agregar toast de confirmación al guardar insumo (igual que al aceptar pedidos). Agregar placeholder o tooltip en "Stock mínimo".

---

### Tarea 5 — Revisar ocupación de la semana e identificar días de mayor carga

**Qué intento hacer:** Ver qué días estuve más ocupada y cuándo tengo más pedidos.

**Qué miro primero:** Voy a la pestaña "Historial". Veo un calendario del mes con celdas coloreadas.

**Qué entiendo:** El calendario muestra junio 2026 con días coloreados: fondo claro (1–2 pedidos) y naranja fuerte (3+ pedidos). Hay una leyenda abajo. Debajo del calendario hay dos gráficos de barras: "Pedidos por día de la semana" y "Productos más pedidos".

**Qué me resulta claro:** El calendario es intuitivo. Los días con más color tienen más pedidos. La leyenda me confirma qué significa cada color. Los gráficos de barras son fáciles de leer. Veo rápido que el viernes y el sábado concentran más pedidos.

**Qué me genera duda o fricción:**
- El calendario muestra todo el mes pero no me dice cuál es "la semana". ¿La semana pasada? ¿La semana actual? No hay forma de filtrar por semana o rango.
- Los días pasados tienen una opacidad menor (correcto) pero no hay forma de saber el número exacto de pedidos al hacer hover — las celdas no son interactivas.
- El gráfico "por día de la semana" no distingue qué período cubre. ¿Es histórico? ¿Del mes? ¿Desde siempre?
- No hay un resumen textual: "tu día más ocupado es el viernes". Tengo que leer el gráfico sola.

**Qué haría/clickeo:** Miro el calendario, localizo los días más oscuros, después miro el gráfico de barras de días de la semana.

**Resultado de la tarea:** Completada con dificultad  
**Nivel de facilidad:** Medio  

**Comentario textual como usuaria:**  
*"La vista está buena, los colores ayudan. Pero me cuesta saber exactamente de qué período están hablando los gráficos. Si yo quiero saber cómo me fue esta semana específicamente, no puedo. Solo veo el mes completo. Y me gustaría que al hacer clic en un día me muestre qué pedidos hubo ese día."*

**Evidencia observable para el equipo:** Screenshots `T5-historial-carga-semanal.png` y `T5-historial-charts.png` — calendario y gráficos visibles pero sin interactividad ni filtros.

**Aprendizaje para el equipo:** La visualización macro funciona. La granularidad (ver pedidos de un día específico, filtrar por semana) falta y es lo que más valor le daría a la usuaria para planificar.

**Acción recomendada:** Hacer las celdas del calendario clicables (mostrar pedidos del día). Agregar filtro de rango temporal o indicación del período en los gráficos.

---

### Tarea 6 — Aceptar un pedido nuevo

**Qué intento hacer:** Revisar un pedido que llegó y confirmar que lo puedo hacer.

**Qué miro primero:** El kanban. Veo la columna "Nuevo" con PED-003 (Carlos Rodríguez, Torta mediana, 25 jun, $4.300).

**Qué entiendo:** Hago clic en la tarjeta. Se abre un modal con todos los detalles: ID, badge de estado "Nuevo" en azul, nombre, teléfono, producto, sabor, decoración, fecha de entrega, restricciones (Sin TACC), precio total. Abajo dos botones: "Rechazar" (gris/rojo) y "Aceptar pedido →" (verde).

**Qué me resulta claro:** La información del pedido está completa en un solo lugar. No tengo que ir a buscar nada. Los botones son claros y diferenciados. El badge de estado ayuda a ubicarse.

**Qué me genera duda o fricción:**
- No hay información de si ese día (25 jun) tengo disponibilidad. El sistema me dice que hay 0/3 ocupados ese día, pero eso está en el mini-calendario del panel, no en el modal. Tendría que salir del modal para verificarlo.
- No hay botón de "Pedir más información" o forma de contactar al cliente desde el modal.
- No hay indicación de seña o condición de pago al aceptar. ¿El cliente sabe cuánto tiene que pagar? ¿Yo tengo que avisarle por separado?
- Una vez que acepto, el sistema me muestra un toast "✅ Pedido confirmado · 📅 25 jun agendado". Está bien, pero dura muy poco.

**Qué haría/clickeo:** Clic en PED-003 → reviso el modal → clic "Aceptar pedido →" → veo el toast y el pedido se mueve a "Confirmado".

**Resultado de la tarea:** Completada  
**Nivel de facilidad:** Alto  

**Comentario textual como usuaria:**  
*"Muy fácil. Veo todo lo que necesito en el modal y confirmo. Lo único que me falta es ver si tengo lugar ese día sin tener que cerrar el modal y buscar el calendario. Pero el flujo en sí es rápido."*

**Evidencia observable para el equipo:** Screenshots `T6-modal-pedido-nuevo-PED003.png` y `T6-pedido-aceptado-toast-kanban.png` — modal completo con información del pedido, botones claros, toast de confirmación visible, pedido se mueve de columna.

**Aprendizaje para el equipo:** La tarea de aceptar es la más lograda del prototipo. El modal concentra la información clave y los botones son inequívocos.

**Acción recomendada:** Agregar indicador de capacidad disponible para esa fecha dentro del modal. Evaluar agregar acción rápida de contacto (link a WhatsApp del cliente).

---

### Tarea 7 — Rechazar un pedido nuevo

**Qué intento hacer:** Rechazar un pedido que no puedo tomar.

**Qué miro primero:** Igual que la tarea anterior — kanban, columna "Nuevo", PED-003.

**Qué entiendo:** En el modal, el botón "Rechazar" está a la izquierda en gris con texto rojo. Hago clic. El modal se cierra, el toast dice "Pedido PED-003 rechazado", y la columna "Nuevo" queda en 0.

**Qué me resulta claro:** El botón existe y funciona. La acción es irreversible e inmediata.

**Qué me genera duda o fricción:**
- No hay confirmación previa al rechazar. Yo hago clic y listo: rechazado. No me pregunta "¿seguro?" ni "¿querés agregar un motivo?". Eso me preocupa porque me puedo equivocar.
- No hay forma de escribirle al cliente un motivo del rechazo desde la app. Si rechacé, tengo que ir a WhatsApp a explicarle por qué.
- El toast dice solo "Pedido PED-003 rechazado" — muy frío, sin opción de deshacer.
- El pedido rechazado desaparece del kanban. ¿Dónde queda registrado? No veo una columna "Rechazado" ni en el historial aparece.
- El botón "Rechazar" en gris con borde rojo no está mal, pero visualmente no es tan distinto del botón "Cerrar" que podría aparecer en otros estados.

**Qué haría/clickeo:** Clic en "Rechazar" → sorpresa por la inmediatez → busco si el pedido quedó registrado en algún lado.

**Resultado de la tarea:** Completada con dificultad  
**Nivel de facilidad:** Bajo  

**Comentario textual como usuaria:**  
*"Se puede hacer, pero me pone nerviosa. No me pregunta si estoy segura, no me deja escribirle nada al cliente, y el pedido desaparece. Para mí rechazar un pedido es una decisión importante: capaz lo hago por error, o necesito explicarle algo al cliente. La acción debería tener más 'peso' en el sistema."*

**Evidencia observable para el equipo:** Screenshots `T7-modal-antes-rechazar.png` y `T7-pedido-rechazado-resultado.png` — acción sin confirmación, sin campo de motivo, pedido desaparece sin trazabilidad visible.

**Aprendizaje para el equipo:** El rechazo es la tarea más problemática. Falta confirmación, trazabilidad y comunicación con el cliente.

**Acción recomendada:** Agregar paso de confirmación con campo de motivo opcional antes de rechazar. Mostrar pedidos rechazados en una sección de historial. Considerar un link de WhatsApp pre-cargado con mensaje de rechazo.

---

### Tarea 8 — Marcar como completado un pedido en producción

**Qué intento hacer:** Indicar que terminé de preparar un pedido que está en producción.

**Qué miro primero:** El kanban, columna "En producción". Veo PED-001 (Ana García, Torta grande, Mañana, $5.500).

**Qué entiendo:** Hago clic en la tarjeta. Se abre el modal con los detalles. El estado es "En producción". Los botones son "Cerrar" y "Marcar como listo" (naranja). Hago clic en "Marcar como listo". Aparece toast "🎉 Listo — se notifica a Ana García por WhatsApp". La tarjeta se mueve a la columna "Listo ✓".

**Qué me resulta claro:** El botón "Marcar como listo" es claro. El toast confirma que el cliente será notificado. El pedido se mueve a la columna correcta visualmente.

**Qué me genera duda o fricción:**
- El toast dice "se notifica a Ana García por WhatsApp" pero no sé si eso pasa de verdad en el prototipo o es solo texto. En un sistema real, ¿se envía automáticamente? ¿Tengo que hacer algo más?
- No hay campo para agregar nota al cliente ("tu torta está lista, podés pasar de 10 a 18 hs").
- En el modal no aparece el número de teléfono de Ana García cuando el estado es "en-produccion" — sí aparece cuando es "nuevo". ¿Por qué?
  (Verificando: sí aparece el teléfono en el modal. Está bien.)
- El avance de estado es lineal: no puedo "volver atrás" si me equivoqué. Si marco listo por error, no puedo revertirlo.

**Qué haría/clickeo:** Clic en PED-001 → reviso el modal → clic "Marcar como listo" → veo el toast → confirmo que el pedido pasó a "Listo ✓".

**Resultado de la tarea:** Completada  
**Nivel de facilidad:** Alto  

**Comentario textual como usuaria:**  
*"Muy claro. El botón dice exactamente lo que hace, y el mensaje de que se notifica al cliente por WhatsApp me da tranquilidad. Lo único que me falta es saber si realmente se manda ese mensaje o si lo tengo que mandar yo."*

**Evidencia observable para el equipo:** Screenshots `T8-modal-pedido-en-produccion.png` y `T8-pedido-marcado-listo-resultado.png` — flujo correcto, toast con confirmación de notificación al cliente, pedido se mueve a columna Listo.

**Aprendizaje para el equipo:** El avance de estado es intuitivo y el feedback al marcar listo es el más completo de todas las acciones (incluye notificación al cliente).

**Acción recomendada:** Aclarar en la UI si la notificación de WhatsApp es automática o manual. Agregar campo de nota al cliente al marcar como listo. Evaluar opción de reversión de estado.

---

## EVIDENCIAS DE VALIDACIÓN

---

### 1. Resumen Narrativo de la Sesión

La sesión de validación recorrió las ocho tareas previstas sobre el panel de la emprendedora de PasteleriApp. El prototipo es visualmente coherente y con buena jerarquía de información: el panel principal comunica el estado del negocio de forma rápida. Las tareas de lectura e interpretación resultaron las más fluidas. Las tareas de acción (aceptar, rechazar, avanzar estado) fueron donde aparecieron las fricciones más relevantes.

Las partes más intuitivas fueron: la tarjeta de entregas del día, la sección "Próximas entregas", el modal de pedido nuevo con toda la información concentrada, y el avance de estado en producción. Las principales fricciones aparecieron en: la ambigüedad de la métrica de ingresos, la ausencia de confirmación al rechazar un pedido, la falta de trazabilidad del pedido rechazado, la ausencia de feedback al guardar un insumo, y la falta de filtros temporales en el historial.

La sesión fue completable en su totalidad, con 5 tareas completadas con nivel alto de facilidad, 2 con nivel medio y 1 con nivel bajo.

---

### 2. Evidence Board

| Usuario | Tarea | Objetivo / Hipótesis | Evidencia a observar | Evidencia observada | Aprendizaje | Acción / Próximo paso |
|---|---|---|---|---|---|---|
| Dueña de pastelería artesanal | T1 — Datos generales | La emprendedora entiende rápidamente la situación del negocio desde el panel | ¿Lee y comprende las 3 tarjetas sin ayuda? ¿Las interpreta correctamente? | Leyó las tarjetas sin fricción. Dudó sobre qué incluye "Ingresos del mes" y sobre la mezcla de estados en "Pedidos activos" | Hipótesis parcialmente validada: la lectura es rápida pero la interpretación no es unívoca | Aclarar qué incluyen los ingresos; separar pedidos por estado |
| Dueña de pastelería artesanal | T2 — Pedidos del día | La emprendedora identifica la carga diaria a partir de pedidos y próximas entregas | ¿Localiza cuántos pedidos tiene hoy sin búsqueda activa? | Localizó "Entregas hoy: 1" y "Próximas entregas" sin dificultad | Hipótesis validada: la sección de entregas del día es efectiva | Evaluar agregar distinción entre "pedidos recibidos hoy" vs "a entregar hoy" |
| Dueña de pastelería artesanal | T3 — Insumos faltantes | Las alertas de stock bajo permiten anticipar problemas antes de que sean críticos | ¿Ve la alerta sin necesidad de navegar a Stock? | Vio la alerta en el panel sin scroll adicional. Señaló que no hay link directo al insumo | Hipótesis validada: la alerta es visible. Fricción en el paso siguiente (navegar al detalle) | Hacer la alerta clicable para ir directo al insumo en Stock |
| Dueña de pastelería artesanal | T4 — Cargar insumo | La emprendedora registra insumos de forma simple y sin errores | ¿Completa el formulario sin errores? ¿Recibe confirmación? | Completó el formulario correctamente. No recibió feedback visual de éxito post-guardado | Hipótesis parcialmente validada: el formulario es simple pero falta confirmación | Agregar toast de éxito al guardar insumo; tooltip en "Stock mínimo" |
| Dueña de pastelería artesanal | T5 — Ocupación semanal | La visualización histórica facilita identificar días de mayor demanda | ¿Identifica días de pico sin ayuda? ¿Puede filtrar por semana? | Identificó días de mayor carga por color. No pudo filtrar por semana. Las celdas no son interactivas | Hipótesis parcialmente validada: la visualización macro funciona, la granularidad falta | Celdas del calendario clicables; filtro de rango temporal |
| Dueña de pastelería artesanal | T6 — Aceptar pedido | La emprendedora evalúa y acepta un pedido con confianza desde el modal | ¿Entiende la información del modal? ¿Completa la acción con confianza? | Leyó el modal completo y aceptó sin dificultad. Señaló que falta ver disponibilidad del día dentro del modal | Hipótesis validada: el flujo de aceptación es claro y completo | Agregar indicador de capacidad del día en el modal |
| Dueña de pastelería artesanal | T7 — Rechazar pedido | La emprendedora puede rechazar un pedido de forma clara y controlada | ¿Completa la acción con control? ¿Entiende las consecuencias? | Completó la acción pero se sorprendió por la inmediatez. No hubo confirmación ni campo de motivo. El pedido desapareció sin trazabilidad | Hipótesis no validada: rechazar no da sensación de control. Falta confirmación, motivo y registro | Agregar confirmación con campo de motivo; sección de rechazados en historial |
| Dueña de pastelería artesanal | T8 — Completar pedido en producción | La emprendedora puede avanzar el estado de un pedido y comunicar el progreso | ¿Encuentra el botón correcto? ¿Comprende el feedback del sistema? | Encontró el botón "Marcar como listo" sin dudar. Leyó el toast sobre notificación a WhatsApp pero no sabe si es automático | Hipótesis validada: el avance de estado es intuitivo. Duda sobre automatismo de la notificación | Aclarar si la notificación es automática o manual |

---

### 3. Grilla de Captura de Feedback

#### Gustó
- Las tres tarjetas del panel son inmediatas: números grandes, etiquetas claras.
- La alerta de stock bajo es visible sin scroll y no se puede ignorar.
- La sección "Próximas entregas" da exactamente la información que se necesita a primera hora.
- El modal del pedido concentra toda la información relevante en un solo lugar.
- Los botones "Aceptar" y "Rechazar" están diferenciados por color y posición.
- El toast "Marcar como listo" menciona explícitamente la notificación al cliente — eso da seguridad.
- El kanban visual con columnas de estado es fácil de interpretar.
- El calendariito de capacidad en el panel es útil para ver la semana de un vistazo.
- Los badges de color por estado en las tarjetas de pedido son consistentes.

#### Críticas
- "Ingresos del mes" no aclara qué incluye (¿cobrado? ¿confirmado? ¿estimado?).
- Rechazar un pedido no pide confirmación ni permite agregar motivo.
- El pedido rechazado desaparece sin quedar registrado en ningún lugar visible.
- Al guardar un insumo no hay confirmación de éxito (sin toast, sin mensaje).
- El historial no tiene filtro por semana ni por rango de fechas.
- Las celdas del calendario de historial no son interactivas (no se puede ver qué pedidos hubo ese día).
- La alerta de stock no es clicable — hay que navegar manualmente a Stock.
- "Pedidos activos: 6" mezcla pedidos sin revisar con pedidos ya confirmados.
- No hay indicación de disponibilidad del día dentro del modal de pedido.
- No hay campo de nota al cliente al marcar un pedido como listo.

#### Preguntas
- ¿La notificación por WhatsApp al marcar listo se envía automáticamente o la tengo que mandar yo?
- ¿Dónde quedan los pedidos rechazados? ¿Puedo verlos después?
- ¿"Ingresos del mes" incluye la seña o el total del pedido?
- ¿Puedo revertir un estado si me equivoco?
- ¿El sistema se conecta con WhatsApp de alguna forma, o solo es un aviso interno?
- ¿Puedo ver el historial de un cliente específico (cuántas veces me pidió antes)?
- ¿Hay roles distintos? ¿Si tengo una ayudante puede entrar ella también?

#### Ideas
- Hacer la alerta de stock clicable que lleve directo al insumo.
- Paso de confirmación al rechazar, con campo de motivo opcional.
- Mostrar disponibilidad del día de entrega dentro del modal del pedido.
- Link a WhatsApp pre-armado desde el modal para contactar al cliente.
- Filtro de rango en el historial (semana, mes, período personalizado).
- Celdas del calendario clicables para ver pedidos de ese día.
- Toast de confirmación al guardar un insumo.
- Resumen de pedidos rechazados en algún lugar del historial.
- Campo de nota al cliente al marcar un pedido como listo.
- Etiqueta más precisa para los ingresos ("ingresos confirmados", "ingresos cobrados", etc.).

---

### 4. Conclusión de Validación

#### Hipótesis que se fortalecen

**"La emprendedora puede entender rápidamente la situación general del negocio desde el Panel principal."**  
Parcialmente. La lectura es rápida, pero la interpretación de métricas clave (especialmente ingresos) genera duda. El panel comunica volumen, no calidad de la situación.

**"La emprendedora puede identificar la carga de trabajo diaria a partir de la información de pedidos y próximas entregas."**  
Validada. La sección "Próximas entregas" funciona correctamente. Es el componente más intuitivo del panel.

**"Las alertas de stock bajo permiten anticipar problemas de producción antes de que se conviertan en faltantes críticos."**  
Validada en visibilidad. La alerta está donde corresponde y no se pierde. La fricción aparece en el paso siguiente: no hay conexión directa al detalle del insumo.

**"La emprendedora puede evaluar un pedido nuevo y aceptarlo con confianza a partir de la información disponible."**  
Validada. El modal del pedido es el componente mejor diseñado del prototipo. Información completa, botones claros, feedback inmediato.

**"La emprendedora puede avanzar el estado de un pedido en producción y comunicar mejor el progreso al cliente."**  
Validada. El flujo es intuitivo. La mención explícita de la notificación al cliente en el toast es un punto a favor.

#### Hipótesis que quedan parcialmente validadas

**"La emprendedora puede registrar nuevos insumos de forma simple y sin errores."**  
El formulario es simple y el registro fue exitoso, pero la ausencia de feedback post-guardado introduce incertidumbre. Necesita una iteración mínima de UX.

**"La visualización histórica de pedidos ayuda a identificar días de mayor demanda y facilita la planificación."**  
La visualización macro funciona. La hipótesis queda limitada por la falta de interactividad (no se puede filtrar por semana, no se puede hacer drill-down por día). Para planificación real, la información disponible es insuficiente.

#### Hipótesis no validada

**"La emprendedora puede rechazar un pedido de forma clara y controlada."**  
No validada. La acción carece de confirmación, de campo de motivo, de trazabilidad post-rechazo y de mecanismo de comunicación al cliente. Para una emprendedora que valora el control, este flujo genera desconfianza activa.

#### Riesgos y dudas que siguen abiertos

- El modelo de notificación a clientes (WhatsApp) es ambiguo: no queda claro si es automatizado o manual. Este es un riesgo de expectativa del usuario.
- La trazabilidad de pedidos rechazados está ausente. Para un negocio con historial, esto puede ser un problema legal y operativo.
- La métrica de ingresos puede inducir a error si la emprendedora la usa para tomar decisiones financieras sin entender qué incluye.
- Los estados son irreversibles en el prototipo. En producción, los errores de avance de estado deben poder corregirse.

#### Cambios concretos antes de volver a testear

1. **Rechazar pedido**: agregar confirmación + campo de motivo + registro en historial de rechazados.
2. **Feedback de guardado de insumo**: agregar toast de confirmación idéntico al de aceptar pedido.
3. **Modal de pedido**: incluir indicador de disponibilidad del día de entrega dentro del modal.
4. **Ingresos del mes**: cambiar etiqueta o agregar subetiqueta que aclare qué incluye.
5. **Alerta de stock**: hacer clicable para navegar directo al insumo.
6. **Historial**: agregar interactividad en celdas del calendario + filtro de rango.
7. **Notificación WhatsApp**: dejar claro en la UI si es automática o un recordatorio manual.

#### Limitaciones de esta simulación

Esta validación fue realizada con inteligencia artificial en el rol de usuaria, no con una emprendedora real. Las implicaciones son:

- **No hay comportamiento espontáneo real**: una usuaria real puede ignorar elementos que el modelo IA sí notó (y viceversa). El escaneo visual, el estrés operativo, la fatiga y la motivación personal no se simulan.
- **El modelo conoce el prototipo antes de "explorarlo"**: la IA puede tener sesgos derivados de haber leído el código fuente, lo que elimina la sorpresa genuina ante elementos ocultos o inesperados.
- **Las emociones son simuladas**: la "desconfianza" o "preocupación" descrita es una representación, no una reacción afectiva real que pueda observarse en la expresión corporal o en el tiempo de hesitación.
- **La sesión no mide tiempo real de tarea**: en una sesión real se puede cronometrar cuánto tarda una usuaria en cada tarea. Eso no está disponible aquí.
- **No emergieron comportamientos de error propios**: una usuaria real puede equivocarse de botón, escribir en el campo equivocado, o abandonar una tarea. Esos comportamientos son valiosos y no están capturados.

**Esta validación es un insumo de diseño, no un reemplazo del testeo con usuarias reales.** Se recomienda realizar al menos 3 sesiones con emprendedoras reales, especialmente para las tareas de rechazo de pedido (T7) e historial (T5), donde las fricciones encontradas son las más críticas.

---

## ARCHIVOS DE EVIDENCIA

| Archivo | Tarea | Descripción |
|---|---|---|
| `01-vista-inicial-cliente.png` | — | Vista inicial del prototipo (vista cliente) |
| `T1-T2-T3-panel-dashboard.png` | T1, T2, T3 | Panel completo con stats, alerta y kanban |
| `T1-T2-datos-generales-stats.png` | T1, T2 | Tarjetas de métricas del panel |
| `T3-alerta-stock-bajo.png` | T3 | Franja de alerta de stock bajo |
| `T3-T4-stock-vista-inicial.png` | T3, T4 | Vista inicial del tab Stock |
| `T4-form-azucar-impalpable-completo.png` | T4 | Formulario completo antes de guardar |
| `T4-azucar-guardado-resultado.png` | T4 | Tabla de stock con insumo agregado |
| `T5-historial-carga-semanal.png` | T5 | Calendario de historial del mes |
| `T5-historial-charts.png` | T5 | Gráficos de pedidos por día y producto |
| `T6-modal-pedido-nuevo-PED003.png` | T6 | Modal del pedido PED-003 antes de aceptar |
| `T6-pedido-aceptado-toast-kanban.png` | T6 | Dashboard post-aceptación con toast visible |
| `T7-modal-antes-rechazar.png` | T7 | Modal de PED-003 antes de rechazar |
| `T7-pedido-rechazado-resultado.png` | T7 | Dashboard post-rechazo |
| `T8-modal-pedido-en-produccion.png` | T8 | Modal de PED-001 en producción |
| `T8-pedido-marcado-listo-resultado.png` | T8 | Dashboard post-marcado como listo |
