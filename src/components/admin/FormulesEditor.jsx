'use client';
import { eur } from '../../lib/pricing';

const num = (v) => Number(String(v).replace(',', '.'));
const VIDE = { nom: '', description: '', heures: '', prix: '', badge: '', points: [] };

// Gestion des formules / forfaits : ajouter, modifier, supprimer, réordonner
export default function FormulesEditor({ formules, onChange, creditImpotPct, defauts }) {
  const maj = (i, champ, valeur) => onChange(formules.map((f, j) => (j === i ? { ...f, [champ]: valeur } : f)));
  const deplacer = (i, delta) => {
    const k = i + delta;
    if (k < 0 || k >= formules.length) return;
    const copie = [...formules];
    [copie[i], copie[k]] = [copie[k], copie[i]];
    onChange(copie);
  };
  const reste = 1 - num(creditImpotPct) / 100;

  return (
    <div>
      {formules.map((f, i) => {
        const net = num(f.prix) * reste;
        return (
          <div key={i} className="card-item" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              <strong>Formule {i + 1}{f.nom ? ` — ${f.nom}` : ''}</strong>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button type="button" className="slot-btn" disabled={i === 0} onClick={() => deplacer(i, -1)} aria-label="Monter cette formule">↑</button>
                <button type="button" className="slot-btn" disabled={i === formules.length - 1} onClick={() => deplacer(i, 1)} aria-label="Descendre cette formule">↓</button>
                <button type="button" className="slot-btn" disabled={formules.length <= 1} onClick={() => { if (window.confirm('Supprimer cette formule ?')) onChange(formules.filter((_, j) => j !== i)); }}>🗑️ Supprimer</button>
              </div>
            </div>
            <div className="grid-3" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label" htmlFor={`f-nom-${i}`}>Nom de la formule</label>
                <input id={`f-nom-${i}`} className="form-input" value={f.nom} onChange={(e) => maj(i, 'nom', e.target.value)} placeholder="Ex : Forfait 3 heures" maxLength={80} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor={`f-heures-${i}`}>Durée (heures)</label>
                <input id={`f-heures-${i}`} className="form-input" inputMode="decimal" value={f.heures} onChange={(e) => maj(i, 'heures', e.target.value)} placeholder="Ex : 3" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor={`f-prix-${i}`}>Prix brut (€)</label>
                <input id={`f-prix-${i}`} className="form-input" inputMode="decimal" value={f.prix} onChange={(e) => maj(i, 'prix', e.target.value)} placeholder="Ex : 45" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor={`f-desc-${i}`}>Description courte <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>(facultatif)</span></label>
              <input id={`f-desc-${i}`} className="form-input" value={f.description} onChange={(e) => maj(i, 'description', e.target.value)} maxLength={200} />
            </div>
            <div className="grid-2" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label" htmlFor={`f-badge-${i}`}>Étiquette de mise en avant <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>(facultatif)</span></label>
                <input id={`f-badge-${i}`} className="form-input" value={f.badge} onChange={(e) => maj(i, 'badge', e.target.value)} placeholder="Ex : Le plus choisi" maxLength={40} />
                <p className="field-help">Si renseignée, la formule est mise en valeur sur l&apos;accueil.</p>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor={`f-points-${i}`}>Points forts <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>(un par ligne)</span></label>
                <textarea id={`f-points-${i}`} className="form-textarea" rows={4} value={f.points.join('\n')} onChange={(e) => maj(i, 'points', e.target.value.split('\n'))} />
              </div>
            </div>
            <p style={{ fontSize: 14 }}>
              Aperçu : <strong>{Number.isFinite(num(f.prix)) && f.prix !== '' ? eur(num(f.prix)) : '—'}</strong> brut,
              {' '}<strong>{Number.isFinite(net) && f.prix !== '' ? eur(net) : '—'}</strong> après crédit d&apos;impôt.
            </p>
          </div>
        );
      })}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <button type="button" className="btn btn-ghost" disabled={formules.length >= 6} onClick={() => onChange([...formules, { ...VIDE }])}>➕ Ajouter une formule</button>
        <button type="button" className="btn btn-ghost" onClick={() => { if (window.confirm('Revenir aux formules d’origine ? Vos modifications non enregistrées seront perdues.')) onChange(defauts); }}>↩️ Formules d&apos;origine</button>
      </div>
      <p className="field-help" style={{ marginBottom: 16 }}>
        Jusqu&apos;à 6 formules. Elles apparaissent sur l&apos;accueil, dans le simulateur et dans le formulaire de rendez-vous. Le tarif horaire de référence (utilisé par le simulateur pour les heures hors forfait) est celui de la formule la plus courte.
      </p>
    </div>
  );
}
