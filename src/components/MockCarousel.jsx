'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Icon from './Icon';
import BrowserMock, { PageMock } from './BrowserMock';

const DELAI = 5500;

// Liste de prestations à gauche, maquette inclinée à droite, lecture automatique avec pause / précédent / suivant
export default function MockCarousel({ items, creneaux, pct }) {
  const [i, setI] = useState(0);
  const [lecture, setLecture] = useState(true);
  const liste = useRef(null);
  const n = items.length;

  useEffect(() => {
    if (!lecture || n < 2) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.getAttribute('data-mode') === 'senior') {
      setLecture(false);
      return undefined;
    }
    const t = setTimeout(() => setI((x) => (x + 1) % n), DELAI);
    return () => clearTimeout(t);
  }, [lecture, i, n]);

  useEffect(() => {
    const ul = liste.current;
    const li = ul && ul.children[i];
    if (li) ul.scrollTo({ top: Math.max(0, li.offsetTop - 8), behavior: 'smooth' });
  }, [i]);

  const aller = (d) => setI((x) => (x + d + n) % n);
  const it = items[i];
  const deux = (v) => String(v).padStart(2, '0');

  return (
    <div className="kw-carousel">
      <div className="kw-carousel-list">
        <ul ref={liste}>
          {items.map((p, k) => (
            <li key={k}>
              <button type="button" className={k === i ? 'on' : ''} aria-current={k === i ? 'true' : undefined} onClick={() => { setI(k); setLecture(false); }}>
                <b>{p.titre || p.categorie}</b><span>{p.categorie}</span>
                {k === i && <i className={lecture ? 'play' : ''} style={{ animationDuration: `${DELAI}ms` }} />}
              </button>
            </li>
          ))}
        </ul>
        <div className="kw-ctrl">
          <button type="button" onClick={() => { aller(-1); setLecture(false); }} aria-label="Prestation précédente"><svg className="kw-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg></button>
          <button type="button" onClick={() => setLecture((v) => !v)} aria-label={lecture ? 'Mettre en pause' : 'Lancer le défilement'}>
            {lecture
              ? <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor" /><rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor" /></svg>
              : <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2l10 6-10 6z" fill="currentColor" /></svg>}
          </button>
          <button type="button" onClick={() => { aller(1); setLecture(false); }} aria-label="Prestation suivante"><svg className="kw-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg></button>
          <span className="kw-count" aria-live="off">{deux(i + 1)} / {deux(n)}</span>
          <Link href={`/rendez-vous?prestation=${encodeURIComponent(it.titre || it.categorie)}`} className="btn btn-cta btn-sm kw-book">Réserver</Link>
        </div>
      </div>
      <div className="kw-carousel-mock" key={i}>
        <BrowserMock
          url="aide-o-clic.fr"
          label={`Aperçu de la prestation : ${it.titre || it.categorie}`}
          tags={[{ text: `PRESTATION · ${(it.categorie || '').toUpperCase()}`, pos: 'a' }, { text: 'SANS JARGON', pos: 'b' }, { text: 'DÉPLACEMENT INCLUS', pos: 'c' }]}
        >
          <PageMock
            titre={it.titre || it.categorie}
            texte={it.texte}
            creneaux={creneaux}
            pct={pct}
            art={<span className="kw-art"><Icon name={it.icone || 'check'} size={60} /></span>}
          />
        </BrowserMock>
      </div>
    </div>
  );
}
