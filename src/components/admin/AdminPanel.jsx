'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { eur } from '../../lib/pricing';

async function appel(url, methode, corps) {
  const res = await fetch(url, { method: methode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corps) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.erreur || 'Une erreur est survenue.');
  return data;
}

// Message affiché après un changement de statut (selon l'e-mail de confirmation envoyé ou non au client)
function messageStatut(r) {
  if (r.email === 'envoye') return { type: 'ok', texte: 'Rendez-vous confirmé. E-mail de confirmation envoyé au client.' };
  if (r.email === 'non_envoye') return { type: 'erreur', texte: `Rendez-vous confirmé, mais l'e-mail n'a pas pu être envoyé : ${r.detail || 'erreur inconnue'}. Pensez à appeler le client.` };
  if (r.email === 'sans_adresse') return { type: 'ok', texte: "Rendez-vous confirmé. Le client n'a pas laissé d'adresse e-mail : pensez à l'appeler." };
  return null;
}

const num = (v) => Number(String(v).replace(',', '.'));
const dateLongue = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('fr-FR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
});
const STATUTS = {
  en_attente: { texte: 'En attente', fond: '#fef3c7', couleur: '#92400e' },
  confirme: { texte: 'Confirmé', fond: '#dcfce7', couleur: '#14532d' },
  annule: { texte: 'Annulé', fond: '#e2e8f0', couleur: '#475569' },
};
const LABELS_EDITEUR = {
  nom: 'Nom et prénom', statut: 'Statut juridique', siret: 'N° SIRET', sap: 'N° de déclaration Services à la Personne',
  adresse: 'Adresse professionnelle', directeurPublication: 'Directeur de la publication',
  tva: 'Mention de TVA sur les prix', mediateur: 'Médiateur de la consommation (nom, adresse, site)',
};

function Champ({ id, label, children }) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

function ListeEditable({ titre, valeurs, onChange, max, exemple }) {
  const maj = (i, v) => onChange(valeurs.map((x, j) => (j === i ? v : x)));
  return (
    <div className="card-item" style={{ padding: 20, marginBottom: 20 }}>
      <div className="card-item-header">{titre}</div>
      {valeurs.map((v, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input className="form-input" value={v} onChange={(e) => maj(i, e.target.value)} aria-label={`${titre} ${i + 1}`} />
          <button type="button" className="slot-btn" disabled={valeurs.length <= 1} onClick={() => onChange(valeurs.filter((_, j) => j !== i))}>Retirer</button>
        </div>
      ))}
      <button type="button" className="slot-btn" disabled={valeurs.length >= max} onClick={() => onChange([...valeurs, ''])}>+ Ajouter ({exemple})</button>
    </div>
  );
}

export default function AdminPanel({ config, rendezVous, messages, erreurDonnees, demo }) {
  const router = useRouter();
  const [onglet, setOnglet] = useState('rdv');
  const [cfg, setCfg] = useState(config);
  const [etat, setEtat] = useState({ type: '', texte: '' });
  const [filtre, setFiltre] = useState('tous');
  const [occupe, setOccupe] = useState(false);

  const maj = (champ) => (e) => setCfg((c) => ({ ...c, [champ]: e.target.value }));
  const majEditeur = (champ) => (e) => setCfg((c) => ({ ...c, editeur: { ...c.editeur, [champ]: e.target.value } }));

  async function agir(fn, succes) {
    setOccupe(true);
    setEtat({ type: '', texte: '' });
    try {
      const r = await fn();
      const msg = typeof succes === 'function' ? succes(r) : succes ? { type: 'ok', texte: succes } : null;
      if (msg) setEtat(msg);
      router.refresh();
    } catch (e) {
      setEtat({ type: 'erreur', texte: e.message });
    }
    setOccupe(false);
  }

  const enregistrer = () => agir(async () => {
    const r = await appel('/api/admin/config', 'PUT', cfg);
    setCfg((c) => ({ ...c, ...r.config }));
  }, 'Enregistré. Le site public est à jour.');

  const changerStatut = (id, statut, renvoyer = false) => agir(() => appel('/api/admin/rdv', 'PATCH', { id, statut, renvoyer }), messageStatut);
  const supprimerRdv = (id) => { if (window.confirm('Supprimer définitivement ce rendez-vous ?')) agir(() => appel('/api/admin/rdv', 'DELETE', { id })); };
  const basculerLu = (id, lu) => agir(() => appel('/api/admin/messages', 'PATCH', { id, lu }));
  const supprimerMsg = (id) => { if (window.confirm('Supprimer définitivement ce message ?')) agir(() => appel('/api/admin/messages', 'DELETE', { id })); };
  const deconnecter = async () => { await fetch('/api/admin/logout', { method: 'POST' }); router.refresh(); };

  const nonLus = messages.filter((m) => !m.lu).length;
  const enAttente = rendezVous.filter((r) => r.statut === 'en_attente').length;
  const onglets = [
    ['rdv', `Rendez-vous${enAttente ? ` (${enAttente})` : ''}`],
    ['messages', `Messages${nonLus ? ` (${nonLus})` : ''}`],
    ['tarifs', 'Tarifs'],
    ['lieux', 'Créneaux & communes'],
    ['coordonnees', 'Coordonnées & mentions légales'],
  ];

  const ph = num(cfg.prixHeure);
  const pp = num(cfg.prixPack2h);
  const reste = 1 - num(cfg.creditImpotPct) / 100;
  const apercu = (n) => (Number.isFinite(n) ? eur(n) : '—');

  const rdvAffiches = rendezVous.filter((r) => filtre === 'tous' || r.statut === filtre);

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <h1 style={{ fontSize: 22 }}>🛠️ Administration — Aide O&apos;Clic</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="/" className="slot-btn" style={{ textDecoration: 'none' }}>Voir le site</a>
          <button type="button" className="slot-btn" onClick={deconnecter}>Se déconnecter</button>
        </div>
      </div>

      {demo && (
        <div className="senior-help-bar" role="note"><div className="senior-help-bar-text">
          🚧 Le site est en <strong>mode démo</strong> : les demandes de rendez-vous et les messages ne sont pas enregistrés tant que MODE_DEMO n&apos;est pas défini sur « false ». Vos réglages (tarifs, communes…) s&apos;appliquent déjà.
        </div></div>
      )}
      {erreurDonnees && <div className="senior-help-bar" role="alert"><div className="senior-help-bar-text">⚠️ {erreurDonnees}</div></div>}

      <div className="time-slots" style={{ marginBottom: 16 }} role="tablist">
        {onglets.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={onglet === id} className={'slot-btn' + (onglet === id ? ' selected' : '')}
            onClick={() => { setOnglet(id); setEtat({ type: '', texte: '' }); }}>{label}</button>
        ))}
      </div>

      {etat.type === 'ok' && <div className="callout-box" role="status"><p>✅ {etat.texte}</p></div>}
      {etat.type === 'erreur' && <div className="senior-help-bar" role="alert"><div className="senior-help-bar-text">⚠️ {etat.texte}</div></div>}

      {onglet === 'rdv' && (
        <>
          <div className="form-group" style={{ maxWidth: 260 }}>
            <label className="form-label" htmlFor="filtre">Afficher</label>
            <select id="filtre" className="form-select" value={filtre} onChange={(e) => setFiltre(e.target.value)}>
              <option value="tous">Tous les rendez-vous</option>
              <option value="en_attente">En attente</option>
              <option value="confirme">Confirmés</option>
              <option value="annule">Annulés</option>
            </select>
          </div>
          {rdvAffiches.length === 0 && <p>Aucun rendez-vous.</p>}
          {rdvAffiches.map((r) => {
            const s = STATUTS[r.statut] || STATUTS.en_attente;
            return (
              <div key={r.id} className="card-item" style={{ padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <strong>{dateLongue(r.date_rdv)} — {r.creneau}</strong>
                  <span style={{ background: s.fond, color: s.couleur, padding: '2px 10px', borderRadius: 12, fontWeight: 700, fontSize: 13 }}>{s.texte}</span>
                </div>
                <p style={{ margin: '6px 0' }}>
                  {r.nom} — <a href={`tel:${String(r.telephone).replace(/[^\d+]/g, '')}`}>{r.telephone}</a>{r.email ? <> — <a href={`mailto:${r.email}`}>{r.email}</a></> : null} — {r.commune}<br />
                  {r.prestation}{r.details ? <><br /><em>{r.details}</em></> : null}
                  {r.conditions_acceptees_le ? <><br /><small>✔ Conditions d&apos;annulation et de rétractation acceptées le {new Date(r.conditions_acceptees_le).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</small></> : null}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {r.statut !== 'confirme' && <button type="button" className="slot-btn" disabled={occupe} onClick={() => changerStatut(r.id, 'confirme')}>✅ Confirmer{r.email ? ' et prévenir le client' : ''}</button>}
                  {r.statut === 'confirme' && r.email && <button type="button" className="slot-btn" disabled={occupe} onClick={() => changerStatut(r.id, 'confirme', true)}>✉️ Renvoyer l&apos;e-mail de confirmation</button>}
                  {r.statut !== 'annule' && <button type="button" className="slot-btn" disabled={occupe} onClick={() => changerStatut(r.id, 'annule')}>❌ Annuler (libère le créneau)</button>}
                  {r.statut !== 'en_attente' && <button type="button" className="slot-btn" disabled={occupe} onClick={() => changerStatut(r.id, 'en_attente')}>↩️ Remettre en attente</button>}
                  <button type="button" className="slot-btn" disabled={occupe} onClick={() => supprimerRdv(r.id)}>🗑️ Supprimer</button>
                </div>
              </div>
            );
          })}
        </>
      )}

      {onglet === 'messages' && (
        <>
          {messages.length === 0 && <p>Aucun message.</p>}
          {messages.map((m) => (
            <div key={m.id} className="card-item" style={{ padding: 16, marginBottom: 12, borderLeft: m.lu ? undefined : '4px solid var(--cyan-accent)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <strong>{m.nom} — {m.contact}</strong>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(m.created_at).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</span>
              </div>
              <p style={{ margin: '8px 0', whiteSpace: 'pre-wrap' }}>{m.message}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" className="slot-btn" disabled={occupe} onClick={() => basculerLu(m.id, !m.lu)}>{m.lu ? 'Marquer comme non lu' : 'Marquer comme lu'}</button>
                <button type="button" className="slot-btn" disabled={occupe} onClick={() => supprimerMsg(m.id)}>🗑️ Supprimer</button>
              </div>
            </div>
          ))}
        </>
      )}

      {onglet === 'tarifs' && (
        <div className="card-item" style={{ padding: 20 }}>
          <div className="card-item-header">💶 Tarifs, crédit d&apos;impôt et annulation</div>
          <div className="grid-3">
            <Champ id="ph" label="Prix de l'heure (€)"><input id="ph" className="form-input" inputMode="decimal" value={cfg.prixHeure} onChange={maj('prixHeure')} /></Champ>
            <Champ id="pp" label="Prix du pack 2 heures (€)"><input id="pp" className="form-input" inputMode="decimal" value={cfg.prixPack2h} onChange={maj('prixPack2h')} /></Champ>
            <Champ id="ci" label="Crédit d'impôt (%)"><input id="ci" className="form-input" inputMode="decimal" value={cfg.creditImpotPct} onChange={maj('creditImpotPct')} /></Champ>
          </div>
          <div style={{ maxWidth: 420 }}>
            <Champ id="ah" label="Annulation sans frais jusqu'à (heures avant le rendez-vous)"><input id="ah" className="form-input" inputMode="numeric" value={cfg.annulationHeures} onChange={maj('annulationHeures')} /></Champ>
            <p style={{ fontSize: 13, marginTop: -8 }}>Affiché sur la page « Annulation et remboursement ». Mettre 0 pour permettre l&apos;annulation sans frais à tout moment.</p>
          </div>
          <p style={{ margin: '8px 0 16px', fontSize: 14 }}>
            Aperçu sur le site : forfait 1h = <strong>{apercu(ph)}</strong> brut, <strong>{apercu(ph * reste)}</strong> après crédit d&apos;impôt ·
            forfait 2h = <strong>{apercu(pp)}</strong> brut, <strong>{apercu(pp * reste)}</strong> après crédit d&apos;impôt.
          </p>
          <button type="button" className="btn-primary" disabled={occupe} onClick={enregistrer}>{occupe ? 'Enregistrement…' : 'Enregistrer les tarifs'}</button>
        </div>
      )}

      {onglet === 'lieux' && (
        <>
          <ListeEditable titre="Créneaux horaires" valeurs={cfg.creneaux} max={12} exemple="ex : 09h00 - 11h00"
            onChange={(creneaux) => setCfg((c) => ({ ...c, creneaux }))} />
          <ListeEditable titre="Communes desservies" valeurs={cfg.communes} max={40} exemple="ex : Layrac"
            onChange={(communes) => setCfg((c) => ({ ...c, communes }))} />
          <p style={{ marginBottom: 12, fontSize: 14 }}>Les rendez-vous déjà pris gardent leur créneau d&apos;origine, même si vous le modifiez ici.</p>
          <button type="button" className="btn-primary" disabled={occupe} onClick={enregistrer}>{occupe ? 'Enregistrement…' : 'Enregistrer les créneaux et communes'}</button>
        </>
      )}

      {onglet === 'coordonnees' && (
        <>
          <div className="card-item" style={{ padding: 20, marginBottom: 20 }}>
            <div className="card-item-header">📞 Coordonnées affichées sur le site</div>
            <div className="grid-2">
              <Champ id="tel" label="Téléphone"><input id="tel" className="form-input" value={cfg.telephone} onChange={maj('telephone')} /></Champ>
              <Champ id="mail" label="Adresse e-mail"><input id="mail" className="form-input" type="email" value={cfg.email} onChange={maj('email')} /></Champ>
            </div>
            <Champ id="hor" label="Horaires"><input id="hor" className="form-input" value={cfg.horaires} onChange={maj('horaires')} /></Champ>
          </div>
          <div className="card-item" style={{ padding: 20, marginBottom: 20 }}>
            <div className="card-item-header">⚖️ Mentions légales (éditeur du site)</div>
            <div className="grid-2">
              {Object.entries(LABELS_EDITEUR).map(([k, label]) => (
                <Champ key={k} id={`ed-${k}`} label={label}><input id={`ed-${k}`} className="form-input" value={cfg.editeur[k] ?? ''} onChange={majEditeur(k)} /></Champ>
              ))}
              <Champ id="dmaj" label="Date de dernière mise à jour"><input id="dmaj" className="form-input" value={cfg.dateMajLegal} onChange={maj('dateMajLegal')} /></Champ>
            </div>
          </div>
          <button type="button" className="btn-primary" disabled={occupe} onClick={enregistrer}>{occupe ? 'Enregistrement…' : 'Enregistrer'}</button>
        </>
      )}
    </div>
  );
}
