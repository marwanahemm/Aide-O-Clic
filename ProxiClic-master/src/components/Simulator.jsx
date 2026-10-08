'use client';
import { useState } from 'react';
import { calculerBudget, eur, PRIX_HEURE, PRIX_PACK_2H } from '../lib/pricing';

export default function Simulator() {
  const [heures, setHeures] = useState(2);
  const [mode, setMode] = useState('hourly');
  const { brut, net } = calculerBudget(heures, mode);

  return (
    <div className="card-item" style={{ padding: 24, marginBottom: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <label className="form-label" htmlFor="pricing-mode">Sélectionnez votre formule :</label>
        <select id="pricing-mode" className="form-select" style={{ fontWeight: 700, fontSize: 13 }} value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="hourly">Tarif horaire standard ({PRIX_HEURE} € / heure)</option>
          <option value="pack2h">Optimisation Forfait 2h ({PRIX_PACK_2H} € les 2 heures)</option>
        </select>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label htmlFor="hours-slider" className="form-label" style={{ fontSize: 13, margin: 0 }}>Volume horaire d&apos;intervention :</label>
          <span style={{ color: 'var(--cyan-accent)', fontSize: 20, fontWeight: 800 }}>{heures.toFixed(1).replace('.', ',')} h</span>
        </div>
        <input id="hours-slider" type="range" min="1" max="10" step="0.5" value={heures} onChange={(e) => setHeures(parseFloat(e.target.value))} style={{ width: '100%', height: 8, accentColor: 'var(--cyan-accent)', cursor: 'pointer' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
          <span>1h (Ponctuel)</span><span>5h (Suivi)</span><span>10h (Accompagnement)</span>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 0 }} aria-live="polite">
        <div style={{ background: '#ffffff', padding: 18, borderRadius: 8, border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>Montant Total Brut</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy-bg)' }}>{eur(brut)}</div>
        </div>
        <div style={{ background: 'var(--blue-callout-bg)', padding: 18, borderRadius: 8, border: '2px solid var(--cyan-accent)', textAlign: 'center' }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--blue-callout-text)', fontWeight: 700, marginBottom: 4 }}>Coût Réel (Après Crédit d&apos;Impôt 50 %)</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--green-badge-text)' }}>{eur(net)}</div>
        </div>
      </div>
    </div>
  );
}
