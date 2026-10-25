// Factures et attestations (back-office) : validation et calculs. Fonctions pures, utilisables côté serveur et dans le navigateur.
export const MODES_PAIEMENT = ['Chèque', 'Virement', 'Espèces', 'Carte bancaire', 'CESU préfinancé', 'Autre'];
export const STATUTS_FACTURE = ['emise', 'payee', 'annulee'];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const arrondi = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
export const aujourdhuiParis = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' }); // AAAA-MM-JJ

const texte = (v, min, max) => {
  const s = String(v ?? '').trim().replace(/\s+/g, ' ');
  return s.length >= min && s.length <= max ? s : null;
};
const dateIso = (v) => {
  const s = String(v ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s ? s : null;
};
const nombre = (v) => Number(String(v ?? '').replace(',', '.'));

export const totalLigne = (l) => arrondi(l.quantite * l.prix_unitaire);
export const calculerTotal = (lignes) => arrondi(lignes.reduce((s, l) => s + totalLigne(l), 0));

// Nouvelle facture
export function nettoyerFacture(b) {
  if (!b || typeof b !== 'object') return { ok: false, erreur: 'Données invalides.' };
  const aujourdhui = aujourdhuiParis();
  const date_facture = dateIso(b.date_facture || aujourdhui);
  if (!date_facture) return { ok: false, erreur: "Date d'émission invalide." };
  if (date_facture > aujourdhui) return { ok: false, erreur: "La date d'émission ne peut pas être dans le futur." };
  const date_prestation = dateIso(b.date_prestation);
  if (!date_prestation) return { ok: false, erreur: 'Date de la prestation invalide.' };
  if (date_prestation > date_facture) return { ok: false, erreur: "La prestation ne peut pas être postérieure à la date d'émission." };

  const client_nom = texte(b.client_nom, 2, 100);
  if (!client_nom) return { ok: false, erreur: 'Nom du client invalide (2 à 100 caractères).' };
  const client_adresse = String(b.client_adresse ?? '').trim().replace(/\s+/g, ' ');
  if (client_adresse.length > 250) return { ok: false, erreur: 'Adresse trop longue (250 caractères maximum).' };
  const notes = String(b.notes ?? '').trim();
  if (notes.length > 500) return { ok: false, erreur: 'Notes trop longues (500 caractères maximum).' };

  if (!Array.isArray(b.lignes) || b.lignes.length < 1 || b.lignes.length > 8) return { ok: false, erreur: 'Une facture comporte de 1 à 8 lignes.' };
  const lignes = [];
  for (let i = 0; i < b.lignes.length; i++) {
    const l = b.lignes[i] || {};
    const designation = texte(l.designation, 2, 120);
    if (!designation) return { ok: false, erreur: `Ligne ${i + 1} : désignation invalide (2 à 120 caractères).` };
    const quantite = nombre(l.quantite);
    if (!Number.isFinite(quantite) || quantite <= 0 || quantite > 100) return { ok: false, erreur: `Ligne ${i + 1} : quantité invalide (entre 0,01 et 100).` };
    const prix_unitaire = nombre(l.prix_unitaire);
    if (!Number.isFinite(prix_unitaire) || prix_unitaire < 0 || prix_unitaire > 1000) return { ok: false, erreur: `Ligne ${i + 1} : prix unitaire invalide (entre 0 et 1000 €).` };
    lignes.push({ designation, quantite: arrondi(quantite), prix_unitaire: arrondi(prix_unitaire) });
  }
  const total = calculerTotal(lignes);
  if (total <= 0) return { ok: false, erreur: 'Le total de la facture doit être supérieur à 0 €.' };

  const rdv_id = UUID.test(b.rdv_id || '') ? b.rdv_id : null;
  const client_id = UUID.test(b.client_id || '') ? b.client_id : null;
  return {
    ok: true,
    facture: { date_facture, date_prestation, client_nom, client_adresse: client_adresse || null, lignes, total, notes: notes || null, rdv_id, client_id },
  };
}

// Règlement d'une facture
export function nettoyerPaiement(b, dateFacture) {
  const aujourdhui = aujourdhuiParis();
  const date_paiement = dateIso(b?.date_paiement || aujourdhui);
  if (!date_paiement) return { ok: false, erreur: 'Date de règlement invalide.' };
  if (date_paiement > aujourdhui) return { ok: false, erreur: 'La date de règlement ne peut pas être dans le futur.' };
  if (dateFacture && date_paiement < dateFacture) return { ok: false, erreur: "Le règlement ne peut pas précéder la date d'émission de la facture." };
  const mode_paiement = texte(b?.mode_paiement, 2, 40);
  if (!mode_paiement) return { ok: false, erreur: 'Choisissez le mode de règlement.' };
  return { ok: true, paiement: { date_paiement, mode_paiement } };
}

// Correction des coordonnées du client sur une facture (les lignes et le montant ne changent jamais)
export function nettoyerCoordonnees(b) {
  const client_nom = texte(b?.client_nom, 2, 100);
  if (!client_nom) return { ok: false, erreur: 'Nom du client invalide (2 à 100 caractères).' };
  const client_adresse = String(b?.client_adresse ?? '').trim().replace(/\s+/g, ' ');
  if (client_adresse.length > 250) return { ok: false, erreur: 'Adresse trop longue (250 caractères maximum).' };
  const notes = String(b?.notes ?? '').trim();
  if (notes.length > 500) return { ok: false, erreur: 'Notes trop longues (500 caractères maximum).' };
  return { ok: true, valeurs: { client_nom, client_adresse: client_adresse || null, notes: notes || null } };
}

// Numéro suivant : AAAA-001, AAAA-002… (continu, par année d'émission)
export function numeroSuivant(annee, existants) {
  const dernier = existants
    .map((r) => String(r.numero || ''))
    .filter((n) => n.startsWith(`${annee}-`))
    .sort((a, b) => b.localeCompare(a))[0];
  const n = dernier ? parseInt(dernier.split('-')[1], 10) + 1 : 1;
  return `${annee}-${String(n).padStart(3, '0')}`;
}
