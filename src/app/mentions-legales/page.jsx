import PageHead, { SectionTitle } from '../../components/PageHead';
import {
  EDITEUR, EMAIL, TELEPHONE, DATE_MAJ_LEGAL, RETENTION_RDV_MOIS, RETENTION_CONTACT_MOIS,
} from '../../lib/site';

export const metadata = { title: 'Mentions légales & confidentialité — Assistance à domicile Agen' };

export default function MentionsLegales() {
  return (
    <div className="legal">
      <PageHead
        titre="Mentions légales & confidentialité"
        sousTitre="Qui je suis, ce que je fais de vos données et comment exercer vos droits"
        pastilles={['🔒 Aucune revente de données', '🍪 Aucun cookie de suivi', `🗓️ Mise à jour : ${DATE_MAJ_LEGAL}`]}
      />

      <SectionTitle>MENTIONS LÉGALES</SectionTitle>

      <div className="card-item">
        <h3 className="card-item-header">Éditeur du site</h3>
        <p><strong>{EDITEUR.nom}</strong> — {EDITEUR.statut}</p>
        <p>SIRET : {EDITEUR.siret}</p>
        <p>Déclaration Services à la Personne : {EDITEUR.sap}</p>
        <p>Adresse : {EDITEUR.adresse}</p>
        <p>Téléphone : {TELEPHONE} — E-mail : <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
        <p>Directeur de la publication : {EDITEUR.directeurPublication}</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">Hébergement</h3>
        <p><strong>Site et images :</strong> Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, États-Unis — cloudflare.com. Le site s&apos;exécute sur le réseau de Cloudflare, au plus près du visiteur ; les images sont stockées dans l&apos;Union européenne.</p>
        <p><strong>Base de données :</strong> Supabase (supabase.com), hébergée dans l&apos;Union européenne.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">Propriété intellectuelle et responsabilité</h3>
        <p>Les textes, la mise en page et les éléments graphiques de ce site sont la propriété de l&apos;éditeur. Toute reproduction sans autorisation est interdite.</p>
        <p>Ce site n&apos;est pas un site officiel et n&apos;est affilié à aucun des organismes cités (CAF, France Travail, Ameli, administration fiscale…).</p>
        <p>Le simulateur de budget est fourni à titre indicatif : le crédit d&apos;impôt de 50 % dépend de votre situation fiscale et de la réglementation en vigueur.</p>
      </div>

      <section id="confidentialite">
        <SectionTitle>POLITIQUE DE CONFIDENTIALITÉ</SectionTitle>
      </section>

      <div className="card-item">
        <h3 className="card-item-header">1. Responsable du traitement</h3>
        <p>{EDITEUR.nom}, éditeur du site (coordonnées ci-dessus), est responsable des données que vous saisissez dans les formulaires.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">2. Données collectées, pourquoi et sur quelle base</h3>
        <ul>
          <li><strong>Demande de rendez-vous</strong> : nom, téléphone, commune, précisions sur votre besoin ou votre adresse, date et créneau, prestation choisie. Objectif : confirmer le rendez-vous et organiser l&apos;intervention. Base légale : mesures précontractuelles prises à votre demande.</li>
          <li><strong>Formulaire de contact</strong> : nom, téléphone ou e-mail, message. Objectif : vous répondre. Base légale : mesures précontractuelles à votre demande, ou intérêt légitime à répondre aux questions reçues.</li>
        </ul>
        <p>Ces données sont indispensables pour traiter votre demande : sans elles, je ne peux pas vous répondre. Aucune décision automatisée, aucun profilage, aucune prospection commerciale.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">3. Informations à ne pas saisir</h3>
        <p>Merci de n&apos;indiquer dans les formulaires ni mot de passe, ni numéro de sécurité sociale, ni information de santé ou toute autre donnée sensible. Les documents et identifiants se traitent ensemble, lors de l&apos;intervention, jamais par ce site.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">4. Durées de conservation</h3>
        <ul>
          <li><strong>Demandes de rendez-vous</strong> : {RETENTION_RDV_MOIS} mois après la date du rendez-vous, puis suppression automatique.</li>
          <li><strong>Messages de contact</strong> : {RETENTION_CONTACT_MOIS} mois après réception, puis suppression automatique.</li>
          <li><strong>E-mails de notification</strong> reçus par l&apos;éditeur : supprimés dans les mêmes délais.</li>
        </ul>
        <p>Les factures et documents comptables, établis en dehors de ce site, sont conservés selon les obligations légales (10 ans).</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">5. Qui peut voir vos données</h3>
        <p>Seul l&apos;éditeur y a accès. Elles ne sont ni vendues, ni cédées. Pour faire fonctionner le site, j&apos;utilise trois prestataires techniques (sous-traitants) : Cloudflare (hébergement du site et des images), Supabase (base de données) et Resend (envoi de l&apos;e-mail qui m&apos;avertit d&apos;une nouvelle demande).</p>
        <p>Ces prestataires sont des sociétés américaines : un transfert de données hors de l&apos;Union européenne est donc possible. Il est encadré par les garanties prévues par le RGPD (clauses contractuelles types ou cadre de protection des données UE–États-Unis, selon le prestataire).</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">6. Cookies</h3>
        <p>Ce site n&apos;utilise aucun cookie, aucun outil de mesure d&apos;audience et aucun traceur publicitaire. Seul votre choix « Mode senior » est mémorisé dans votre navigateur (stockage local) pour afficher le site comme vous l&apos;avez choisi ; il n&apos;est jamais transmis.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">7. Vos droits</h3>
        <p>Vous pouvez demander l&apos;accès à vos données, leur rectification, leur effacement, la limitation de leur traitement, ou vous y opposer. Pour cela, écrivez à <a href={`mailto:${EMAIL}`}>{EMAIL}</a> ou par courrier à l&apos;adresse de l&apos;éditeur. Une pièce d&apos;identité peut être demandée en cas de doute sur votre identité. Réponse sous un mois.</p>
        <p>Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une réclamation auprès de la CNIL : www.cnil.fr — 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">8. Sécurité</h3>
        <p>Les échanges avec le site sont chiffrés (HTTPS). La base de données n&apos;est pas accessible publiquement : seules les fonctions du site, côté serveur, peuvent y écrire, et seul l&apos;éditeur peut la consulter.</p>
        <p>Dernière mise à jour : {DATE_MAJ_LEGAL}.</p>
      </div>
    </div>
  );
}
