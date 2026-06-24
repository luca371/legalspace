import { createContext, useContext, useCallback } from 'react';

const LenisContext = createContext(null);

// Simplificat complet: Lenis a fost eliminat de pe pagină odată cu
// ScrollStack (singura componentă care îl crea). scrollTo foloseşte acum
// scrollIntoView nativ, cu behavior: 'smooth' — suportat de toate browserele
// moderne, fără dependență externă și fără riscul de bug-uri de sincronizare
// fină scroll-poziție pe care Lenis le introducea (jitter, blocaje, etc.,
// vânate îndelung pe ScrollStack înainte de a decide eliminarea completă).
export const LenisProvider = ({ children }) => {
  const scrollTo = useCallback((target, options = {}) => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;

    if (options.offset) {
      // scrollIntoView nu suportă un offset custom direct — calculăm manual
      // poziția țintă (utilă pentru a compensa nav-ul fixed care altfel ar
      // acoperi parțial secțiunea țintă) și scrollăm la ea explicit.
      const rect = el.getBoundingClientRect();
      const targetY = rect.top + window.scrollY + options.offset;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <LenisContext.Provider value={{ scrollTo }}>
      {children}
    </LenisContext.Provider>
  );
};

export const useLenis = () => {
  const ctx = useContext(LenisContext);
  if (!ctx) {
    throw new Error('useLenis must be used within a LenisProvider');
  }
  return ctx;
};