import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSupabase } from './supabase';

export const COOKIE_SESSION = 'admin_session';
export const DUREE_SESSION_S = 8 * 3600;
const MAX_ECHECS = 5;
const FENETRE_MS = 15 * 60 * 1000;
const enc = new TextEncoder();

// L'espace admin n'existe que si ADMIN_PASSWORD est défini et assez long (12 caractères minimum).
export const adminConfigure = () => (process.env.ADMIN_PASSWORD || '').length >= 12;

async function hmac(secret, donnee) {
  const cle = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', cle, enc.encode(donnee));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function egal(a, b) { // comparaison à temps constant
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function motDePasseValide(saisi) {
  if (!adminConfigure()) return false;
  const [a, b] = await Promise.all([hmac('cmp', String(saisi)), hmac('cmp', process.env.ADMIN_PASSWORD)]);
  return egal(a, b);
}

// Session = « expiration.signature » signée avec le mot de passe : changer le mot de passe déconnecte tout le monde.
export async function creerSession() {
  const exp = Math.floor(Date.now() / 1000) + DUREE_SESSION_S;
  return `${exp}.${await hmac(process.env.ADMIN_PASSWORD, `admin.${exp}`)}`;
}

export async function estAdmin() {
  if (!adminConfigure()) return false;
  const valeur = (await cookies()).get(COOKIE_SESSION)?.value || '';
  const [exp, sig] = valeur.split('.');
  if (!/^\d{9,12}$/.test(exp || '') || !sig || Number(exp) < Date.now() / 1000) return false;
  return egal(sig, await hmac(process.env.ADMIN_PASSWORD, `admin.${exp}`));
}

// Garde des routes /api/admin/* : session valide + (pour les écritures) requête venant bien de ce site.
export async function garde(request) {
  if (!(await estAdmin())) return NextResponse.json({ erreur: 'Non autorisé.' }, { status: 401 });
  if (request.method !== 'GET') {
    const origine = request.headers.get('origin');
    if (origine && new URL(origine).host !== request.headers.get('host')) {
      return NextResponse.json({ erreur: 'Origine refusée.' }, { status: 403 });
    }
  }
  return null;
}

// ----- Limitation des tentatives de connexion (5 échecs / 15 min par adresse IP, IP stockée hachée) -----
const empreinteIp = (request) => hmac(process.env.ADMIN_PASSWORD, `ip.${request.headers.get('cf-connecting-ip') || 'inconnue'}`);

export async function connexionBloquee(request) {
  const ip = await empreinteIp(request);
  const { data } = await getSupabase().from('admin_tentatives').select('nb, debut').eq('ip', ip).maybeSingle();
  return Boolean(data && data.nb >= MAX_ECHECS && Date.now() - new Date(data.debut).getTime() < FENETRE_MS);
}

export async function enregistrerEchec(request) {
  const db = getSupabase();
  const ip = await empreinteIp(request);
  const { data } = await db.from('admin_tentatives').select('nb, debut').eq('ip', ip).maybeSingle();
  const recent = data && Date.now() - new Date(data.debut).getTime() < FENETRE_MS;
  await db.from('admin_tentatives').upsert({
    ip, nb: recent ? data.nb + 1 : 1, debut: recent ? data.debut : new Date().toISOString(),
  });
}

export async function effacerEchecs(request) {
  await getSupabase().from('admin_tentatives').delete().eq('ip', await empreinteIp(request));
}
