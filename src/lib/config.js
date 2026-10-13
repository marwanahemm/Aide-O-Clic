import { cache } from 'react';
import { getSupabase } from './supabase';
import {
  PRIX_HEURE_DEFAUT, PRIX_PACK_2H_DEFAUT, CREDIT_IMPOT_PCT_DEFAUT, CRENEAUX_DEFAUT, COMMUNES_DEFAUT,
} from './pricing';
import { TELEPHONE, EMAIL, EDITEUR, DATE_MAJ_LEGAL } from './site';

// Réglages modifiables depuis le back-office. Valeurs de départ = celles écrites dans le code.
export const CONFIG_DEFAUT = {
  prixHeure: PRIX_HEURE_DEFAUT,
  prixPack2h: PRIX_PACK_2H_DEFAUT,
  creditImpotPct: CREDIT_IMPOT_PCT_DEFAUT,
  annulationHeures: 24, // annulation sans frais jusqu'à X h avant le rendez-vous (0 = toujours sans frais)
  creneaux: CRENEAUX_DEFAUT,
  communes: COMMUNES_DEFAUT,
  telephone: TELEPHONE,
  email: EMAIL,
  horaires: 'Du lundi au vendredi : 09h00 – 18h00',
  editeur: { ...EDITEUR },
  dateMajLegal: DATE_MAJ_LEGAL,
};

export function telHref(tel) {
  const d = String(tel).replace(/[^\d+]/g, '');
  if (d.startsWith('+')) return 'tel:' + d;
  if (d.startsWith('0')) return 'tel:+33' + d.slice(1);
  return 'tel:' + d;
}

const texte = (v, min, max) => {
  const s = String(v ?? '').trim().replace(/\s+/g, ' ');
  return s.length >= min && s.length <= max ? s : null;
};
const liste = (v, maxItems, min, max) => {
  if (!Array.isArray(v) || v.length < 1 || v.length > maxItems) return null;
  const out = v.map((x) => texte(x, min, max));
  if (out.includes(null)) return null;
  if (new Set(out.map((x) => x.toLowerCase())).size !== out.length) return null; // pas de doublon
  return out;
};
const prix = (v) => {
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) && n > 0 && n <= 1000 ? Math.round(n * 100) / 100 : null;
};

/**
 * Valide et nettoie une configuration (utilisée à l'enregistrement ET à la lecture).
 * Retourne { ok: true, config } ou { ok: false, erreur }.
 */
export function nettoyerConfig(b) {
  if (!b || typeof b !== 'object') return { ok: false, erreur: 'Données invalides.' };
  const prixHeure = prix(b.prixHeure);
  const prixPack2h = prix(b.prixPack2h);
  if (prixHeure === null) return { ok: false, erreur: "Prix de l'heure invalide (entre 0,01 et 1000 €)." };
  if (prixPack2h === null) return { ok: false, erreur: 'Prix du pack 2h invalide (entre 0,01 et 1000 €).' };
  if (prixPack2h > prixHeure * 2) return { ok: false, erreur: "Le pack 2h ne peut pas coûter plus que 2 heures au tarif normal." };

  const pct = Number(b.creditImpotPct);
  if (!Number.isFinite(pct) || pct < 0 || pct > 100) return { ok: false, erreur: "Crédit d'impôt invalide (entre 0 et 100 %)." };

  const annulationHeures = Number(b.annulationHeures);
  if (!Number.isInteger(annulationHeures) || annulationHeures < 0 || annulationHeures > 168) return { ok: false, erreur: "Délai d'annulation invalide (nombre entier d'heures, de 0 à 168)." };

  const creneaux = liste(b.creneaux, 12, 3, 40);
  if (!creneaux) return { ok: false, erreur: 'Créneaux invalides : 1 à 12, de 3 à 40 caractères, sans doublon.' };
  const communes = liste(b.communes, 40, 2, 60);
  if (!communes) return { ok: false, erreur: 'Communes invalides : 1 à 40, de 2 à 60 caractères, sans doublon.' };

  const telephone = String(b.telephone ?? '').trim();
  if (!/^[0-9+().\s-]{6,20}$/.test(telephone)) return { ok: false, erreur: 'Numéro de téléphone invalide.' };
  const email = String(b.email ?? '').trim();
  if (email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, erreur: 'Adresse e-mail invalide.' };
  const horaires = texte(b.horaires, 3, 120);
  if (!horaires) return { ok: false, erreur: 'Horaires invalides (3 à 120 caractères).' };
  const dateMajLegal = texte(b.dateMajLegal, 3, 40);
  if (!dateMajLegal) return { ok: false, erreur: 'Date de mise à jour des mentions légales invalide.' };

  const e = b.editeur || {};
  const editeur = {};
  for (const k of Object.keys(EDITEUR)) {
    const v = texte(e[k], 1, 200);
    if (!v) return { ok: false, erreur: `Champ « ${k} » des mentions légales invalide (1 à 200 caractères).` };
    editeur[k] = v;
  }

  return {
    ok: true,
    config: { prixHeure, prixPack2h, creditImpotPct: Math.round(pct * 100) / 100, annulationHeures, creneaux, communes, telephone, email, horaires, editeur, dateMajLegal },
  };
}

function enrichir(c) {
  return { ...c, creditImpot: c.creditImpotPct / 100, telephoneHref: telHref(c.telephone) };
}

export function baseConfiguree() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Lit les réglages en base (ligne « site »). Si la base est absente ou en erreur : valeurs par défaut du code. */
// cache() : le layout et la page demandent la config dans la même requête → une seule lecture en base
export const getConfig = cache(async function getConfig() {
  if (!baseConfiguree()) return enrichir(CONFIG_DEFAUT);
  try {
    const { data, error } = await getSupabase().from('parametres').select('valeur').eq('cle', 'site').maybeSingle();
    if (error) throw error;
    if (!data) return enrichir(CONFIG_DEFAUT);
    const r = nettoyerConfig({ ...CONFIG_DEFAUT, ...data.valeur, editeur: { ...CONFIG_DEFAUT.editeur, ...(data.valeur?.editeur || {}) } });
    if (!r.ok) throw new Error(r.erreur);
    return enrichir(r.config);
  } catch (e) {
    console.error('getConfig :', e.message);
    return enrichir(CONFIG_DEFAUT);
  }
});
