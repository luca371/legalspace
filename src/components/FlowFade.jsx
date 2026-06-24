import { useRef, useEffect, useState } from 'react';

// Înlocuiește ScrollStack pentru secțiunea "The Flow" — fără scroll-jacking,
// fără pin, fără transform-uri calculate din scrollTop. Fiecare card stă la
// poziția lui NATURALĂ în document (flow normal, una sub alta, cu spațiu
// normal între ele) — nu mai există nicio sincronizare fină cu poziția de
// scroll, deci toată clasa de bug-uri vânată anterior (jitter, suprapunere,
// blocaj la ultimul card, interferență cu hover) nu mai poate exista
// structural, pentru că mecanismul care le cauza pe toate (transform live
// recalculat la fiecare scroll tick) a fost eliminat complet.
//
// Tranziția cerută — "cardul vechi se stinge când vine cel nou, overlap
// minim" — se obține simplu: fiecare card e propriul IntersectionObserver,
// cu fade-in la intrare în viewport și fade-out la ieșire. Pentru ca două
// carduri consecutive să nu fie complet vizibile simultan (overlap minim,
// nu zero), cardurile sunt suficient de înalte (min-height generos) și
// threshold-ul observerului e ales ca un card să înceapă să se stingă
// chiar înainte ca următorul să fi apărut complet — un fade încrucișat
// natural, fără nicio coordonare JS între carduri.
function FlowFadeCard({ children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.4, rootMargin: '-10% 0px -10% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={visible ? 'flow-fade-card flow-fade-card--visible' : 'flow-fade-card'}>
      {children}
    </div>
  );
}

export default function FlowFade({ steps, renderCard }) {
  return (
    <div className="flow-fade-list">
      {steps.map((step) => (
        <FlowFadeCard key={step.key}>
          {renderCard(step)}
        </FlowFadeCard>
      ))}
    </div>
  );
}