'use client';
import { useState } from 'react';

// Formulaire de création / modification d'un message (back-office)
export default function MessageForm({ initial, occupe, onSave, onCancel }) {
  const edition = Boolean(initial?.id);
  const [f, setF] = useState({ nom: initial?.nom ?? '', contact: initial?.contact ?? '', message: initial?.message ?? '' });
  const maj = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  return (
    <form className="panel" onSubmit={(e) => { e.preventDefault(); onSave({ ...f, ...(edition ? { id: initial.id } : {}) }); }} aria-label={edition ? 'Modifier le message' : 'Nouveau message'}>
      <h2 className="panel-title">{edition ? '✏️ Modifier le message' : '➕ Nouveau message'}</h2>
      <div className="grid-2" style={{ marginBottom: 0 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="m-nom">Nom</label>
          <input id="m-nom" className="form-input" value={f.nom} onChange={maj('nom')} required minLength={2} maxLength={100} autoComplete="off" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="m-contact">Téléphone ou e-mail</label>
          <input id="m-contact" className="form-input" value={f.contact} onChange={maj('contact')} required minLength={5} maxLength={150} autoComplete="off" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="m-message">Message</label>
        <textarea id="m-message" className="form-textarea" rows={4} value={f.message} onChange={maj('message')} required minLength={5} maxLength={2000} />
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="submit" className="btn btn-cta" disabled={occupe}>{occupe ? 'Enregistrement…' : edition ? 'Enregistrer les modifications' : 'Ajouter le message'}</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={occupe}>Annuler</button>
      </div>
    </form>
  );
}
