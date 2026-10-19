'use client';
import { useState } from 'react';

const VIDE = { date_rdv: '', creneau: '', nom: '', telephone: '', email: '', commune: '', prestation: '', details: '', statut: 'confirme' };

// Formulaire de création / modification d'un rendez-vous (back-office)
export default function RdvForm({ initial, creneaux, communes, prestations, clients = [], occupe, onSave, onCancel }) {
  const edition = Boolean(initial?.id);
  const [f, setF] = useState(() => ({
    ...VIDE,
    commune: communes[0] || '',
    prestation: prestations[0]?.value || '',
    // valeurs fournies (modification, ou client choisi) ; sinon valeurs par défaut
    ...(initial ? Object.fromEntries(Object.keys(VIDE).filter((k) => initial[k] !== undefined && initial[k] !== null && initial[k] !== '').map((k) => [k, initial[k]])) : {}),
  }));
  const [prevenir, setPrevenir] = useState(!edition);
  const maj = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  function choisirClient(id) {
    const c = clients.find((x) => x.id === id);
    if (c) setF((x) => ({ ...x, nom: c.nom, telephone: c.telephone || '', email: c.email || '', commune: c.commune || x.commune }));
  }

  function envoyer(e) {
    e.preventDefault();
    onSave({ ...f, ...(edition ? { id: initial.id } : {}), prevenir });
  }

  return (
    <form className="panel" onSubmit={envoyer} aria-label={edition ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}>
      <h2 className="panel-title">{edition ? '✏️ Modifier le rendez-vous' : '➕ Nouveau rendez-vous'}</h2>

      {!edition && clients.length > 0 && (
        <div className="form-group" style={{ maxWidth: 420 }}>
          <label className="form-label" htmlFor="r-client">Client existant <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>(facultatif : remplit les champs)</span></label>
          <select id="r-client" className="form-select" defaultValue="" onChange={(e) => choisirClient(e.target.value)}>
            <option value="">— Nouveau client —</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.nom}{c.commune ? ` (${c.commune})` : ''}</option>)}
          </select>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: 0 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="r-date">Date</label>
          <input id="r-date" type="date" className="form-input" value={f.date_rdv} onChange={maj('date_rdv')} required />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="r-creneau">Créneau</label>
          <input id="r-creneau" className="form-input" list="r-creneaux" value={f.creneau} onChange={maj('creneau')} placeholder="Ex : 09h00 - 11h00" required minLength={3} maxLength={40} />
          <datalist id="r-creneaux">{creneaux.map((c) => <option key={c} value={c} />)}</datalist>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="r-nom">Nom et prénom</label>
          <input id="r-nom" className="form-input" value={f.nom} onChange={maj('nom')} required minLength={2} maxLength={100} autoComplete="off" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="r-tel">Téléphone</label>
          <input id="r-tel" type="tel" className="form-input" value={f.telephone} onChange={maj('telephone')} required autoComplete="off" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="r-mail">Adresse e-mail <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>(facultatif)</span></label>
          <input id="r-mail" type="email" className="form-input" value={f.email} onChange={maj('email')} maxLength={150} autoComplete="off" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="r-commune">Commune</label>
          <input id="r-commune" className="form-input" list="r-communes" value={f.commune} onChange={maj('commune')} required minLength={2} maxLength={60} />
          <datalist id="r-communes">{communes.map((c) => <option key={c} value={c} />)}</datalist>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="r-presta">Prestation</label>
          <input id="r-presta" className="form-input" list="r-prestas" value={f.prestation} onChange={maj('prestation')} required minLength={2} maxLength={120} />
          <datalist id="r-prestas">{prestations.map((p) => <option key={p.value} value={p.value} />)}</datalist>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="r-statut">Statut</label>
          <select id="r-statut" className="form-select" value={f.statut} onChange={maj('statut')}>
            <option value="confirme">Confirmé</option>
            <option value="en_attente">En attente</option>
            <option value="annule">Annulé</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="r-details">Précisions <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>(facultatif)</span></label>
        <textarea id="r-details" className="form-textarea" rows={3} value={f.details} onChange={maj('details')} maxLength={1000} />
      </div>

      <label className="check-row" style={{ marginBottom: 16 }}>
        <input type="checkbox" checked={prevenir} onChange={(e) => setPrevenir(e.target.checked)} />
        <span>{edition ? 'Envoyer au client un e-mail avec les informations mises à jour' : 'Envoyer au client un e-mail de confirmation'} (si une adresse est renseignée et le statut « Confirmé »).</span>
      </label>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="submit" className="btn btn-cta" disabled={occupe}>{occupe ? 'Enregistrement…' : edition ? 'Enregistrer les modifications' : 'Créer le rendez-vous'}</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={occupe}>Annuler</button>
      </div>
    </form>
  );
}
