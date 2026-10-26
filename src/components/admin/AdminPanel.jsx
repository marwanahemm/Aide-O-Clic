'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { eur, nombre, construirePrestations } from '../../lib/pricing';
import RdvForm from './RdvForm';
import MessageForm from './MessageForm';
import ClientsPanel from './ClientsPanel';
import FormulesEditor from './FormulesEditor';
import FaqEditor from './FaqEditor';
import CatalogueEditor from './CatalogueEditor';
import FacturesPanel from './FacturesPanel';
import { aujourdhuiParis } from '../../lib/facturesAdmin';

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

// Message après création / modification d'un rendez-vous (selon l'e-mail envoyé ou non au client)
function messageCrud(r, base) {
  if (r.email === 'envoye') return { type: 'ok', texte: `${base} E-mail envoyé au client.` };
  if (r.email === 'non_envoye') return { type: 'erreur', texte: `${base} Mais l'e-mail n'a pas pu être envoyé : ${r.detail || 'erreur inconnue'}.` };
  if (r.email === 'sans_adresse') return { type: 'ok', texte: `${base} Aucune adresse e-mail renseignée : le client n'a pas été prévenu.` };
  return { type: 'ok', texte: base };
}

const num = (v) => Number(String(v).replace(',', '.'));
const dateLongue = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('fr-FR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
});
const STATUTS = {
  en_attente: { texte: 'En attente', fond: 'var(--amber-bg)', couleur: 'var(--amber-text)' },
  confirme: { texte: 'Confirmé', fond: 'var(--green-badge-bg)', couleur: 'var(--green-badge-text)' },
  annule: { texte: 'Annulé', fond: 'var(--line)', couleur: 'var(--text-muted)' },
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

export default function AdminPanel({ config, rendezVous, messages, clients = [], erreurClients = '', factures = [], erreurFactures = '', defauts, retentionClientMois = 36, erreurDonnees, demo }) {
  const router = useRouter();
  const [onglet, setOnglet] = useState('rdv');
  const [cfg, setCfg] = useState(config);
  const [etat, setEtat] = useState({ type: '', texte: '' });
  const [filtre, setFiltre] = useState('tous');
  const [occupe, setOccupe] = useState(false);
  const [formRdv, setFormRdv] = useState(null); // null = fermé · {} = création · rendez-vous = modification
  const [formMsg, setFormMsg] = useState(null);
  const [formFacture, setFormFacture] = useState(null); // null = fermé · {} = nouvelle facture · objet = préremplie
  const [rechercheRdv, setRechercheRdv] = useState('');
  const [rechercheMsg, setRechercheMsg] = useState('');
  const prestations = construirePrestations(config);

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
  const enregistrerRdv = (payload) => agir(
    () => appel('/api/admin/rdv', payload.id ? 'PUT' : 'POST', payload),
    (r) => { setFormRdv(null); return messageCrud(r, payload.id ? 'Rendez-vous modifié.' : 'Rendez-vous créé.'); },
  );
  const enregistrerMsg = (payload) => agir(
    () => appel('/api/admin/messages', payload.id ? 'PUT' : 'POST', payload),
    () => { setFormMsg(null); return { type: 'ok', texte: payload.id ? 'Message modifié.' : 'Message ajouté.' }; },
  );
  const enregistrerClient = (payload, fermer) => agir(
    () => appel('/api/admin/clients', payload.id ? 'PUT' : 'POST', payload),
    () => { fermer(); return { type: 'ok', texte: payload.id ? 'Fiche client modifiée.' : 'Client ajouté.' }; },
  );
  const supprimerClient = (id) => { if (window.confirm('Supprimer définitivement cette fiche client ?')) agir(() => appel('/api/admin/clients', 'DELETE', { id }), 'Fiche client supprimée.'); };
  const toucherClient = (id) => agir(() => appel('/api/admin/clients', 'PATCH', { id }), 'Fiche conservée : le délai de suppression automatique repart de zéro.');
  const nouveauRdvPour = (c) => {
    setFormRdv({ nom: c.nom, telephone: c.telephone, email: c.email, commune: c.commune });
    setOnglet('rdv');
    setEtat({ type: '', texte: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // ----- Factures -----
  const creerFacture = (payload, fermer) => agir(
    () => appel('/api/admin/factures', 'POST', payload),
    (r) => { fermer(); return { type: 'ok', texte: `Facture ${r.numero} créée.` }; },
  );
  const actionFacture = (id, action, extra, fermer) => agir(
    () => appel('/api/admin/factures', 'PATCH', { id, action, ...extra }),
    () => { if (fermer) fermer(); return { type: 'ok', texte: action === 'payer' ? 'Règlement enregistré.' : action === 'annuler' ? 'Facture annulée.' : 'Facture rouverte.' }; },
  );
  const modifierFacture = (payload, fermer) => agir(
    () => appel('/api/admin/factures', 'PUT', payload),
    () => { fermer(); return { type: 'ok', texte: 'Coordonnées de la facture corrigées.' }; },
  );
  // « 🧾 Facturer » depuis un rendez-vous : client retrouvé dans le carnet, formule reconnue ou prestation facturée à l'heure
  const facturerRdv = (r) => {
    const norm = (v) => String(v || '').toLowerCase().replace(/\s+/g, ' ').trim();
    const chiffres = (v) => String(v || '').replace(/\D/g, '');
    const c = clients.find((x) => (r.email && x.email && norm(x.email) === norm(r.email)) || (chiffres(r.telephone) && chiffres(x.telephone) === chiffres(r.telephone)) || norm(x.nom) === norm(r.nom));
    const fo = config.formules.find((x) => `${x.nom} (${nombre(x.prix)} €)` === r.prestation);
    setFormFacture({
      rdv_id: r.id, client_id: c?.id || '', client_nom: c?.nom || r.nom, client_adresse: c ? [c.adresse, c.commune].filter(Boolean).join(', ') : '',
      date_prestation: r.date_rdv > aujourdhuiParis() ? aujourdhuiParis() : r.date_rdv, // une prestation future ne peut pas encore être facturée
      lignes: [fo ? { designation: fo.nom, quantite: '1', prix_unitaire: String(fo.prix) } : { designation: `${r.prestation} (heures)`, quantite: '1', prix_unitaire: String(config.tarifHoraire) }],
    });
    setOnglet('factures');
    setEtat({ type: '', texte: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const deconnecter = async () => { await fetch('/api/admin/logout', { method: 'POST' }); router.refresh(); };

  const nonLus = messages.filter((m) => !m.lu).length;
  const enAttente = rendezVous.filter((r) => r.statut === 'en_attente').length;
  const onglets = [
    ['rdv', `Rendez-vous${enAttente ? ` (${enAttente})` : ''}`],
    ['messages', `Messages${nonLus ? ` (${nonLus})` : ''}`],
    ['clients', `Clients${clients.length ? ` (${clients.length})` : ''}`],
    ['factures', `Factures${factures.filter((f) => f.statut === 'emise').length ? ` (${factures.filter((f) => f.statut === 'emise').length})` : ''}`],
    ['tarifs', 'Formules & tarifs'],
    ['catalogue', 'Catalogue'],
    ['faq', 'FAQ'],
    ['lieux', 'Créneaux & communes'],
    ['coordonnees', 'Coordonnées & mentions légales'],
  ];

  const correspond = (recherche, ...champs) => {
    const q = recherche.trim().toLowerCase();
    return !q || champs.some((c) => String(c ?? '').toLowerCase().includes(q));
  };
  const rdvAffiches = rendezVous.filter((r) => (filtre === 'tous' || r.statut === filtre) && correspond(rechercheRdv, r.nom, r.telephone, r.email, r.commune, r.prestation, r.details));
  const messagesAffiches = messages.filter((m) => correspond(rechercheMsg, m.nom, m.contact, m.message));

  return (
    <div className="ac-subpage admin-shell">
      <header className="admin-top">
        <div>
          <p className="ac-eyebrow"><span className="ac-live" aria-hidden="true" /> Espace administration · Aide O&apos;Clic</p>
          <h1>Tableau de bord</h1>
        </div>
        <div className="admin-actions">
          <a href="/" className="slot-btn" style={{ textDecoration: 'none' }}>Voir le site</a>
          <button type="button" className="slot-btn" onClick={deconnecter}>Se déconnecter</button>
        </div>
      </header>

      {demo && (
        <div className="senior-help-bar" role="note"><div className="senior-help-bar-text">
          🚧 Le site est en <strong>mode démo</strong> : les demandes de rendez-vous et les messages ne sont pas enregistrés tant que MODE_DEMO n&apos;est pas défini sur « false ». Vos réglages (tarifs, communes…) s&apos;appliquent déjà.
        </div></div>
      )}
      {erreurDonnees && <div className="senior-help-bar" role="alert"><div className="senior-help-bar-text">⚠️ {erreurDonnees}</div></div>}

      <div className="time-slots admin-tabs" role="tablist">
        {onglets.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={onglet === id} className={'slot-btn' + (onglet === id ? ' selected' : '')}
            onClick={() => { setOnglet(id); setEtat({ type: '', texte: '' }); }}>{label}</button>
        ))}
      </div>

      {etat.type === 'ok' && <div className="callout-box" role="status"><p>✅ {etat.texte}</p></div>}
      {etat.type === 'erreur' && <div className="senior-help-bar" role="alert"><div className="senior-help-bar-text">⚠️ {etat.texte}</div></div>}

      {onglet === 'rdv' && (
        <>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 8 }}>
            <div className="form-group" style={{ minWidth: 200, flex: '0 1 240px' }}>
              <label className="form-label" htmlFor="filtre">Afficher</label>
              <select id="filtre" className="form-select" value={filtre} onChange={(e) => setFiltre(e.target.value)}>
                <option value="tous">Tous les rendez-vous</option>
                <option value="en_attente">En attente</option>
                <option value="confirme">Confirmés</option>
                <option value="annule">Annulés</option>
              </select>
            </div>
            <div className="form-group" style={{ minWidth: 200, flex: '1 1 240px' }}>
              <label className="form-label" htmlFor="recherche">Rechercher</label>
              <input id="recherche" type="search" className="form-input" value={rechercheRdv} onChange={(e) => setRechercheRdv(e.target.value)} placeholder="Nom, téléphone, commune…" />
            </div>
            <div className="form-group">
              <button type="button" className="btn btn-cta" disabled={occupe} onClick={() => { setFormRdv({}); setEtat({ type: '', texte: '' }); }}>➕ Nouveau rendez-vous</button>
            </div>
          </div>
          {formRdv && (
            <RdvForm key={formRdv.id || formRdv.nom || 'nouveau'} initial={formRdv} creneaux={cfg.creneaux} communes={cfg.communes} prestations={prestations} clients={clients}
              occupe={occupe} onSave={enregistrerRdv} onCancel={() => setFormRdv(null)} />
          )}
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
                  {r.statut !== 'annule' && <button type="button" className="slot-btn" disabled={occupe} onClick={() => facturerRdv(r)}>🧾 Facturer</button>}
                  <button type="button" className="slot-btn" disabled={occupe} onClick={() => { setFormRdv(r); setEtat({ type: '', texte: '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>✏️ Modifier</button>
                  <button type="button" className="slot-btn" disabled={occupe} onClick={() => supprimerRdv(r.id)}>🗑️ Supprimer</button>
                </div>
              </div>
            );
          })}
        </>
      )}

      {onglet === 'messages' && (
        <>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 8 }}>
            <div className="form-group" style={{ minWidth: 200, flex: '1 1 240px' }}>
              <label className="form-label" htmlFor="recherche-m">Rechercher</label>
              <input id="recherche-m" type="search" className="form-input" value={rechercheMsg} onChange={(e) => setRechercheMsg(e.target.value)} placeholder="Nom, contact, mot du message…" />
            </div>
            <div className="form-group">
              <button type="button" className="btn btn-cta" disabled={occupe} onClick={() => { setFormMsg({}); setEtat({ type: '', texte: '' }); }}>➕ Nouveau message</button>
            </div>
          </div>
          {formMsg && <MessageForm key={formMsg.id || 'nouveau'} initial={formMsg} occupe={occupe} onSave={enregistrerMsg} onCancel={() => setFormMsg(null)} />}
          {messagesAffiches.length === 0 && <p>Aucun message.</p>}
          {messagesAffiches.map((m) => (
            <div key={m.id} className="card-item" style={{ padding: 16, marginBottom: 12, borderLeft: m.lu ? undefined : '4px solid var(--cyan-accent)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <strong>{m.nom} — {m.contact}</strong>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(m.created_at).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</span>
              </div>
              <p style={{ margin: '8px 0', whiteSpace: 'pre-wrap' }}>{m.message}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" className="slot-btn" disabled={occupe} onClick={() => basculerLu(m.id, !m.lu)}>{m.lu ? 'Marquer comme non lu' : 'Marquer comme lu'}</button>
                <button type="button" className="slot-btn" disabled={occupe} onClick={() => { setFormMsg(m); setEtat({ type: '', texte: '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>✏️ Modifier</button>
                <button type="button" className="slot-btn" disabled={occupe} onClick={() => supprimerMsg(m.id)}>🗑️ Supprimer</button>
              </div>
            </div>
          ))}
        </>
      )}

      {onglet === 'factures' && (
        <FacturesPanel factures={factures} erreur={erreurFactures} clients={clients} formules={config.formules} tarifHoraire={config.tarifHoraire}
          site={{ editeur: config.editeur, creditImpotPct: Number(config.creditImpotPct), telephone: config.telephone, email: config.email, nomSite: "Aide O'Clic" }}
          occupe={occupe} form={formFacture} setForm={setFormFacture} onCreate={creerFacture} onAction={actionFacture} onModifier={modifierFacture} />
      )}

      {onglet === 'clients' && (
        <ClientsPanel clients={clients} erreur={erreurClients} communes={cfg.communes} retentionMois={retentionClientMois} occupe={occupe}
          onSave={enregistrerClient} onDelete={supprimerClient} onTouch={toucherClient} onNouveauRdv={nouveauRdvPour} />
      )}

      {onglet === 'tarifs' && (
        <>
          <FormulesEditor formules={cfg.formules} onChange={(formules) => setCfg((c) => ({ ...c, formules }))} creditImpotPct={cfg.creditImpotPct} defauts={defauts.formules} />
          <div className="card-item" style={{ padding: 20, marginBottom: 16 }}>
            <div className="card-item-header">💳 Crédit d&apos;impôt et annulation</div>
            <div className="grid-2" style={{ marginBottom: 0 }}>
              <Champ id="ci" label="Crédit d'impôt (%)"><input id="ci" className="form-input" inputMode="decimal" value={cfg.creditImpotPct} onChange={maj('creditImpotPct')} /></Champ>
              <Champ id="ah" label="Annulation sans frais jusqu'à (heures avant le rendez-vous)"><input id="ah" className="form-input" inputMode="numeric" value={cfg.annulationHeures} onChange={maj('annulationHeures')} /></Champ>
            </div>
            <p style={{ fontSize: 13 }}>Le délai est affiché sur la page « Annulation et remboursement ». Mettre 0 pour permettre l&apos;annulation sans frais à tout moment.</p>
          </div>
          <button type="button" className="btn-primary" disabled={occupe} onClick={enregistrer}>{occupe ? 'Enregistrement…' : 'Enregistrer les formules et tarifs'}</button>
        </>
      )}

      {onglet === 'catalogue' && (
        <>
          <CatalogueEditor catalogue={cfg.catalogue} onChange={(catalogue) => setCfg((c) => ({ ...c, catalogue }))} defauts={defauts.catalogue} />
          <button type="button" className="btn-primary" disabled={occupe} onClick={enregistrer}>{occupe ? 'Enregistrement…' : 'Enregistrer le catalogue'}</button>
        </>
      )}

      {onglet === 'faq' && (
        <>
          <FaqEditor faq={cfg.faq} onChange={(faq) => setCfg((c) => ({ ...c, faq }))} defauts={defauts.faq} />
          <button type="button" className="btn-primary" disabled={occupe} onClick={enregistrer}>{occupe ? 'Enregistrement…' : 'Enregistrer la FAQ'}</button>
        </>
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
