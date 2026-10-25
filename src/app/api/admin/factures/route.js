import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { garde } from '../../../../lib/adminAuth';
import { expliquerErreurBase } from '../../../../lib/erreurs';
import { nettoyerFacture, nettoyerPaiement, nettoyerCoordonnees, numeroSuivant } from '../../../../lib/facturesAdmin';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const lireJson = async (request) => { try { return await request.json(); } catch { return null; } };
const dateFr = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

// POST { date_facture?, date_prestation, client_nom, client_adresse?, lignes[], notes?, rdv_id?, client_id? } → crée une facture, numérotée à la suite
export async function POST(request) {
  const refus = await garde(request);
  if (refus) return refus;
  const b = await lireJson(request);
  if (!b) return NextResponse.json({ erreur: 'Requête invalide.' }, { status: 400 });
  const r = nettoyerFacture(b);
  if (!r.ok) return NextResponse.json({ erreur: r.erreur }, { status: 400 });

  try {
    const db = getSupabase();
    const annee = r.facture.date_facture.slice(0, 4);
    for (let essai = 0; essai < 4; essai++) {
      const { data, error } = await db.from('factures').select('numero, date_facture').like('numero', `${annee}-%`).order('numero', { ascending: false }).limit(5);
      if (error) throw error;
      const existants = (data || []).filter((x) => String(x.numero).startsWith(`${annee}-`));
      const dernier = [...existants].sort((a, c) => c.numero.localeCompare(a.numero))[0];
      // Numérotation chronologique : on ne peut pas émettre une facture datée avant la précédente
      if (dernier && r.facture.date_facture < dernier.date_facture) {
        return NextResponse.json({ erreur: `La date d'émission doit être postérieure ou égale à celle de la facture précédente (n° ${dernier.numero}, du ${dateFr(dernier.date_facture)}).` }, { status: 400 });
      }
      const numero = numeroSuivant(annee, existants);
      const { data: cree, error: e2 } = await db.from('factures').insert({ ...r.facture, numero }).select('*').maybeSingle();
      if (e2) {
        if (e2.code === '23505') continue; // numéro pris entre-temps : on recalcule
        throw e2;
      }
      return NextResponse.json({ ok: true, numero, id: cree?.id }, { status: 201 });
    }
    return NextResponse.json({ erreur: 'Numérotation impossible pour le moment, réessayez.' }, { status: 409 });
  } catch (e) {
    console.error('POST admin/factures', e.message);
    return NextResponse.json({ erreur: expliquerErreurBase(e) }, { status: 500 });
  }
}

// PATCH { id, action: 'payer' | 'rouvrir' | 'annuler', date_paiement?, mode_paiement? } → règlement, réouverture ou annulation
export async function PATCH(request) {
  const refus = await garde(request);
  if (refus) return refus;
  const b = await lireJson(request);
  if (!b || !UUID.test(b.id || '') || !['payer', 'rouvrir', 'annuler'].includes(b.action)) return NextResponse.json({ erreur: 'Données invalides.' }, { status: 400 });
  try {
    const db = getSupabase();
    const { data: f, error } = await db.from('factures').select('*').eq('id', b.id).maybeSingle();
    if (error) throw error;
    if (!f) return NextResponse.json({ erreur: 'Facture introuvable.' }, { status: 404 });

    let valeurs;
    if (b.action === 'payer') {
      if (f.statut !== 'emise') return NextResponse.json({ erreur: 'Seule une facture émise (non réglée, non annulée) peut être marquée comme payée.' }, { status: 409 });
      const p = nettoyerPaiement(b, f.date_facture);
      if (!p.ok) return NextResponse.json({ erreur: p.erreur }, { status: 400 });
      valeurs = { statut: 'payee', ...p.paiement };
    } else if (b.action === 'rouvrir') {
      if (f.statut !== 'payee') return NextResponse.json({ erreur: 'Seule une facture payée peut être rouverte.' }, { status: 409 });
      valeurs = { statut: 'emise', date_paiement: null, mode_paiement: null };
    } else {
      if (f.statut !== 'emise') return NextResponse.json({ erreur: "Seule une facture émise et non réglée peut être annulée (rouvrez-la d'abord si elle est payée)." }, { status: 409 });
      valeurs = { statut: 'annulee' };
    }
    const { error: e2 } = await db.from('factures').update(valeurs).eq('id', b.id);
    if (e2) throw e2;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('PATCH admin/factures', e.message);
    return NextResponse.json({ erreur: expliquerErreurBase(e) }, { status: 500 });
  }
}

// PUT { id, client_nom, client_adresse?, notes? } → corrige les coordonnées du client (jamais les lignes ni le montant)
export async function PUT(request) {
  const refus = await garde(request);
  if (refus) return refus;
  const b = await lireJson(request);
  if (!b || !UUID.test(b.id || '')) return NextResponse.json({ erreur: 'Données invalides.' }, { status: 400 });
  const r = nettoyerCoordonnees(b);
  if (!r.ok) return NextResponse.json({ erreur: r.erreur }, { status: 400 });
  try {
    const { data, error } = await getSupabase().from('factures').update(r.valeurs).eq('id', b.id).neq('statut', 'annulee').select('id').maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ erreur: 'Facture introuvable ou annulée.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('PUT admin/factures', e.message);
    return NextResponse.json({ erreur: expliquerErreurBase(e) }, { status: 500 });
  }
}
