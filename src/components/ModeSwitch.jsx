'use client';
import { useEffect, useState } from 'react';
import Icon from './Icon';

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
    <button type="button" role="switch" aria-checked={senior} className="mode-switch" onClick={toggle}>
      <Icon name="eye" size={20} />
      <span className="mode-label">Mode senior<small>Textes plus grands, contrastes renforcés</small></span>
      <span className="track" aria-hidden="true" />
    </button>
  );
}
