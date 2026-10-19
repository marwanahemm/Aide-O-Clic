'use client';
import { useEffect } from 'react';

// Ajoute une ombre sous l'en-tête dès que la page défile
export default function ScrollShadow() {
  useEffect(() => {
    const maj = () => { if (window.scrollY > 8) document.documentElement.setAttribute('data-scrolled', ''); else document.documentElement.removeAttribute('data-scrolled'); };
    maj();
    window.addEventListener('scroll', maj, { passive: true });
    return () => window.removeEventListener('scroll', maj);
  }, []);
  return null;
}
