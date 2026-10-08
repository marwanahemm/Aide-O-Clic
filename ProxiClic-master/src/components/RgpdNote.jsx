import Link from 'next/link';

// Information RGPD affichée sous les formulaires (art. 13 : finalité, destinataire, droits)
export default function RgpdNote() {
  return (
    <p className="rgpd-note">
      🔒 Ces informations servent uniquement à traiter votre demande et ne sont jamais revendues. Merci de ne saisir
      ni mot de passe, ni numéro de sécurité sociale, ni information de santé.{' '}
      <Link href="/mentions-legales#confidentialite">En savoir plus sur vos données et vos droits</Link>.
    </p>
  );
}