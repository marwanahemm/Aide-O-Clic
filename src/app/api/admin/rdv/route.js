import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getConfig } from '../../../../lib/config';
import { envoyerAuClient } from '../../../../lib/notify';
import { garde } from '../../../../lib/adminAuth';
import { NOM_SITE } from '../../../../lib/site';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUTS = ['en_attente', 'confirme', 'annule'];

const dateLongue = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('fr-FR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
});

async function envoyerConfirmation(rdv, request) {
  const cfg = await getConfig();
  const jour = dateLongue(rdv.date_rdv);
  return envoyerAuClient({
    to: rdv.email,
    replyTo: cfg.email, // le client répond directement à l'éditeur
    sujet: `Rendez-vous confirmé : ${jour}, ${rdv.creneau}`,
    lignes: [
      `Bonjour ${rdv.nom},`,
      '',
      'Votre rendez-vous est confirmé :',
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
    return NextResponse.json({ erreur: 'Erreur serveur.' }, { status: 500 });
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
    return NextResponse.json({ erreur: 'Erreur serveur.' }, { status: 500 });
  }
}
