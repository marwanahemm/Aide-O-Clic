'use client';
import { useEffect, useRef } from 'react';

// Fait apparaître une section en douceur quand elle entre à l'écran.
// Amélioration progressive : sans JavaScript, avec « réduire les animations » ou en mode accessibilité, tout est visible tout de suite.
export default function Reveal({ as: Tag = 'div', className = '', children, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.getAttribute('data-mode') === 'senior';
    if (calme) return undefined;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return undefined; // déjà visible : on n'y touche pas
    el.classList.add('rv-hidden');
    const obs = new IntersectionObserver((entrees) => {
      entrees.forEach((e) => {
        if (e.isIntersecting) {
          el.classList.remove('rv-hidden');
          el.classList.add('rv-in');
          obs.disconnect();
        }
      });
    }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return <Tag ref={ref} className={`${className} rv`.trim()} {...props}>{children}</Tag>;
}
