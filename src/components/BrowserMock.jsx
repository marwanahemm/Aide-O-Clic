import HeroArt from './HeroArt';

// Fenêtre de navigateur inclinée en 3D, avec halo et étiquettes reliées par un point (effet « maquette »)
export default function BrowserMock({ url = 'aide-o-clic.fr', label, tags = [], children }) {
  return (
    <div className="kw-stage" role="img" aria-label={label}>
      <div className="kw-tilt">
        <div className="kw-win" aria-hidden="true">
          <div className="kw-win-bar"><i /><i /><i /><span>{url}</span></div>
          {children}
        </div>
        {tags.map((t) => <span key={t.text} className={`kw-tag kw-tag-${t.pos}`} aria-hidden="true">{t.text}</span>)}
      </div>
    </div>
  );
}

// Contenu factice d'une page du site (toujours sur fond clair, comme une vraie page dans la fenêtre)
export function PageMock({ titre, accent, texte, art, creneaux = [], pct = 50 }) {
  const jours = creneaux.slice(0, 3);
  return (
    <div className="kw-page">
      <div className="kw-page-nav"><b><i />Aide O&apos;Clic</b><span /><span /><span /><u>Réserver</u></div>
      <div className="kw-page-grid">
        <div>
          <small className="kw-pill">Rendez-vous ouverts</small>
          <h4>{titre} {accent && <em>{accent}</em>}</h4>
          <p>{texte}</p>
          <div className="kw-page-btns"><u>Prendre rendez-vous</u><s>Comment ça marche</s></div>
        </div>
        <div className="kw-page-art">
          {art || <HeroArt pct={pct} />}
          {jours.length > 0 && (
            <div className="kw-slots"><small>Prochains créneaux</small><span>{jours.map((c, k) => <i key={c} className={k === 1 ? 'on' : ''}>{c}</i>)}</span></div>
          )}
        </div>
      </div>
      <div className="kw-page-steps">
        <div><em>01</em><b>Je choisis un créneau</b></div>
        <div><em>02</em><b>Il vient chez moi</b></div>
        <div><em>03</em><b>Je ne paie que {100 - pct} %</b></div>
      </div>
    </div>
  );
}
