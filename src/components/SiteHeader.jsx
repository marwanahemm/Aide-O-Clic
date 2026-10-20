import Link from 'next/link';
import Logo from './Logo';
import Nav from './Nav';
import ModeSwitch from './ModeSwitch';
import Icon from './Icon';
import ScrollShadow from './ScrollShadow';

export default function SiteHeader({ horaires }) {
  return (
    <>
      <ScrollShadow />
      <section className="topbar" aria-label="Informations pratiques et mode accessibilité">
        <div className="container topbar-inner">
          <span className="topbar-info"><Icon name="pin" size={18} /> Bassin d&apos;Agen · {horaires}</span>
          <ModeSwitch />
        </div>
      </section>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand-link" title="Retour à l'accueil"><Logo /></Link>
          <Nav />
        </div>
      </header>
    </>
  );
}
