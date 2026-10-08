// Coordonnées affichées partout sur le site (accueil, contact, mentions légales)
export const TELEPHONE = '07 81 05 14 72';
export const TELEPHONE_HREF = 'tel:+33781051472';
export const EMAIL = 'marwan.ahemmane@gmail.com';

// ===== MODE DÉMO =====
// Actif par défaut. En mode démo : site non référencé (noindex), bandeau « en construction »,
// et AUCUNE donnée enregistrée (ni base de données, ni e-mail). Le site fonctionne sans aucune variable d'environnement.
// Pour ouvrir le site au public (SIRET + n° SAP obtenus) : définir MODE_DEMO=false (variable de BUILD et variable d'exécution Cloudflare), puis redéployer.
export const MODE_DEMO = process.env.MODE_DEMO !== 'false';

// ===== Identité de l'éditeur : à compléter (affichée dans /mentions-legales) =====
export const EDITEUR = {
  nom: '[Prénom NOM]',
  statut: 'Entrepreneur individuel (micro-entrepreneur)',
  siret: '[N° SIRET — 14 chiffres]',
  sap: '[N° de déclaration Services à la Personne]',
  adresse: '[Adresse professionnelle], 47000 Agen',
  directeurPublication: '[Prénom NOM]',
};
export const DATE_MAJ_LEGAL = '1er octobre 2026';

// ===== Durées de conservation (RGPD) =====
// Source unique : utilisées par la page /mentions-legales ET par la purge automatique (/api/cron/purge)
export const RETENTION_RDV_MOIS = 12;     // après la date du rendez-vous
export const RETENTION_CONTACT_MOIS = 6;  // après la réception du message