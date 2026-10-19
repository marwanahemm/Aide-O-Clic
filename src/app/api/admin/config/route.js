import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { nettoyerConfig } from '../../../../lib/config';
import { garde } from '../../../../lib/adminAuth';
import { expliquerErreurBase } from '../../../../lib/erreurs';

export const dynamic = 'force-dynamic';

// PUT /api/admin/config → enregistre les réglages du site (tarifs, créneaux, communes, coordonnées, mentions légales)
export async function PUT(request) {
  const refus = await garde(request);
  if (refus) return refus;
  let b;
  try { b = await request.json(); } catch { return NextResponse.json({ erreur: 'Requête invalide.' }, { status: 400 }); }

  const r = nettoyerConfig(b);
  if (!r.ok) return NextResponse.json({ erreur: r.erreur }, { status: 400 });

  try {
    const { error } = await getSupabase().from('parametres')
      .upsert({ cle: 'site', valeur: r.config, maj: new Date().toISOString() });
    if (error) throw error;
    return NextResponse.json({ ok: true, config: r.config });
  } catch (e) {
    console.error('PUT admin/config', e.message);
    return NextResponse.json({ erreur: `Enregistrement impossible. ${expliquerErreurBase(e)}` }, { status: 500 });
  }
}
