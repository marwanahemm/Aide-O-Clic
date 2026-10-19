import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { garde } from '../../../../lib/adminAuth';
import { expliquerErreurBase } from '../../../../lib/erreurs';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function nettoyerMessage(b) {
  const nom = String(b?.nom ?? '').trim();
  const contact = String(b?.contact ?? '').trim();
  const message = String(b?.message ?? '').trim();
  if (nom.length < 2 || nom.length > 100) return { erreur: 'Nom invalide (2 à 100 caractères).' };
  if (contact.length < 5 || contact.length > 150) return { erreur: 'Téléphone ou e-mail invalide (5 à 150 caractères).' };
  if (message.length < 5 || message.length > 2000) return { erreur: 'Message trop court ou trop long (5 à 2000 caractères).' };
  return { valeurs: { nom, contact, message } };
}

// POST { nom, contact, message } → ajoute un message à la main (ex. demande reçue par téléphone) ; marqué « lu »
export async function POST(request) {
  const refus = await garde(request);
  if (refus) return refus;
  let b;
  try { b = await request.json(); } catch { return NextResponse.json({ erreur: 'Requête invalide.' }, { status: 400 }); }
  const r = nettoyerMessage(b);
  if (r.erreur) return NextResponse.json({ erreur: r.erreur }, { status: 400 });
  try {
    const { error } = await getSupabase().from('messages_contact').insert({ ...r.valeurs, lu: true });
    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error('POST admin/messages', e.message);
    return NextResponse.json({ erreur: expliquerErreurBase(e) }, { status: 500 });
  }
}

// PUT { id, nom, contact, message } → modifie un message
export async function PUT(request) {
  const refus = await garde(request);
  if (refus) return refus;
  let b;
  try { b = await request.json(); } catch { return NextResponse.json({ erreur: 'Requête invalide.' }, { status: 400 }); }
  if (!UUID.test(b?.id || '')) return NextResponse.json({ erreur: 'Données invalides.' }, { status: 400 });
  const r = nettoyerMessage(b);
  if (r.erreur) return NextResponse.json({ erreur: r.erreur }, { status: 400 });
  try {
    const { error } = await getSupabase().from('messages_contact').update(r.valeurs).eq('id', b.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('PUT admin/messages', e.message);
    return NextResponse.json({ erreur: expliquerErreurBase(e) }, { status: 500 });
  }
}

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
    return NextResponse.json({ erreur: expliquerErreurBase(e) }, { status: 500 });
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
    return NextResponse.json({ erreur: expliquerErreurBase(e) }, { status: 500 });
  }
}
