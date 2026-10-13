import Link from 'next/link';
import PageHead, { SectionTitle } from '../../components/PageHead';
import { getConfig } from '../../lib/config';
import { NOM_SITE } from '../../lib/site';

export const metadata = { title: 'Mentions légales' };
export const dynamic = 'force-dynamic';

export default async function MentionsLegales() {
  const { editeur: EDITEUR, email: EMAIL, telephone: TELEPHONE, dateMajLegal: DATE_MAJ_LEGAL, creditImpotPct: PCT } = await getConfig();
  return (
    <div className="legal">
      <PageHead
        titre="Mentions légales"
        sousTitre="Qui édite ce site, qui l’héberge et dans quel cadre je propose mes services"
        pastilles={['⚖️ Éditeur & hébergeur', '🔒 Aucune revente de données', `🗓️ Mise à jour : ${DATE_MAJ_LEGAL}`]}
      />

      <SectionTitle>MENTIONS LÉGALES</SectionTitle>

      <div className="card-item">
        <h3 className="card-item-header">Éditeur du site</h3>
        <p><strong>{EDITEUR.nom}</strong> — {EDITEUR.statut}</p>
        <p>Nom commercial : <strong>{NOM_SITE}</strong></p>
        <p>SIRET : {EDITEUR.siret}</p>
        <p>Déclaration Services à la Personne : {EDITEUR.sap}</p>
        <p>Adresse : {EDITEUR.adresse}</p>
        <p>Téléphone : {TELEPHONE} — E-mail : <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
        <p>Directeur de la publication : {EDITEUR.directeurPublication}</p>
        <p>{EDITEUR.tva}.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">Hébergement</h3>
        <p><strong>Site et images :</strong> Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, États-Unis — cloudflare.com. Le site s’exécute sur le réseau de Cloudflare, au plus près du visiteur ; les images sont stockées dans l’Union européenne.</p>
        <p><strong>Base de données :</strong> Supabase (supabase.com), hébergée dans l’Union européenne.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">Médiation de la consommation</h3>
        <p>En cas de litige non résolu après une réclamation écrite auprès de moi, vous pouvez recourir gratuitement au médiateur de la consommation : {EDITEUR.mediateur}.</p>
        <p>Détails dans la page <Link href="/annulation-remboursement">Annulation, rétractation et remboursement</Link>.</p>
      </div>

      <div className="card-item">
        <h3 className="card-item-header">Propriété intellectuelle et responsabilité</h3>
        <p>Les textes, la mise en page et les éléments graphiques de ce site sont la propriété de l’éditeur. Toute reproduction sans autorisation est interdite.</p>
        <p>Ce site n’est pas un site officiel et n’est affilié à aucun des organismes cités (CAF, France Travail, Ameli, administration fiscale…).</p>
        <p>Le simulateur de budget est fourni à titre indicatif : le crédit d’impôt de {PCT} % dépend de votre situation fiscale et de la réglementation en vigueur.</p>
      </div>

      <section id="confidentialite">
        <div className="card-item">
          <h3 className="card-item-header">Données personnelles, cookies et conditions</h3>
          <ul>
            <li><Link href="/politique-de-confidentialite">Politique de confidentialité</Link> — vos données et vos droits</li>
            <li><Link href="/politique-de-cookies">Politique de cookies</Link></li>
            <li><Link href="/conditions-utilisation">Conditions d’utilisation du site</Link></li>
            <li><Link href="/annulation-remboursement">Annulation, rétractation et remboursement</Link></li>
          </ul>
        </div>
      </section>
    </div>
  );
}
