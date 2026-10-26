import Link from 'next/link';
import Icon from '../components/Icon';
import QuickBooking from '../components/QuickBooking';
import Reveal from '../components/Reveal';
import CountUp from '../components/CountUp';
import RichText, { remplacer } from '../components/RichText';
import { eur, nombre, heuresTxt, reductionFormule } from '../lib/pricing';
import { getConfig } from '../lib/config';
import { NOM_SITE } from '../lib/site';

export const dynamic = 'force-dynamic'; // les tarifs, communes et coordonnées viennent du back-office

export default async function Accueil() {
  const {
    formules: FORMULES, tarifHoraire: REF, faq: FAQ, catalogue: CATALOGUE, creditImpot: CREDIT_IMPOT, creditImpotPct: PCT,
    communes: COMMUNES, creneaux: CRENEAUX, telephone: TELEPHONE, telephoneHref: TEL_HREF, email: EMAIL, annulationHeures: HEURES,
  } = await getConfig();
  // Valeurs utilisables dans les textes de la FAQ modifiés depuis le back-office : {pct}, {communes}, {telephone}…
  const VARS = {
    pct: PCT, reste: 100 - PCT, communes: COMMUNES.join(', '), telephone: TELEPHONE, tel: TEL_HREF, email: EMAIL,
    annulation: HEURES > 0 ? `C’est sans frais jusqu’à ${HEURES} heures avant le rendez-vous.` : 'C’est sans frais, à tout moment.',
  };
  const RESTE = 1 - CREDIT_IMPOT; // part payée par le client après crédit d'impôt
  const MIN_NET_HEURE = Math.min(...FORMULES.map((f) => (f.prix / f.heures) * RESTE)); // meilleur prix de l'heure après crédit d'impôt
  const F0 = FORMULES[0];
  // Chaque prestation du catalogue devient une carte (les 2 domaines regroupés, comme dans le back-office)
  const PRESTATIONS = CATALOGUE.flatMap((c) => c.items.map((it) => ({ ...it, categorie: c.titre })));
  const ticks = (n) => String(n).padStart(2, '0');

  return (
    <div className="ac-page">
      {/* ===== 1. Accueil : texte à gauche, réservation « console » à droite ===== */}
      <section className="ac-hero" aria-labelledby="titre-accueil">
        <div className="ac-hero-text">
          <p className="ac-eyebrow"><span className="ac-live" aria-hidden="true" /> Dossier 001 · {NOM_SITE.toUpperCase()} · Agen</p>
          <h1 id="titre-accueil">Vos démarches en ligne, <em>expliquées simplement, chez vous.</em></h1>
          <p className="ac-lead">Démarches administratives, ordinateur, tablette, smartphone… Je me déplace à votre domicile et je prends le temps de tout vous expliquer, sans jargon.</p>
          <div className="ac-actions">
            <Link href="/rendez-vous" className="btn btn-cta btn-lg"><Icon name="calendar" size={22} /> Prendre rendez-vous</Link>
            <a href="#prestations" className="btn btn-ghost btn-lg">Voir mes prestations <Icon name="arrow" size={20} /></a>
          </div>
          <dl className="ac-metrics">
            <div><dt>Crédit d&apos;impôt</dt><dd>{PCT} %</dd></div>
            <div><dt>Déplacement</dt><dd>0 €</dd></div>
            <div><dt>Communes</dt><dd>{COMMUNES.length}</dd></div>
          </dl>
        </div>
        <div className="ac-console">
          <div className="ac-console-bar" aria-hidden="true">
            <span /><span /><span />
            <b>aide-o-clic · réservation</b>
            <em>en ligne</em>
          </div>
          <QuickBooking creneaux={CRENEAUX} />
        </div>
      </section>

      {/* ===== Zone d'intervention : défilement des communes ===== */}
      <section className="ac-zone" aria-label="Communes desservies">
        <p>Je me déplace chez vous, sans frais, sur le Bassin d&apos;Agen</p>
        <div className="ac-marquee">
          <ul>
            {[...COMMUNES, ...COMMUNES].map((c, i) => (
              <li key={i} aria-hidden={i >= COMMUNES.length ? 'true' : undefined}>{c}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== 2. Prestations (issues du catalogue du back-office) ===== */}
      {PRESTATIONS.length > 0 && (
        <Reveal as="section" className="ac-section" id="prestations" aria-labelledby="t-prestations">
          <header className="ac-head">
            <span className="ac-kicker">Prestations</span>
            <h2 id="t-prestations">Une aide complète, <em>à votre rythme.</em></h2>
            <p>Chaque prestation peut être réservée directement pour le domaine qui vous intéresse.</p>
          </header>
          <ul className="ac-grid-4">
            {PRESTATIONS.map((it, i) => (
              <li key={i} className="ac-card">
                <span className="ac-num">· {ticks(i + 1)}</span>
                <span className="ac-card-ico"><Icon name={it.icone || 'check'} size={24} /></span>
                <h3>{it.titre || it.categorie}</h3>
                <p>{it.texte}</p>
                <Link href={`/rendez-vous?prestation=${encodeURIComponent(it.categorie)}`} className="ac-link">
                  Réserver ce domaine <Icon name="arrow" size={16} />
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      {/* ===== 3. Chiffres clés ===== */}
      <Reveal as="section" className="ac-section" aria-labelledby="t-chiffres">
        <header className="ac-head">
          <span className="ac-kicker">Chiffres clés</span>
          <h2 id="t-chiffres">Des repères simples, <em>sans fioritures.</em></h2>
        </header>
        <div className="ac-stats">
          <div className="ac-stat"><strong><CountUp fin={PCT} suffixe=" %" /></strong><span>de crédit d&apos;impôt sur les services à la personne</span></div>
          <div className="ac-stat"><strong>0 €</strong><span>de frais de déplacement</span></div>
          <div className="ac-stat"><strong><CountUp fin={COMMUNES.length} /></strong><span>communes desservies</span></div>
          <div className="ac-stat"><strong>dès <CountUp fin={MIN_NET_HEURE} decimales={2} suffixe=" €" />/h</strong><span>après crédit d&apos;impôt</span></div>
        </div>
      </Reveal>

      {/* ===== 4. Comment ça se passe : trois parties alternées, avec une maquette ===== */}
      <section className="ac-section" aria-labelledby="t-etapes">
        <header className="ac-head">
          <span className="ac-kicker">Simple comme un clic</span>
          <h2 id="t-etapes">Comment ça se passe ?</h2>
          <p>Trois étapes, et vous n&apos;avez rien à installer ni à préparer.</p>
        </header>

        <Reveal as="article" className="ac-show">
          <div className="ac-show-text">
            <span className="ac-num">· 01</span>
            <h3>Vous choisissez un moment</h3>
            <p>En ligne en quelques clics, ou par téléphone si vous préférez : on fixe ensemble le jour et le créneau qui vous conviennent.</p>
            <ul className="ac-ticks">
              <li>Jours ouvrés, du lundi au vendredi</li>
              <li>Choix du créneau en ligne ou par téléphone</li>
              <li>Formulaire déjà rempli après votre choix</li>
            </ul>
          </div>
          <div className="ac-mock" aria-label="Aperçu des créneaux">
            <p className="ac-mock-title">Aperçu · créneaux proposés</p>
            {CRENEAUX.slice(0, 4).map((c, i) => (
              <div key={c} className={'ac-mock-row' + (i === 1 ? ' is-on' : '')}>
                <span>Créneau</span><b>{c}</b><em>{i === 1 ? 'Sélectionné' : 'Disponible'}</em>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal as="article" className="ac-show rev">
          <div className="ac-show-text">
            <span className="ac-num">· 02</span>
            <h3>Je viens chez vous</h3>
            <p>Je me déplace à votre domicile, avec ce qu&apos;il faut. Nous avançons à votre rythme, pas à pas.</p>
            <ul className="ac-ticks">
              <li>Explications sans jargon</li>
              <li>Vous gardez la main sur chaque geste</li>
              <li>Une fiche mémo laissée si vous le souhaitez</li>
            </ul>
          </div>
          <div className="ac-mock" aria-label="Déroulé d'une intervention">
            <p className="ac-mock-title">Déroulé d&apos;une intervention</p>
            <ol className="ac-timeline">
              <li><b>Arrivée à votre domicile</b><span>On fait le point sur votre besoin</span></li>
              <li><b>Explication pas à pas</b><span>Chaque geste est expliqué et répété</span></li>
              <li><b>Fiche mémo</b><span>Un aide-mémoire simple pour la suite</span></li>
              <li><b>Bilan et prochaine étape</b><span>On convient ensemble de la suite</span></li>
            </ol>
          </div>
        </Reveal>

        {F0 && (
          <Reveal as="article" className="ac-show">
            <div className="ac-show-text">
              <span className="ac-num">· 03</span>
              <h3>Vous ne payez que {100 - PCT} %</h3>
              <p>Grâce au crédit d&apos;impôt de {PCT} %, votre coût réel est divisé. Une attestation fiscale annuelle vous est remise.</p>
            </div>
            <div className="ac-mock" aria-label="Exemple de calcul du coût réel">
              <p className="ac-mock-title">Exemple · {F0.nom}</p>
              <div className="ac-bar-row">
                <span>Prix brut</span><b>{eur(F0.prix)}</b>
                <div className="ac-bar"><i style={{ width: '100%' }} /></div>
              </div>
              <div className="ac-bar-row">
                <span>Crédit d&apos;impôt ({PCT} %)</span><b>− {eur(F0.prix * CREDIT_IMPOT)}</b>
                <div className="ac-bar ac-bar-aide"><i style={{ width: `${PCT}%` }} /></div>
              </div>
              <div className="ac-bar-row ac-bar-total">
                <span>Votre coût réel</span><b>{eur(F0.prix * RESTE)}</b>
                <div className="ac-bar ac-bar-vert"><i style={{ width: `${100 - PCT}%` }} /></div>
              </div>
            </div>
          </Reveal>
        )}
      </section>

      {/* ===== 5. Engagements (en cartes) ===== */}
      <Reveal as="section" className="ac-section" aria-labelledby="t-engagements">
        <header className="ac-head">
          <span className="ac-kicker">Mes engagements</span>
          <h2 id="t-engagements">Une aide pensée pour vous mettre <em>à l&apos;aise.</em></h2>
          <p>Un accompagnement humain, patient et accessible à tous. Je prends le temps nécessaire pour expliquer chaque étape, afin que vous retrouviez sérénité et autonomie.</p>
        </header>
        <div className="ac-quotes">
          <article className="ac-quote">
            <span className="ac-quote-ico"><Icon name="heart" size={24} /></span>
            <h3>Pédagogie &amp; patience</h3>
            <p>Un rythme d&apos;apprentissage adapté aux seniors, des explications claires et des fiches mémos simples laissées à votre disposition.</p>
            <span className="ac-quote-tag">Engagement · 01</span>
          </article>
          <article className="ac-quote">
            <span className="ac-quote-ico"><Icon name="bike" size={24} /></span>
            <h3>Logistique 100 % éco</h3>
            <p>Interventions à vélo et en bus sur Agen et ses communes limitrophes. Aucun frais de déplacement supplémentaire ne vous sera facturé.</p>
            <span className="ac-quote-tag">Engagement · 02</span>
          </article>
          <article className="ac-quote">
            <span className="ac-quote-ico"><Icon name="wifi" size={24} /></span>
            <h3>Connexion sécurisée</h3>
            <p>Équipement d&apos;appoint avec connexion Internet 5G+ sécurisée, en cas de problème de réseau ou d&apos;absence de box Wi-Fi chez vous.</p>
            <span className="ac-quote-tag">Engagement · 03</span>
          </article>
          <article className="ac-quote">
            <span className="ac-quote-ico"><Icon name="user" size={24} /></span>
            <h3>Une expérience de terrain</h3>
            <p>Huit mois de Service Civique à France Travail, à accompagner le public sur les démarches numériques, complétés par une qualification en développement web.</p>
            <span className="ac-quote-tag">Engagement · 04</span>
          </article>
        </div>
      </Reveal>

      {/* ===== 6. Tarifs ===== */}
      <Reveal as="section" className="ac-section" id="tarifs" aria-labelledby="t-tarifs">
        <header className="ac-head">
          <span className="ac-kicker">Tarifs clairs</span>
          <h2 id="t-tarifs">Sans frais cachés, <em>{PCT} % déductibles.</em></h2>
          <p>Le prix affiché est celui de l&apos;intervention, déplacement compris.</p>
        </header>
        <div className="pricing-grid">
          {FORMULES.map((f, i) => {
            const reduction = reductionFormule(f, REF);
            return (
              <div key={f.nom} className={'pricing-card' + (f.badge ? ' featured' : '')}>
                {f.badge && <span className="ribbon">{f.badge}</span>}
                <div>
                  <span className="ac-num">· {ticks(i + 1)}</span>
                  <h3 className="pricing-title">{f.nom}</h3>
                  {f.description && <p className="pricing-sub">{f.description}</p>}
                  <div className="pricing-price">
                    <div className="price-gross">{eur(f.prix)} <span>brut{f.heures !== 1 ? ` · ${heuresTxt(f.heures)} h` : ''}</span></div>
                    <div className="price-net">
                      Coût réel : {eur(f.prix * (1 - CREDIT_IMPOT))} après crédit d&apos;impôt ({PCT} %)
                      {f.heures > 1 ? ` (soit ${eur((f.prix * (1 - CREDIT_IMPOT)) / f.heures)}/h)` : ''}
                    </div>
                  </div>
                  <ul className="check-list" style={{ marginBottom: 24 }}>
                    {f.points.map((p) => <li key={p}>{p}</li>)}
                    {reduction > 0 && <li>Réduction de {eur(reduction)} par rapport au tarif horaire</li>}
                  </ul>
                </div>
                <Link href="/rendez-vous" className={'btn ' + (f.badge ? 'btn-cta' : 'btn-primary')} aria-label={`Réserver cette formule : ${f.nom}, ${nombre(f.prix)} euros brut`}>
                  Réserver cette formule <Icon name="arrow" size={20} />
                </Link>
              </div>
            );
          })}
        </div>
        <p className="pricing-note">
          Besoin d&apos;un autre volume d&apos;heures ? <Link href="/simulation">Calculez votre budget</Link> · <Link href="/annulation-remboursement">Conditions d&apos;annulation et de remboursement</Link>
        </p>
      </Reveal>

      {/* ===== 7. Questions fréquentes (modifiables dans le back-office) ===== */}
      {FAQ.length > 0 && (
        <Reveal as="section" className="ac-section ac-faq-wrap" aria-labelledby="t-faq">
          <div className="ac-faq-side">
            <span className="ac-kicker">Questions fréquentes</span>
            <h2 id="t-faq">Vous vous demandez <em>peut-être…</em></h2>
            <p>Une question qui ne figure pas ici ? Écrivez-moi à <a href={`mailto:${EMAIL}`}>{EMAIL}</a> ou appelez le <a href={TEL_HREF}>{TELEPHONE}</a>.</p>
          </div>
          <div className="faq">
            {FAQ.map((item, i) => (
              <details key={i}>
                <summary>{remplacer(item.q, VARS)} <Icon name="chevron" size={22} /></summary>
                <div className="faq-body"><RichText texte={remplacer(item.r, VARS)} /></div>
              </details>
            ))}
          </div>
        </Reveal>
      )}

      {/* ===== 8. Appel à l'action ===== */}
      <Reveal as="section" className="ac-cta" aria-labelledby="t-cta">
        <h2 id="t-cta">Prêt à vous faire <em>aider ?</em></h2>
        <p>Une question avant de vous lancer ? Appelez-moi : je vous réponds avec plaisir.</p>
        <ul className="ac-cta-tags">
          <li>Déplacement inclus</li>
          <li>Crédit d&apos;impôt de {PCT} %</li>
          <li>Attestation fiscale annuelle</li>
        </ul>
        <div className="ac-actions ac-actions-center">
          <Link href="/rendez-vous" className="btn btn-cta btn-lg"><Icon name="calendar" size={22} /> Prendre rendez-vous</Link>
          <a href={TEL_HREF} className="btn btn-ghost btn-lg"><Icon name="phone" size={22} /> {TELEPHONE}</a>
        </div>
      </Reveal>
    </div>
  );
}
