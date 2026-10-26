'use client';
import { useState } from 'react';
import { eur, nombre } from '../../lib/pricing';
import { aujourdhuiParis, calculerTotal, totalLigne } from '../../lib/facturesAdmin';

const num = (v) => Number(String(v ?? '').replace(',', '.'));
const LIGNE_VIDE = (pu) => ({ designation: '', quantite: '1', prix_unitaire: String(pu) });

// Formulaire de création d'une facture (lignes libres ou formules du site)
export default function FactureForm({ initial, clients, formules, tarifHoraire, occupe, onSave, onCancel }) {
  const aujourdhui = aujourdhuiParis();
  const [f, setF] = useState({
    client_id: initial?.client_id || '', client_nom: initial?.client_nom || '', client_adresse: initial?.client_adresse || '',
    date_facture: aujourdhui, date_prestation: initial?.date_prestation || aujourdhui, notes: initial?.notes || '', rdv_id: initial?.rdv_id || '',
  });
  const [lignes, setLignes] = useState(() => (initial?.lignes?.length ? initial.lignes.map((l) => ({ ...l })) : [LIGNE_VIDE(tarifHoraire)]));
  const maj = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const majLigne = (i, k, v) => setLignes((ls) => ls.map((l, j) => (j === i ? { ...l, [k]: v } : l)));

  function choisirClient(id) {
    const c = clients.find((x) => x.id === id);
    setF((x) => ({ ...x, client_id: id, ...(c ? { client_nom: c.nom, client_adresse: [c.adresse, c.commune].filter(Boolean).join(', ') } : {}) }));
  }
  function ajouterFormule(nom) {
    const fo = formules.find((x) => x.nom === nom);
    if (fo) setLignes((ls) => [...ls, { designation: fo.nom, quantite: '1', prix_unitaire: String(fo.prix) }]);
  }

  const valides = lignes.every((l) => Number.isFinite(num(l.quantite)) && Number.isFinite(num(l.prix_unitaire)));
  const total = valides ? calculerTotal(lignes.map((l) => ({ quantite: num(l.quantite), prix_unitaire: num(l.prix_unitaire) }))) : null;

  return (
    <form className="panel" onSubmit={(e) => { e.preventDefault(); onSave({ ...f, lignes }); }} aria-label="Nouvelle facture">
      <h2 className="panel-title">🧾 Nouvelle facture</h2>

      {clients.length > 0 && (
        <div className="form-group" style={{ maxWidth: 420 }}>
          <label className="form-label" htmlFor="f-client">Client du carnet <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>(facultatif : remplit le nom et l&apos;adresse)</span></label>
          <select id="f-client" className="form-select" value={f.client_id} onChange={(e) => choisirClient(e.target.value)}>
            <option value="">— Autre client —</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.nom}{c.commune ? ` (${c.commune})` : ''}</option>)}
          </select>
        </div>
      )}
      <div className="grid-2" style={{ marginBottom: 0 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="f-nom">Nom du client</label>
          <input id="f-nom" className="form-input" value={f.client_nom} onChange={maj('client_nom')} required minLength={2} maxLength={100} autoComplete="off" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="f-adresse">Adresse du client <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>(nécessaire pour l&apos;attestation fiscale)</span></label>
          <input id="f-adresse" className="form-input" value={f.client_adresse} onChange={maj('client_adresse')} maxLength={250} autoComplete="off" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="f-date">Date d&apos;émission</label>
          <input id="f-date" type="date" className="form-input" value={f.date_facture} max={aujourdhui} onChange={maj('date_facture')} required />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="f-presta">Date de la prestation</label>
          <input id="f-presta" type="date" className="form-input" value={f.date_prestation} max={f.date_facture} onChange={maj('date_prestation')} required />
        </div>
      </div>

      <p className="form-label" style={{ marginBottom: 8 }}>Lignes de la facture</p>
      {lignes.map((l, i) => (
        <div key={i} style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: 12, marginBottom: 10, background: 'var(--surface)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor={`l-d-${i}`}>Désignation</label>
            <input id={`l-d-${i}`} className="form-input" value={l.designation} onChange={(e) => majLigne(i, 'designation', e.target.value)} maxLength={120} placeholder="Ex : Assistance informatique — installation d'une imprimante (heures)" required />
          </div>
          <div className="grid-3" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label className="form-label" htmlFor={`l-q-${i}`}>Quantité</label>
              <input id={`l-q-${i}`} className="form-input" inputMode="decimal" value={l.quantite} onChange={(e) => majLigne(i, 'quantite', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor={`l-p-${i}`}>Prix unitaire (€)</label>
              <input id={`l-p-${i}`} className="form-input" inputMode="decimal" value={l.prix_unitaire} onChange={(e) => majLigne(i, 'prix_unitaire', e.target.value)} required />
            </div>
            <div className="form-group">
              <span className="form-label">Montant</span>
              <strong style={{ minHeight: 52, display: 'flex', alignItems: 'center' }}>{valides ? eur(totalLigne({ quantite: num(l.quantite), prix_unitaire: num(l.prix_unitaire) })) : '—'}</strong>
            </div>
          </div>
          <button type="button" className="slot-btn" disabled={lignes.length <= 1} onClick={() => setLignes((ls) => ls.filter((_, j) => j !== i))}>🗑️ Retirer cette ligne</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
        <button type="button" className="btn btn-ghost btn-sm" disabled={lignes.length >= 8} onClick={() => setLignes((ls) => [...ls, LIGNE_VIDE(tarifHoraire)])}>➕ Ajouter une ligne</button>
        <select className="form-select" style={{ maxWidth: 320 }} aria-label="Ajouter une formule du site" value="" onChange={(e) => ajouterFormule(e.target.value)} disabled={lignes.length >= 8}>
          <option value="">➕ Ajouter une formule du site…</option>
          {formules.map((fo) => <option key={fo.nom} value={fo.nom}>{fo.nom} — {nombre(fo.prix)} €</option>)}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="f-notes">Note sur la facture <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>(facultatif, imprimée en bas)</span></label>
        <textarea id="f-notes" className="form-textarea" rows={2} value={f.notes} onChange={maj('notes')} maxLength={500} />
      </div>

      <p style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 14 }}>Total : {total !== null ? eur(total) : '—'}</p>
      <p className="field-help" style={{ marginBottom: 14 }}>Une fois créée, une facture ne peut plus être modifiée ni supprimée (seulement annulée) : le numéro est définitif et la numérotation reste continue.</p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="submit" className="btn btn-cta" disabled={occupe}>{occupe ? 'Création…' : 'Créer la facture'}</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={occupe}>Annuler</button>
      </div>
    </form>
  );
}
