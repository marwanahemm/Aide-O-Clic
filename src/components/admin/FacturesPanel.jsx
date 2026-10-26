'use client';
import { useState } from 'react';
import FactureForm from './FactureForm';
import { eur } from '../../lib/pricing';
import { MODES_PAIEMENT, aujourdhuiParis } from '../../lib/facturesAdmin';

const STATUTS = {
  emise: { texte: 'À encaisser', fond: 'var(--amber-bg)', couleur: 'var(--amber-text)' },
  payee: { texte: 'Payée', fond: 'var(--green-badge-bg)', couleur: 'var(--green-badge-text)' },
  annulee: { texte: 'Annulée', fond: 'var(--line)', couleur: 'var(--text-muted)' },
};
const dateCourte = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const cle = (nom) => String(nom || '').trim().toLowerCase().replace(/\s+/g, ' ');

// Factures et attestations fiscales : créer, suivre les règlements, télécharger les PDF
export default function FacturesPanel({ factures, erreur, clients, formules, tarifHoraire, site, occupe, form, setForm, onCreate, onAction, onModifier }) {
  const anneeCourante = aujourdhuiParis().slice(0, 4);
  const annees = [...new Set([anneeCourante, ...factures.flatMap((f) => [f.date_facture?.slice(0, 4), f.date_paiement?.slice(0, 4)].filter(Boolean))])].sort().reverse();
  const [annee, setAnnee] = useState(anneeCourante);
  const [recherche, setRecherche] = useState('');
  const [payerId, setPayerId] = useState(null);
  const [paiement, setPaiement] = useState({ date_paiement: aujourdhuiParis(), mode_paiement: MODES_PAIEMENT[0] });
  const [editId, setEditId] = useState(null);
  const [coord, setCoord] = useState({ client_nom: '', client_adresse: '', notes: '' });
  const [attestation, setAttestation] = useState(false);
  const [clientAttestation, setClientAttestation] = useState('');
  const [erreurPdf, setErreurPdf] = useState('');

  const ed = site.editeur;
  const incomplet = ['nom', 'siret', 'sap', 'adresse'].some((k) => String(ed[k] || '').startsWith('['));

  const delAnnee = factures.filter((f) => f.date_facture?.startsWith(annee));
  const facture = delAnnee.filter((f) => f.statut !== 'annulee').reduce((s, f) => s + Number(f.total), 0);
  const aEncaisser = delAnnee.filter((f) => f.statut === 'emise').reduce((s, f) => s + Number(f.total), 0);
  const encaisse = factures.filter((f) => f.statut === 'payee' && f.date_paiement?.startsWith(annee)).reduce((s, f) => s + Number(f.total), 0);
  const q = recherche.trim().toLowerCase();
  const affichees = delAnnee.filter((f) => !q || [f.numero, f.client_nom, ...f.lignes.map((l) => l.designation)].some((x) => String(x).toLowerCase().includes(q)));

  // Clients ayant réglé au moins une facture dans l'année choisie
  const payees = factures.filter((f) => f.statut === 'payee' && f.date_paiement?.startsWith(annee));
  const clientsAttestation = [...new Map(payees.map((f) => [cle(f.client_nom), f.client_nom])).entries()];
  const choisi = clientsAttestation.some(([k]) => k === clientAttestation) ? clientAttestation : clientsAttestation[0]?.[0] || '';
  const paiementsClient = payees.filter((f) => cle(f.client_nom) === choisi).sort((a, b) => a.date_paiement.localeCompare(b.date_paiement));

  async function pdfFacture(f) {
    setErreurPdf('');
    try {
      const { genererFacturePdf, telecharger } = await import('../../lib/pdf');
      telecharger(await genererFacturePdf(f, site), `Facture-${f.numero}.pdf`);
    } catch (e) { setErreurPdf(`Impossible de générer le PDF : ${e.message}`); }
  }
  async function pdfAttestation() {
    setErreurPdf('');
    try {
      const { genererAttestationPdf, telecharger } = await import('../../lib/pdf');
      const dernier = [...paiementsClient].reverse().find((f) => f.client_adresse) || paiementsClient[paiementsClient.length - 1];
      const nom = paiementsClient[paiementsClient.length - 1].client_nom;
      const octets = await genererAttestationPdf({
        annee, client: { nom, adresse: dernier?.client_adresse || '' },
        paiements: paiementsClient.map((f) => ({ numero: f.numero, date_paiement: f.date_paiement, total: f.total })),
        dateEdition: aujourdhuiParis(),
      }, site);
      telecharger(octets, `Attestation-${annee}-${nom.replace(/[^\p{L}\p{N}]+/gu, '-')}.pdf`);
    } catch (e) { setErreurPdf(`Impossible de générer le PDF : ${e.message}`); }
  }

  return (
    <>
      {erreur && <div className="senior-help-bar" role="alert"><div className="senior-help-bar-text">⚠️ {erreur}</div></div>}
      {incomplet && (
        <div className="senior-help-bar" role="note"><div className="senior-help-bar-text">
          ⚠️ Vos mentions légales sont incomplètes (nom, SIRET, n° de déclaration SAP ou adresse). Complétez-les dans l&apos;onglet « Coordonnées &amp; mentions légales » <strong>avant</strong> d&apos;émettre des factures : ces informations sont obligatoires.
        </div></div>
      )}
      {erreurPdf && <div className="senior-help-bar" role="alert"><div className="senior-help-bar-text">⚠️ {erreurPdf}</div></div>}

      <div className="stats" style={{ marginTop: 0, marginBottom: 16 }}>
        <div className="stat"><strong>{eur(facture)}</strong><span>facturé en {annee}</span></div>
        <div className="stat"><strong>{eur(encaisse)}</strong><span>encaissé en {annee}</span></div>
        <div className="stat"><strong>{eur(aEncaisser)}</strong><span>à encaisser</span></div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 8 }}>
        <div className="form-group" style={{ minWidth: 120 }}>
          <label className="form-label" htmlFor="f-annee">Année</label>
          <select id="f-annee" className="form-select" value={annee} onChange={(e) => setAnnee(e.target.value)}>{annees.map((a) => <option key={a} value={a}>{a}</option>)}</select>
        </div>
        <div className="form-group" style={{ minWidth: 200, flex: '1 1 220px' }}>
          <label className="form-label" htmlFor="f-recherche">Rechercher</label>
          <input id="f-recherche" type="search" className="form-input" value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="N° de facture, client…" />
        </div>
        <div className="form-group"><button type="button" className="btn btn-cta" disabled={occupe || Boolean(erreur)} onClick={() => setForm({})}>➕ Nouvelle facture</button></div>
        <div className="form-group"><button type="button" className="btn btn-ghost" aria-expanded={attestation} onClick={() => setAttestation((a) => !a)}>📄 Attestation fiscale annuelle</button></div>
      </div>

      {attestation && (
        <div className="card-item" style={{ padding: 20, marginBottom: 16 }}>
          <div className="card-item-header">📄 Attestation fiscale {annee}</div>
          {clientsAttestation.length === 0 ? (
            <p>Aucune facture réglée en {annee} : l&apos;attestation reprend les sommes <strong>effectivement payées</strong> dans l&apos;année. Marquez d&apos;abord vos factures comme payées.</p>
          ) : (
            <>
              <div className="form-group" style={{ maxWidth: 420 }}>
                <label className="form-label" htmlFor="f-att-client">Client</label>
                <select id="f-att-client" className="form-select" value={choisi} onChange={(e) => setClientAttestation(e.target.value)}>
                  {clientsAttestation.map(([k, nom]) => <option key={k} value={k}>{nom}</option>)}
                </select>
              </div>
              <p style={{ marginBottom: 12 }}>
                {paiementsClient.length} règlement{paiementsClient.length > 1 ? 's' : ''} en {annee} : <strong>{eur(paiementsClient.reduce((s, f) => s + Number(f.total), 0))}</strong>
                {paiementsClient.some((f) => f.client_adresse) ? '' : ' — ⚠️ aucune adresse enregistrée pour ce client (corrigez-la sur une de ses factures).'}
              </p>
              <button type="button" className="btn btn-cta" onClick={pdfAttestation}>⬇️ Télécharger l&apos;attestation (PDF)</button>
            </>
          )}
          <p className="field-help" style={{ marginTop: 10 }}>À remettre à vos clients avant le 31 mars de l&apos;année suivante. Si un client utilise l&apos;avance immédiate de crédit d&apos;impôt, l&apos;attestation est établie par l&apos;Urssaf pour la part concernée.</p>
        </div>
      )}

      {form && (
        <FactureForm key={form.rdv_id || form.client_nom || 'nouvelle'} initial={form} clients={clients} formules={formules} tarifHoraire={tarifHoraire}
          occupe={occupe} onSave={(payload) => onCreate(payload, () => setForm(null))} onCancel={() => setForm(null)} />
      )}

      {!erreur && affichees.length === 0 && <p>Aucune facture en {annee}{q ? ' pour cette recherche' : ''}.</p>}
      {affichees.map((f) => {
        const s = STATUTS[f.statut] || STATUTS.emise;
        return (
          <div key={f.id} className="card-item" style={{ padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <strong>Facture {f.numero} — {f.client_nom}</strong>
              <span style={{ background: s.fond, color: s.couleur, padding: '2px 10px', borderRadius: 12, fontWeight: 700, fontSize: 13 }}>{s.texte}</span>
            </div>
            <p style={{ margin: '6px 0' }}>
              <strong>{eur(Number(f.total))}</strong> · émise le {dateCourte(f.date_facture)} · prestation du {dateCourte(f.date_prestation)}
              {f.statut === 'payee' ? <> · <span style={{ color: 'var(--green-badge-text)', fontWeight: 700 }}>réglée le {dateCourte(f.date_paiement)} ({String(f.mode_paiement).toLowerCase()})</span></> : null}
              <br />{f.lignes.map((l) => `${l.designation} (${String(l.quantite).replace('.', ',')} × ${eur(Number(l.prix_unitaire))})`).join(' — ')}
              {f.client_adresse ? <><br /><small>{f.client_adresse}</small></> : <><br /><small style={{ color: 'var(--amber-text)' }}>⚠️ Adresse du client manquante</small></>}
            </p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="slot-btn" onClick={() => pdfFacture(f)}>⬇️ PDF</button>
              {f.statut === 'emise' && <button type="button" className="slot-btn" disabled={occupe} onClick={() => { setPayerId(payerId === f.id ? null : f.id); setEditId(null); setPaiement({ date_paiement: aujourdhuiParis(), mode_paiement: MODES_PAIEMENT[0] }); }}>💶 Marquer payée</button>}
              {f.statut === 'payee' && <button type="button" className="slot-btn" disabled={occupe} onClick={() => { if (window.confirm('Rouvrir cette facture (annuler le règlement enregistré) ?')) onAction(f.id, 'rouvrir', {}); }}>↩️ Rouvrir</button>}
              {f.statut !== 'annulee' && <button type="button" className="slot-btn" disabled={occupe} onClick={() => { setEditId(editId === f.id ? null : f.id); setPayerId(null); setCoord({ client_nom: f.client_nom, client_adresse: f.client_adresse || '', notes: f.notes || '' }); }}>✏️ Client</button>}
              {f.statut === 'emise' && <button type="button" className="slot-btn" disabled={occupe} onClick={() => { if (window.confirm(`Annuler la facture ${f.numero} ? Son numéro reste utilisé (la numérotation doit rester continue).`)) onAction(f.id, 'annuler', {}); }}>🚫 Annuler</button>}
            </div>

            {payerId === f.id && (
              <form style={{ marginTop: 12, padding: 12, background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 12 }}
                onSubmit={(e) => { e.preventDefault(); onAction(f.id, 'payer', paiement, () => setPayerId(null)); }}>
                <div className="grid-2" style={{ marginBottom: 0 }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor={`p-d-${f.id}`}>Date du règlement</label>
                    <input id={`p-d-${f.id}`} type="date" className="form-input" value={paiement.date_paiement} min={f.date_facture} max={aujourdhuiParis()} onChange={(e) => setPaiement((p) => ({ ...p, date_paiement: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor={`p-m-${f.id}`}>Mode de règlement</label>
                    <select id={`p-m-${f.id}`} className="form-select" value={paiement.mode_paiement} onChange={(e) => setPaiement((p) => ({ ...p, mode_paiement: e.target.value }))}>
                      {MODES_PAIEMENT.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="submit" className="btn btn-cta btn-sm" disabled={occupe}>Enregistrer le règlement</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPayerId(null)}>Annuler</button>
                </div>
              </form>
            )}

            {editId === f.id && (
              <form style={{ marginTop: 12, padding: 12, background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 12 }}
                onSubmit={(e) => { e.preventDefault(); onModifier({ id: f.id, ...coord }, () => setEditId(null)); }}>
                <p className="field-help" style={{ marginBottom: 10 }}>Vous pouvez corriger le nom, l&apos;adresse et la note. Les lignes et le montant ne changent jamais.</p>
                <div className="form-group"><label className="form-label" htmlFor={`e-n-${f.id}`}>Nom du client</label><input id={`e-n-${f.id}`} className="form-input" value={coord.client_nom} onChange={(e) => setCoord((c) => ({ ...c, client_nom: e.target.value }))} required minLength={2} maxLength={100} /></div>
                <div className="form-group"><label className="form-label" htmlFor={`e-a-${f.id}`}>Adresse du client</label><input id={`e-a-${f.id}`} className="form-input" value={coord.client_adresse} onChange={(e) => setCoord((c) => ({ ...c, client_adresse: e.target.value }))} maxLength={250} /></div>
                <div className="form-group"><label className="form-label" htmlFor={`e-t-${f.id}`}>Note</label><input id={`e-t-${f.id}`} className="form-input" value={coord.notes} onChange={(e) => setCoord((c) => ({ ...c, notes: e.target.value }))} maxLength={500} /></div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="submit" className="btn btn-cta btn-sm" disabled={occupe}>Enregistrer</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>Annuler</button>
                </div>
              </form>
            )}
          </div>
        );
      })}
    </>
  );
}
