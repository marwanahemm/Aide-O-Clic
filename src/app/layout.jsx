import './globals.css';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { MobileBar } from '../components/Nav';
import { MODE_DEMO, NOM_SITE } from '../lib/site';
import { getConfig } from '../lib/config';

export const metadata = {
  ...(MODE_DEMO ? { robots: { index: false, follow: false } } : {}),
  title: {
    default: `${NOM_SITE} — Assistance administrative & informatique à domicile · Agen`,
    template: `%s · ${NOM_SITE}`,
  },
  description:
    "Aide O'Clic : assistance administrative et informatique à domicile sur le Bassin d'Agen. Accompagnement patient, sans jargon, avec 50 % de crédit d'impôt.",
  applicationName: NOM_SITE,
  openGraph: { siteName: NOM_SITE, locale: 'fr_FR', type: 'website' },
};

export const viewport = { themeColor: '#1b2535', width: 'device-width', initialScale: 1 };

// Applique le mode accessibilité AVANT l'affichage (évite un « flash » en mode normal)
const initMode = `try{if(localStorage.getItem('sap-mode')==='senior')document.documentElement.setAttribute('data-mode','senior')}catch(e){}`;

export default async function RootLayout({ children }) {
  const { telephone, telephoneHref, email, horaires } = await getConfig();
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: initMode }} />
      </head>
      <body>
        <a href="#contenu" className="skip-link">Aller au contenu</a>
        {MODE_DEMO && (
          <div className="demo-banner" role="region" aria-label="Site en démonstration">
            <div className="container">
              <span aria-hidden="true">🚧</span>
              <span>Site en construction — version de démonstration : les services et tarifs affichés ne sont pas encore proposés, et aucune demande n&apos;est enregistrée.</span>
            </div>
          </div>
        )}
        <SiteHeader horaires={horaires} />
        <main id="contenu" className="container" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter telephone={telephone} telephoneHref={telephoneHref} email={email} horaires={horaires} />
        <MobileBar telephone={telephone} telephoneHref={telephoneHref} />
      </body>
    </html>
  );
}
