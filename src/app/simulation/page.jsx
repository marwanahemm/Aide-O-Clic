import Icon from '../../components/Icon';
import PageHead from '../../components/PageHead';
import Simulator from '../../components/Simulator';
import { eur } from '../../lib/pricing';
import { getConfig } from '../../lib/config';

export const metadata = { title: 'Simulateur de budget' };
export const dynamic = 'force-dynamic';

export default async function Simulation() {
  const { prixHeure: PRIX_HEURE, prixPack2h: PRIX_PACK_2H, creditImpot: CREDIT_IMPOT, creditImpotPct: PCT } = await getConfig();
  const RESTE = 1 - CREDIT_IMPOT;
  return (
    <>
      <PageHead
        titre="Simulateur de budget"
        sousTitre={`Estimez en quelques secondes ce que vous paierez vraiment, grâce au crédit d'impôt de ${PCT} %.`}
        pastilles={[
          `💶 Forfait 1h : ${eur(PRIX_HEURE)} (soit ${eur(PRIX_HEURE * RESTE)} net)`,
          `⚡ Forfait 2h : ${eur(PRIX_PACK_2H)} (soit ${eur(PRIX_PACK_2H * RESTE)} net)`,
          '🚲 Déplacement : 0 €',
        ]}
      />
      <Simulator prixHeure={PRIX_HEURE} prixPack2h={PRIX_PACK_2H} creditImpot={CREDIT_IMPOT} pct={PCT} />
      <div className="callout-box" style={{ marginTop: 28 }}>
        <p>
          <Icon name="euro" size={20} className="inline" /> <strong>Comment fonctionne le crédit d&apos;impôt de {PCT} % ?</strong><br />
          Grâce au dispositif Avance Immédiate du Cesu / Urssaf, vous ne réglez que le montant net ({100 - PCT} % de la prestation). Si vous préférez le paiement classique, {PCT} % du montant dépensé vous sera déduit lors de votre déclaration d&apos;impôt annuelle.
        </p>
      </div>
    </>
  );
}
