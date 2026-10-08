'use client';
import { useEffect, useState } from 'react';

export default function ModeSwitch() {
  const [senior, setSenior] = useState(false);

  useEffect(() => {
    setSenior(document.documentElement.getAttribute('data-mode') === 'senior');
  }, []);

  function toggle() {
    const next = !senior;
    setSenior(next);
    if (next) document.documentElement.setAttribute('data-mode', 'senior');
    else document.documentElement.removeAttribute('data-mode');
    try { localStorage.setItem('sap-mode', next ? 'senior' : 'normal'); } catch {}
  }

  return (
    <div className="mode-bar">
      <button type="button" role="switch" aria-checked={senior} className="mode-switch" onClick={toggle}>
        <span className="track" aria-hidden="true" />
        <span>👓 Mode senior<small>Textes agrandis &amp; contrastes renforcés</small></span>
      </button>
    </div>
  );
}
