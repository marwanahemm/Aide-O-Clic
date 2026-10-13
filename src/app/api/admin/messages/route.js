import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { garde } from '../../../../lib/adminAuth';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// PATCH { id, lu } → marque un message comme lu / non lu
export async function PATCH(request) {
  const refus = await garde(request);
  if (refus) return refus;
  let b;
  try { b = await request.json(); } catch { return NextResponse.json({ erreur: 'Requête invalide.' }, { status: 400 }); }
  if (!UUID.test(b.id || '') || typeof b.lu !== 'boolean') return NextResponse.json({ erreur: 'Données invalides.' }, { status: 400 });
  try {
    const { error } = await getSupabase().from('messages_contact').update({ lu: b.lu }).eq('id', b.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('PATCH admin/messages', e.message);
    return NextResponse.json({ erreur: 'Erreur serveur.' }, { status: 500 });
  }
}

// DELETE { id } → supprime définitivement un message
export async function DELETE(request) {
  const refus = await garde(request);
  if (refus) return refus;
  let b;
  try { b = await request.json(); } catch { return NextResponse.json({ erreur: 'Requête invalide.' }, { status: 400 }); }
  if (!UUID.test(b.id || '')) return NextResponse.json({ erreur: 'Données invalides.' }, { status: 400 });
  try {
    const { error } = await getSupabase().from('messages_contact').delete().eq('id', b.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE admin/messages', e.message);
    return NextResponse.json({ erreur: 'Erreur serveur.' }, { status: 500 });
  }
}
