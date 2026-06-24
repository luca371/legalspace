import { createContext, useContext, useRef, useCallback } from 'react';

const LenisContext = createContext(null);

export const LenisProvider = ({ children }) => {
  // Holds the single global Lenis instance once ScrollStack creates it.
  // Using a ref (not state) because we don't want consumers to re-render
  // when the instance is set — they only need it inside event handlers.
  const lenisRef = useRef(null);

  const registerLenis = useCallback(instance => {
    lenisRef.current = instance;
  }, []);

  const scrollTo = useCallback((target, options) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, options);
    } else {
      // Fallback in case nav is clicked before ScrollStack has mounted/registered.
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <LenisContext.Provider value={{ registerLenis, scrollTo }}>
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