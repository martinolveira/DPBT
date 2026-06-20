# PasteleriApp — Prototipo funcional

Prototipo de alta fidelidad para una aplicación de gestión de pedidos de pastelería artesanal. Desarrollado como entregable de la materia **Diseño y Prototipado de Bases Tecnológicas** (ORT, 8.° semestre).

---

## Cómo ejecutar

No requiere instalación ni servidor. Abrí el archivo directamente en el navegador:

```
index.html  →  doble clic, o arrastrarlo a Chrome/Firefox/Edge
```

> Funciona 100% offline. Usa `localStorage` del navegador para persistir datos entre recargas.

---

## Qué es PasteleriApp

Solución para emprendedoras de pastelería artesanal que hoy gestionan pedidos por WhatsApp. El sistema cubre dos actores:

| Actor | Qué puede hacer |
|---|---|
| **Cliente** | Hacer un pedido con presupuesto en tiempo real, ver disponibilidad de fechas, rastrear el estado de su pedido |
| **Emprendedora** | Ver y gestionar pedidos en un kanban, controlar la agenda de entregas, registrar avances de producción, gestionar stock de insumos, analizar patrones de demanda |

---

## Estructura de la app

```
Soy cliente
└── Formulario de pedido (con precio calculado en tiempo real)
└── Tracker de pedido (línea de tiempo del estado)

Panel emprendedora
├── Panel      → Stats · Calendario de capacidad · Entregas · Kanban
├── Historial  → Calendario de junio · Gráficos de demanda
└── Stock      → CRUD de insumos con unidades y alertas
```

---

## Escenarios de demo

### Como cliente

1. **Hacer un pedido**
   - Ir a "Soy cliente"
   - Completar nombre, WhatsApp, producto, sabor, decoración y fecha
   - Verificar presupuesto estimado en tiempo real
   - Enviar pedido → queda como `PED-008` en estado *Nuevo*

2. **Ver bloqueo de agenda**
   - Seleccionar la fecha **21 de junio** como fecha de entrega
   - El indicador muestra ✗ en rojo: esa fecha está llena (3/3 pedidos)
   - El botón "Enviar pedido" permanece deshabilitado
   - Seleccionar **22 de junio**: indicador en verde, fecha libre

3. **Rastrear un pedido existente**
   - Ingresar `PED-003` en el campo de seguimiento → pedido de Carlos Rodríguez
   - Ingresar `PED-005` → pedido de Lucía, en estado *Listo* (ya aparece el banner verde)

### Como emprendedora

4. **Aceptar un pedido nuevo**
   - Ir a "Panel emprendedora" → Panel
   - Clic en el pedido de Carlos Rodríguez (PED-003, columna *Nuevo*)
   - Clic en "Aceptar pedido" → pasa a *Confirmado*, aparece toast de confirmación

5. **Avanzar producción**
   - Clic en PED-001 (Ana García, *En producción*) → "Marcar como listo"
   - Toast: "🎉 Listo — se notifica a Ana García por WhatsApp"

6. **Ver agenda llena en el calendario**
   - En la sección de capacidad, el día **21 jun** aparece en rojo con badge `3/3`
   - Los días 23 y 25 aparecen en ámbar (1/3 y 1/3)

7. **Historial y demanda**
   - Ir a la sub-tab "Historial"
   - El calendario de junio muestra los días con pedidos en color (ámbar = 1–2, naranja = 3+)
   - Los gráficos muestran que **jueves, viernes y sábado** concentran la mayor demanda
   - Los **cupcakes** son el producto más pedido

8. **Gestión de stock**
   - Ir a la sub-tab "Stock"
   - "Dulce de leche" y "Manteca" muestran badge *Bajo* / *Crítico*
   - Clic en la cantidad → editar directamente en la tabla
   - Botón "+ Agregar insumo" → ingresar nombre, cantidad, unidad y mínimo

9. **Reiniciar demo**
   - Botón "↺ Reiniciar demo" (abajo a la derecha) restaura todos los datos de ejemplo

---

## Decisiones técnicas

| Aspecto | Decisión |
|---|---|
| Stack | HTML + CSS + JS vanilla, un solo archivo, sin dependencias |
| Persistencia | `localStorage` (clave `pastelero_v4`) |
| Fuentes | System fonts (`Segoe UI`, `Georgia`) — sin requests externos |
| Offline | 100% funcional sin conexión a internet |
| Capacidad | Máximo 3 pedidos/día, calculado dinámicamente excluyendo estados `entregado` y `rechazado` |
| Datos de ejemplo | 7 pedidos seed + 20 registros históricos (mayo–junio 2026) + 8 insumos |

---

## Datos de ejemplo incluidos

| ID | Cliente | Producto | Fecha | Estado |
|---|---|---|---|---|
| PED-001 | Ana García | Torta grande | 21 jun | En producción |
| PED-002 | María López | Cupcakes × 12 | 23 jun | Confirmado |
| PED-003 | Carlos Rodríguez | Torta mediana | 25 jun | **Nuevo** |
| PED-004 | Valentina Sosa | Alfajores × 12 | 20 jun | Entregado |
| PED-005 | Lucía Fernández | Torta pequeña | 20 jun | **Listo** |
| PED-006 | Sofía Méndez | Torta pequeña | 21 jun | Confirmado |
| PED-007 | Tomás Gutiérrez | Cupcakes × 12 | 21 jun | Confirmado |

> Los pedidos PED-001, PED-006 y PED-007 hacen que el **21 de junio esté lleno (3/3)**.
