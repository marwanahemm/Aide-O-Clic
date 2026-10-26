import Icon from '../../components/Icon';
import PageHead from '../../components/PageHead';
import Simulator from '../../components/Simulator';
import { eur } from '../../lib/pricing';
import { getConfig } from '../../lib/config';

export const metadata = { title: 'Simulateur de budget' };
export const dynamic = 'force-dynamic';

export default async function Simulation() {
  const { formules: FORMULES, tarifHoraire: REF, creditImpot: CREDIT_IMPOT, creditImpotPct: PCT } = await getConfig();
  const RESTE = 1 - CREDIT_IMPOT;
  return (
    <div className="ac-subpage">
      <PageHead
        titre="Simulateur de budget"
        sousTitre={`Estimez en quelques secondes ce que vous paierez vraiment, grâce au crédit d'impôt de ${PCT} %.`}
        pastilles={[
          ...FORMULES.slice(0, 3).map((f) => `💶 ${f.nom} : ${eur(f.prix)} (soit ${eur(f.prix * RESTE)} net)`),
          '🚲 Déplacement : 0 €',
        ]}
      />
      <Simulator formules={FORMULES} tarifHoraire={REF} creditImpot={CREDIT_IMPOT} pct={PCT} />
      <div className="callout-box" style={{ marginTop: 28 }}>
        <p>
          <Icon name="euro" size={20} className="inline" /> <strong>Comment fonctionne le crédit d&apos;impôt de {PCT} % ?</strong><br />
          Grâce au dispositif Avance Immédiate du Cesu / Urssaf, vous ne réglez que le montant net ({100 - PCT} % de la prestation). Si vous préférez le paiement classique, {PCT} % du montant dépensé vous sera déduit lors de votre déclaration d&apos;impôt annuelle.
        </p>
      </div>
    </div>
  );
}
