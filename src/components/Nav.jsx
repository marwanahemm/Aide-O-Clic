'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from './Icon';

export const LIENS = [
  ['/', 'Accueil', 'home'],
  ['/simulation', 'Simulateur', 'calculator'],
  ['/rendez-vous', 'Rendez-vous', 'calendar'],
  ['/contact', 'Contact', 'mail'],
];

// Menu principal (ordinateur et tablette)
export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="main-nav" aria-label="Menu principal">
      {LIENS.filter(([href]) => href !== '/rendez-vous').map(([href, label]) => (
        <Link key={href} href={href} className={'nav-link' + (pathname === href ? ' active' : '')} aria-current={pathname === href ? 'page' : undefined}>
          {label}
        </Link>
      ))}
    </nav>
  );
}

// Barre du bas (téléphone) : les 4 pages + un gros bouton « Appeler » au centre
export function MobileBar({ telephone, telephoneHref }) {
  const pathname = usePathname();
  const item = ([href, label, icone]) => (
    <Link key={href} href={href} className={'tab' + (pathname === href ? ' active' : '')} aria-current={pathname === href ? 'page' : undefined}>
      <Icon name={icone} size={24} />
      <span>{label}</span>
    </Link>
  );
  return (
    <nav className="tabbar" aria-label="Menu mobile">
      {item(LIENS[0])}
      {item(LIENS[1])}
      <a href={telephoneHref} className="tab tab-call" aria-label={`Appeler le ${telephone}`}>
        <span className="tab-call-btn"><Icon name="phone" size={26} /></span>
        <span>Appeler</span>
      </a>
      {item(LIENS[2])}
      {item(LIENS[3])}
    </nav>
  );
}
