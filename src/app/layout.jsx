import './globals.css';
import Link from 'next/link';
import ModeSwitch from '../components/ModeSwitch';
import { MODE_DEMO } from '../lib/site';

export const metadata = {
  ...(MODE_DEMO ? { robots: { index: false, follow: false } } : {}),
  title: 'Assistance Administrative & Informatique à domicile — Agen',
  description:
    "Assistance administrative et informatique à domicile sur le Bassin d'Agen. Accompagnement patient, 50 % de crédit d'impôt.",
};

// Applique le mode senior AVANT l'affichage (évite un « flash » en mode normal)
const initMode = `try{if(localStorage.getItem('sap-mode')==='senior')document.documentElement.setAttribute('data-mode','senior')}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: initMode }} />
      </head>
      <body>
        <main className="container">
          {MODE_DEMO && (
            <div className="senior-help-bar" role="note">
              <div className="senior-help-bar-icon" aria-hidden="true">🚧</div>
              <div className="senior-help-bar-text">
                Site en construction — version de démonstration. Les services et tarifs affichés ne sont pas encore proposés,
                et aucune demande n&apos;est enregistrée.
              </div>
            </div>
          )}
          <ModeSwitch />
          {children}
        </main>
        <footer role="contentinfo">
          <div className="container">
            <p>Services à la Personne (SAP) • Micro-entreprise d&apos;Assistance Administrative &amp; Informatique à Domicile • Bassin d&apos;Agen</p>
            <p style={{ marginTop: 6, fontSize: 12, color: '#94a3b8' }}>
              Site conçu pour une accessibilité maximale et une lecture confortable pour les seniors.
            </p>
            <p style={{ marginTop: 6 }}>
              <Link href="/mentions-legales" style={{ color: 'inherit', textDecoration: 'underline' }}>Mentions légales &amp; confidentialité</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}