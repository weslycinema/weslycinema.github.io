/* ────────────────────────────────────────────────────────────────────
   Mapa corporal interactivo.
   Cada zona es una forma clicable del SVG. Las zonas laterales se
   definen una sola vez (mitad izquierda de la imagen) y se reflejan.

   Convención anatómica:
     · Vista FRONTAL  → la izquierda de la imagen es la DERECHA del paciente.
     · Vista DORSAL   → la izquierda de la imagen es la IZQUIERDA del paciente.
   ──────────────────────────────────────────────────────────────────── */

const ANCHO = 200;

/* forma: {t:'r',x,y,w,h,rx}  ó  {t:'e',cx,cy,rx,ry} */
const FRONTAL = {
  centro: [
    ['craneo',   'Cráneo / cara',      {t:'e',cx:100,cy:34,rx:23,ry:28}],
    ['cuello',   'Cuello anterior',    {t:'r',x:88,y:58,w:24,h:17,rx:7}],
    ['abdomen',  'Abdomen',            {t:'r',x:79,y:110,w:42,h:32,rx:10}],
    ['pelvis',   'Pelvis / ingle',     {t:'r',x:77,y:145,w:46,h:24,rx:11}],
  ],
  lateral: [
    ['deltoides',  'Deltoides',            {t:'e',cx:64,cy:92,rx:16,ry:14}],
    ['pectoral',   'Pectoral',             {t:'r',x:78,y:76,w:21,h:32,rx:8}],
    ['biceps',     'Bíceps / brazo',       {t:'r',x:49,y:104,w:17,h:42,rx:8}],
    ['antebrazo',  'Antebrazo anterior',   {t:'r',x:44,y:148,w:15,h:40,rx:7}],
    ['mano',       'Mano',                 {t:'e',cx:51,cy:196,rx:9,ry:12}],
    ['cuadriceps', 'Cuádriceps',           {t:'r',x:76,y:172,w:22,h:60,rx:11}],
    ['rodilla',    'Rodilla',              {t:'e',cx:87,cy:240,rx:12,ry:11}],
    ['tibial',     'Tibial anterior',      {t:'r',x:78,y:250,w:18,h:56,rx:9}],
    ['pie',        'Pie / empeine',        {t:'e',cx:87,cy:316,rx:11,ry:12}],
  ],
};

const DORSAL = {
  centro: [
    ['occipital', 'Occipital',        {t:'e',cx:100,cy:34,rx:23,ry:28}],
    ['cervical',  'Cervicales',       {t:'r',x:88,y:58,w:24,h:17,rx:7}],
    ['sacro',     'Sacro / coxis',    {t:'r',x:84,y:158,w:32,h:20,rx:8}],
  ],
  lateral: [
    ['trapecio',    'Trapecio',              {t:'r',x:72,y:72,w:27,h:26,rx:8}],
    ['deltoidesp',  'Deltoides posterior',   {t:'e',cx:62,cy:94,rx:15,ry:13}],
    ['escapula',    'Escápula / romboides',  {t:'r',x:77,y:100,w:22,h:30,rx:8}],
    ['dorsalancho', 'Lumbar',                {t:'r',x:78,y:132,w:21,h:28,rx:8}],
    ['triceps',     'Tríceps',               {t:'r',x:48,y:104,w:17,h:42,rx:8}],
    ['antebrazop',  'Antebrazo posterior',   {t:'r',x:43,y:148,w:15,h:40,rx:7}],
    ['manop',       'Mano',                  {t:'e',cx:50,cy:196,rx:9,ry:12}],
    ['gluteo',      'Glúteo',                {t:'r',x:75,y:166,w:24,h:32,rx:12}],
    ['isquio',      'Isquiotibial',          {t:'r',x:76,y:200,w:22,h:52,rx:11}],
    ['popliteo',    'Hueco poplíteo',        {t:'e',cx:87,cy:258,rx:12,ry:10}],
    ['gemelo',      'Gemelo / sóleo',        {t:'r',x:78,y:266,w:18,h:52,rx:9}],
    ['talon',       'Talón / planta',        {t:'e',cx:87,cy:324,rx:11,ry:11}],
  ],
};

function reflejar(f){
  return f.t === 'r'
    ? {...f, x: ANCHO - f.x - f.w}
    : {...f, cx: ANCHO - f.cx};
}

/* Devuelve [{id, nombre, lado, forma}] ya expandido para una vista */
export function zonasDe(vista){
  const def = vista === 'frontal' ? FRONTAL : DORSAL;
  const out = def.centro.map(([id,nombre,forma]) => ({id, nombre, lado:null, forma}));
  for (const [id,nombre,forma] of def.lateral){
    // mitad izquierda de la imagen
    const ladoIzqImagen = vista === 'frontal' ? 'der' : 'izq';
    const ladoDerImagen = vista === 'frontal' ? 'izq' : 'der';
    out.push({id:`${id}_${ladoIzqImagen}`, nombre, lado:ladoIzqImagen, forma});
    out.push({id:`${id}_${ladoDerImagen}`, nombre, lado:ladoDerImagen, forma:reflejar(forma)});
  }
  return out;
}

export function nombreZona(vista, zonaId){
  return zonasDe(vista).find(z => z.id === zonaId)?.nombre ?? zonaId;
}
export function etiquetaLado(lado){
  return lado === 'izq' ? 'izq.' : lado === 'der' ? 'der.' : '';
}

const COLOR_INT = {1:'#fde68a',2:'#fbbf24',3:'#fb923c',4:'#ef4444',5:'#b91c1c'};

/**
 * Dibuja el cuerpo dentro de `host`.
 * marcasPorZona: { zonaId: {intensidad, evitar, n} }
 * onZona(zonaId, zona) se llama al hacer clic (si se pasa).
 */
export function dibujarCuerpo(host, vista, marcasPorZona = {}, onZona = null, seleccion = null){
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox', `0 0 ${ANCHO} 344`);
  svg.setAttribute('class','cuerpo');
  svg.setAttribute('role','img');
  svg.setAttribute('aria-label', `Mapa corporal, vista ${vista}`);

  for (const z of zonasDe(vista)){
    const f = z.forma;
    const el = document.createElementNS(ns, f.t === 'r' ? 'rect' : 'ellipse');
    if (f.t === 'r'){
      el.setAttribute('x',f.x); el.setAttribute('y',f.y);
      el.setAttribute('width',f.w); el.setAttribute('height',f.h);
      el.setAttribute('rx',f.rx ?? 6);
    } else {
      el.setAttribute('cx',f.cx); el.setAttribute('cy',f.cy);
      el.setAttribute('rx',f.rx); el.setAttribute('ry',f.ry);
    }
    el.setAttribute('class','cuerpo-zona');
    el.dataset.zona = z.id;

    const m = marcasPorZona[z.id];
    if (m){
      if (m.evitar) el.classList.add('evitar');
      // style inline: una regla CSS de clase gana a un atributo de presentación
      if (m.intensidad) el.style.fill = COLOR_INT[m.intensidad];
      else if (m.evitar) el.style.fill = '#3730a3';
    }
    if (seleccion === z.id) el.classList.add('sel');

    const t = document.createElementNS(ns,'title');
    const lado = etiquetaLado(z.lado);
    t.textContent = `${z.nombre}${lado ? ' ' + lado : ''}${m ? ` · ${m.n} marca(s)` : ''}`;
    el.appendChild(t);

    if (onZona){
      el.addEventListener('click', () => onZona(z.id, z));
      el.setAttribute('tabindex','0');
      el.setAttribute('role','button');
      el.addEventListener('keydown', ev => {
        if (ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); onZona(z.id, z); }
      });
      el.style.cursor = 'pointer';
    } else {
      el.style.cursor = 'default';
    }
    svg.appendChild(el);
  }
  host.replaceChildren(svg);
  return svg;
}

export { COLOR_INT };
