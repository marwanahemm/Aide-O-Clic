import { NOM_SITE } from '../lib/site';

// Bandeau d'introduction de chaque page (le menu est dans l'en-tête du site)
export default function PageHead({ titre, sousTitre, pastilles = [], eyebrow }) {
  return (
    <header className="page-hero">
      <p className="page-hero-eyebrow">{eyebrow || `${NOM_SITE} · Services à la personne`}</p>
      <h1 className="page-hero-title">{titre}</h1>
      {sousTitre && <p className="page-hero-sub">{sousTitre}</p>}
      {pastilles.length > 0 && (
        <ul className="pill-list">
          {pastilles.map((p) => <li key={p} className="pill">{p}</li>)}
        </ul>
      )}
    </header>
  );
}

export function SectionTitle({ children }) {
  return (
    <div className="section-header">
      <h2>{children}</h2>
    </div>
  );
}
