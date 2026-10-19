'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import Icon from './Icon';

// Catalogue des prestations : onglets par catégorie, puis une grille de « tuiles » (une par prestation).
// En mode accessibilité, toutes les catégories sont affichées l'une sous l'autre (pas d'onglets).
export default function Catalogue({ catalogue }) {
  const [actif, setActif] = useState(0);
  const refs = useRef([]);

  function touche(e, i) {
    const n = catalogue.length;
    let k = null;
    if (e.key === 'ArrowRight') k = (i + 1) % n;
    else if (e.key === 'ArrowLeft') k = (i - 1 + n) % n;
    else if (e.key === 'Home') k = 0;
    else if (e.key === 'End') k = n - 1;
    if (k !== null) { e.preventDefault(); setActif(k); refs.current[k]?.focus(); }
  }

  return (
    <div className="cat">
      {catalogue.length > 1 && (
        <div className="cat-tabs" role="tablist" aria-label="Catégories de prestations">
          {catalogue.map((c, i) => (
            <button
              key={c.titre}
              ref={(el) => { refs.current[i] = el; }}
              type="button"
              role="tab"
              id={`cat-tab-${i}`}
              aria-selected={i === actif}
              aria-controls={`cat-panel-${i}`}
              tabIndex={i === actif ? 0 : -1}
              className={'cat-tab' + (i === actif ? ' actif' : '')}
              onClick={() => setActif(i)}
              onKeyDown={(e) => touche(e, i)}
            >
              <Icon name={c.icone} size={22} /> <span>{c.titre}</span>
            </button>
          ))}
        </div>
      )}

      {catalogue.map((c, i) => (
        <div
          key={c.titre}
          id={`cat-panel-${i}`}
          role={catalogue.length > 1 ? 'tabpanel' : undefined}
          aria-labelledby={catalogue.length > 1 ? `cat-tab-${i}` : undefined}
          hidden={catalogue.length > 1 && i !== actif}
          className="cat-panel"
        >
          <div className="cat-head">
            <div className="cat-badge"><Icon name={c.icone} size={34} /></div>
            <div className="cat-head-text">
              <h3>{c.titre}</h3>
              {c.intro && <p>{c.intro}</p>}
            </div>
            <Link href={`/rendez-vous?prestation=${encodeURIComponent(c.titre)}`} className="btn btn-cta">
              Réserver cette aide <Icon name="arrow" size={20} />
            </Link>
          </div>
          {c.items.length > 0 && (
            <ul className="cat-grid">
              {c.items.map((it, k) => (
                <li key={k} className="cat-tile">
                  <span className="cat-ico"><Icon name={it.icone || 'check'} size={24} /></span>
                  <div>
                    {it.titre && <h4>{it.titre}</h4>}
                    <p>{it.texte}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
