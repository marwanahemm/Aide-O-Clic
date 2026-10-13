import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';
import { construirePrestations } from '../../../lib/pricing';
import { getConfig } from '../../../lib/config';
import { notifier } from '../../../lib/notify';
import { MODE_DEMO } from '../../../lib/site';

export const dynamic = 'force-dynamic';

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const TEL = /^[0-9+().\s-]{6,20}$/;

function jourOuvreFutur(iso) {
  if (!ISO.test(iso)) return false;
  const [y, m, j] = iso.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1, j, 12));
  // JS « corrige » silencieusement les dates inexistantes (31 février → 3 mars) : on les refuse ici,
  // sinon la base les rejette et l'utilisateur reçoit une erreur 500 au lieu d'un 400.
  if (d.getUTCFullYear() !== y || d.getUTCMonth() !== m - 1 || d.getUTCDate() !== j) return false;
  if (d.getUTCDay() === 0 || d.getUTCDay() === 6) return false;
  // « Demain » se calcule à l'heure de Paris (le serveur Cloudflare tourne en UTC).
  const aujourdhui = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' }); // AAAA-MM-JJ
  const demain = new Date(aujourdhui + 'T12:00:00Z');
  demain.setUTCDate(demain.getUTCDate() + 1);
  return d >= demain;
}

// GET /api/rendez-vous?date=2026-10-12 → créneaux déjà pris (aucune donnée personnelle)
export async function GET(request) {
  const date = new URL(request.url).searchParams.get('date') || '';
  if (!ISO.test(date)) return NextResponse.json({ erreur: 'Date invalide.' }, { status: 400 });
  if (MODE_DEMO) return NextResponse.json({ pris: [] });
  try {
    const { data, error } = await getSupabase()
      .from('rendez_vous').select('creneau').eq('date_rdv', date).neq('statut', 'annule');
    if (error) throw error;
    return NextResponse.json({ pris: data.map((r) => r.creneau) });
  } catch (e) {
    console.error('GET rendez-vous', e);
    return NextResponse.json({ erreur: 'Erreur serveur.' }, { status: 500 });
  }
}

// POST /api/rendez-vous → 201 créé · 400 invalide · 409 créneau pris · 500 erreur serveur
export async function POST(request) {
  let b;
  try { b = await request.json(); } catch { return NextResponse.json({ erreur: 'Requête invalide.' }, { status: 400 }); }

  if (b.website) return NextResponse.json({ ok: true }, { status: 201 }); // robot : on fait semblant

  const cfg = await getConfig();
  const nom = String(b.nom || '').trim();
  const telephone = String(b.telephone || '').trim();
  const details = String(b.details || '').trim();
  const email = String(b.email || '').trim(); // facultatif : sert à envoyer la confirmation du rendez-vous

  if (nom.length < 2 || nom.length > 100) return NextResponse.json({ erreur: 'Nom invalide.' }, { status: 400 });
  if (!TEL.test(telephone)) return NextResponse.json({ erreur: 'Numéro de téléphone invalide.' }, { status: 400 });
  if (email && (email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return NextResponse.json({ erreur: 'Adresse e-mail invalide.' }, { status: 400 });
  if (!construirePrestations(cfg).some((p) => p.value === b.prestation)) return NextResponse.json({ erreur: 'Prestation invalide.' }, { status: 400 });
  if (!cfg.communes.includes(b.commune)) return NextResponse.json({ erreur: 'Commune invalide.' }, { status: 400 });
  if (!cfg.creneaux.includes(b.creneau)) return NextResponse.json({ erreur: 'Créneau invalide.' }, { status: 400 });
  if (!jourOuvreFutur(b.date)) return NextResponse.json({ erreur: 'Choisissez un jour ouvré à partir de demain.' }, { status: 400 });
  if (details.length > 1000) return NextResponse.json({ erreur: 'Message trop long.' }, { status: 400 });
  if (!b.accepteConditions) return NextResponse.json({ erreur: "Merci de cocher la case d'acceptation des conditions d'annulation et de rétractation." }, { status: 400 });

  if (MODE_DEMO) return NextResponse.json({ ok: true, demo: true }, { status: 201 }); // validé, mais rien n'est enregistré

  try {
    const { error } = await getSupabase().from('rendez_vous').insert({
      date_rdv: b.date, creneau: b.creneau, nom, telephone, email: email || null,
      prestation: b.prestation, commune: b.commune, details: details || null,
      conditions_acceptees_le: new Date().toISOString(), // preuve de l'accord du client (demande d'exécution avant la fin du délai de rétractation)
    });
    if (error) {
      if (error.code === '23505') return NextResponse.json({ erreur: 'Créneau déjà réservé.' }, { status: 409 });
      throw error;
    }
    const dateLongue = new Date(b.date + 'T12:00:00Z').toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    });
    await notifier({
      sujet: `Nouveau RDV : ${nom} — ${dateLongue}, ${b.creneau}`,
      lignes: [
        'Nouvelle demande de rendez-vous',
        '',
        `Date : ${dateLongue}`,
        `Créneau : ${b.creneau}`,
        `Nom : ${nom}`,
        `Téléphone : ${telephone}`,
        `E-mail : ${email || '—'}`,
        `Commune : ${b.commune}`,
        `Prestation : ${b.prestation}`,
        `Précisions : ${details || '—'}`,
        '',
        `À confirmer ou annuler dans le back-office : ${new URL('/admin', request.url).href}`,
      ],
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error('POST rendez-vous', e);
    return NextResponse.json({ erreur: 'Erreur serveur, merci de réessayer.' }, { status: 500 });
  }
}