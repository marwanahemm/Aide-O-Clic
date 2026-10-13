// Logo : un curseur qui « clique » (clin d'œil au nom) + le nom commercial. clair = version pour fond sombre.
export function LogoMark({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <rect width="48" height="48" rx="12" fill="#1b2535" />
      <circle cx="30" cy="18" r="9" fill="#0077cc" />
      <circle cx="30" cy="18" r="13.5" fill="none" stroke="#0077cc" strokeOpacity="0.45" strokeWidth="2" />
      <path d="M14 11l0 24 6.2-5.6 4.1 8.6 4.2-2-4.1-8.5 8.3-.7z" fill="#ffffff" stroke="#1b2535" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ clair = false }) {
  return (
    <span className={'brand' + (clair ? ' brand-clair' : '')}>
      <LogoMark />
      <span className="brand-text">
        <span className="brand-name">Aide <b>O&apos;Clic</b></span>
        <span className="brand-tag">Assistance à domicile · Agen</span>
      </span>
    </span>
  );
}
