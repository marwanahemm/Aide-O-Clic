// Validation des rendez-vous créés / modifiés depuis le back-office (/admin).
export const STATUTS_RDV = ['en_attente', 'confirme', 'annule'];

const texte = (v, min, max) => {
  const s = String(v ?? '').trim().replace(/\s+/g, ' ');
  return s.length >= min && s.length <= max ? s : null;
};

export function nettoyerRdv(b) {
  if (!b || typeof b !== 'object') return { ok: false, erreur: 'Données invalides.' };
  const date = String(b.date_rdv ?? '').trim();
  const d = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T12:00:00Z`) : null;
  if (!d || Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== date) return { ok: false, erreur: 'Date invalide.' };

  const creneau = texte(b.creneau, 3, 40);
  if (!creneau) return { ok: false, erreur: 'Créneau invalide (3 à 40 caractères, ex. « 09h00 - 11h00 »).' };
  const nom = texte(b.nom, 2, 100);
  if (!nom) return { ok: false, erreur: 'Nom invalide (2 à 100 caractères).' };
  const telephone = String(b.telephone ?? '').trim();
  if (!/^[0-9+().\s-]{6,20}$/.test(telephone)) return { ok: false, erreur: 'Numéro de téléphone invalide.' };
  const email = String(b.email ?? '').trim();
  if (email && (email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return { ok: false, erreur: 'Adresse e-mail invalide.' };
  const commune = texte(b.commune, 2, 60);
  if (!commune) return { ok: false, erreur: 'Commune invalide (2 à 60 caractères).' };
  const prestation = texte(b.prestation, 2, 120);
  if (!prestation) return { ok: false, erreur: 'Prestation invalide (2 à 120 caractères).' };
  const details = String(b.details ?? '').trim();
  if (details.length > 1000) return { ok: false, erreur: 'Précisions trop longues (1000 caractères maximum).' };
  const statut = b.statut === undefined ? 'confirme' : b.statut;
  if (!STATUTS_RDV.includes(statut)) return { ok: false, erreur: 'Statut invalide.' };

  return {
    ok: true,
    rdv: { date_rdv: date, creneau, nom, telephone, email: email || null, commune, prestation, details: details || null, statut },
    prevenir: b.prevenir === true,
  };
}
