'use client';
import { useState } from 'react';
import ClientForm from './ClientForm';

const MS_MOIS = 30.44 * 24 * 3600 * 1000;

// Carnet de clients : lire, rechercher, ajouter, modifier, supprimer
export default function ClientsPanel({ clients, erreur, communes, retentionMois, occupe, onSave, onDelete, onTouch, onNouveauRdv }) {
  const [form, setForm] = useState(null); // null = fermé · {} = création · fiche = modification
  const [recherche, setRecherche] = useState('');
  const q = recherche.trim().toLowerCase();
  const affiches = clients.filter((c) => !q || [c.nom, c.telephone, c.email, c.adresse, c.commune, c.notes].some((x) => String(x ?? '').toLowerCase().includes(q)));

  return (
    <>
      {erreur && <div className="senior-help-bar" role="alert"><div className="senior-help-bar-text">⚠️ {erreur}</div></div>}
      <div className="callout-box"><p>Carnet privé : ces fiches ne sont jamais visibles sur le site. Une fiche sans mise à jour depuis {retentionMois} mois est supprimée automatiquement (bouton « Contact récent » pour la conserver).</p></div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 8 }}>
        <div className="form-group" style={{ minWidth: 200, flex: '1 1 240px' }}>
          <label className="form-label" htmlFor="recherche-c">Rechercher</label>
          <input id="recherche-c" type="search" className="form-input" value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Nom, téléphone, commune, note…" />
        </div>
        <div className="form-group">
          <button type="button" className="btn btn-cta" disabled={occupe || Boolean(erreur)} onClick={() => setForm({})}>➕ Nouveau client</button>
        </div>
      </div>
      {form && (
        <ClientForm key={form.id || 'nouveau'} initial={form} communes={communes} occupe={occupe}
          onSave={(payload) => onSave(payload, () => setForm(null))} onCancel={() => setForm(null)} />
      )}
      {!erreur && affiches.length === 0 && <p>Aucun client{q ? ' ne correspond à la recherche' : ' pour le moment'}.</p>}
      {affiches.map((c) => {
        const mois = Math.floor((Date.now() - new Date(c.updated_at || c.created_at).getTime()) / MS_MOIS);
        const restant = retentionMois - mois;
        return (
          <div key={c.id} className="card-item" style={{ padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <strong>{c.nom}</strong>
              <span style={{ fontSize: 13, color: restant <= 6 ? 'var(--amber-text)' : 'var(--text-muted)', fontWeight: restant <= 6 ? 800 : 600 }}>
                {restant <= 6 ? `⏳ Suppression automatique dans ${Math.max(restant, 0)} mois` : `Dernière mise à jour : ${new Date(c.updated_at || c.created_at).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}`}
              </span>
            </div>
            <p style={{ margin: '6px 0' }}>
              {c.telephone ? <a href={`tel:${String(c.telephone).replace(/[^\d+]/g, '')}`}>{c.telephone}</a> : null}
              {c.telephone && c.email ? ' — ' : null}
              {c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : null}
              {c.adresse || c.commune ? <><br />{[c.adresse, c.commune].filter(Boolean).join(', ')}</> : null}
              {c.notes ? <><br /><em style={{ whiteSpace: 'pre-wrap' }}>{c.notes}</em></> : null}
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="slot-btn" disabled={occupe} onClick={() => onNouveauRdv(c)}>📅 Nouveau rendez-vous</button>
              <button type="button" className="slot-btn" disabled={occupe} onClick={() => { setForm(c); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>✏️ Modifier</button>
              <button type="button" className="slot-btn" disabled={occupe} onClick={() => onTouch(c.id)}>🔄 Contact récent</button>
              <button type="button" className="slot-btn" disabled={occupe} onClick={() => onDelete(c.id)}>🗑️ Supprimer</button>
            </div>
          </div>
        );
      })}
    </>
  );
}
