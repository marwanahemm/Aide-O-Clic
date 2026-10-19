import Link from 'next/link';

// Texte simple modifiable depuis le back-office : [texte](/page) devient un lien ; les retours à la ligne sont conservés.
// Rien n'est interprété comme du HTML. Seuls les liens internes (/…), https://, tel: et mailto: sont acceptés.
const LIEN = /\[([^\]\n]{1,120})\]\(((?:\/(?!\/)|https:\/\/|tel:|mailto:)[^)\s]{0,200})\)/g;

export function remplacer(texte, vars) {
  return String(texte).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

function morceaux(ligne) {
  const out = [];
  let dernier = 0;
  let m;
  LIEN.lastIndex = 0;
  while ((m = LIEN.exec(ligne))) {
    if (m.index > dernier) out.push(ligne.slice(dernier, m.index));
    const [, label, url] = m;
    out.push(url.startsWith('/')
      ? <Link key={m.index} href={url}>{label}</Link>
      : <a key={m.index} href={url} {...(url.startsWith('https') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{label}</a>);
    dernier = m.index + m[0].length;
  }
  if (dernier < ligne.length) out.push(ligne.slice(dernier));
  return out;
}

export default function RichText({ texte }) {
  return String(texte).split('\n').map((ligne, i) => (
    <span key={i}>{i > 0 && <br />}{morceaux(ligne)}</span>
  ));
}
