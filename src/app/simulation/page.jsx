import Link from 'next/link';
import PageHead, { SectionTitle } from '../../components/PageHead';
import Simulator from '../../components/Simulator';
import { PRIX_HEURE, PRIX_PACK_2H, CREDIT_IMPOT, eur } from '../../lib/pricing';

export const metadata = { title: 'Simulateur de Budget — Assistance à domicile Agen' };

export default function Simulation() {
  return (
    <>
      <PageHead
        titre="Simulateur de Budget sur-mesure"
        sousTitre="Estimez instantanément le coût réel de votre intervention grâce au crédit d'impôt de 50 %"
        pastilles={[
          `💶 Forfait 1h : ${eur(PRIX_HEURE)} (soit ${eur(PRIX_HEURE * CREDIT_IMPOT)} net)`,
          `⚡ Forfait 2h : ${eur(PRIX_PACK_2H)} (soit ${eur(PRIX_PACK_2H * CREDIT_IMPOT)} net)`,
          '🚲 Déplacements 0 €',
        ]}
      />
      <SectionTitle>CALCULEZ DE MANIÈRE DYNAMIQUE VOTRE RESTE À CHARGE</SectionTitle>
      <Simulator />
      <div className="callout-box">
        <p>
          💳 <strong>Comment fonctionne le Crédit d&apos;Impôt de 50 % ?</strong><br />
          Grâce au dispositif Avance Immédiate du Cesu / Urssaf, vous ne réglez que le montant net (50 % de la prestation). Si vous préférez le paiement classique, 50 % du montant dépensé vous sera déduit lors de votre déclaration d&apos;impôt annuelle.
        </p>
      </div>
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <Link href="/rendez-vous" className="btn-primary" style={{ maxWidth: 320 }}>Réserver une date d&apos;intervention</Link>
      </div>
    </>
  );
}
