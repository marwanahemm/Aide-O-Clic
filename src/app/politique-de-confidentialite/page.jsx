import Link from 'next/link';
import PageHead, { SectionTitle } from '../../components/PageHead';
import { RETENTION_RDV_MOIS, RETENTION_CONTACT_MOIS, RETENTION_CLIENT_MOIS } from '../../lib/site';
import { getConfig } from '../../lib/config';
import { NOM_SITE } from '../../lib/site';

export const metadata = { title: 'Politique de confidentialité' };
export const dynamic = 'force-dynamic';

export default async function Confidentialite() {
  const { editeur: EDITEUR, email: EMAIL, telephone: TELEPHONE, dateMajLegal: DATE_MAJ_LEGAL } = await getConfig();
  return (
    <div className="legal">
      <PageHead
        titre="Politique de confidentialité"
        sousTitre="Quelles données je collecte, pourquoi, combien de temps, et comment exercer vos droits"
        pastilles={['🔒 Aucune revente de données', '🍪 Aucun cookie de suivi', `🗓️ Mise à jour : ${DATE_MAJ_LEGAL}`]}
      />

      <SectionTitle>VOS DONNÉES PERSONNELLES</SectionTitle>

      <div className="card-item">
        <h3 className="card-item-header">1. Responsable du traitement</h3>
        <p><strong>{EDITEUR.nom}</strong>, {EDITEUR.statut}, exerçant sous le nom commercial {NOM_SITE}, {EDITEUR.adresse}, est responsable des données que vous saisissez sur ce site.</p>
        <p>Contact pour toute question sur vos données : <a href={`mailto:${EMAIL}`}>{EMAIL}</a> — {TELEPHONE}. Aucun délégué à la protection des données (DPO) n’est désigné : vous écrivez directement à la personne qui traite vos données.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">2. Données collectées, pourquoi et sur quelle base</h3>
        <ul>
          <li><strong>Demande de rendez-vous</strong> : nom, téléphone, adresse e-mail (facultative), commune, précisions facultatives sur votre besoin, date et créneau, prestation choisie, date et heure de votre acceptation des conditions d’annulation et de rétractation.
            Finalités : organiser et confirmer le rendez-vous, vous envoyer la confirmation par e-mail si vous avez donné votre adresse, et conserver la preuve de votre accord sur les conditions.
            Base légale : mesures précontractuelles prises à votre demande (article 6.1.b du RGPD) ; pour la preuve de votre accord, mon intérêt légitime à pouvoir justifier du respect de mes obligations d’information envers les consommateurs (article 6.1.f).</li>
          <li><strong>Formulaire de contact</strong> : nom, téléphone ou e-mail, message. Finalité : vous répondre. Base légale : mesures précontractuelles à votre demande, ou intérêt légitime à répondre aux questions reçues.</li>
          <li><strong>Carnet de clients</strong> (tenu par l’éditeur, jamais visible sur le site) : nom, téléphone et/ou e-mail, adresse, commune et notes de suivi sur les interventions réalisées.
            Finalité : gérer la relation avec mes clients (rendez-vous, devis, factures, suivi). Base légale : exécution du contrat (article 6.1.b du RGPD) et intérêt légitime à assurer le suivi de mes interventions.</li>
        </ul>
        <p>Les champs obligatoires sont strictement ceux dont j’ai besoin pour vous répondre ou vous rappeler : sans eux, je ne peux pas traiter votre demande. Les autres champs sont facultatifs et signalés comme tels. Aucune décision automatisée, aucun profilage, aucune prospection commerciale.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">3. Informations à ne pas saisir</h3>
        <p>Merci de n’indiquer dans les formulaires ni mot de passe, ni numéro de sécurité sociale, ni information de santé ou toute autre donnée sensible. Les documents et identifiants se traitent ensemble, lors de l’intervention, jamais par ce site.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">4. Durées de conservation</h3>
        <ul>
          <li><strong>Demandes de rendez-vous</strong> : {RETENTION_RDV_MOIS} mois après la date du rendez-vous, puis suppression automatique.</li>
          <li><strong>Messages de contact</strong> : {RETENTION_CONTACT_MOIS} mois après réception, puis suppression automatique.</li>
          <li><strong>Fiches du carnet de clients</strong> : {RETENTION_CLIENT_MOIS} mois après la dernière mise à jour de la fiche, puis suppression automatique.</li>
          <li><strong>E-mails de notification</strong> reçus par l’éditeur : supprimés dans les mêmes délais.</li>
        </ul>
        <p>Les devis, factures et documents comptables, établis en dehors de ce site, sont conservés selon les obligations légales (10 ans).</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">5. Qui peut voir vos données</h3>
        <p>Seul l’éditeur y a accès. Elles ne sont ni vendues, ni cédées. Pour faire fonctionner le site, j’utilise trois prestataires techniques (sous-traitants) : Cloudflare (hébergement du site et des images), Supabase (base de données) et Resend (envoi de l’e-mail qui m’avertit d’une nouvelle demande et, si vous avez renseigné votre adresse, de l’e-mail de confirmation de votre rendez-vous).</p>
        <p>Ces prestataires sont des sociétés américaines : un transfert de données hors de l’Union européenne est donc possible. Il est encadré par les garanties prévues par le RGPD (clauses contractuelles types ou cadre de protection des données UE–États-Unis, selon le prestataire).</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">6. Données techniques et sécurité</h3>
        <p>Comme sur tout site, votre visite génère des journaux techniques (adresse IP, date, page demandée), traités par Cloudflare pour acheminer le site et le protéger contre les attaques. Ils sont conservés pour une durée limitée, et je ne les utilise qu’en cas de dysfonctionnement ou d’incident de sécurité, jamais pour mesurer ou suivre votre navigation.</p>
        <p>L’espace d’administration du site, réservé à l’éditeur, limite les tentatives de connexion à l’aide d’une empreinte non réversible de l’adresse IP, effacée sous 24 heures.</p>
        <p>Les échanges avec le site sont chiffrés (HTTPS). La base de données n’est pas accessible publiquement : seules les fonctions du site, côté serveur, peuvent y écrire, et seul l’éditeur peut la consulter.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">7. Cookies et stockage local</h3>
        <p>Ce site n’utilise aucun traceur publicitaire ni outil de mesure d’audience. Seul votre choix « Mode accessibilité » est mémorisé dans votre navigateur, à votre demande. Le détail figure dans la <Link href="/politique-de-cookies">politique de cookies</Link>.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">8. Vos droits</h3>
        <p>Vous pouvez demander l’accès à vos données, leur rectification, leur effacement, la limitation de leur traitement, vous y opposer, et obtenir une copie de celles que vous m’avez fournies dans un format lisible (portabilité). Vous pouvez aussi définir des directives sur le sort de vos données après votre décès.</p>
        <p>Pour exercer ces droits, écrivez à <a href={`mailto:${EMAIL}`}>{EMAIL}</a> ou par courrier à {EDITEUR.adresse}. Une pièce d’identité peut être demandée en cas de doute sur votre identité. Réponse sous un mois (deux mois au plus si la demande est complexe, auquel cas je vous en informe).</p>
        <p>Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une réclamation auprès de la CNIL : www.cnil.fr — 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07.</p>
        <p>Dernière mise à jour : {DATE_MAJ_LEGAL}.</p>
      </div>
    </div>
  );
}
