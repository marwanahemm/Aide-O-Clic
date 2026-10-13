import Link from 'next/link';
import PageHead, { SectionTitle } from '../../components/PageHead';
import { getConfig } from '../../lib/config';

export const metadata = { title: 'Politique de cookies' };
export const dynamic = 'force-dynamic';

export default async function Cookies() {
  const { email: EMAIL, dateMajLegal: DATE_MAJ_LEGAL } = await getConfig();
  return (
    <div className="legal">
      <PageHead
        titre="Politique de cookies"
        sousTitre="Ce qui est mémorisé dans votre navigateur quand vous visitez ce site"
        pastilles={['🍪 Aucun cookie publicitaire', '📊 Aucune mesure d’audience', `🗓️ Mise à jour : ${DATE_MAJ_LEGAL}`]}
      />

      <SectionTitle>COOKIES ET STOCKAGE LOCAL</SectionTitle>

      <div className="card-item">
        <h3 className="card-item-header">En bref</h3>
        <p>Ce site ne dépose aucun cookie qui nécessite votre accord : pas de publicité, pas de suivi, pas de statistiques, pas de réseaux sociaux ni de vidéos intégrées, pas de police de caractères chargée depuis un site tiers. C’est pourquoi vous ne voyez pas de bandeau de consentement : la loi n’en exige pas pour les éléments strictement nécessaires ou demandés par vous (article 82 de la loi Informatique et Libertés, recommandations de la CNIL).</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">Ce qui est mémorisé, précisément</h3>
        <ul>
          <li><strong>« sap-mode »</strong> (stockage local du navigateur) — mémorise votre choix du « Mode senior » (textes agrandis, contrastes renforcés). Créé uniquement quand vous actionnez le bouton, jamais transmis à un serveur, conservé jusqu’à ce que vous l’effaciez.</li>
          <li><strong>« admin_session »</strong> (cookie) — utilisé uniquement par l’éditeur du site après connexion à son espace d’administration, valable 8 heures. Les visiteurs ne le reçoivent jamais.</li>
          <li><strong>Cookie technique de sécurité de Cloudflare</strong> (par exemple « __cf_bm ») — peut être déposé par notre hébergeur pour distinguer les visiteurs des robots malveillants. Il est strictement nécessaire à la sécurité du site, de courte durée (environ 30 minutes), et ne sert à aucun suivi.</li>
        </ul>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">Si cela change</h3>
        <p>Si j’ajoute un jour un outil de mesure d’audience ou tout autre traceur soumis à consentement, je vous demanderai votre accord avant de le déclencher, et cette page sera mise à jour.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">Supprimer ou bloquer</h3>
        <p>Vous pouvez à tout moment désactiver le « Mode senior » avec le bouton en haut de page, ou effacer les données du site dans les réglages de votre navigateur (rubrique « Confidentialité » ou « Cookies et données de sites »). Cela ne gêne pas le fonctionnement du site.</p>
        <p>Plus d’informations sur vos données : <Link href="/politique-de-confidentialite">politique de confidentialité</Link> — une question ? <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>
      </div>
    </div>
  );
}
