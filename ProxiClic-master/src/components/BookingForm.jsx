'use client';
import { useEffect, useState } from 'react';
import { SectionTitle } from './PageHead';
import RgpdNote from './RgpdNote';
import { CRENEAUX, COMMUNES, PRESTATIONS } from '../lib/pricing';

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function BookingForm() {
  const [mois, setMois] = useState(null); // { y, m } — défini après affichage pour éviter un décalage serveur/navigateur
  const [demain, setDemain] = useState(null);
  const [jour, setJour] = useState('');
  const [creneau, setCreneau] = useState('');
  const [pris, setPris] = useState([]);
  const [etat, setEtat] = useState({ type: '', texte: '' });
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    const t = new Date();
    const d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1);
    setDemain(d);
    setMois({ y: d.getFullYear(), m: d.getMonth() }); // mois de « demain » : évite un calendrier tout grisé le dernier jour du mois
  }, []);

  // Créneaux déjà réservés pour le jour choisi (lus dans Supabase via l'API)
  function chargerCreneauxPris(date) {
    fetch(`/api/rendez-vous?date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        setPris(d.pris || []);
        setCreneau((c) => ((d.pris || []).includes(c) ? '' : c));
      })
      .catch(() => setPris([]));
  }
  useEffect(() => { if (jour) chargerCreneauxPris(jour); }, [jour]);

  if (!mois || !demain) return <p style={{ margin: '24px 0' }}>Chargement du calendrier…</p>;

  const premier = new Date(mois.y, mois.m, 1);
  const decalage = (premier.getDay() + 6) % 7; // semaine commençant le lundi
  const nbCases = Math.ceil((decalage + new Date(mois.y, mois.m + 1, 0).getDate()) / 7) * 7;
  const cases = Array.from({ length: nbCases }, (_, i) => new Date(mois.y, mois.m, 1 - decalage + i));
  const titreMois = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(premier);
  const moisCourant = new Date(demain.getFullYear(), demain.getMonth(), 1);
  const peutReculer = premier > moisCourant;

  function changerMois(delta) {
    setMois(({ y, m }) => { const d = new Date(y, m + delta, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  }

  async function envoyer(e) {
    e.preventDefault();
    if (!jour || !creneau) {
      setEtat({ type: 'erreur', texte: 'Merci de choisir une date et un créneau horaire.' });
      return;
    }
    const form = e.currentTarget;
    const f = Object.fromEntries(new FormData(form));
    setEnvoi(true);
    setEtat({ type: '', texte: '' });
    try {
      const res = await fetch('/api/rendez-vous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, date: jour, creneau }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 201) {
        setEtat({ type: 'ok', texte: data.demo ? "Mode démonstration : le formulaire fonctionne, mais votre demande n'a pas été enregistrée." : 'Votre demande est bien enregistrée. Je vous rappelle rapidement pour confirmer le rendez-vous.' });
        form.reset();
        setCreneau('');
        chargerCreneauxPris(jour);
      } else if (res.status === 409) {
        setEtat({ type: 'erreur', texte: "Ce créneau vient d'être réservé par quelqu'un d'autre. Merci d'en choisir un autre." });
        chargerCreneauxPris(jour);
      } else {
        setEtat({ type: 'erreur', texte: data.erreur || "Une erreur est survenue. Merci de réessayer ou de m'appeler." });
      }
    } catch {
      setEtat({ type: 'erreur', texte: 'Connexion impossible. Vérifiez votre accès Internet et réessayez.' });
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <>
      <SectionTitle>1. CHOISISSEZ VOTRE DATE ET VOTRE CRÉNEAU</SectionTitle>

      <div className="calendar-container">
        <div className="calendar-header">
          <button type="button" className="slot-btn" onClick={() => changerMois(-1)} disabled={!peutReculer} aria-label="Mois précédent">‹</button>
          <div className="calendar-title" aria-live="polite">{titreMois}</div>
          <button type="button" className="slot-btn" onClick={() => changerMois(1)} aria-label="Mois suivant">›</button>
        </div>

        <div className="calendar-grid">
          {JOURS.map((j) => <div key={j} className="cal-day-head">{j}</div>)}
          {cases.map((d) => {
            const valeur = iso(d);
            const dansLeMois = d.getMonth() === mois.m;
            const ouvre = dansLeMois && d >= demain && d.getDay() !== 0 && d.getDay() !== 6;
            return (
              <div
                key={valeur}
                className={'cal-day' + (ouvre ? '' : ' disabled') + (jour === valeur ? ' selected' : '')}
                role={ouvre ? 'button' : undefined}
                tabIndex={ouvre ? 0 : undefined}
                aria-pressed={ouvre ? jour === valeur : undefined}
                onClick={ouvre ? () => { setJour(valeur); setCreneau(''); } : undefined}
                onKeyDown={ouvre ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setJour(valeur); setCreneau(''); } } : undefined}
              >
                {d.getDate()}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 16 }}>
          <span className="form-label">Créneau horaire souhaité :</span>
          <div className="time-slots">
            {CRENEAUX.map((c) => (
              <button
                key={c}
                type="button"
                className={'slot-btn' + (creneau === c ? ' selected' : '')}
                disabled={!jour || pris.includes(c)}
                aria-pressed={creneau === c}
                onClick={() => setCreneau(c)}
              >
                {c}
              </button>
            ))}
          </div>
          {!jour && <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>Choisissez d&apos;abord un jour ouvré.</p>}
          {jour && pris.length > 0 && <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>Les créneaux barrés sont déjà réservés.</p>}
        </div>
      </div>

      <SectionTitle>2. VOS COORDONNÉES POUR CONFIRMER LE RENDEZ-VOUS</SectionTitle>

      <div className="card-item" style={{ padding: 20 }}>
        <form onSubmit={envoyer}>
          <input className="hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="nom">Nom &amp; Prénom</label>
              <input id="nom" type="text" name="nom" className="form-input" placeholder="Ex : Jean Dupont" required minLength={2} maxLength={100} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="telephone">Téléphone de contact</label>
              <input id="telephone" type="tel" name="telephone" className="form-input" placeholder="Ex : 06 12 34 56 78" required />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="prestation">Formule / Prestation souhaitée</label>
              <select id="prestation" name="prestation" className="form-select">
                {PRESTATIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="commune">Commune (Bassin d&apos;Agen)</label>
              <select id="commune" name="commune" className="form-select">
                {COMMUNES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="details">Précisez le besoin ou l&apos;adresse précise</label>
            <textarea id="details" name="details" rows={3} maxLength={1000} className="form-textarea" placeholder="Ex : Résidence les Lilas à Boé. Besoin d'aide pour une déclaration en ligne et l'installation d'une imprimante WiFi." />
          </div>

          <RgpdNote />

          {etat.type === 'ok' && <div className="callout-box" role="status"><p>✅ {etat.texte}</p></div>}
          {etat.type === 'erreur' && <div className="senior-help-bar" role="alert"><div className="senior-help-bar-text">⚠️ {etat.texte}</div></div>}

          <button type="submit" className="btn-primary" disabled={envoi}>
            {envoi ? 'Envoi en cours…' : 'Valider et demander la confirmation du RDV'}
          </button>
        </form>
      </div>
    </>
  );
}