// Validation des fiches du carnet de clients (back-office).
const texte = (v, min, max) => {
  const s = String(v ?? '').trim().replace(/\s+/g, ' ');
  return s.length >= min && s.length <= max ? s : null;
};

export function nettoyerClient(b) {
  if (!b || typeof b !== 'object') return { ok: false, erreur: 'Données invalides.' };
  const nom = texte(b.nom, 2, 100);
  if (!nom) return { ok: false, erreur: 'Nom invalide (2 à 100 caractères).' };
  const telephone = String(b.telephone ?? '').trim();
  if (telephone && !/^[0-9+().\s-]{6,20}$/.test(telephone)) return { ok: false, erreur: 'Numéro de téléphone invalide.' };
  const email = String(b.email ?? '').trim();
  if (email && (email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return { ok: false, erreur: 'Adresse e-mail invalide.' };
  if (!telephone && !email) return { ok: false, erreur: 'Indiquez au moins un téléphone ou une adresse e-mail.' };
  const adresse = String(b.adresse ?? '').trim().replace(/\s+/g, ' ');
  if (adresse.length > 200) return { ok: false, erreur: 'Adresse trop longue (200 caractères maximum).' };
  const commune = String(b.commune ?? '').trim().replace(/\s+/g, ' ');
  if (commune.length > 60) return { ok: false, erreur: 'Commune trop longue (60 caractères maximum).' };
  const notes = String(b.notes ?? '').trim();
  if (notes.length > 1000) return { ok: false, erreur: 'Notes trop longues (1000 caractères maximum).' };
  return {
    ok: true,
    client: { nom, telephone: telephone || null, email: email || null, adresse: adresse || null, commune: commune || null, notes: notes || null },
  };
}
