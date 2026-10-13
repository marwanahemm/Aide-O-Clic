'use client';
import { useState } from 'react';
import Link from 'next/link';
import Icon from './Icon';
import { calculerBudget, eur, nombre } from '../lib/pricing';

const RAPIDES = [1, 2, 3, 4, 6, 8];
const borne = (h) => Math.min(10, Math.max(1, h));
const fmtHeures = (h) => String(h).replace('.', ',');

export default function Simulator({ prixHeure, prixPack2h, creditImpot, pct }) {
  const [heures, setHeures] = useState(2);
  const [mode, setMode] = useState('hourly');
  const { brut, net } = calculerBudget(heures, mode, { prixHeure, prixPack2h, creditImpot });

  return (
    <div className="sim">
      <div className="panel">
        <h2 className="panel-title"><span className="n">1</span> Choisissez votre formule</h2>
        <div className="choice-grid" role="radiogroup" aria-label="Formule">
          <button type="button" role="radio" aria-checked={mode === 'hourly'} className="choice" onClick={() => setMode('hourly')}>
            <strong>Tarif horaire</strong>
            <span>{nombre(prixHeure)} € / heure</span>
          </button>
          <button type="button" role="radio" aria-checked={mode === 'pack2h'} className="choice" onClick={() => setMode('pack2h')}>
            <strong>Pack 2 heures</strong>
            <span>{nombre(prixPack2h)} € les 2 heures</span>
          </button>
        </div>

        <h2 className="panel-title" style={{ marginTop: 30 }}><span className="n">2</span> Combien d&apos;heures ?</h2>
        <div className="stepper-hours">
          <button type="button" className="round-btn" aria-label="Retirer une demi-heure" disabled={heures <= 1} onClick={() => setHeures((h) => borne(h - 0.5))}><Icon name="minus" size={26} /></button>
          <div className="hours-value">{fmtHeures(heures)}<small>{heures > 1 ? 'heures' : 'heure'}</small></div>
          <button type="button" className="round-btn" aria-label="Ajouter une demi-heure" disabled={heures >= 10} onClick={() => setHeures((h) => borne(h + 0.5))}><Icon name="plus" size={26} /></button>
        </div>
        <input id="hours-slider" type="range" min="1" max="10" step="0.5" value={heures} onChange={(e) => setHeures(parseFloat(e.target.value))} aria-label="Nombre d'heures d'intervention" />
        <div className="range-scale" aria-hidden="true"><span>1 h · ponctuel</span><span>5 h · suivi</span><span>10 h · accompagnement</span></div>
        <div className="quick" role="group" aria-label="Choix rapides">
          {RAPIDES.map((h) => (
            <button key={h} type="button" className={'slot-btn' + (heures === h ? ' selected' : '')} aria-pressed={heures === h} onClick={() => setHeures(h)}>{h} h</button>
          ))}
        </div>
      </div>

      <aside className="sim-side" aria-live="polite" aria-label="Résultat de la simulation">
        <div className="result">
          <div className="result-label">Votre coût réel</div>
          <div className="result-net">{eur(net)}</div>
          <div className="result-brut">au lieu de {eur(brut)} avant crédit d&apos;impôt de {pct} %</div>
          <div className="save-badge"><Icon name="check" size={18} /> Vous économisez {eur(brut - net)}</div>
          <Link href="/rendez-vous" className="btn btn-cta btn-block btn-lg">Réserver cette intervention <Icon name="arrow" size={20} /></Link>
        </div>
      </aside>
    </div>
  );
}
