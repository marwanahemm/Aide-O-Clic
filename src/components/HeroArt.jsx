// Illustration d'accueil : une fenêtre d'ordinateur, un bouton « Aide O'Clic » et un curseur qui clique
export default function HeroArt({ pct }) {
  return (
    <svg viewBox="0 0 420 360" role="img" aria-label="Illustration : un écran d'ordinateur où un curseur clique sur un bouton Aide O'Clic">
      <circle cx="210" cy="190" r="150" fill="#0077cc" opacity="0.18" />
      <rect x="30" y="50" width="340" height="250" rx="20" fill="#f0f7ff" />
      <path d="M30 70a20 20 0 0 1 20-20h300a20 20 0 0 1 20 20v20H30z" fill="#dbe9f7" />
      <circle cx="55" cy="70" r="5" fill="#94a3b8" /><circle cx="73" cy="70" r="5" fill="#94a3b8" /><circle cx="91" cy="70" r="5" fill="#94a3b8" />
      <rect x="120" y="62" width="200" height="16" rx="8" fill="#ffffff" />
      <circle cx="72" cy="130" r="20" fill="#0077cc" />
      <rect x="104" y="116" width="150" height="11" rx="5.5" fill="#1b2535" opacity="0.85" />
      <rect x="104" y="136" width="104" height="9" rx="4.5" fill="#94a3b8" />
      <rect x="56" y="172" width="288" height="14" rx="7" fill="#cfe3f6" />
      <rect x="56" y="196" width="236" height="14" rx="7" fill="#cfe3f6" />
      <rect x="56" y="232" width="186" height="50" rx="15" fill="#0077cc" />
      <text x="136" y="263" textAnchor="middle" fontSize="19" fontWeight="800" fill="#ffffff" fontFamily="Segoe UI, system-ui, sans-serif">Aide O&apos;Clic</text>
      <circle cx="238" cy="262" r="24" fill="none" stroke="#7cc0f5" strokeWidth="3" opacity="0.7" />
      <circle cx="238" cy="262" r="38" fill="none" stroke="#7cc0f5" strokeWidth="2" opacity="0.35" />
      <path transform="translate(26 0)" d="M200 250l0 42 10.5-9.5 7.5 16 8-3.5-7.5-16 14-1.2z" fill="#ffffff" stroke="#1b2535" strokeWidth="2.4" strokeLinejoin="round" />
      <g>
        <rect x="262" y="18" width="136" height="46" rx="15" fill="#ffffff" />
        <circle cx="288" cy="41" r="13" fill="#16a34a" />
        <path d="M281.5 41.5l5 5 8.5-9.5" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <text x="309" y="47" fontSize="14" fontWeight="800" fill="#1b2535" fontFamily="Segoe UI, system-ui, sans-serif">C&apos;est fait !</text>
      </g>
      <g>
        <rect x="246" y="296" width="152" height="54" rx="15" fill="#ffffff" />
        <text x="262" y="318" fontSize="11.5" fontWeight="700" fill="#475569" fontFamily="Segoe UI, system-ui, sans-serif">Crédit d&apos;impôt</text>
        <text x="262" y="340" fontSize="22" fontWeight="800" fill="#14532d" fontFamily="Segoe UI, system-ui, sans-serif">{pct} %</text>
      </g>
    </svg>
  );
}
