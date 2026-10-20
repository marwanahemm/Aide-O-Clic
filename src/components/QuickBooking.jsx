'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from './Icon';

const JOURS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dateLongue = (isoDate) => new Date(`${isoDate}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

// Les 5 prochains jours ouvrés (du lundi au vendredi), à partir de demain
function prochainsJours(n) {
  const t = new Date();
  const d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1);
  const out = [];
  while (out.length < n) {
    if (d.getDay() !== 0 && d.getDay() !== 6) out.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

// Carte « Réservez en 3 clics » de l'accueil : choix du jour et du créneau, puis le formulaire s'ouvre déjà rempli
export default function QuickBooking({ creneaux }) {
  const [jours, setJours] = useState(null); // défini après affichage (évite un décalage serveur / navigateur)
  const [jour, setJour] = useState('');
  const [creneau, setCreneau] = useState('');
  const [pris, setPris] = useState([]);

  useEffect(() => {
    const j = prochainsJours(5);
    setJours(j);
    setJour(iso(j[0]));
  }, []);

  useEffect(() => {
    if (!jour) return undefined;
    let actif = true;
    fetch(`/api/rendez-vous?date=${jour}`)
      .then((r) => r.json())
      .then((d) => { if (actif) { setPris(d.pris || []); setCreneau((c) => ((d.pris || []).includes(c) ? '' : c)); } })
      .catch(() => { if (actif) setPris([]); });
    return () => { actif = false; };
  }, [jour]);

  const href = `/rendez-vous?${new URLSearchParams({ ...(jour ? { date: jour } : {}), ...(creneau ? { creneau } : {}) }).toString()}`;

  return (
    <div className="resa" role="group" aria-labelledby="resa-titre">
      <h2 id="resa-titre">Réservez en 3 clics</h2>
      <p className="resa-sub">Choisissez un jour, un créneau, et c&apos;est parti.</p>

      {!jours ? (
        <div className="resa-attente" aria-hidden="true" />
      ) : (
        <>
          <div className="resa-jours" role="group" aria-label="Choisir un jour">
            {jours.map((d) => {
              const v = iso(d);
              return (
                <button key={v} type="button" className={'jour' + (jour === v ? ' sel' : '')} aria-pressed={jour === v} aria-label={`${JOURS[d.getDay()]} ${d.getDate()} ${d.toLocaleDateString('fr-FR', { month: 'long' })}`} onClick={() => { setJour(v); setCreneau(''); }}>
                  <small>{JOURS[d.getDay()]}</small>{' '}{d.getDate()}
                </button>
              );
            })}
          </div>
          <p className="resa-date" aria-live="polite"><span className="cap">{dateLongue(jour)}</span></p>
          <div className="time-slots" role="group" aria-label="Choisir un créneau">
            {creneaux.map((c) => (
              <button key={c} type="button" className={'slot-btn' + (creneau === c ? ' selected' : '')} disabled={pris.includes(c)} aria-pressed={creneau === c} onClick={() => setCreneau(c)}>{c}</button>
            ))}
          </div>
        </>
      )}

      <Link href={href} className="btn btn-cta btn-block resa-go">Continuer <Icon name="arrow" size={20} /></Link>
    </div>
  );
}
