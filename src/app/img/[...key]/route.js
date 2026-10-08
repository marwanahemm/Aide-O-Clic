import { getCloudflareContext } from '@opennextjs/cloudflare';

export const dynamic = 'force-dynamic';

const CLE_VALIDE = /^[a-z0-9][a-z0-9/_.-]{0,199}$/i;
const TYPES = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp',
  avif: 'image/avif', gif: 'image/gif', svg: 'image/svg+xml', ico: 'image/x-icon',
};

// GET /img/logo.svg → lit « logo.svg » dans le bucket R2 (binding IMAGES_BUCKET). Aucune clé, aucun bucket public.
export async function GET(request, { params }) {
  const { key: morceaux } = await params;
  const cle = morceaux.join('/');
  const ext = cle.split('.').pop().toLowerCase();

  if (!CLE_VALIDE.test(cle) || cle.includes('..') || cle.includes('//') || !TYPES[ext]) {
    return new Response('Introuvable', { status: 404 });
  }

  const bucket = getCloudflareContext().env.IMAGES_BUCKET;
  if (!bucket) return new Response('Stockage d\'images indisponible', { status: 503 });

  const objet = await bucket.get(cle, { onlyIf: request.headers }); // gère If-None-Match (304)
  if (!objet) return new Response('Introuvable', { status: 404 });

  const headers = new Headers();
  objet.writeHttpMetadata(headers);
  if (!headers.get('content-type')) headers.set('content-type', TYPES[ext]);
  headers.set('etag', objet.httpEtag);
  headers.set('cache-control', 'public, max-age=86400');
  headers.set('x-content-type-options', 'nosniff');
  headers.set('content-security-policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox"); // neutralise tout script dans un SVG

  if (!('body' in objet)) return new Response(null, { status: 304, headers }); // condition non remplie → pas de corps
  return new Response(objet.body, { headers });
}
