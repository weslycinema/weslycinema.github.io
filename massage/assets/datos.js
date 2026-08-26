/* ────────────────────────────────────────────────────────────────────
   Estado del prototipo.

   En producción esto es Postgres + un canal de tiempo real (Supabase
   Realtime / WebSocket). Aquí lo sustituimos por localStorage +
   BroadcastChannel, que se comporta igual entre pestañas del mismo
   navegador: abre el dashboard y una pantalla de sala a la vez y verás
   la sincronización en vivo.
   ──────────────────────────────────────────────────────────────────── */

const CLAVE = 'masaje_demo_v3';
const canal = 'BroadcastChannel' in window ? new BroadcastChannel('masaje_demo') : null;

const dia = 86400000;
const hoy = () => new Date();
const haceDias = (n, h = 10, m = 0) => {
  const d = new Date(Date.now() - n * dia);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export const TIPOS_MARCA = {
  contractura: {etq:'Contractura', color:'#fb923c'},
  dolor:       {etq:'Dolor',       color:'#ef4444'},
  tension:     {etq:'Tensión',     color:'#fbbf24'},
  lesion:      {etq:'Lesión',      color:'#f472b6'},
  evitar:      {etq:'No tratar',   color:'#6366f1'},
};

function semilla(){
  return {
    version: 3,
    clientes: [
      {id:'c1', nombre:'Laura Méndez',   nac:1988, tel:'+34 611 22 33 44',
       consent:true,  alergias:'Aceite de almendra',
       nota:'Trabaja 9 h sentada. Tensión cervical crónica.'},
      {id:'c2', nombre:'Andreas Køhler', nac:1975, tel:'+34 622 55 66 77',
       consent:true,  alergias:'—',
       nota:'Corredor de fondo. Sobrecarga de gemelos y fascia.'},
      {id:'c3', nombre:'Rocío Salas',    nac:1994, tel:'+34 633 88 99 00',
       consent:true,  alergias:'Perfumes fuertes',
       nota:'Escoliosis leve diagnosticada. Sin dolor agudo.'},
      {id:'c4', nombre:'Tomás Iglesias', nac:1969, tel:'+34 644 11 22 33',
       consent:false, alergias:'—',
       nota:'Primera visita. Falta firmar consentimiento de datos de salud.'},
      {id:'c5', nombre:'Núria Fontán',   nac:1991, tel:'+34 655 44 55 66',
       consent:true,  alergias:'—',
       nota:'Postoperatorio de hombro (12 meses). Rango casi completo.'},
      {id:'c6', nombre:'Iván Bracamonte',nac:1983, tel:'+34 666 77 88 99',
       consent:true,  alergias:'—',
       nota:'Bruxismo. Pide siempre trabajo de mandíbula y temporal.'},
    ],

    salas: [
      {id:'s1', nombre:'Sala 1', tipo:'Descontracturante profundo', min:60,
       protocolo:['Calor húmedo en la zona','Amasamiento superficial','Presión sostenida en puntos gatillo','Estiramiento asistido','Cierre con fricciones suaves']},
      {id:'s2', nombre:'Sala 2', tipo:'Deportivo / recuperación', min:45,
       protocolo:['Valoración de rango articular','Fricción transversa profunda','Bombeo linfático de tren inferior','Estiramientos activos','Crioterapia local']},
      {id:'s3', nombre:'Sala 3', tipo:'Drenaje linfático manual', min:50,
       protocolo:['Apertura de ganglios cervicales','Drenaje de abdomen','Tren inferior ascendente','Cierre y reposo 5 min']},
      {id:'s4', nombre:'Sala 4', tipo:'Relajante / aromaterapia', min:75,
       protocolo:['Ambiente y aceite templado','Espalda completa','Cervicales y cuero cabelludo','Piernas y pies','Reposo con manta térmica']},
    ],

    sesiones: [
      {id:'x1', clienteId:'c1', salaId:'s1', terapeuta:'Marta R.', inicio:haceDias(96,11), fin:haceDias(96,12),
       notas:'Trapecio derecho muy tenso. Cede poco.',
       marcas:[
         {vista:'dorsal', zona:'trapecio_der',   tipo:'contractura', int:5, nota:'Punto gatillo activo'},
         {vista:'dorsal', zona:'cervical',       tipo:'tension',     int:4, nota:''},
         {vista:'dorsal', zona:'escapula_der',   tipo:'tension',     int:3, nota:''},
       ]},
      {id:'x2', clienteId:'c1', salaId:'s1', terapeuta:'Marta R.', inicio:haceDias(61,11), fin:haceDias(61,12),
       notas:'Mejora clara en trapecio. Aparece molestia lumbar.',
       marcas:[
         {vista:'dorsal', zona:'trapecio_der',    tipo:'contractura', int:3, nota:'Baja de 5 a 3'},
         {vista:'dorsal', zona:'dorsalancho_izq', tipo:'dolor',       int:3, nota:'Nueva'},
         {vista:'dorsal', zona:'cervical',        tipo:'tension',     int:3, nota:''},
       ]},
      {id:'x3', clienteId:'c1', salaId:'s4', terapeuta:'Jon A.', inicio:haceDias(24,17), fin:haceDias(24,18),
       notas:'Sesión de mantenimiento. Muy buena respuesta.',
       marcas:[
         {vista:'dorsal', zona:'trapecio_der',    tipo:'tension', int:2, nota:''},
         {vista:'dorsal', zona:'dorsalancho_izq', tipo:'tension', int:2, nota:'Mejorando'},
         {vista:'frontal',zona:'deltoides_der',   tipo:'tension', int:2, nota:''},
       ]},

      {id:'x4', clienteId:'c2', salaId:'s2', terapeuta:'Jon A.', inicio:haceDias(45,9), fin:haceDias(45,10),
       notas:'Post-maratón. Gemelos muy cargados.',
       marcas:[
         {vista:'dorsal', zona:'gemelo_izq', tipo:'contractura', int:4, nota:''},
         {vista:'dorsal', zona:'gemelo_der', tipo:'contractura', int:4, nota:''},
         {vista:'dorsal', zona:'isquio_der', tipo:'dolor',       int:3, nota:'Ojo, antecedente de rotura'},
       ]},
      {id:'x5', clienteId:'c2', salaId:'s2', terapeuta:'Jon A.', inicio:haceDias(12,9), fin:haceDias(12,10),
       notas:'Carga de entrenamiento alta otra vez.',
       marcas:[
         {vista:'dorsal', zona:'gemelo_izq',  tipo:'contractura', int:3, nota:''},
         {vista:'dorsal', zona:'isquio_der',  tipo:'lesion',      int:4, nota:'Fibrosis antigua palpable'},
         {vista:'frontal',zona:'cuadriceps_izq', tipo:'tension',  int:2, nota:''},
       ]},

      {id:'x6', clienteId:'c3', salaId:'s3', terapeuta:'Marta R.', inicio:haceDias(30,16), fin:haceDias(30,17),
       notas:'Asimetría visible en bipedestación.',
       marcas:[
         {vista:'dorsal', zona:'dorsalancho_der', tipo:'tension', int:3, nota:''},
         {vista:'dorsal', zona:'gluteo_izq',      tipo:'tension', int:2, nota:''},
       ]},

      {id:'x7', clienteId:'c5', salaId:'s1', terapeuta:'Marta R.', inicio:haceDias(18,12), fin:haceDias(18,13),
       notas:'Hombro operado: trabajo suave, sin tracción.',
       marcas:[
         {vista:'frontal',zona:'deltoides_izq', tipo:'evitar', int:0, nota:'Cirugía 2024 · no movilizar en tracción'},
         {vista:'dorsal', zona:'trapecio_izq',  tipo:'tension', int:3, nota:''},
       ]},

      {id:'x8', clienteId:'c6', salaId:'s4', terapeuta:'Jon A.', inicio:haceDias(7,19), fin:haceDias(7,20),
       notas:'Mandíbula muy rígida al despertar.',
       marcas:[
         {vista:'frontal',zona:'craneo',   tipo:'tension',     int:4, nota:'Masetero y temporal'},
         {vista:'dorsal', zona:'cervical', tipo:'contractura', int:3, nota:''},
       ]},
    ],

    /* Los "pop-up de la siguiente visita": avisos pendientes por cliente */
    avisos: [
      {id:'a1', clienteId:'c1', prioridad:'media',
       texto:'Insistir en trapecio derecho; la última vez cedió con presión sostenida de 90 s.',
       creado:haceDias(24,18), visto:null},
      {id:'a2', clienteId:'c2', prioridad:'alta',
       texto:'Isquiotibial derecho: fibrosis antigua. NO aplicar fricción transversa profunda.',
       creado:haceDias(12,10), visto:null},
      {id:'a3', clienteId:'c5', prioridad:'alta',
       texto:'Hombro izquierdo operado. Sin tracción ni movilización forzada.',
       creado:haceDias(18,13), visto:null},
      {id:'a4', clienteId:'c6', prioridad:'media',
       texto:'Pidió empezar por mandíbula antes que por espalda.',
       creado:haceDias(7,20), visto:null},
    ],

    /* Sesiones en curso: salaId → {clienteId, inicio, paso} */
    activas: {},

    scans: [
      {id:'sc1', clienteId:'c3', fecha:haceDias(30,16),
       metricas:{'Desnivel de hombros':'+1,8 cm (der. alto)','Rotación de pelvis':'4° izq.','Inclinación de cabeza':'2,5° der.','Apoyo plantar':'Pronación leve izq.'}},
      {id:'sc2', clienteId:'c1', fecha:haceDias(24,17),
       metricas:{'Desnivel de hombros':'+0,9 cm (der. alto)','Rotación de pelvis':'1° der.','Inclinación de cabeza':'6° ant. (anteposición)','Apoyo plantar':'Neutro'}},
    ],
  };
}

/* ── Persistencia ─────────────────────────────────────────────────── */
export let E = cargar();

function cargar(){
  try{
    const raw = localStorage.getItem(CLAVE);
    if (raw){
      const d = JSON.parse(raw);
      if (d.version === 3) return d;
    }
  }catch(_){}
  const s = semilla();
  try{ localStorage.setItem(CLAVE, JSON.stringify(s)); }catch(_){}
  return s;
}

export function guardar(evento = {tipo:'estado'}){
  try{ localStorage.setItem(CLAVE, JSON.stringify(E)); }catch(_){}
  canal?.postMessage(evento);
}

export function reiniciar(){
  E = semilla();
  guardar({tipo:'estado'});
  location.reload();
}

/** Suscribe a cambios hechos en cualquier pestaña. */
export function alCambiar(fn){
  canal?.addEventListener('message', ev => {
    E = cargar();
    fn(ev.data || {tipo:'estado'});
  });
  window.addEventListener('storage', ev => {
    if (ev.key === CLAVE){ E = cargar(); fn({tipo:'estado'}); }
  });
}

/* ── Consultas ────────────────────────────────────────────────────── */
export const cliente = id => E.clientes.find(c => c.id === id);
export const sala    = id => E.salas.find(s => s.id === id);
export const sesionesDe = id =>
  E.sesiones.filter(s => s.clienteId === id).sort((a,b) => b.inicio.localeCompare(a.inicio));
export const avisosDe = id => E.avisos.filter(a => a.clienteId === id && !a.visto);
export const scansDe  = id =>
  E.scans.filter(s => s.clienteId === id).sort((a,b) => b.fecha.localeCompare(a.fecha));

export const iniciales = n => n.split(/\s+/).map(p => p[0]).join('').slice(0,2).toUpperCase();
/** Nombre reducido para pantallas visibles desde el pasillo (RGPD). */
export const nombreEnPantalla = n => {
  const [pila, ...resto] = n.split(/\s+/);
  return resto.length ? `${pila} ${resto[0][0]}.` : pila;
};
export const edad = nac => hoy().getFullYear() - nac;

export const fFecha = iso => new Date(iso).toLocaleDateString('es-ES',
  {day:'2-digit', month:'short', year:'numeric'});
export const fHora  = iso => new Date(iso).toLocaleTimeString('es-ES',
  {hour:'2-digit', minute:'2-digit'});

export function reloj(desdeISO){
  const s = Math.max(0, Math.floor((Date.now() - new Date(desdeISO)) / 1000));
  const mm = String(Math.floor(s/60)).padStart(2,'0');
  const ss = String(s%60).padStart(2,'0');
  return `${mm}:${ss}`;
}

export function nuevoId(pre){
  return pre + Math.random().toString(36).slice(2,8);
}

/* ── Acciones ─────────────────────────────────────────────────────── */

/** Check-in: asigna cliente a sala y lanza el pop-up en su pantalla. */
export function checkIn(clienteId, salaId){
  E.activas[salaId] = {clienteId, inicio:new Date().toISOString(), paso:0};
  guardar({tipo:'checkin', salaId, clienteId});
}

export function cerrarSesion(salaId, {notas = '', marcas = [], aviso = null} = {}){
  const act = E.activas[salaId];
  if (!act) return;
  E.sesiones.push({
    id: nuevoId('x'), clienteId: act.clienteId, salaId,
    terapeuta: 'Recepción (demo)',
    inicio: act.inicio, fin: new Date().toISOString(),
    notas, marcas,
  });
  if (aviso?.texto){
    E.avisos.push({
      id: nuevoId('a'), clienteId: act.clienteId,
      prioridad: aviso.prioridad || 'media', texto: aviso.texto,
      creado: new Date().toISOString(), visto: null,
    });
  }
  delete E.activas[salaId];
  guardar({tipo:'checkout', salaId});
}

export function avanzarPaso(salaId, delta){
  const act = E.activas[salaId];
  if (!act) return;
  const s = sala(salaId);
  act.paso = Math.max(0, Math.min(s.protocolo.length - 1, act.paso + delta));
  guardar({tipo:'paso', salaId});
}

export function marcarAvisosVistos(clienteId){
  const t = new Date().toISOString();
  E.avisos.forEach(a => { if (a.clienteId === clienteId && !a.visto) a.visto = t; });
  guardar();
}

/**
 * Agrega todas las marcas de un cliente por zona.
 * `hasta`: ISO opcional para ver el cuerpo "tal como estaba" en el pasado.
 * Devuelve { [vista]: { [zonaId]: {intensidad, evitar, n, ultima} } }
 */
export function mapaDeMarcas(clienteId, {hasta = null, soloSesion = null} = {}){
  const out = {frontal:{}, dorsal:{}};
  let ses = sesionesDe(clienteId);
  if (soloSesion) ses = ses.filter(s => s.id === soloSesion);
  else if (hasta) ses = ses.filter(s => s.inicio <= hasta);

  for (const s of ses){
    for (const m of (s.marcas || [])){
      const v = out[m.vista] || (out[m.vista] = {});
      const prev = v[m.zona];
      const esEvitar = m.tipo === 'evitar';
      if (!prev){
        v[m.zona] = {intensidad: esEvitar ? 0 : m.int, evitar: esEvitar, n:1,
                     ultima: s.inicio, tipo: m.tipo, nota: m.nota};
      } else {
        prev.n++;
        prev.evitar = prev.evitar || esEvitar;
        // la marca más reciente manda en la intensidad mostrada
        if (s.inicio > prev.ultima && !esEvitar){
          prev.intensidad = m.int; prev.ultima = s.inicio;
          prev.tipo = m.tipo; prev.nota = m.nota;
        }
      }
    }
  }
  return out;
}
