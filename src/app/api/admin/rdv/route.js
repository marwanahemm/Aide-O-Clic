import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getConfig } from '../../../../lib/config';
import { envoyerAuClient } from '../../../../lib/notify';
import { garde } from '../../../../lib/adminAuth';
import { expliquerErreurBase } from '../../../../lib/erreurs';
import { NOM_SITE } from '../../../../lib/site';
import { nettoyerRdv } from '../../../../lib/rdvAdmin';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUTS = ['en_attente', 'confirme', 'annule'];

const dateLongue = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('fr-FR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
});

async function envoyerConfirmation(rdv, request, modifie = false) {
  const cfg = await getConfig();
  const jour = dateLongue(rdv.date_rdv);
  return envoyerAuClient({
    to: rdv.email,
    replyTo: cfg.email, // le client répond directement à l'éditeur
    sujet: `${modifie ? 'Rendez-vous modifié' : 'Rendez-vous confirmé'} : ${jour}, ${rdv.creneau}`,
    lignes: [
      `Bonjour ${rdv.nom},`,
      '',
      modifie ? 'Votre rendez-vous a été modifié. Voici les nouvelles informations :' : 'Votre rendez-vous est confirmé :',
      '',
      `Date : ${jour}`,
      `Créneau : ${rdv.creneau}`,
      `Commune : ${rdv.commune}`,
      `Prestation : ${rdv.prestation}`,
      '',
      `Je me déplace à votre domicile. Pour modifier ou annuler, répondez à cet e-mail ou appelez-moi au ${cfg.telephone}.`,
      '',
      'À bientôt,',
      `${NOM_SITE} — Assistance administrative & informatique à domicile`,
      '',
      `Vous recevez ce message car vous avez renseigné votre adresse e-mail en demandant un rendez-vous sur ${new URL(request.url).host}. Elle n'est utilisée que pour ce rendez-vous.`,
    ],
  });
}

// Courriel au client après création / modification (si demandé, si adresse renseignée et rendez-vous confirmé)
async function prevenirClient({ prevenir, rdv, request, modifie }) {
  if (!prevenir || rdv.statut !== 'confirme') return { email: 'aucun' };
  if (!rdv.email) return { email: 'sans_adresse' };
  const r = await envoyerConfirmation(rdv, request, modifie);
  return { email: r.ok ? 'envoye' : 'non_envoye', ...(r.detail ? { detail: r.detail } : {}) };
}

const MSG_CRENEAU_PRIS = 'Ce créneau est déjà pris ce jour-là par un autre rendez-vous (annulez-le d\'abord, ou choisissez un autre créneau).';

// POST { date_rdv, creneau, nom, telephone, email?, commune, prestation, details?, statut?, prevenir? } → crée un rendez-vous (ex. pris par téléphone)
export async function POST(request) {
  const refus = await garde(request);
  if (refus) return refus;
  let b;
  try { b = await request.json(); } catch { return NextResponse.json({ erreur: 'Requête invalide.' }, { status: 400 }); }
  const r = nettoyerRdv(b);
  if (!r.ok) return NextResponse.json({ erreur: r.erreur }, { status: 400 });
  try {
    const { data, error } = await getSupabase().from('rendez_vous').insert(r.rdv).select('*').maybeSingle();
    if (error) {
      if (error.code === '23505') return NextResponse.json({ erreur: MSG_CRENEAU_PRIS }, { status: 409 });
      throw error;
    }
    const cree = data || { ...r.rdv };
    return NextResponse.json({ ok: true, ...(await prevenirClient({ prevenir: r.prevenir, rdv: cree, request, modifie: false })) }, { status: 201 });
  } catch (e) {
    console.error('POST admin/rdv', e.message);
    return NextResponse.json({ erreur: expliquerErreurBase(e) }, { status: 500 });
  }
}

// PUT { id, ...mêmes champs } → modifie tous les champs d'un rendez-vous
export async function PUT(request) {
  const refus = await garde(request);
  if (refus) return refus;
  let b;
  try { b = await request.json(); } catch { return NextResponse.json({ erreur: 'Requête invalide.' }, { status: 400 }); }
  if (!UUID.test(b?.id || '')) return NextResponse.json({ erreur: 'Données invalides.' }, { status: 400 });
  const r = nettoyerRdv(b);
  if (!r.ok) return NextResponse.json({ erreur: r.erreur }, { status: 400 });
  try {
    const { data, error } = await getSupabase().from('rendez_vous').update(r.rdv).eq('id', b.id).select('*').maybeSingle();
    if (error) {
      if (error.code === '23505') return NextResponse.json({ erreur: MSG_CRENEAU_PRIS }, { status: 409 });
      throw error;
    }
    if (!data) return NextResponse.json({ erreur: 'Rendez-vous introuvable.' }, { status: 404 });
    return NextResponse.json({ ok: true, ...(await prevenirClient({ prevenir: r.prevenir, rdv: data, request, modifie: true })) });
  } catch (e) {
    console.error('PUT admin/rdv', e.message);
    return NextResponse.json({ erreur: expliquerErreurBase(e) }, { status: 500 });
  }
}

// PATCH { id, statut, renvoyer? } → change le statut d'un rendez-vous (un RDV annulé libère le créneau).
// Passer à « confirmé » envoie un e-mail au client s'il a laissé son adresse (renvoyer: true force un nouvel envoi).
// Réponse : { ok, email: 'envoye' | 'non_envoye' | 'sans_adresse' | 'aucun', detail? }
export async function PATCH(request) {
  const refus = await garde(request);
  if (refus) return refus;
  let b;
  try { b = await request.json(); } catch { return NextResponse.json({ erreur: 'Requête invalide.' }, { status: 400 }); }
  if (!UUID.test(b.id || '') || !STATUTS.includes(b.statut) || (b.renvoyer !== undefined && typeof b.renvoyer !== 'boolean')) {
    return NextResponse.json({ erreur: 'Données invalides.' }, { status: 400 });
  }
  try {
    const db = getSupabase();
    const avant = await db.from('rendez_vous').select('*').eq('id', b.id).maybeSingle();
    if (avant.error) throw avant.error;
    if (!avant.data) return NextResponse.json({ erreur: 'Rendez-vous introuvable.' }, { status: 404 });

    const { error } = await db.from('rendez_vous').update({ statut: b.statut }).eq('id', b.id);
    if (error) {
      if (error.code === '23505') return NextResponse.json({ erreur: 'Impossible : ce créneau a été réservé par quelqu\'un d\'autre entre-temps.' }, { status: 409 });
      throw error;
    }

    let email = 'aucun';
    let detail;
    if (b.statut === 'confirme' && (avant.data.statut !== 'confirme' || b.renvoyer === true)) {
      if (!avant.data.email) {
        email = 'sans_adresse';
      } else {
        const r = await envoyerConfirmation(avant.data, request);
        email = r.ok ? 'envoye' : 'non_envoye';
        detail = r.detail;
      }
    }
    return NextResponse.json({ ok: true, email, ...(detail ? { detail } : {}) });
  } catch (e) {
    console.error('PATCH admin/rdv', e.message);
    return NextResponse.json({ erreur: expliquerErreurBase(e) }, { status: 500 });
  }
}

// DELETE { id } → supprime définitivement un rendez-vous
export async function DELETE(request) {
  const refus = await garde(request);
  if (refus) return refus;
  let b;
  try { b = await request.json(); } catch { return NextResponse.json({ erreur: 'Requête invalide.' }, { status: 400 }); }
  if (!UUID.test(b.id || '')) return NextResponse.json({ erreur: 'Données invalides.' }, { status: 400 });
  try {
    const { error } = await getSupabase().from('rendez_vous').delete().eq('id', b.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE admin/rdv', e.message);
    return NextResponse.json({ erreur: expliquerErreurBase(e) }, { status: 500 });
  }
}
