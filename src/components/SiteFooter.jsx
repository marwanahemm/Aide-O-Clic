import Link from 'next/link';
import Logo from './Logo';
import Icon from './Icon';
import { NOM_SITE } from '../lib/site';

export default function SiteFooter({ telephone, telephoneHref, email, horaires }) {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container footer-grid">
        <div>
          <Logo clair />
          <p>Assistance administrative et informatique à domicile, avec patience et sans jargon. Services à la personne sur le Bassin d&apos;Agen.</p>
        </div>
        <div>
          <h2>Naviguer</h2>
          <ul>
            <li><Link href="/">Accueil</Link></li>
            <li><Link href="/simulation">Simulateur de budget</Link></li>
            <li><Link href="/rendez-vous">Prendre rendez-vous</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h2>Me contacter</h2>
          <ul>
            <li><a href={telephoneHref}><Icon name="phone" size={18} /> {telephone}</a></li>
            <li><a href={`mailto:${email}`}><Icon name="mail" size={18} /> {email}</a></li>
            <li><span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', minHeight: 40 }}><Icon name="clock" size={18} /> {horaires}</span></li>
          </ul>
        </div>
        <nav aria-label="Informations légales">
          <h2>Informations</h2>
          <ul>
            <li><Link href="/mentions-legales">Mentions légales</Link></li>
            <li><Link href="/politique-de-confidentialite">Confidentialité</Link></li>
            <li><Link href="/politique-de-cookies">Cookies</Link></li>
            <li><Link href="/conditions-utilisation">Conditions d’utilisation</Link></li>
            <li><Link href="/annulation-remboursement">Annulation &amp; remboursement</Link></li>
          </ul>
        </nav>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <span>© {new Date().getFullYear()} {NOM_SITE} — micro-entreprise de services à la personne</span>
          <span>Site conçu pour être lisible et simple à utiliser par tous.</span>
        </div>
      </div>
    </footer>
  );
}
