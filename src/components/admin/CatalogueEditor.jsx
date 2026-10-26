'use client';
import { ICONES_CATALOGUE } from '../../lib/pricing';

const deplacer = (liste, i, delta) => {
  const k = i + delta;
  if (k < 0 || k >= liste.length) return liste;
  const copie = [...liste];
  [copie[i], copie[k]] = [copie[k], copie[i]];
  return copie;
};

// Catalogue des prestations : catégories (cartes de l'accueil) et prestations de chaque catégorie
export default function CatalogueEditor({ catalogue, onChange, defauts }) {
  const majCat = (i, champ, valeur) => onChange(catalogue.map((c, j) => (j === i ? { ...c, [champ]: valeur } : c)));
  const majItem = (i, k, champ, valeur) => onChange(catalogue.map((c, j) => (j === i ? { ...c, items: c.items.map((it, m) => (m === k ? { ...it, [champ]: valeur } : it)) } : c)));
  const setItems = (i, items) => majCat(i, 'items', items);

  return (
    <div>
      <div className="callout-box">
        <p>Le catalogue s&apos;affiche sur l&apos;accueil, sous forme de cartes. Chaque catégorie apparaît aussi comme choix dans le formulaire de rendez-vous. Sans aucune catégorie, la section disparaît de l&apos;accueil.</p>
      </div>

      {catalogue.map((c, i) => (
        <div key={i} className="card-item" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            <strong>Catégorie {i + 1}{c.titre ? ` — ${c.titre}` : ''}</strong>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button type="button" className="slot-btn" disabled={i === 0} onClick={() => onChange(deplacer(catalogue, i, -1))} aria-label="Monter cette catégorie">↑</button>
              <button type="button" className="slot-btn" disabled={i === catalogue.length - 1} onClick={() => onChange(deplacer(catalogue, i, 1))} aria-label="Descendre cette catégorie">↓</button>
              <button type="button" className="slot-btn" onClick={() => { if (window.confirm('Supprimer cette catégorie et toutes ses prestations ?')) onChange(catalogue.filter((_, j) => j !== i)); }}>🗑️ Supprimer la catégorie</button>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label className="form-label" htmlFor={`cat-titre-${i}`}>Titre de la catégorie</label>
              <input id={`cat-titre-${i}`} className="form-input" value={c.titre} onChange={(e) => majCat(i, 'titre', e.target.value)} maxLength={80} placeholder="Ex : Assistance administrative" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor={`cat-icone-${i}`}>Icône</label>
              <select id={`cat-icone-${i}`} className="form-select" value={c.icone} onChange={(e) => majCat(i, 'icone', e.target.value)}>
                {ICONES_CATALOGUE.map(([nom, label]) => <option key={nom} value={nom}>{label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor={`cat-intro-${i}`}>Introduction <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>(facultatif)</span></label>
            <input id={`cat-intro-${i}`} className="form-input" value={c.intro} onChange={(e) => majCat(i, 'intro', e.target.value)} maxLength={200} />
          </div>

          <p className="form-label" style={{ marginBottom: 8 }}>Prestations de cette catégorie</p>
          {c.items.length === 0 && <p className="field-help" style={{ marginBottom: 10 }}>Aucune prestation : la carte n&apos;affichera que son titre.</p>}
          {c.items.map((it, k) => (
            <div key={k} style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: 12, marginBottom: 10, background: 'var(--surface)' }}>
              <div className="grid-2" style={{ marginBottom: 0 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor={`it-i-${i}-${k}`}>Icône</label>
                  <select id={`it-i-${i}-${k}`} className="form-select" value={it.icone || 'check'} onChange={(e) => majItem(i, k, 'icone', e.target.value)}>
                    {ICONES_CATALOGUE.map(([nom, label]) => <option key={nom} value={nom}>{label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor={`it-t-${i}-${k}`}>Titre <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>(facultatif)</span></label>
                  <input id={`it-t-${i}-${k}`} className="form-input" value={it.titre} onChange={(e) => majItem(i, k, 'titre', e.target.value)} maxLength={80} placeholder="Ex : Démarches en ligne" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor={`it-x-${i}-${k}`}>Description</label>
                <textarea id={`it-x-${i}-${k}`} className="form-textarea" rows={2} value={it.texte} onChange={(e) => majItem(i, k, 'texte', e.target.value)} maxLength={300} />
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button type="button" className="slot-btn" disabled={k === 0} onClick={() => setItems(i, deplacer(c.items, k, -1))} aria-label="Monter cette prestation">↑</button>
                <button type="button" className="slot-btn" disabled={k === c.items.length - 1} onClick={() => setItems(i, deplacer(c.items, k, 1))} aria-label="Descendre cette prestation">↓</button>
                <button type="button" className="slot-btn" onClick={() => setItems(i, c.items.filter((_, m) => m !== k))}>🗑️ Supprimer</button>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" disabled={c.items.length >= 10} onClick={() => setItems(i, [...c.items, { titre: '', texte: '', icone: 'check' }])}>➕ Ajouter une prestation</button>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <button type="button" className="btn btn-ghost" disabled={catalogue.length >= 6} onClick={() => onChange([...catalogue, { titre: '', intro: '', icone: 'file', items: [{ titre: '', texte: '', icone: 'check' }] }])}>➕ Ajouter une catégorie</button>
        <button type="button" className="btn btn-ghost" onClick={() => { if (window.confirm('Revenir au catalogue d’origine ? Vos modifications non enregistrées seront perdues.')) onChange(defauts); }}>↩️ Catalogue d&apos;origine</button>
      </div>
    </div>
  );
}
