'use client';
import { useEffect, useState } from 'react';

// Bouton « couleurs claires » : change UNIQUEMENT les couleurs (pas la taille des textes, contrairement au mode accessibilité)
export default function ThemeSwitch() {
  const [clair, setClair] = useState(false);

  useEffect(() => {
    setClair(document.documentElement.getAttribute('data-theme') === 'light');
  }, []);

  function toggle() {
    const next = !clair;
    setClair(next);
    if (next) document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    try { localStorage.setItem('sap-theme', next ? 'light' : 'dark'); } catch {}
  }

  return (
    <button type="button" role="switch" aria-checked={clair} className="mode-switch theme-switch" onClick={toggle}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.3M12 19.2v2.3M2.5 12h2.3M19.2 12h2.3M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
      </svg>
      <span className="mode-label">Couleurs claires<small>Change seulement les couleurs du site</small></span>
      <span className="track" aria-hidden="true" />
    </button>
  );
}
