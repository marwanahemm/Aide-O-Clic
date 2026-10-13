// Valeurs PAR DÉFAUT. Les valeurs réelles se modifient dans le back-office (/admin) et sont lues via getConfig()
// (src/lib/config.js). Ce fichier sert aussi de secours si la base de données n'est pas joignable.
export const PRIX_HEURE_DEFAUT = 25;
export const PRIX_PACK_2H_DEFAUT = 35;
export const CREDIT_IMPOT_PCT_DEFAUT = 50;
export const CRENEAUX_DEFAUT = ['09h00 - 11h00', '11h00 - 12h30', '14h00 - 16h00', '16h00 - 18h00'];
export const COMMUNES_DEFAUT = ['Agen', 'Boé', 'Le Passage', 'Bon-Encontre', 'Castelculier', 'Lafox'];

export const eur = (n) => n.toFixed(2).replace('.', ',') + ' €';
// 25 → « 25 », 50.5 → « 50,50 » (toujours 2 décimales quand le prix n'est pas rond)
export const nombre = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));

// Formules proposées dans le formulaire de rendez-vous
export function construirePrestations({ prixHeure, prixPack2h }) {
  return [
    { value: `Forfait 1h (${nombre(prixHeure)} €)`, label: `Forfait 1h — Assistance Ponctuelle (${nombre(prixHeure)} €)` },
    { value: `Forfait 2h (${nombre(prixPack2h)} €)`, label: `Forfait 2h — Pack Approfondi (${nombre(prixPack2h)} €)` },
    { value: 'Assistance Administrative', label: 'Assistance Administrative générale' },
    { value: 'Assistance Informatique', label: 'Assistance & Pédagogie Informatique' },
  ];
}

// creditImpot : fraction (0,5 = 50 %). « net » = ce que paie réellement le client.
export function calculerBudget(heures, mode, { prixHeure, prixPack2h, creditImpot }) {
  let brut;
  if (mode === 'pack2h') {
    // Pack par tranche de 2h ; le reste est facturé à l'heure, sans jamais dépasser le prix d'un pack
    // (sinon 1h30 coûterait plus cher que 2h).
    const reste = (heures % 2) * prixHeure;
    brut = Math.floor(heures / 2) * prixPack2h + Math.min(reste, prixPack2h);
  } else {
    brut = heures * prixHeure;
  }
  return { brut, net: brut * (1 - creditImpot) };
}
