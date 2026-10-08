import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { MODE_DEMO, RETENTION_RDV_MOIS, RETENTION_CONTACT_MOIS } from '../../../../lib/site';

export const dynamic = 'force-dynamic';

const ilYaMois = (n) => { const d = new Date(); d.setUTCMonth(d.getUTCMonth() - n); return d; };

// Appelée chaque nuit par le Cron Trigger Cloudflare (voir wrangler.jsonc et worker.js). Protégée par CRON_SECRET.
export async function GET(request) {
  if (MODE_DEMO) return NextResponse.json({ ok: true, demo: true }); // rien n'est stocké, donc rien à purger
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: 'Non autorisé.' }, { status: 401 });
  }
  try {
    const db = getSupabase();
    const rdv = await db.from('rendez_vous').delete({ count: 'exact' })
      .lt('date_rdv', ilYaMois(RETENTION_RDV_MOIS).toISOString().slice(0, 10));
    if (rdv.error) throw rdv.error;
    const msg = await db.from('messages_contact').delete({ count: 'exact' })
      .lt('created_at', ilYaMois(RETENTION_CONTACT_MOIS).toISOString());
    if (msg.error) throw msg.error;
    return NextResponse.json({ ok: true, rendezVousSupprimes: rdv.count, messagesSupprimes: msg.count });
  } catch (e) {
    console.error('cron purge', e.message);
    return NextResponse.json({ erreur: 'Erreur serveur.' }, { status: 500 });
  }
}