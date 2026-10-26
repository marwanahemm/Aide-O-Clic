'use client';
import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import RgpdNote from './RgpdNote';

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dateLongue = (isoDate) => new Date(`${isoDate}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

export default function BookingForm({ creneaux, communes, prestations, prestationInitiale = '', dateInitiale = '', creneauInitial = '' }) {
  const [mois, setMois] = useState(null); // { y, m } — défini après affichage pour éviter un décalage serveur/navigateur
  const [demain, setDemain] = useState(null);
  const [jour, setJour] = useState('');
  const [creneau, setCreneau] = useState(() => (creneaux.includes(creneauInitial) ? creneauInitial : ''));
  const [pris, setPris] = useState([]);
  const [prestation, setPrestation] = useState(() => prestations.find((p) => p.value === prestationInitiale)?.value || prestations[0]?.value || '');
  const [commune, setCommune] = useState(communes[0] || '');
  const [etat, setEtat] = useState({ type: '', texte: '' });
  const [envoi, setEnvoi] = useState(false);
  const [fait, setFait] = useState(null); // récapitulatif après envoi réussi
  const alerteRef = useRef(null);

  useEffect(() => {
    const t = new Date();
    const d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1);
    setDemain(d);
    let m = { y: d.getFullYear(), m: d.getMonth() }; // mois de « demain » : évite un calendrier tout grisé le dernier jour du mois
    // Jour (et créneau) choisis dans la carte de l'accueil : acceptés seulement s'ils sont valides
    const [a, mo, j] = /^\d{4}-\d{2}-\d{2}$/.test(dateInitiale) ? dateInitiale.split('-').map(Number) : [0, 0, 0];
    const choisi = a ? new Date(a, mo - 1, j) : null;
    if (choisi && iso(choisi) === dateInitiale && choisi >= d && choisi.getDay() !== 0 && choisi.getDay() !== 6) {
      setJour(dateInitiale);
      m = { y: a, m: mo - 1 };
    } else {
      setCreneau('');
    }
    setMois(m);
  }, []);

  useEffect(() => {
    if (etat.type && alerteRef.current) alerteRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [etat]);

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
      setEtat({ type: 'erreur', texte: 'Merci de choisir une date puis un créneau horaire dans le calendrier ci-dessus.' });
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
        setFait({ demo: Boolean(data.demo), jour, creneau, commune, prestation, email: f.email || '' });
        form.reset();
        setCreneau('');
        chargerCreneauxPris(jour);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // ----- Confirmation d'envoi -----
  if (fait) {
    return (
      <div className="panel success-panel" role="status">
        <div className="big-check"><Icon name="check" size={44} /></div>
        <h2>{fait.demo ? 'Démonstration réussie' : 'Demande bien reçue !'}</h2>
        <p className="lead" style={{ maxWidth: '34rem', margin: '0 auto 22px' }}>
          {fait.demo
            ? "Le formulaire fonctionne, mais en mode démonstration votre demande n'a pas été enregistrée."
            : `Je vous rappelle rapidement pour confirmer le rendez-vous${fait.email ? ', et vous recevrez aussi un e-mail de confirmation' : ''}.`}
        </p>
        <div className="recap" style={{ maxWidth: 440, margin: '0 auto 24px', textAlign: 'left' }}>
          <dl>
            <div><dt>Date</dt><dd className="cap">{dateLongue(fait.jour)}</dd></div>
            <div><dt>Créneau</dt><dd>{fait.creneau}</dd></div>
            <div><dt>Lieu</dt><dd>{fait.commune}</dd></div>
            <div><dt>Prestation</dt><dd>{fait.prestation}</dd></div>
          </dl>
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => setFait(null)}>Faire une autre demande</button>
      </div>
    );
  }

  const etape = !jour ? 1 : !creneau ? 2 : 3;
  const etapes = [['Date', 1], ['Créneau', 2], ['Coordonnées', 3]];

  return (
    <div>
      <ol className="stepper" aria-label="Progression">
        {etapes.map(([t, n]) => (
          <li key={n} className={n < etape ? 'fait' : n === etape ? 'actif' : ''} aria-current={n === etape ? 'step' : undefined}>
            <span className="n">{n < etape ? <Icon name="check" size={16} /> : n}</span><span className="t">{t}</span>
          </li>
        ))}
      </ol>

      <div className="booking">
        <div>
          <section className="panel" aria-labelledby="t-date">
            <h2 className="panel-title" id="t-date"><span className="n">1</span> Choisissez un jour</h2>
            <div className="cal-clair"><div className="calendar-container">
              <div className="calendar-header">
                <button type="button" className="slot-btn" onClick={() => changerMois(-1)} disabled={!peutReculer} aria-label="Mois précédent">‹</button>
                <div className="calendar-title" aria-live="polite">{titreMois}</div>
                <button type="button" className="slot-btn" onClick={() => changerMois(1)} aria-label="Mois suivant">›</button>
              </div>
              <div className="calendar-grid">
                {JOURS.map((j) => <div key={j} className="cal-day-head">{j}</div>)}
                {cases.map((d) => {
                  const valeur = iso(d);
                  if (d.getMonth() !== mois.m) return <span key={valeur} className="cal-empty" />;
                  const ouvre = d >= demain && d.getDay() !== 0 && d.getDay() !== 6;
                  return (
                    <button
                      key={valeur}
                      type="button"
                      className={'cal-day' + (ouvre ? '' : ' disabled') + (jour === valeur ? ' selected' : '')}
                      disabled={!ouvre}
                      aria-pressed={ouvre ? jour === valeur : undefined}
                      aria-label={dateLongue(valeur)}
                      onClick={() => { setJour(valeur); setCreneau(''); }}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>
              <p className="field-help" style={{ marginTop: 12 }}>Du lundi au vendredi. Les jours grisés ne sont pas disponibles.</p>
            </div></div>
          </section>

          <section className="panel" aria-labelledby="t-creneau">
            <h2 className="panel-title" id="t-creneau"><span className="n">2</span> Choisissez un créneau</h2>
            <div className="time-slots">
              {creneaux.map((c) => (
                <button key={c} type="button" className={'slot-btn' + (creneau === c ? ' selected' : '')} disabled={!jour || pris.includes(c)} aria-pressed={creneau === c} onClick={() => setCreneau(c)}>
                  {c}
                </button>
              ))}
            </div>
            {!jour && <p className="field-help" style={{ marginTop: 10 }}>Choisissez d&apos;abord un jour dans le calendrier.</p>}
            {jour && pris.length > 0 && <p className="field-help" style={{ marginTop: 10 }}>Les créneaux barrés sont déjà réservés.</p>}
          </section>

          <section className="panel" aria-labelledby="t-coord">
            <h2 className="panel-title" id="t-coord"><span className="n">3</span> Vos coordonnées</h2>
            <form onSubmit={envoyer}>
              <input className="hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />

              <div className="grid-2" style={{ marginBottom: 0 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="nom">Nom et prénom</label>
                  <input id="nom" type="text" name="nom" className="form-input" placeholder="Ex : Jean Dupont" autoComplete="name" required minLength={2} maxLength={100} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="telephone">Téléphone</label>
                  <input id="telephone" type="tel" name="telephone" className="form-input" placeholder="Ex : 06 12 34 56 78" autoComplete="tel" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Adresse e-mail <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>(facultatif)</span></label>
                <input id="email" type="email" name="email" className="form-input" placeholder="Ex : jean.dupont@exemple.fr" maxLength={150} autoComplete="email" />
                <p className="field-help">Pour recevoir la confirmation de votre rendez-vous par e-mail.</p>
              </div>

              <div className="grid-2" style={{ marginBottom: 0 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="prestation">Formule souhaitée</label>
                  <select id="prestation" name="prestation" className="form-select" value={prestation} onChange={(e) => setPrestation(e.target.value)}>
                    {prestations.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="commune">Commune</label>
                  <select id="commune" name="commune" className="form-select" value={commune} onChange={(e) => setCommune(e.target.value)}>
                    {communes.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="details">Votre besoin ou votre adresse précise <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>(facultatif)</span></label>
                <textarea id="details" name="details" rows={3} maxLength={1000} className="form-textarea" placeholder="Ex : Résidence les Lilas à Boé. Besoin d'aide pour une déclaration en ligne et l'installation d'une imprimante Wi-Fi." />
              </div>

              <div className="form-group">
                <label className="check-row">
                  <input type="checkbox" name="accepteConditions" required />
                  <span>
                    J’ai lu les <a href="/annulation-remboursement" target="_blank" rel="noopener">conditions d’annulation, de rétractation et de remboursement</a>.
                    Je demande que l’intervention ait lieu à la date choisie, même si elle intervient avant la fin du délai de rétractation de 14 jours, et je reconnais
                    qu’une fois l’intervention entièrement réalisée, je ne pourrai plus me rétracter.
                  </span>
                </label>
              </div>

              <RgpdNote />

              <div ref={alerteRef}>
                {etat.type === 'erreur' && <div className="alert alert-erreur" role="alert"><span aria-hidden="true">⚠️</span> <span>{etat.texte}</span></div>}
              </div>

              <button type="submit" className="btn-primary btn-lg" disabled={envoi}>
                {envoi ? 'Envoi en cours…' : 'Envoyer ma demande de rendez-vous'}
              </button>
            </form>
          </section>
        </div>

        <aside className="booking-side" aria-label="Récapitulatif">
          <div className="recap">
            <h3>Votre rendez-vous</h3>
            <dl>
              <div><dt>Date</dt><dd className={'cap' + (jour ? '' : ' vide')}>{jour ? dateLongue(jour) : 'À choisir dans le calendrier'}</dd></div>
              <div><dt>Créneau</dt><dd className={creneau ? '' : 'vide'}>{creneau || 'À choisir'}</dd></div>
              <div><dt>Lieu</dt><dd>{commune}</dd></div>
              <div><dt>Formule</dt><dd>{prestation}</dd></div>
            </dl>
          </div>
          <div className="panel" style={{ marginBottom: 0 }}>
            <ul className="reassure">
              <li><Icon name="check" size={20} /> <span>Demande sans engagement : je vous rappelle pour confirmer.</span></li>
              <li><Icon name="check" size={20} /> <span>Déplacement inclus dans les communes desservies.</span></li>
              <li><Icon name="check" size={20} /> <span>Annulation possible, voir les <a href="/annulation-remboursement">conditions</a>.</span></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
