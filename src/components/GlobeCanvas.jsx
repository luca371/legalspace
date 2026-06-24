import { useRef, useEffect } from 'react';
import { geoOrthographic, geoPath, geoInterpolate } from 'd3-geo';
import { feature } from 'topojson-client';
import landTopology from './land-110m.json';

// Conversia se face o singură dată, la nivel de modul — nu la fiecare render
// al componentei. land e un FeatureCollection cu o singură Feature de tip
// MultiPolygon (toată masa terestră simplificată, fără granițe de țări).
const land = feature(landTopology, landTopology.objects.land);

// Valorile default sunt constante module-level (nu literali în semnătura
// funcției) — un array/obiect default recreat la fiecare render ar schimba
// referința primită de componentă la fiecare re-render al părintelui,
// declanșând inutil logica de mai jos. Vezi nota din propsRef.
const DEFAULT_OCEAN_STOPS = ['#ffffff', '#eef0fb', '#c9d2f4', '#a7b4ea'];
const DEFAULT_LAND_STROKE = 'rgba(0, 33, 142, 0.65)';
const DEFAULT_LAND_FILL = 'rgba(62, 102, 234, 0.12)';

// Trasee reale [lon, lat], gândite ca "contracte trimise oriunde" — un mix
// între Paris (relevant pentru piața franceză țintă) și alte hub-uri majore,
// pe continente diferite. Cu 7 sloturi posibil active simultan, am extins
// lista la 10 trasee (de la 5) ca să reducă șansa ca două sloturi să aleagă
// din întâmplare exact același traseu, perfect suprapus vizual.
const CONTRACT_ROUTES = [
  { from: [2.35, 48.85], to: [-74.0, 40.71] },    // Paris -> New York
  { from: [2.35, 48.85], to: [139.69, 35.68] },   // Paris -> Tokyo
  { from: [2.35, 48.85], to: [151.21, -33.87] },  // Paris -> Sydney
  { from: [2.35, 48.85], to: [-46.63, -23.55] },  // Paris -> São Paulo
  { from: [2.35, 48.85], to: [55.27, 25.2] },     // Paris -> Dubai
  { from: [-0.13, 51.51], to: [103.82, 1.35] },   // Londra -> Singapore
  { from: [-0.13, 51.51], to: [18.42, -33.92] },  // Londra -> Cape Town
  { from: [55.27, 25.2], to: [103.82, 1.35] },    // Dubai -> Singapore
  { from: [-46.63, -23.55], to: [18.42, -33.92] },// São Paulo -> Cape Town
  { from: [-74.0, 40.71], to: [139.69, 35.68] },  // New York -> Tokyo
];

const ARC_COLOR = 'rgba(62, 102, 234, 0.85)';
const ARC_GLOW_COLOR = 'rgba(255, 255, 255, 0.95)';

export default function GlobeCanvas({
  // `size` rămâne acceptat ca limită maximă opțională (ex. dacă vrei un glob
  // mai mic decât containerul lui), dar NU mai dictează dimensiunea reală —
  // aceea se citește din containerul DOM via ResizeObserver. Înainte, `size`
  // fix (200) ignora complet faptul că `.hero-sphere` devine 150px prin CSS
  // la breakpoint-ul de 768px: canvas-ul rămânea randat intern la 200px și
  // doar SCALAT vizual de CSS — nu o randare nativă la rezoluția reală.
  maxSize = 200,
  rotationPeriodMs = 32000, // timp pentru o rotație completă de 360°
  oceanGradientStops = DEFAULT_OCEAN_STOPS,
  landStroke = DEFAULT_LAND_STROKE,
  landFill = DEFAULT_LAND_FILL,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const propsRef = useRef({ rotationPeriodMs, oceanGradientStops, landStroke, landFill });
  propsRef.current = { rotationPeriodMs, oceanGradientStops, landStroke, landFill };

  // Dimensiunea curentă (px CSS, nu px fizici) trăiește într-un ref, citită
  // de bucla de randare. ResizeObserver o actualizează când containerul își
  // schimbă dimensiunea (breakpoint CSS, redimensionare fereastră, rotație
  // telefon) — fără să remonteze efectul principal și fără să reseteze
  // `lambda` (rotația curentă), exact ca props-urile de stil de mai sus.
  const currentSizeRef = useRef(maxSize);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Recreează proiecția d3-geo + redimensionează bitmap-ul intern al
    // canvas-ului la noua dimensiune reală — apelată la mount și de fiecare
    // dată când ResizeObserver detectează o schimbare de layout.
    let projection = null;
    let path = null;

    const applySize = (cssSize) => {
      currentSizeRef.current = cssSize;
      const dpr = window.devicePixelRatio || 1;

      // Randare la rezoluție nativă a ecranului — fără asta canvas-ul apare
      // neclar pe ecrane retina/high-DPI (bitmap intern mai mic decât suprafața
      // CSS afișată).
      canvas.width = cssSize * dpr;
      canvas.height = cssSize * dpr;
      canvas.style.width = `${cssSize}px`;
      canvas.style.height = `${cssSize}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset, ca scale-urile succesive să nu se acumuleze
      ctx.scale(dpr, dpr);

      const radius = cssSize / 2 * 0.96;
      projection = geoOrthographic()
        .scale(radius)
        .translate([cssSize / 2, cssSize / 2])
        .clipAngle(90);
      path = geoPath(projection, ctx);
    };

    applySize(currentSizeRef.current);

    // Gradient + desen — toate citesc currentSizeRef.current, nu o valoare
    // capturată la momentul montării, ca să reflecte mereu dimensiunea la zi
    // după un eventual resize.
    const drawOcean = () => {
      const cssSize = currentSizeRef.current;
      const radius = cssSize / 2 * 0.96;
      const stops = propsRef.current.oceanGradientStops;
      const grad = ctx.createRadialGradient(
        cssSize * 0.35, cssSize * 0.32, 0,
        cssSize * 0.5, cssSize * 0.5, radius
      );
      stops.forEach((color, i) => {
        grad.addColorStop(i / (stops.length - 1), color);
      });
      ctx.beginPath();
      ctx.arc(cssSize / 2, cssSize / 2, radius, 0, 2 * Math.PI);
      ctx.fillStyle = grad;
      ctx.fill();
    };

    let lambda = 0;
    let lastTime = null;
    let reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── ARCURI OCAZIONALE "contracte trimise" ───────────────────────────
    // 3 sloturi independente, fiecare cu propriul traseu/fază/timer — nu
    // un singur arc multiplicat, ci 3 cicluri de viață separate, pornite
    // la momente decalate, ca să nu apară/dispară sincron toate deodată.
    // Desenate în interiorul aceluiași render() / cu aceeași proiecție,
    // ca arcurile să rămână "lipite" de suprafața sferei pe măsură ce
    // aceasta se rotește (nu un overlay separat care ar aluneca vizual).
    // Faze per slot: 'idle' (așteptare) -> 'drawing' (arcul se trasează
    // progresiv) -> 'traveling' (arc complet, o particulă se deplasează
    // de-a lungul lui) -> 'fading' (se stinge) -> idle.
    const ARC_SLOT_COUNT = 7;
    const arcSlots = Array.from({ length: ARC_SLOT_COUNT }, (_, i) => ({
      phase: 'idle',
      phaseStart: 0,
      route: null,
      // Decalaj inițial diferit per slot, ca cele 3 cicluri să nu pornească
      // sincron la încărcarea paginii — fiecare își are propriul "ceas".
      nextArcTime: 300 + i * 350 + Math.random() * 500,
      elapsed: 0,
    }));

    const PHASE_DURATIONS = {
      drawing: 1100,
      traveling: 1300,
      fading: 700,
    };

    const pickRoute = () => CONTRACT_ROUTES[Math.floor(Math.random() * CONTRACT_ROUTES.length)];

    // Determină dacă un punct [lon, lat] e pe emisfera vizibilă din unghiul
    // curent de rotație — același test geometric pe care `clipAngle(90)`
    // îl aplică intern path-urilor, dar trebuie reimplementat manual aici
    // pentru că desenăm arcul punct-cu-punct, nu printr-un geoPath() pe o
    // singură geometrie.
    const isVisible = ([lon, lat], rotation) => {
      const [rLambda, rPhi] = rotation;
      const lambdaRad = (lon + rLambda) * Math.PI / 180;
      const phiRad = lat * Math.PI / 180;
      const rPhiRad = -rPhi * Math.PI / 180;
      const cosC = Math.sin(rPhiRad) * Math.sin(phiRad) +
                   Math.cos(rPhiRad) * Math.cos(phiRad) * Math.cos(lambdaRad);
      return cosC > 0;
    };

    const updateArcSlot = (slot, dt) => {
      slot.elapsed += dt;

      if (slot.phase === 'idle') {
        if (slot.elapsed >= slot.nextArcTime) {
          slot.route = pickRoute();
          slot.phase = 'drawing';
          slot.phaseStart = slot.elapsed;
        }
        return;
      }

      const phaseElapsed = slot.elapsed - slot.phaseStart;
      const duration = PHASE_DURATIONS[slot.phase];

      if (phaseElapsed >= duration) {
        if (slot.phase === 'drawing') slot.phase = 'traveling';
        else if (slot.phase === 'traveling') slot.phase = 'fading';
        else if (slot.phase === 'fading') {
          slot.phase = 'idle';
          slot.route = null;
          // Pauză ocazională până la următorul arc din acest slot: 1.5-3.5
          // secunde — destul de frecvent cât să fie observat constant, dar
          // tot cu o pauză vizibilă, nu un singur arc continuu pe acel slot.
          slot.nextArcTime = slot.elapsed + 1500 + Math.random() * 2000;
        }
        slot.phaseStart = slot.elapsed;
      }
    };

    const drawArcSlot = (slot, rotation) => {
      if (!slot.route || slot.phase === 'idle') return;

      const interpolate = geoInterpolate(slot.route.from, slot.route.to);
      const phaseElapsed = slot.elapsed - slot.phaseStart;

      // Progresul de "trasare" a arcului: 0 -> 1 doar în faza 'drawing';
      // rămâne la 1 (arc complet vizibil) în 'traveling' și 'fading'.
      let drawProgress = 1;
      if (slot.phase === 'drawing') {
        drawProgress = Math.min(phaseElapsed / PHASE_DURATIONS.drawing, 1);
      }

      // Opacity globală a arcului — plin în 'drawing'/'traveling', scade
      // spre 0 în 'fading'.
      let arcOpacity = 1;
      if (slot.phase === 'fading') {
        arcOpacity = 1 - Math.min(phaseElapsed / PHASE_DURATIONS.fading, 1);
      }

      const SAMPLES = 60; // puncte de-a lungul arcului — suficient pentru curbură netedă
      const points = [];
      for (let i = 0; i <= SAMPLES; i++) {
        const t = (i / SAMPLES) * drawProgress;
        points.push(interpolate(t));
      }

      // Desenăm doar segmentele aflate pe emisfera vizibilă — fără asta,
      // un arc spre un punct ascuns (ex. Sydney, la 152° de Paris) ar trece
      // vizual "prin" glob în loc să fie tăiat la orizont, ca și coastele
      // continentelor.
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = ARC_COLOR.replace(/[\d.]+\)$/, `${arcOpacity * 0.85})`);
      ctx.beginPath();
      let penDown = false;
      for (const coord of points) {
        const visible = isVisible(coord, rotation);
        if (!visible) { penDown = false; continue; }
        const [x, y] = projection(coord);
        if (!penDown) {
          ctx.moveTo(x, y);
          penDown = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Particula care "călătorește" de-a lungul arcului — vizibilă doar
      // în faza 'traveling', poziționată la procentul curent al acelei faze.
      if (slot.phase === 'traveling') {
        const travelT = Math.min(phaseElapsed / PHASE_DURATIONS.traveling, 1);
        const particleCoord = interpolate(travelT);
        if (isVisible(particleCoord, rotation)) {
          const [px, py] = projection(particleCoord);
          ctx.beginPath();
          ctx.arc(px, py, 2.6, 0, 2 * Math.PI);
          ctx.fillStyle = ARC_GLOW_COLOR;
          ctx.shadowColor = ARC_COLOR;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0; // reset, ca shadow-ul să nu "scurgă" pe restul desenului
        }
      }

      // Mici puncte la origine/destinație — marcaj vizual discret al celor
      // două "orașe" conectate, vizibile cât arcul e prezent.
      [slot.route.from, slot.route.to].forEach((coord) => {
        if (!isVisible(coord, rotation)) return;
        const [x, y] = projection(coord);
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fillStyle = ARC_COLOR.replace(/[\d.]+\)$/, `${arcOpacity * 0.9})`);
        ctx.fill();
      });
    };

    const render = () => {
      const cssSize = currentSizeRef.current;
      const radius = cssSize / 2 * 0.96;

      ctx.clearRect(0, 0, cssSize, cssSize);
      drawOcean();

      projection.rotate([lambda, -15, 0]);

      ctx.beginPath();
      path(land);
      ctx.fillStyle = propsRef.current.landFill;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = propsRef.current.landStroke;
      ctx.stroke();

      arcSlots.forEach(slot => drawArcSlot(slot, [lambda, -15, 0]));

      ctx.beginPath();
      ctx.arc(cssSize / 2, cssSize / 2, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const tick = (now) => {
      if (lastTime === null) lastTime = now;
      const dt = now - lastTime;
      lastTime = now;

      // Clamp pe dt — vezi explicația detaliată din versiunea anterioară:
      // previne saltul unghiular mare după ce tab-ul a fost inactiv.
      const safeDt = Math.min(dt, 33);

      if (!reduceMotion) {
        lambda += (safeDt / propsRef.current.rotationPeriodMs) * 360;
        if (lambda > 360) lambda -= 360;
        arcSlots.forEach(slot => updateArcSlot(slot, safeDt));
      }

      render();
      rafRef.current = requestAnimationFrame(tick);
    };

    render();
    rafRef.current = requestAnimationFrame(tick);

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e) => { reduceMotion = e.matches; };
    mql.addEventListener('change', handleMotionChange);

    // ResizeObserver urmărește dimensiunea REALĂ a elementului canvas în DOM
    // (determinată de CSS — `.hero-globe-canvas { width: 100%; height: 100%; }`
    // în interiorul `.hero-sphere`, care la rândul ei se micșorează la 150px
    // sub breakpoint-ul de 768px). La fiecare schimbare, recreăm proiecția la
    // noua dimensiune — globul rămâne nativ clar la orice mărime, nu doar
    // scalat vizual de CSS peste un bitmap fix.
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const newSize = Math.round(entry.contentRect.width);
      if (newSize > 0 && newSize !== currentSizeRef.current) {
        applySize(Math.min(newSize, maxSize));
      }
    });
    resizeObserver.observe(canvas.parentElement);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      mql.removeEventListener('change', handleMotionChange);
      resizeObserver.disconnect();
    };
    // maxSize e singura prop care ar justifica remontarea completă (schimbă
    // limita superioară a dimensiunii) — restul sunt citite live din
    // propsRef.current, exact ca în versiunea anterioară.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxSize]);

  return <canvas ref={canvasRef} className="hero-globe-canvas" aria-hidden="true" />;
}