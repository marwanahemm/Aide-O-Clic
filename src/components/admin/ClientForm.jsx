'use client';
import { useState } from 'react';

// Formulaire de création / modification d'une fiche client
export default function ClientForm({ initial, communes, occupe, onSave, onCancel }) {
  const edition = Boolean(initial?.id);
  const [f, setF] = useState({
    nom: initial?.nom ?? '', telephone: initial?.telephone ?? '', email: initial?.email ?? '',
    adresse: initial?.adresse ?? '', commune: initial?.commune ?? '', notes: initial?.notes ?? '',
  });
  const maj = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  return (
    <form className="panel" onSubmit={(e) => { e.preventDefault(); onSave({ ...f, ...(edition ? { id: initial.id } : {}) }); }} aria-label={edition ? 'Modifier la fiche client' : 'Nouveau client'}>
      <h2 className="panel-title">{edition ? '✏️ Modifier la fiche client' : '➕ Nouveau client'}</h2>
      <div className="grid-2" style={{ marginBottom: 0 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="c-nom">Nom et prénom</label>
          <input id="c-nom" className="form-input" value={f.nom} onChange={maj('nom')} required minLength={2} maxLength={100} autoComplete="off" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="c-tel">Téléphone</label>
          <input id="c-tel" type="tel" className="form-input" value={f.telephone} onChange={maj('telephone')} autoComplete="off" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="c-mail">Adresse e-mail</label>
          <input id="c-mail" type="email" className="form-input" value={f.email} onChange={maj('email')} maxLength={150} autoComplete="off" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="c-commune">Commune</label>
          <input id="c-commune" className="form-input" list="c-communes" value={f.commune} onChange={maj('commune')} maxLength={60} />
          <datalist id="c-communes">{communes.map((c) => <option key={c} value={c} />)}</datalist>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="c-adresse">Adresse</label>
        <input id="c-adresse" className="form-input" value={f.adresse} onChange={maj('adresse')} maxLength={200} autoComplete="off" />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="c-notes">Notes de suivi</label>
        <textarea id="c-notes" className="form-textarea" rows={3} value={f.notes} onChange={maj('notes')} maxLength={1000} />
        <p className="field-help">Téléphone ou e-mail : au moins un des deux. N&apos;écrivez ni information de santé, ni donnée sensible dans les notes.</p>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="submit" className="btn btn-cta" disabled={occupe}>{occupe ? 'Enregistrement…' : edition ? 'Enregistrer les modifications' : 'Ajouter le client'}</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={occupe}>Annuler</button>
      </div>
    </form>
  );
}
