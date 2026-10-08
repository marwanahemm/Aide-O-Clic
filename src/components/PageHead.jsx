import Nav from './Nav';

// Bandeau d'en-tête + navigation, communs à toutes les pages
export default function PageHead({ titre, sousTitre, pastilles = [] }) {
  return (
    <>
      <header className="banner-card">
        <div className="badge-sap-cyan">SERVICES À LA PERSONNE (SAP)</div>
        <h1 className="main-title">{titre}</h1>
        <p className="main-subtitle">{sousTitre}</p>
        <div className="atouts-pills">
          {pastilles.map((p) => <span key={p} className="pill-item">{p}</span>)}
        </div>
      </header>
      <Nav />
    </>
  );
}

export function SectionTitle({ children }) {
  return (
    <div className="section-header">
      <h2>{children}</h2>
      <div className="title-line" />
    </div>
  );
}
