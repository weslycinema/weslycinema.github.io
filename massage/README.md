# Prototipo — Dashboard para centro de masaje

Prototipo navegable de un sistema de gestión clínica para un centro de masaje
con varias salas. Es **HTML/CSS/JS sin dependencias**: funciona tal cual en
GitHub Pages y sirve para validar el flujo antes de invertir en backend.

## Pantallas

| Archivo | Quién la usa | Qué hace |
|---|---|---|
| `index.html` | Recepción / dueño | KPIs, estado en vivo de las 4 salas, lista de clientes, check-in |
| `cliente.html?id=c1` | Terapeuta (tablet) | Mapa corporal, historial, avisos, scan postural |
| `sala.html?id=s2` | Nadie — pantalla fija | Vista de kiosco: cliente, cronómetro, protocolo, zonas de trabajo |

## Cómo ver la parte interesante

1. Abre `sala.html?id=s2` en una pestaña y déjala visible.
2. En otra pestaña abre `index.html` y haz **Check-in** de *Andreas Køhler* en la Sala 2.
3. La pantalla de la sala muestra el **pop-up con los avisos de la visita anterior**
   sin recargar nada. Los botones «◀ Paso / Paso ▶» del dashboard mueven el
   protocolo en la pantalla de la sala en tiempo real.

En `cliente.html` toca cualquier zona del cuerpo para registrar un hallazgo, y
mueve el deslizador temporal para ver el cuerpo tal como estaba en cada visita
(modo **Acumulado**) o solo lo hallado en una sesión concreta (**Por sesión**).

## Qué es real y qué está simulado

| Pieza | En el prototipo | En producción |
|---|---|---|
| Base de datos | `localStorage` | Postgres (Supabase) |
| Tiempo real | `BroadcastChannel` entre pestañas | Supabase Realtime / WebSocket |
| Autenticación y roles | no existe | Supabase Auth: recepción / terapeuta / admin |
| Scan postural | métricas inventadas al azar | foto frontal y lateral + MediaPipe Pose (33 puntos) en el navegador |
| Mapa corporal | **real y funcional** | igual, con el catálogo de zonas ampliado |
| Historial y línea temporal | **real y funcional** | igual, contra la base de datos |

`BroadcastChannel` solo sincroniza pestañas del **mismo navegador**. Entre
dispositivos distintos hace falta el backend — esa es exactamente la pieza que
este prototipo sustituye.

## Decisiones de privacidad ya incorporadas

Los datos tratados son **categoría especial** (RGPD art. 9), así que:

- La pantalla de sala muestra el nombre reducido (`Andreas K.`), nunca el
  historial clínico: se ve desde el pasillo.
- El detalle clínico aparece únicamente en el pop-up de check-in, que se cierra
  solo a los 25 s. *Decisión a revisar con el centro: si la camilla es visible
  desde la puerta, ese pop-up debería salir solo en la tablet del terapeuta.*
- La ficha marca en rojo a quien no tenga el consentimiento firmado.
- Falta por implementar (necesita backend): cifrado en reposo, registro de
  accesos y borrado a petición del cliente.

## Modelo de datos

Definido en `assets/datos.js`, con la forma que tendrían las tablas reales:

```
clientes · salas · sesiones · sesiones.marcas · avisos · scans · activas
```

`assets/cuerpo.js` contiene el catálogo de zonas anatómicas y el dibujo del
SVG. Las zonas laterales se definen una sola vez y se reflejan; en vista
frontal la izquierda de la imagen es el lado derecho del paciente.

## Reiniciar

El botón «Reiniciar datos de ejemplo» del dashboard restaura la semilla.
