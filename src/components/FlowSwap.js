import { useState, useRef, useEffect } from 'react';
import { useLenis } from './LenisContext';

// FlowSwap înlocuiește ScrollStack pentru secțiunea "The Flow" — diferența
// mecanică esențială: ScrollStack ținea TOATE cardurile vizibile simultan,
// poziționate ca stivă (scale/blur cumulative, unul "în spatele" celuilalt).
// Aici, la orice moment doar UN card e vizibil; trecerea la următorul se
// face prin fade+slide (cardul curent iese pe sus, următorul intră de jos),
// nu prin dezvăluire treptată a unei stive.
//
// Mecanism: un "tunel" de scroll cu înălțime = steps.length × 100vh conține
// zona de conținut, fixată pe ecran prin `position: sticky` (CSS nativ —
// nu necesită calcul JS de poziție, doar browser-ul ține elementul pe loc
// cât timp containerul lui părinte trece prin viewport). Singurul lucru
// calculat în JS e INDEXUL pasului activ, derivat din procentul de scroll
// parcurs prin tunel — apoi CSS-ul aplică starea de tranziție corectă
// (.swap-active / .swap-prev / .swap-next) pe baza diferenței de index.
export default function FlowSwap({ steps, renderCard }) {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { onScroll } = useLenis();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const computeActiveIndex = () => {
      const rect = container.getBoundingClientRect();
      const total = steps.length;
      // Progresul de scroll prin tunel: 0 când partea de sus a containerului
      // atinge vârful viewport-ului, 1 când partea de jos a containerului
      // ajunge la vârful viewport-ului (adică tot tunelul a "trecut").
      const scrolled = -rect.top;
      const totalScrollable = rect.height - window.innerHeight;
      const progress = totalScrollable > 0
        ? Math.min(Math.max(scrolled / totalScrollable, 0), 1)
        : 0;

      const index = Math.min(
        Math.floor(progress * total),
        total - 1
      );
      setActiveIndex(prev => (prev !== index ? index : prev));
    };

    computeActiveIndex();

    // Folosim evenimentul de scroll publicat de Lenis (vezi LenisContext) ca
    // să rămânem pe același "ceas" de scroll ca restul paginii — altfel, un
    // listener nativ separat pe window.scroll ar putea desincroniza ușor
    // calculul de progres față de poziția reală redată de Lenis (mai ales
    // pe smooth-scroll, unde poziția vizuală diferă de scrollTop brut pentru
    // o fracțiune de secundă).
    const unsubscribe = onScroll(computeActiveIndex);
    window.addEventListener('resize', computeActiveIndex);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', computeActiveIndex);
    };
  }, [steps.length, onScroll]);

  return (
    <div
      ref={containerRef}
      className="flow-swap-tunnel"
      style={{ height: `${steps.length * 100}vh` }}
    >
      <div className="flow-swap-sticky">
        {steps.map((step, i) => {
          let state = 'flow-swap-card--hidden';
          if (i === activeIndex) state = 'flow-swap-card--active';
          else if (i === activeIndex - 1) state = 'flow-swap-card--prev';
          else if (i === activeIndex + 1) state = 'flow-swap-card--next';

          return (
            <div key={step.key} className={`flow-swap-card ${state}`}>
              {renderCard(step, i === activeIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}