import Link from 'next/link';
import Logo from './Logo';
import Nav from './Nav';
import ModeSwitch from './ModeSwitch';
import Icon from './Icon';

export default function SiteHeader({ telephone, telephoneHref, horaires }) {
  return (
    <>
      <section className="topbar" aria-label="Informations pratiques et mode senior">
        <div className="container topbar-inner">
          <span className="topbar-info"><Icon name="pin" size={18} /> Bassin d&apos;Agen · {horaires}</span>
          <ModeSwitch />
        </div>
      </section>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand-link" title="Retour à l'accueil"><Logo /></Link>
          <Nav />
          <div className="header-actions">
            <a href={telephoneHref} className="btn btn-ghost btn-sm header-phone" aria-label={`Appeler le ${telephone}`}>
              <Icon name="phone" size={20} /> <span>{telephone}</span>
            </a>
            <Link href="/rendez-vous" className="btn btn-cta btn-sm">Prendre rendez-vous</Link>
          </div>
        </div>
      </header>
    </>
  );
}
