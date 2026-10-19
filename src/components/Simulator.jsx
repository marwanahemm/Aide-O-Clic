'use client';
import { useState } from 'react';
import Link from 'next/link';
import Icon from './Icon';
import { calculerBudget, eur, nombre, heuresTxt } from '../lib/pricing';

const RAPIDES = [1, 2, 3, 4, 6, 8];
const borne = (h) => Math.min(10, Math.max(1, h));
const fmtHeures = (h) => String(h).replace('.', ',');

export default function Simulator({ formules, tarifHoraire, creditImpot, pct }) {
  const [heures, setHeures] = useState(2);
  const [choix, setChoix] = useState(0);
  const formule = formules[Math.min(choix, formules.length - 1)];
  const { brut, net } = calculerBudget(heures, formule, tarifHoraire, creditImpot);

  return (
    <div className="sim">
      <div className="panel">
        <h2 className="panel-title"><span className="n">1</span> Choisissez votre formule</h2>
        <div className="choice-grid" role="radiogroup" aria-label="Formule">
          {formules.map((f, i) => (
            <button key={f.nom} type="button" role="radio" aria-checked={choix === i} className="choice" onClick={() => setChoix(i)}>
              <strong>{f.nom}</strong>
              <span>{nombre(f.prix)} € pour {heuresTxt(f.heures)} h</span>
            </button>
          ))}
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
