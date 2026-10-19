'use client';

// Gestion de la FAQ de l'accueil : ajouter, modifier, supprimer, réordonner
export default function FaqEditor({ faq, onChange, defauts }) {
  const maj = (i, champ, valeur) => onChange(faq.map((x, j) => (j === i ? { ...x, [champ]: valeur } : x)));
  const deplacer = (i, delta) => {
    const k = i + delta;
    if (k < 0 || k >= faq.length) return;
    const copie = [...faq];
    [copie[i], copie[k]] = [copie[k], copie[i]];
    onChange(copie);
  };
  return (
    <div>
      <div className="callout-box">
        <p>Dans une réponse, écrivez <code>[texte du lien](/rendez-vous)</code> pour créer un lien. Valeurs automatiques : <code>{'{pct}'}</code> (crédit d&apos;impôt), <code>{'{reste}'}</code>, <code>{'{communes}'}</code>, <code>{'{telephone}'}</code>, <code>{'{email}'}</code>, <code>{'{annulation}'}</code>. Sans aucune question, la section disparaît de l&apos;accueil.</p>
      </div>
      {faq.length === 0 && <p style={{ marginBottom: 12 }}>Aucune question : la section FAQ est masquée sur l&apos;accueil.</p>}
      {faq.map((x, i) => (
        <div key={i} className="card-item" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            <strong>Question {i + 1}</strong>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button type="button" className="slot-btn" disabled={i === 0} onClick={() => deplacer(i, -1)} aria-label="Monter cette question">↑</button>
              <button type="button" className="slot-btn" disabled={i === faq.length - 1} onClick={() => deplacer(i, 1)} aria-label="Descendre cette question">↓</button>
              <button type="button" className="slot-btn" onClick={() => { if (window.confirm('Supprimer cette question ?')) onChange(faq.filter((_, j) => j !== i)); }}>🗑️ Supprimer</button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor={`q-${i}`}>Question</label>
            <input id={`q-${i}`} className="form-input" value={x.q} onChange={(e) => maj(i, 'q', e.target.value)} maxLength={200} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor={`r-${i}`}>Réponse</label>
            <textarea id={`r-${i}`} className="form-textarea" rows={4} value={x.r} onChange={(e) => maj(i, 'r', e.target.value)} maxLength={1500} />
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <button type="button" className="btn btn-ghost" disabled={faq.length >= 20} onClick={() => onChange([...faq, { q: '', r: '' }])}>➕ Ajouter une question</button>
        <button type="button" className="btn btn-ghost" onClick={() => { if (window.confirm('Revenir aux questions d’origine ? Vos modifications non enregistrées seront perdues.')) onChange(defauts); }}>↩️ Questions d&apos;origine</button>
      </div>
    </div>
  );
}
