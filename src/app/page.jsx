import Link from 'next/link';
import Icon from '../components/Icon';
import HeroArt from '../components/HeroArt';
import { eur } from '../lib/pricing';
import { getConfig } from '../lib/config';
import { NOM_SITE } from '../lib/site';

export const dynamic = 'force-dynamic'; // les tarifs, communes et coordonnées viennent du back-office

export default async function Accueil() {
  const {
    prixHeure: PRIX_HEURE, prixPack2h: PRIX_PACK_2H, creditImpot: CREDIT_IMPOT, creditImpotPct: PCT,
    communes: COMMUNES, telephone: TELEPHONE, telephoneHref: TEL_HREF, annulationHeures: HEURES,
  } = await getConfig();
  const RESTE = 1 - CREDIT_IMPOT; // part payée par le client après crédit d'impôt

  return (
    <>
      {/* ===== Héros ===== */}
      <section className="hero" aria-labelledby="titre-accueil">
        <div>
          <p className="hero-eyebrow"><Icon name="sparkle" size={18} /> {NOM_SITE} · Services à la personne · Bassin d&apos;Agen</p>
          <h1 id="titre-accueil">Votre assistant <em>administratif et informatique</em>, chez vous.</h1>
          <p className="hero-lead">Démarches en ligne, ordinateur, tablette, smartphone… Je me déplace à votre domicile et je prends le temps de tout vous expliquer, sans jargon.</p>
          <div className="hero-actions">
            <Link href="/rendez-vous" className="btn btn-cta btn-lg"><Icon name="calendar" size={22} /> Prendre rendez-vous</Link>
            <a href={TEL_HREF} className="btn btn-outline-light btn-lg"><Icon name="phone" size={22} /> {TELEPHONE}</a>
          </div>
          <ul className="trust-list">
            <li><Icon name="check" size={20} /> Crédit d&apos;impôt de {PCT} %</li>
            <li><Icon name="check" size={20} /> Déplacement inclus</li>
            <li><Icon name="check" size={20} /> Patience et pas de jargon</li>
          </ul>
        </div>
        <div className="hero-art"><HeroArt pct={PCT} /></div>
      </section>

      {/* ===== Comment ça marche ===== */}
      <section className="section" aria-labelledby="t-etapes">
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
      </section>

      {/* ===== Prestations ===== */}
      <section className="section" aria-labelledby="t-prestations">
        <div className="section-head">
          <span className="kicker">Ce que je fais pour vous</span>
          <h2 id="t-prestations">Deux domaines d&apos;aide, à la maison</h2>
        </div>
        <div className="grid-2">
          <article className="service-card">
            <div className="service-icon"><Icon name="file" size={28} /></div>
            <h3>Assistance administrative</h3>
            <p className="lead">Un accompagnement complet sur vos démarches du quotidien.</p>
            <ul className="check-list">
              <li><strong>Démarches en ligne :</strong> CAF, France Travail, Ameli / CPAM, déclaration d&apos;impôts, CARSAT / retraite, ANTS (carte grise, identité).</li>
              <li><strong>Gestion de courriers :</strong> rédaction, mise en forme et envoi de lettres officielles ou administratives.</li>
              <li><strong>Organisation &amp; classement :</strong> rangement de vos factures, documents de santé et création d&apos;un dossier numérique sécurisé.</li>
              <li><strong>Comptes personnels :</strong> création et gestion simplifiée de vos identifiants (FranceConnect) et mots de passe en toute sécurité.</li>
            </ul>
          </article>
          <article className="service-card">
            <div className="service-icon"><Icon name="laptop" size={28} /></div>
            <h3>Assistance informatique</h3>
            <p className="lead">Installation, prise en main et dépannage tout en douceur.</p>
            <ul className="check-list">
              <li><strong>Matériel &amp; réseau :</strong> configuration de votre box Internet (Wi-Fi), imprimante, ordinateur portable, tablette ou smartphone.</li>
              <li><strong>Initiation :</strong> apprendre à envoyer des e-mails, faire un appel vidéo avec vos proches (WhatsApp) et naviguer sans risque.</li>
              <li><strong>Sécurité &amp; nettoyage :</strong> protection contre les arnaques Internet, suppression des fenêtres publicitaires, appareil sécurisé.</li>
              <li><strong>Sauvegarde de souvenirs :</strong> transfert de vos photos familiales et documents sur clé USB ou disque dur externe.</li>
            </ul>
          </article>
        </div>
      </section>

      {/* ===== Engagements ===== */}
      <section className="section" aria-labelledby="t-engagements">
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
      </section>

      {/* ===== À propos ===== */}
      <section className="section" aria-labelledby="t-apropos">
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
      </section>

      {/* ===== Tarifs ===== */}
      <section className="section" aria-labelledby="t-tarifs" id="tarifs">
        <div className="section-head center">
          <span className="kicker">Tarifs clairs</span>
          <h2 id="t-tarifs">Sans frais cachés, {PCT} % déductibles</h2>
          <p className="lead">Le prix affiché est celui de l&apos;intervention, déplacement compris.</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <div>
              <h3 className="pricing-title">Forfait 1 heure</h3>
              <p className="pricing-sub">Intervention ponctuelle : débloquer une démarche précise ou résoudre un problème informatique.</p>
              <div className="pricing-price">
                <div className="price-gross">{eur(PRIX_HEURE)} <span>brut</span></div>
                <div className="price-net">Coût réel : {eur(PRIX_HEURE * RESTE)} après crédit d&apos;impôt ({PCT} %)</div>
              </div>
              <ul className="check-list" style={{ marginBottom: 24 }}>
                <li>1 heure complète d&apos;accompagnement à domicile</li>
                <li>Déplacement inclus (communes desservies)</li>
                <li>Prise en charge pas à pas, explications simples</li>
                <li>Attestation fiscale annuelle fournie</li>
              </ul>
            </div>
            <Link href="/rendez-vous" className="btn btn-primary" aria-label={`Réserver le forfait 1h, ${PRIX_HEURE} euros brut`}>
              Réserver le forfait 1h <Icon name="arrow" size={20} />
            </Link>
          </div>

          <div className="pricing-card featured">
            <span className="ribbon">Le plus avantageux à l&apos;heure</span>
            <div>
              <h3 className="pricing-title">Forfait 2 heures — pack approfondi</h3>
              <p className="pricing-sub">Pour un dossier complexe, une formation à votre rythme ou une installation complète.</p>
              <div className="pricing-price">
                <div className="price-gross">{eur(PRIX_PACK_2H)} <span>brut</span></div>
                <div className="price-net">Coût réel : {eur(PRIX_PACK_2H * RESTE)} après crédit d&apos;impôt (soit {eur((PRIX_PACK_2H * RESTE) / 2)}/h)</div>
              </div>
              <ul className="check-list" style={{ marginBottom: 24 }}>
                <li>2 heures consécutives à votre domicile</li>
                <li>Diagnostic complet + prise en main guidée</li>
                <li>Réduction de {eur(PRIX_HEURE * 2 - PRIX_PACK_2H)} par rapport au tarif standard</li>
                <li>Rédaction d&apos;un guide sur mesure si besoin</li>
              </ul>
            </div>
            <Link href="/rendez-vous" className="btn btn-cta" aria-label={`Réserver le forfait 2h, ${PRIX_PACK_2H} euros brut`}>
              Réserver le forfait 2h <Icon name="arrow" size={20} />
            </Link>
          </div>
        </div>
        <p className="pricing-note">
          Besoin d&apos;un autre volume d&apos;heures ? <Link href="/simulation">Calculez votre budget</Link> · <Link href="/annulation-remboursement">Conditions d&apos;annulation et de remboursement</Link>
        </p>
      </section>

      {/* ===== Zone ===== */}
      <section className="section" aria-labelledby="t-zone">
        <div className="zone">
          <div className="zone-icon"><Icon name="pin" size={34} /></div>
          <div>
            <h3 id="t-zone">Je me déplace chez vous, sans frais</h3>
            <p>Communes desservies sur le Bassin d&apos;Agen :</p>
            <div>{COMMUNES.map((c) => <span key={c} className="commune-badge">{c}</span>)}</div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="section" aria-labelledby="t-faq">
        <div className="section-head center">
          <span className="kicker">Questions fréquentes</span>
          <h2 id="t-faq">Vous vous demandez peut-être…</h2>
        </div>
        <div className="faq">
          <details>
            <summary>Comment fonctionne le crédit d&apos;impôt de {PCT} % ? <Icon name="chevron" size={22} /></summary>
            <div className="faq-body">Grâce au dispositif Avance Immédiate du Cesu / Urssaf, vous ne réglez que le montant net ({100 - PCT} % de la prestation). Si vous préférez le paiement classique, {PCT} % du montant dépensé vous sera déduit lors de votre déclaration d&apos;impôt annuelle. <Link href="/simulation">Estimer mon reste à charge</Link></div>
          </details>
          <details>
            <summary>Y a-t-il des frais de déplacement ? <Icon name="chevron" size={22} /></summary>
            <div className="faq-body">Non : le déplacement est inclus dans les communes desservies ({COMMUNES.join(', ')}). Aucun supplément ne vous sera facturé.</div>
          </details>
          <details>
            <summary>Je n&apos;ai pas Internet chez moi, est-ce un problème ? <Icon name="chevron" size={22} /></summary>
            <div className="faq-body">Pas du tout : je viens avec un équipement d&apos;appoint et une connexion Internet 5G+ sécurisée pour pouvoir avancer sur vos démarches.</div>
          </details>
          <details>
            <summary>Comment réserver ? <Icon name="chevron" size={22} /></summary>
            <div className="faq-body">En ligne, <Link href="/rendez-vous">en choisissant une date et un créneau</Link>, ou simplement par téléphone au <a href={TEL_HREF}>{TELEPHONE}</a>.</div>
          </details>
          <details>
            <summary>Et si je dois annuler ou reporter ? <Icon name="chevron" size={22} /></summary>
            <div className="faq-body">{HEURES > 0 ? `C’est sans frais jusqu’à ${HEURES} heures avant le rendez-vous. ` : 'C’est sans frais, à tout moment. '}Vous disposez aussi d&apos;un droit de rétractation de 14 jours. <Link href="/annulation-remboursement">Voir toutes les conditions</Link></div>
          </details>
          <details>
            <summary>Mes données sont-elles protégées ? <Icon name="chevron" size={22} /></summary>
            <div className="faq-body">Vos informations servent uniquement à traiter votre demande et ne sont jamais revendues. <Link href="/politique-de-confidentialite">Lire la politique de confidentialité</Link></div>
          </details>
        </div>
      </section>

      {/* ===== Appel à l'action ===== */}
      <section className="cta-band" aria-labelledby="t-cta">
        <h2 id="t-cta">Prêt à vous faire aider ?</h2>
        <p>Une question avant de vous lancer ? Appelez-moi : je vous réponds avec plaisir.</p>
        <div className="hero-actions">
          <Link href="/rendez-vous" className="btn btn-cta btn-lg"><Icon name="calendar" size={22} /> Prendre rendez-vous</Link>
          <a href={TEL_HREF} className="btn btn-outline-light btn-lg"><Icon name="phone" size={22} /> {TELEPHONE}</a>
        </div>
      </section>
    </>
  );
}
