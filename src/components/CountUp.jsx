'use client';
import { useEffect, useRef, useState } from 'react';

// Chiffre qui « monte » jusqu'à sa valeur quand il apparaît. Sans JavaScript ou en mode accessibilité : la valeur finale s'affiche directement.
export default function CountUp({ fin, decimales = 0, suffixe = '' }) {
  const [valeur, setValeur] = useState(fin);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.getAttribute('data-mode') === 'senior';
    if (!el || calme || typeof IntersectionObserver === 'undefined') return undefined;
    setValeur(0);
    let raf;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const debut = performance.now();
      const duree = 1100;
      const tick = (t) => {
        const p = Math.min(1, (t - debut) / duree);
        setValeur(fin * (1 - (1 - p) ** 3));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => { obs.disconnect(); cancelAnimationFrame(raf); };
  }, [fin]);

  const txt = valeur.toFixed(decimales).replace('.', ',');
  return <span ref={ref}>{txt}{suffixe}</span>;
}
