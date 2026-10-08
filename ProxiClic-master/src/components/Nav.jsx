'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LIENS = [
  ['/', 'Accueil & Tarifs'],
  ['/simulation', 'Simulateur de Budget'],
  ['/rendez-vous', 'Prise de RDV'],
  ['/contact', 'Contact Direct'],
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="nav-bar" aria-label="Menu principal">
      {LIENS.map(([href, label]) => (
        <Link key={href} href={href} className={'nav-link' + (pathname === href ? ' active' : '')} aria-current={pathname === href ? 'page' : undefined}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
