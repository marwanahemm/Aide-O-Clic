import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { garde } from '../../../../lib/adminAuth';
import { expliquerErreurBase } from '../../../../lib/erreurs';
import { nettoyerClient } from '../../../../lib/clientsAdmin';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const lireJson = async (request) => { try { return await request.json(); } catch { return null; } };

// POST { nom, telephone?, email?, adresse?, commune?, notes? } → crée une fiche client
export async function POST(request) {
  const refus = await garde(request);
  if (refus) return refus;
  const b = await lireJson(request);
  if (!b) return NextResponse.json({ erreur: 'Requête invalide.' }, { status: 400 });
  const r = nettoyerClient(b);
  if (!r.ok) return NextResponse.json({ erreur: r.erreur }, { status: 400 });
  try {
    const { error } = await getSupabase().from('clients').insert(r.client);
    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error('POST admin/clients', e.message);
    return NextResponse.json({ erreur: expliquerErreurBase(e) }, { status: 500 });
  }
}

// PUT { id, ...champs } → modifie une fiche (et remet à zéro le délai de conservation)
export async function PUT(request) {
  const refus = await garde(request);
  if (refus) return refus;
  const b = await lireJson(request);
  if (!b || !UUID.test(b.id || '')) return NextResponse.json({ erreur: 'Données invalides.' }, { status: 400 });
  const r = nettoyerClient(b);
  if (!r.ok) return NextResponse.json({ erreur: r.erreur }, { status: 400 });
  try {
    const { error } = await getSupabase().from('clients').update({ ...r.client, updated_at: new Date().toISOString() }).eq('id', b.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('PUT admin/clients', e.message);
    return NextResponse.json({ erreur: expliquerErreurBase(e) }, { status: 500 });
  }
}

// PATCH { id } → « contact récent » : remet à zéro le délai de conservation sans rien modifier
export async function PATCH(request) {
  const refus = await garde(request);
  if (refus) return refus;
  const b = await lireJson(request);
  if (!b || !UUID.test(b.id || '')) return NextResponse.json({ erreur: 'Données invalides.' }, { status: 400 });
  try {
    const { error } = await getSupabase().from('clients').update({ updated_at: new Date().toISOString() }).eq('id', b.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('PATCH admin/clients', e.message);
    return NextResponse.json({ erreur: expliquerErreurBase(e) }, { status: 500 });
  }
}

// DELETE { id } → supprime définitivement une fiche
export async function DELETE(request) {
  const refus = await garde(request);
  if (refus) return refus;
  const b = await lireJson(request);
  if (!b || !UUID.test(b.id || '')) return NextResponse.json({ erreur: 'Données invalides.' }, { status: 400 });
  try {
    const { error } = await getSupabase().from('clients').delete().eq('id', b.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE admin/clients', e.message);
    return NextResponse.json({ erreur: expliquerErreurBase(e) }, { status: 500 });
  }
}
