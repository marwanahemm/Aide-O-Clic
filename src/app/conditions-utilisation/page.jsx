import Link from 'next/link';
import PageHead, { SectionTitle } from '../../components/PageHead';
import { getConfig } from '../../lib/config';
import { NOM_SITE } from '../../lib/site';

export const metadata = { title: 'Conditions d’utilisation du site' };
export const dynamic = 'force-dynamic';

export default async function Conditions() {
  const { editeur: EDITEUR, email: EMAIL, telephone: TELEPHONE, dateMajLegal: DATE_MAJ_LEGAL } = await getConfig();
  return (
    <div className="legal">
      <PageHead
        titre="Conditions d’utilisation du site"
        sousTitre="Les règles simples d’utilisation de ce site et de la prise de rendez-vous en ligne"
        pastilles={['📄 Langage clair', '🇫🇷 Droit français', `🗓️ Mise à jour : ${DATE_MAJ_LEGAL}`]}
      />

      <SectionTitle>CONDITIONS D’UTILISATION</SectionTitle>

      <div className="card-item">
        <h3 className="card-item-header">1. Objet</h3>
        <p>Ce site présente les services d’assistance administrative et informatique à domicile proposés par <strong>{EDITEUR.nom}</strong> ({EDITEUR.statut}), sous le nom commercial <strong>{NOM_SITE}</strong>, et permet de simuler un budget, de demander un rendez-vous et d’envoyer un message. En l’utilisant, vous acceptez les présentes conditions. Les informations sur l’éditeur figurent dans les <Link href="/mentions-legales">mentions légales</Link>.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">2. Accès au site</h3>
        <p>L’accès au site est gratuit ; les frais de connexion Internet restent à votre charge. Je m’efforce de le garder accessible en permanence, mais il peut être interrompu pour maintenance, mise à jour ou panne, sans que cela ouvre droit à une indemnité.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">3. Demande de rendez-vous et conclusion du contrat</h3>
        <p>Le formulaire de rendez-vous est une <strong>demande</strong> : elle ne vous engage pas et ne me réserve pas définitivement à votre domicile tant que je ne l’ai pas confirmée (par téléphone ou par e-mail). Le contrat de prestation est conclu au moment de cette confirmation.</p>
        <p>Les conditions d’annulation, de rétractation (14 jours) et de remboursement sont détaillées dans la page <Link href="/annulation-remboursement">Annulation, rétractation et remboursement</Link>. Vous les acceptez en cochant la case prévue dans le formulaire.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">4. Tarifs et simulateur</h3>
        <p>Les tarifs affichés sont ceux en vigueur au moment de votre visite. Le simulateur de budget donne une estimation indicative et non contractuelle : seuls le devis ou la facture établis avant ou après l’intervention font foi. Le crédit d’impôt dépend de votre situation fiscale et de la réglementation en vigueur.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">5. Vos engagements</h3>
        <ul>
          <li>fournir des informations exactes et à jour dans les formulaires ;</li>
          <li>ne pas y saisir de données sensibles (mot de passe, numéro de sécurité sociale, information de santé) ;</li>
          <li>ne pas perturber le site : envois automatisés, tentatives d’intrusion, surcharge volontaire ou usage détourné sont interdits et peuvent être signalés aux autorités.</li>
        </ul>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">6. Propriété intellectuelle</h3>
        <p>Les textes, la mise en page, les éléments graphiques et le nom du site sont la propriété de l’éditeur. Toute reproduction ou réutilisation sans mon autorisation écrite est interdite.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">7. Données personnelles et cookies</h3>
        <p>Vos données sont traitées comme décrit dans la <Link href="/politique-de-confidentialite">politique de confidentialité</Link> et la <Link href="/politique-de-cookies">politique de cookies</Link>.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">8. Responsabilité</h3>
        <p>Ce site n’est pas un site officiel et n’est affilié à aucun organisme public ; il ne remplace pas leurs informations officielles. Je m’efforce de publier des informations exactes, sans pouvoir garantir l’absence totale d’erreur. Je ne suis pas responsable du contenu des sites vers lesquels un lien pourrait renvoyer.</p>
        <p>Aucune stipulation de ces conditions ne limite les droits que la loi vous reconnaît en tant que consommateur.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">9. Modification des conditions</h3>
        <p>Je peux modifier ces conditions pour les adapter à l’évolution du site ou de la loi. La version applicable est celle publiée à la date de votre visite ; la date de dernière mise à jour figure en haut de page.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">10. Droit applicable et litiges</h3>
        <p>Ces conditions sont soumises au droit français. En cas de difficulté, contactez-moi d’abord : {TELEPHONE} — <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. Si le litige persiste, vous pouvez recourir gratuitement au médiateur de la consommation (voir <Link href="/annulation-remboursement">Annulation, rétractation et remboursement</Link>) ou saisir la juridiction compétente selon les règles légales applicables.</p>
        <p>Dernière mise à jour : {DATE_MAJ_LEGAL}.</p>
      </div>
    </div>
  );
}
