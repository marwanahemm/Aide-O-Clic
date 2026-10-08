import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';
import { notifier } from '../../../lib/notify';
import { MODE_DEMO } from '../../../lib/site';

export const dynamic = 'force-dynamic';

// POST /api/contact → 201 créé · 400 invalide · 500 erreur serveur
export async function POST(request) {
  let b;
  try { b = await request.json(); } catch { return NextResponse.json({ erreur: 'Requête invalide.' }, { status: 400 }); }

  if (b.website) return NextResponse.json({ ok: true }, { status: 201 }); // robot

  const nom = String(b.nom || '').trim();
  const contact = String(b.contact || '').trim();
  const message = String(b.message || '').trim();

  if (nom.length < 2 || nom.length > 100) return NextResponse.json({ erreur: 'Nom invalide.' }, { status: 400 });
  if (contact.length < 5 || contact.length > 150) return NextResponse.json({ erreur: 'Téléphone ou e-mail invalide.' }, { status: 400 });
  if (message.length < 5 || message.length > 2000) return NextResponse.json({ erreur: 'Message trop court ou trop long.' }, { status: 400 });

  if (MODE_DEMO) return NextResponse.json({ ok: true, demo: true }, { status: 201 }); // validé, mais rien n'est enregistré

  try {
    const { error } = await getSupabase().from('messages_contact').insert({ nom, contact, message });
    if (error) throw error;
    await notifier({
      sujet: `Nouveau message : ${nom}`,
      lignes: ['Nouveau message via le formulaire de contact', '', `Nom : ${nom}`, `Contact : ${contact}`, '', message],
      replyTo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) ? contact : undefined, // « Répondre » fonctionne si c'est un e-mail
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error('POST contact', e);
    return NextResponse.json({ erreur: 'Erreur serveur, merci de réessayer.' }, { status: 500 });
  }
}