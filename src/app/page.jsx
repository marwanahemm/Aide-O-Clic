import Link from 'next/link';
import Icon from '../components/Icon';
import QuickBooking from '../components/QuickBooking';
import Reveal from '../components/Reveal';
import CountUp from '../components/CountUp';
import Catalogue from '../components/Catalogue';
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

  return (
    <>
      {/* ===== Bandeau d'accueil : texte à gauche, réservation rapide à droite ===== */}
      <section className="hero2" aria-labelledby="titre-accueil">
        <div>
          <p className="hero2-eyebrow"><Icon name="sparkle" size={18} /> {NOM_SITE} · Services à la personne · Bassin d&apos;Agen</p>
          <h1 id="titre-accueil">Votre assistant <em>administratif et informatique</em>, chez vous.</h1>
          <p className="hero2-lead">Démarches en ligne, ordinateur, tablette, smartphone… Je me déplace à votre domicile et je prends le temps de tout vous expliquer, sans jargon.</p>
          <div className="hero-actions">
            <Link href="/rendez-vous" className="btn btn-cta btn-lg"><Icon name="calendar" size={22} /> Prendre rendez-vous</Link>
            <a href={TEL_HREF} className="btn btn-ghost btn-lg"><Icon name="phone" size={22} /> {TELEPHONE}</a>
          </div>
          <ul className="trust-list">
            <li><Icon name="check" size={20} /> Crédit d&apos;impôt de {PCT} %</li>
            <li><Icon name="check" size={20} /> Déplacement inclus</li>
            <li><Icon name="check" size={20} /> Patience et pas de jargon</li>
          </ul>
        </div>
        <QuickBooking creneaux={CRENEAUX} />
      </section>

      {/* ===== Chiffres clés ===== */}
      <Reveal as="section" className="stats" aria-label="Chiffres clés">
        <div className="stat"><strong><CountUp fin={PCT} suffixe=" %" /></strong><span>de crédit d&apos;impôt</span></div>
        <div className="stat"><strong>0 €</strong><span>de frais de déplacement</span></div>
        <div className="stat"><strong><CountUp fin={COMMUNES.length} /></strong><span>communes desservies</span></div>
        <div className="stat"><strong>dès <CountUp fin={MIN_NET_HEURE} decimales={2} suffixe=" €" />/h</strong><span>après crédit d&apos;impôt</span></div>
      </Reveal>

      {/* ===== Comment ça marche ===== */}
      <Reveal as="section" className="section" aria-labelledby="t-etapes">
        <div className="section-head center">
          <span className="kicker">Simple comme un clic</span>
          <h2 id="t-etapes">Comment ça se passe ?</h2>
          <p className="lead">Trois étapes, et vous n&apos;avez rien à installer ni à préparer.</p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step-num" aria-hidden="true">1</span>
            <h3>Vous choisissez un moment</h3>
            <p>En ligne en quelques clics, ou par téléphone si vous préférez : on fixe ensemble le jour et le créneau qui vous conviennent.</p>
          </div>
          <div className="step">
            <span className="step-num" aria-hidden="true">2</span>
            <h3>Je viens chez vous</h3>
            <p>Je me déplace à votre domicile, à vélo ou en bus, avec ce qu&apos;il faut. Nous avançons à votre rythme, pas à pas.</p>
          </div>
          <div className="step">
            <span className="step-num" aria-hidden="true">3</span>
            <h3>Vous ne payez que {100 - PCT} %</h3>
            <p>Grâce au crédit d&apos;impôt de {PCT} %, votre coût réel est divisé. Une attestation fiscale annuelle vous est remise.</p>
          </div>
        </div>
      </Reveal>

      {/* ===== Prestations (catalogue modifiable dans le back-office) ===== */}
      {CATALOGUE.length > 0 && (
        <Reveal as="section" className="section" aria-labelledby="t-prestations">
          <div className="section-head center">
            <span className="kicker">Ce que je fais pour vous</span>
            <h2 id="t-prestations">Mes prestations, à la maison</h2>
            <p className="lead">Choisissez un domaine et découvrez, en détail, tout ce que je peux faire chez vous.</p>
          </div>
          <Catalogue catalogue={CATALOGUE} />
        </Reveal>
      )}

      {/* ===== Engagements ===== */}
      <Reveal as="section" className="section" aria-labelledby="t-engagements">
        <div className="section-head center">
          <span className="kicker">Mes engagements</span>
          <h2 id="t-engagements">Une aide pensée pour vous mettre à l&apos;aise</h2>
        </div>
        <div className="grid-3">
          <div className="feature">
            <div className="service-icon"><Icon name="heart" size={26} /></div>
            <h3>Pédagogie &amp; patience</h3>
            <p>Un rythme d&apos;apprentissage adapté aux seniors. Des explications claires, une écoute attentive et des fiches mémos simples laissées à votre disposition.</p>
          </div>
          <div className="feature">
            <div className="service-icon"><Icon name="bike" size={26} /></div>
            <h3>Logistique 100 % éco</h3>
            <p>Interventions à vélo et en bus sur Agen et ses communes limitrophes. Aucun frais de déplacement supplémentaire ne vous sera facturé.</p>
          </div>
          <div className="feature">
            <div className="service-icon"><Icon name="wifi" size={26} /></div>
            <h3>Connexion sécurisée</h3>
            <p>Équipement d&apos;appoint avec connexion Internet 5G+ sécurisée, en cas de problème de réseau ou d&apos;absence de box Wi-Fi chez vous.</p>
          </div>
        </div>
      </Reveal>

      {/* ===== À propos ===== */}
      <Reveal as="section" className="section" aria-labelledby="t-apropos">
        <div className="about">
          <div className="about-text">
            <span className="kicker">Qui suis-je ?</span>
            <h3 id="t-apropos">Un accompagnement humain, patient et accessible à tous</h3>
            <p>Fort d&apos;une expérience de 8 mois en Service Civique à France Travail et titulaire d&apos;une qualification en développement web, je me déplace directement chez vous sur le Bassin d&apos;Agen. Ma priorité : prendre le temps nécessaire pour vous expliquer chaque étape sans jargon technique, afin que vous retrouviez sérénité et autonomie dans vos démarches.</p>
          </div>
          <div className="about-facts">
            <div className="fact"><Icon name="user" size={28} /><div><strong>8 mois à France Travail</strong><span>Service Civique</span></div></div>
            <div className="fact"><Icon name="laptop" size={28} /><div><strong>Qualification web</strong><span>Développement web</span></div></div>
            <div className="fact"><Icon name="pin" size={28} /><div><strong>Bassin d&apos;Agen</strong><span>Je viens chez vous</span></div></div>
          </div>
        </div>
      </Reveal>

      {/* ===== Tarifs ===== */}
      <Reveal as="section" className="section" aria-labelledby="t-tarifs" id="tarifs">
        <div className="section-head center">
          <span className="kicker">Tarifs clairs</span>
          <h2 id="t-tarifs">Sans frais cachés, {PCT} % déductibles</h2>
          <p className="lead">Le prix affiché est celui de l&apos;intervention, déplacement compris.</p>
        </div>
        <div className="pricing-grid">
          {FORMULES.map((f) => {
            const reduction = reductionFormule(f, REF);
            return (
              <div key={f.nom} className={'pricing-card' + (f.badge ? ' featured' : '')}>
                {f.badge && <span className="ribbon">{f.badge}</span>}
                <div>
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

      {/* ===== Zone ===== */}
      <Reveal as="section" className="section" aria-labelledby="t-zone">
        <div className="zone">
          <div className="zone-icon"><Icon name="pin" size={34} /></div>
          <div>
            <h3 id="t-zone">Je me déplace chez vous, sans frais</h3>
            <p>Communes desservies sur le Bassin d&apos;Agen :</p>
            <div>{COMMUNES.map((c) => <span key={c} className="commune-badge">{c}</span>)}</div>
          </div>
        </div>
      </Reveal>

      {/* ===== FAQ (modifiable dans le back-office) ===== */}
      {FAQ.length > 0 && (
        <Reveal as="section" className="section" aria-labelledby="t-faq">
          <div className="section-head center">
            <span className="kicker">Questions fréquentes</span>
            <h2 id="t-faq">Vous vous demandez peut-être…</h2>
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

      {/* ===== Appel à l'action ===== */}
      <Reveal as="section" className="cta-band" aria-labelledby="t-cta">
        <h2 id="t-cta">Prêt à vous faire aider ?</h2>
        <p>Une question avant de vous lancer ? Appelez-moi : je vous réponds avec plaisir.</p>
        <div className="hero-actions">
          <Link href="/rendez-vous" className="btn btn-cta btn-lg"><Icon name="calendar" size={22} /> Prendre rendez-vous</Link>
          <a href={TEL_HREF} className="btn btn-outline-light btn-lg"><Icon name="phone" size={22} /> {TELEPHONE}</a>
        </div>
      </Reveal>
    </>
  );
}
