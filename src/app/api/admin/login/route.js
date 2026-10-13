import { NextResponse } from 'next/server';
import { baseConfiguree } from '../../../../lib/config';
import {
  adminConfigure, motDePasseValide, creerSession, connexionBloquee, enregistrerEchec, effacerEchecs,
  COOKIE_SESSION, DUREE_SESSION_S,
} from '../../../../lib/adminAuth';

export const dynamic = 'force-dynamic';

// POST /api/admin/login  { motDePasse }  → 200 connecté · 401 mauvais mot de passe · 429 trop d'essais · 503 non configuré
export async function POST(request) {
  if (!adminConfigure() || !baseConfiguree()) {
    return NextResponse.json({ erreur: "L'espace admin n'est pas configuré (ADMIN_PASSWORD, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)." }, { status: 503 });
  }
  let b;
  try { b = await request.json(); } catch { return NextResponse.json({ erreur: 'Requête invalide.' }, { status: 400 }); }

  try {
    if (await connexionBloquee(request)) {
      return NextResponse.json({ erreur: 'Trop de tentatives. Réessayez dans 15 minutes.' }, { status: 429 });
    }
    if (!(await motDePasseValide(b.motDePasse))) {
      await enregistrerEchec(request);
      await new Promise((r) => setTimeout(r, 600)); // ralentit les essais en rafale
      return NextResponse.json({ erreur: 'Mot de passe incorrect.' }, { status: 401 });
    }
    await effacerEchecs(request);
    const rep = NextResponse.json({ ok: true });
    rep.cookies.set(COOKIE_SESSION, await creerSession(), {
      httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: DUREE_SESSION_S,
    });
    return rep;
  } catch (e) {
    console.error('POST admin/login', e.message);
    return NextResponse.json({ erreur: 'Erreur serveur.' }, { status: 500 });
  }
}
