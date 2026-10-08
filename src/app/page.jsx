import Link from 'next/link';
import PageHead, { SectionTitle } from '../components/PageHead';
import { PRIX_HEURE, PRIX_PACK_2H, CREDIT_IMPOT, COMMUNES, eur } from '../lib/pricing';
import { TELEPHONE } from '../lib/site';

export const metadata = { title: 'Assistance Administrative & Informatique à domicile — Agen' };

export default function Accueil() {
  return (
    <>
      <PageHead
        titre="Assistance Administrative & Informatique"
        sousTitre="Accompagnement pédagogique, bienveillant et numérique à domicile — Bassin d'Agen"
        pastilles={[
          '🚲 Déplacements Inclus (Mobilité Douce)',
          "💳 Crédit d'Impôt 50 % Immédiat",
          '👓 Textes Lisibles & Patient',
          '🏛️ Expérience France Travail',
        ]}
      />

      <div className="senior-help-bar" role="region" aria-label="Assistance téléphonique">
        <div className="senior-help-bar-icon" aria-hidden="true">📞</div>
        <div className="senior-help-bar-text">
          Vous préférez échanger directement par téléphone ?<br />
          Appelez-moi sans hésiter au <strong>{TELEPHONE}</strong> (Du lundi au vendredi, 9h-18h).
        </div>
      </div>

      <SectionTitle>1. PRÉSENTATION DE LA MICRO-ENTREPRISE</SectionTitle>
      <div className="callout-box">
        <p>
          <strong>Un accompagnement à domicile humain, patient et accessible à tous.</strong><br />
          Fort d&apos;une expérience de 8 mois en Service Civique à France Travail et titulaire d&apos;une qualification en développement web, je me déplace directement chez vous sur le Bassin d&apos;Agen. Ma priorité est de prendre le temps nécessaire pour vous expliquer chaque étape sans jargon technique, afin que vous retrouviez sérénité et autonomie dans vos démarches.
        </p>
      </div>

      <div className="grid-3">
        <div className="card-item">
          <div className="card-item-header">👴 Pédagogie &amp; Patience</div>
          <p>Un rythme d&apos;apprentissage adapté aux seniors. Des explications claires, une écoute attentive et des fiches mémos simples laissées à votre disposition.</p>
        </div>
        <div className="card-item">
          <div className="card-item-header">🚲 Logistique 100 % Éco</div>
          <p>Interventions à vélo et bus sur Agen et ses communes limitrophes. Aucun frais de déplacement supplémentaire ne vous sera facturé.</p>
        </div>
        <div className="card-item">
          <div className="card-item-header">⚡ Connexion Sécurisée</div>
          <p>Équipement d&apos;appoint avec connexion Internet 5G+ sécurisée en cas de problème de réseau ou d&apos;absence de box WiFi chez vous.</p>
        </div>
      </div>

      <SectionTitle>2. GRILLE TARIFAIRE (SANS FRAIS CACHÉS - 50 % DÉDUCTIBLE)</SectionTitle>
      <div className="pricing-grid">
        <div className="pricing-card">
          <div>
            <h3 className="pricing-title">Forfait 1 Heure — Intervention Ponctuelle</h3>
            <p className="pricing-sub">Idéal pour débloquer une démarche spécifique ou résoudre un problème informatique précis</p>
            <div className="pricing-price">
              <div className="price-gross">{eur(PRIX_HEURE)} <span>brut</span></div>
              <div className="price-net">Coût réel : {eur(PRIX_HEURE * CREDIT_IMPOT)} après Crédit d&apos;Impôt (50 %)</div>
            </div>
            <ul style={{ marginBottom: 20 }}>
              <li>1 heure complète d&apos;accompagnement à domicile</li>
              <li>Déplacements inclus (communes desservies)</li>
              <li>Prise en charge pas-à-pas et explications simples</li>
              <li>Attestation fiscale annuelle fournie</li>
            </ul>
          </div>
          <Link href="/rendez-vous" className="btn-primary" aria-label={`Réserver le forfait 1 heure à ${PRIX_HEURE} euros`}>
            Réserver le Forfait 1h ({eur(PRIX_HEURE * CREDIT_IMPOT)} net)
          </Link>
        </div>

        <div className="pricing-card">
          <div>
            <h3 className="pricing-title">Forfait 2 Heures — Pack Approfondi</h3>
            <p className="pricing-sub">Pour un dossier complexe, une formation à votre rythme ou une installation complète</p>
            <div className="pricing-price">
              <div className="price-gross">{eur(PRIX_PACK_2H)} <span>brut</span></div>
              <div className="price-net">Coût réel : {eur(PRIX_PACK_2H * CREDIT_IMPOT)} après Crédit d&apos;Impôt (soit {eur((PRIX_PACK_2H * CREDIT_IMPOT) / 2)}/h net)</div>
            </div>
            <ul style={{ marginBottom: 20 }}>
              <li>2 heures consécutives à votre domicile</li>
              <li>Diagnostic complet + prise en main guidée</li>
              <li>Réduction de {PRIX_HEURE * 2 - PRIX_PACK_2H} € par rapport au tarif standard</li>
              <li>Rédaction d&apos;un guide sur-mesure si besoin</li>
            </ul>
          </div>
          <Link href="/rendez-vous" className="btn-primary" aria-label={`Réserver le forfait 2 heures à ${PRIX_PACK_2H} euros`}>
            Réserver le Forfait 2h ({eur(PRIX_PACK_2H * CREDIT_IMPOT)} net)
          </Link>
        </div>
      </div>

      <SectionTitle>3. CATALOGUE DÉTAILLÉ DES PRESTATIONS</SectionTitle>
      <div className="grid-2">
        <div className="card-item">
          <div className="card-item-header" style={{ color: 'var(--cyan-accent)' }}>📝 Assistance Administrative à Domicile</div>
          <p style={{ marginBottom: 12, fontWeight: 700, fontSize: 15 }}>Accompagnement complet sur vos démarches du quotidien :</p>
          <ul>
            <li><strong>Démarches en ligne :</strong> CAF, France Travail, Ameli / CPAM, Déclaration d&apos;impôts, CARSAT / Retraite, ANTS (Carte grise, identité).</li>
            <li><strong>Gestion de courriers :</strong> Rédaction, mise en forme et envoi de lettres officielles ou administratives.</li>
            <li><strong>Organisation &amp; Classement :</strong> Rangement de vos factures, documents de santé et création d&apos;un dossier numérique sécurisé.</li>
            <li><strong>Comptes personnels :</strong> Création et gestion simplifiée de vos identifiants (FranceConnect) et mots de passe en toute sécurité.</li>
          </ul>
        </div>
        <div className="card-item">
          <div className="card-item-header" style={{ color: 'var(--cyan-accent)' }}>💻 Assistance &amp; Pédagogie Informatique</div>
          <p style={{ marginBottom: 12, fontWeight: 700, fontSize: 15 }}>Installation, prise en main et dépannage doux :</p>
          <ul>
            <li><strong>Matériel &amp; Réseau :</strong> Configuration de votre box Internet (WiFi), imprimante, ordinateur portable, tablette ou smartphone.</li>
            <li><strong>Initiation Senior :</strong> Apprendre à envoyer des e-mails, effectuer un appel vidéo avec vos proches (WhatsApp) et naviguer sans risque.</li>
            <li><strong>Sécurité &amp; Nettoyage :</strong> Protection contre les arnaques Internet, suppression des fenêtres publicitaires et sécurisation de l&apos;appareil.</li>
            <li><strong>Sauvegarde de souvenirs :</strong> Transfert de vos photos familiales et documents sur clé USB ou disque dur externe.</li>
          </ul>
        </div>
      </div>

      <SectionTitle>4. ZONE D&apos;INTERVENTION (BASSIN D&apos;AGEN)</SectionTitle>
      <div className="card-item">
        <div className="card-item-header">📍 Communes desservies sans aucun frais de déplacement</div>
        <p style={{ marginBottom: 12, fontSize: 14 }}>Je me déplace directement chez vous dans les communes suivantes :</p>
        <div>
          {COMMUNES.map((c) => <span key={c} className="commune-badge">{c}</span>)}
        </div>
      </div>
    </>
  );
}
