import PageHead, { SectionTitle } from '../../components/PageHead';
import { getConfig } from '../../lib/config';

export const metadata = { title: 'Annulation, rétractation et remboursement' };
export const dynamic = 'force-dynamic';

export default async function AnnulationRemboursement() {
  const {
    editeur: EDITEUR, email: EMAIL, telephone: TELEPHONE, dateMajLegal: DATE_MAJ_LEGAL, annulationHeures: HEURES,
  } = await getConfig();
  return (
    <div className="legal">
      <PageHead
        titre="Annulation, rétractation et remboursement"
        sousTitre="Vos droits si vous devez annuler, reporter ou renoncer à une intervention"
        pastilles={[
          '↩️ Rétractation sous 14 jours',
          HEURES > 0 ? `⏱️ Annulation sans frais jusqu’à ${HEURES} h avant` : '⏱️ Annulation sans frais',
          '💶 Remboursement sous 14 jours',
        ]}
      />

      <SectionTitle>VOS DROITS EN CAS D’ANNULATION</SectionTitle>

      <div className="card-item">
        <h3 className="card-item-header">1. Annuler ou reporter un rendez-vous</h3>
        <p>Prévenez-moi le plus tôt possible par téléphone au <strong>{TELEPHONE}</strong> ou par e-mail à <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. Un rendez-vous annulé libère immédiatement le créneau.</p>
        {HEURES > 0 ? (
          <p>L’annulation ou le report est <strong>sans frais jusqu’à {HEURES} heures avant le début</strong> de l’intervention. Au-delà, et sauf cas de force majeure (maladie, hospitalisation, urgence familiale), la première heure du rendez-vous peut être facturée au tarif en vigueur.</p>
        ) : (
          <p>L’annulation ou le report est <strong>sans frais, à tout moment</strong>.</p>
        )}
        <p>Si c’est moi qui dois annuler (imprévu), je vous préviens dès que possible et je vous propose un autre créneau. Aucune somme n’est alors due.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">2. Droit de rétractation de 14 jours</h3>
        <p>Si vous êtes un consommateur et que vous avez réservé à distance (site, téléphone, e-mail) ou à votre domicile, vous disposez de <strong>14 jours calendaires</strong> pour vous rétracter, sans avoir à donner de motif (article L221-18 du Code de la consommation). Le délai court à partir de la conclusion du contrat, c’est-à-dire de la confirmation de votre rendez-vous.</p>
        <p>Pour vous rétracter, il suffit de me faire part de votre décision de façon claire : par e-mail à <a href={`mailto:${EMAIL}`}>{EMAIL}</a> (recommandé, pour garder une trace), par courrier à {EDITEUR.adresse}, ou par téléphone. Vous pouvez utiliser le modèle de formulaire ci-dessous, sans obligation. Il suffit d’envoyer votre décision avant la fin du délai de 14 jours.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">3. Intervention avant la fin du délai de rétractation</h3>
        <p>Quand le rendez-vous a lieu avant la fin des 14 jours, vous me demandez expressément de réaliser l’intervention dans ce délai : c’est le sens de la case à cocher du formulaire de rendez-vous. Dans ce cas :</p>
        <ul>
          <li>si vous vous rétractez après le début de l’intervention, vous payez un montant proportionnel à ce qui a été fourni jusqu’au moment où vous m’avez informé de votre décision (article L221-25) ;</li>
          <li>si l’intervention est entièrement réalisée avec votre accord préalable exprès et votre renoncement à ce droit, vous ne pouvez plus vous rétracter (article L221-28).</li>
        </ul>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">4. Remboursement</h3>
        <p>Si vous vous rétractez, ou si une somme vous est due, je vous rembourse <strong>au plus tard 14 jours</strong> après avoir été informé de votre décision (article L221-24), par le même moyen de paiement que celui que vous avez utilisé, sauf si vous convenez d’un autre moyen avec moi, et sans frais pour vous. Si rien n’a encore été payé, rien n’est dû.</p>
        <p>L’avantage fiscal (crédit d’impôt ou avance immédiate) ne porte que sur les sommes effectivement dues pour des prestations réalisées : une intervention annulée ou remboursée n’ouvre pas droit au crédit d’impôt.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">5. Intervention qui ne vous satisfait pas</h3>
        <p>Si l’intervention ne correspond pas à ce qui était convenu, écrivez-moi (e-mail ou courrier) en décrivant la difficulté : je reviens vers vous rapidement pour trouver une solution — nouvelle intervention, geste commercial ou remboursement partiel ou total selon la situation.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">6. Médiation de la consommation</h3>
        <p>Si un désaccord persiste après votre réclamation écrite, vous pouvez recourir gratuitement au médiateur de la consommation : {EDITEUR.mediateur}.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">7. Prix et règlement</h3>
        <p>Les prix sont indiqués en euros, par heure d’intervention, déplacement inclus dans les communes desservies. {EDITEUR.tva}. Le règlement est dû à l’issue de l’intervention, selon les modalités indiquées sur la facture.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">8. Modèle de formulaire de rétractation</h3>
        <p>À l’attention de {EDITEUR.nom}, {EDITEUR.adresse}, <a href={`mailto:${EMAIL}`}>{EMAIL}</a> :</p>
        <p>Je vous notifie par la présente ma rétractation du contrat portant sur la prestation de services ci-dessous :</p>
        <ul>
          <li>Prestation commandée le (*) : …………………………</li>
          <li>Nom du ou des consommateurs : …………………………</li>
          <li>Adresse du ou des consommateurs : …………………………</li>
          <li>Date : …………………………</li>
          <li>Signature (uniquement en cas de notification sur papier) : …………………………</li>
        </ul>
        <p style={{ fontSize: 13 }}>(*) Date de confirmation de votre rendez-vous.</p>
        <p>Dernière mise à jour : {DATE_MAJ_LEGAL}.</p>
      </div>
    </div>
  );
}
