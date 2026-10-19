import { cache } from 'react';
import { getSupabase } from './supabase';
import {
  CREDIT_IMPOT_PCT_DEFAUT, CRENEAUX_DEFAUT, COMMUNES_DEFAUT, FORMULES_DEFAUT, FAQ_DEFAUT, CATALOGUE_DEFAUT, ICONES_CATALOGUE, tarifHoraire,
} from './pricing';
import { TELEPHONE, EMAIL, EDITEUR, DATE_MAJ_LEGAL } from './site';

// Réglages modifiables depuis le back-office. Valeurs de départ = celles écrites dans le code.
export const CONFIG_DEFAUT = {
  formules: FORMULES_DEFAUT,
  faq: FAQ_DEFAUT,
  catalogue: CATALOGUE_DEFAUT,
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

const texteLong = (v, min, max) => {
  const s = String(v ?? '').replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return s.length >= min && s.length <= max ? s : null;
};

function nettoyerFormules(v) {
  if (!Array.isArray(v) || v.length < 1 || v.length > 6) return { erreur: 'Formules invalides : il en faut de 1 à 6.' };
  const formules = [];
  for (let i = 0; i < v.length; i++) {
    const f = v[i] || {};
    const n = i + 1;
    const nom = texte(f.nom, 2, 80);
    if (!nom) return { erreur: `Formule ${n} : nom invalide (2 à 80 caractères).` };
    const description = String(f.description ?? '').trim().replace(/\s+/g, ' ');
    if (description.length > 200) return { erreur: `Formule ${n} : description trop longue (200 caractères maximum).` };
    const heures = Number(String(f.heures).replace(',', '.'));
    if (!Number.isFinite(heures) || heures < 0.5 || heures > 10 || (heures * 2) % 1 !== 0) return { erreur: `Formule ${n} : durée invalide (de 0,5 à 10 heures, par demi-heure).` };
    const prixF = prix(f.prix);
    if (prixF === null) return { erreur: `Formule ${n} : prix invalide (entre 0,01 et 1000 €).` };
    const badge = String(f.badge ?? '').trim().replace(/\s+/g, ' ');
    if (badge.length > 40) return { erreur: `Formule ${n} : étiquette trop longue (40 caractères maximum).` };
    const points = (Array.isArray(f.points) ? f.points : []).map((x) => String(x ?? '').trim().replace(/\s+/g, ' ')).filter(Boolean);
    if (points.length > 8 || points.some((p) => p.length < 2 || p.length > 120)) return { erreur: `Formule ${n} : 8 points maximum, de 2 à 120 caractères chacun.` };
    formules.push({ nom, description, heures, prix: prixF, badge, points });
  }
  if (new Set(formules.map((f) => f.nom.toLowerCase())).size !== formules.length) return { erreur: 'Deux formules portent le même nom.' };
  return { formules };
}

function nettoyerCatalogue(v) {
  if (!Array.isArray(v) || v.length > 6) return { erreur: 'Catalogue invalide : 6 catégories au maximum.' };
  const icones = ICONES_CATALOGUE.map(([n]) => n);
  const catalogue = [];
  for (let i = 0; i < v.length; i++) {
    const c = v[i] || {};
    const n = i + 1;
    const titre = texte(c.titre, 2, 80);
    if (!titre) return { erreur: `Catégorie ${n} : titre invalide (2 à 80 caractères).` };
    const intro = String(c.intro ?? '').trim().replace(/\s+/g, ' ');
    if (intro.length > 200) return { erreur: `Catégorie ${n} : introduction trop longue (200 caractères maximum).` };
    const icone = icones.includes(c.icone) ? c.icone : 'file';
    if (!Array.isArray(c.items) || c.items.length > 10) return { erreur: `Catégorie ${n} : 10 prestations au maximum.` };
    const items = [];
    for (let j = 0; j < c.items.length; j++) {
      const it = c.items[j] || {};
      const t = String(it.titre ?? '').trim().replace(/\s+/g, ' ');
      if (t.length > 80) return { erreur: `Catégorie ${n}, prestation ${j + 1} : titre trop long (80 caractères maximum).` };
      const tx = texte(it.texte, 2, 300);
      if (!tx) return { erreur: `Catégorie ${n}, prestation ${j + 1} : description invalide (2 à 300 caractères).` };
      items.push({ titre: t, texte: tx, icone: icones.includes(it.icone) ? it.icone : 'check' });
    }
    catalogue.push({ titre, intro, icone, items });
  }
  if (new Set(catalogue.map((c) => c.titre.toLowerCase())).size !== catalogue.length) return { erreur: 'Deux catégories portent le même titre.' };
  return { catalogue };
}

function nettoyerFaq(v) {
  if (!Array.isArray(v) || v.length > 20) return { erreur: 'FAQ invalide : 20 questions au maximum.' };
  const faq = [];
  for (let i = 0; i < v.length; i++) {
    const q = texte(v[i]?.q, 3, 200);
    const r = texteLong(v[i]?.r, 3, 1500);
    if (!q) return { erreur: `Question ${i + 1} : intitulé invalide (3 à 200 caractères).` };
    if (!r) return { erreur: `Question ${i + 1} : réponse invalide (3 à 1500 caractères).` };
    faq.push({ q, r });
  }
  return { faq };
}

/**
 * Valide et nettoie une configuration (utilisée à l'enregistrement ET à la lecture).
 * Retourne { ok: true, config } ou { ok: false, erreur }.
 */
export function nettoyerConfig(b) {
  if (!b || typeof b !== 'object') return { ok: false, erreur: 'Données invalides.' };
  const f = nettoyerFormules(b.formules);
  if (f.erreur) return { ok: false, erreur: f.erreur };
  const q = nettoyerFaq(b.faq);
  if (q.erreur) return { ok: false, erreur: q.erreur };
  const cat = nettoyerCatalogue(b.catalogue);
  if (cat.erreur) return { ok: false, erreur: cat.erreur };

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
    config: { formules: f.formules, faq: q.faq, catalogue: cat.catalogue, creditImpotPct: Math.round(pct * 100) / 100, annulationHeures, creneaux, communes, telephone, email, horaires, editeur, dateMajLegal },
  };
}

function enrichir(c) {
  return { ...c, creditImpot: c.creditImpotPct / 100, telephoneHref: telHref(c.telephone), tarifHoraire: tarifHoraire(c.formules) };
}

export function baseConfiguree() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// Anciennes configurations (avant les formules libres) : les deux prix deviennent les formules « 1 heure » et « 2 heures »
function migrer(valeur) {
  const v = { ...(valeur || {}) };
  if (!v.formules && (v.prixHeure != null || v.prixPack2h != null)) {
    v.formules = FORMULES_DEFAUT.map((f) => {
      if (f.heures === 1 && v.prixHeure != null) return { ...f, prix: v.prixHeure };
      if (f.heures === 2 && v.prixPack2h != null) return { ...f, prix: v.prixPack2h };
      return f;
    });
  }
  delete v.prixHeure;
  delete v.prixPack2h;
  return v;
}

/** Lit les réglages en base (ligne « site »). Si la base est absente ou en erreur : valeurs par défaut du code. */
// cache() : le layout et la page demandent la config dans la même requête → une seule lecture en base
export const getConfig = cache(async function getConfig() {
  if (!baseConfiguree()) return enrichir(CONFIG_DEFAUT);
  try {
    const { data, error } = await getSupabase().from('parametres').select('valeur').eq('cle', 'site').maybeSingle();
    if (error) throw error;
    if (!data) return enrichir(CONFIG_DEFAUT);
    const saved = migrer(data.valeur);
    const r = nettoyerConfig({ ...CONFIG_DEFAUT, ...saved, editeur: { ...CONFIG_DEFAUT.editeur, ...(saved.editeur || {}) } });
    if (!r.ok) throw new Error(r.erreur);
    return enrichir(r.config);
  } catch (e) {
    console.error('getConfig :', e.message);
    return enrichir(CONFIG_DEFAUT);
  }
});
