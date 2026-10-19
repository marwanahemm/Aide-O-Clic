// Valeurs PAR DÉFAUT. Les valeurs réelles (formules, tarifs, FAQ…) se modifient dans le back-office (/admin)
// et sont lues via getConfig() (src/lib/config.js). Ce fichier sert aussi de secours si la base est injoignable.
export const CREDIT_IMPOT_PCT_DEFAUT = 50;
export const CRENEAUX_DEFAUT = ['09h00 - 11h00', '11h00 - 12h30', '14h00 - 16h00', '16h00 - 18h00'];
export const COMMUNES_DEFAUT = ['Agen', 'Boé', 'Le Passage', 'Bon-Encontre', 'Castelculier', 'Lafox'];

// Une formule = un forfait de N heures à un prix. « badge » (facultatif) la met en avant sur le site.
export const FORMULES_DEFAUT = [
  {
    nom: 'Forfait 1 heure',
    description: 'Intervention ponctuelle : débloquer une démarche précise ou résoudre un problème informatique.',
    heures: 1,
    prix: 25,
    badge: '',
    points: [
      '1 heure complète d’accompagnement à domicile',
      'Déplacement inclus (communes desservies)',
      'Prise en charge pas à pas, explications simples',
      'Attestation fiscale annuelle fournie',
    ],
  },
  {
    nom: 'Forfait 2 heures — pack approfondi',
    description: 'Pour un dossier complexe, une formation à votre rythme ou une installation complète.',
    heures: 2,
    prix: 35,
    badge: 'Le plus avantageux à l’heure',
    points: [
      '2 heures consécutives à votre domicile',
      'Diagnostic complet + prise en main guidée',
      'Rédaction d’un guide sur mesure si besoin',
    ],
  },
];

// Icônes proposées pour illustrer une catégorie du catalogue (noms = icônes de src/components/Icon.jsx)
export const ICONES_CATALOGUE = [
  ['file', 'Document'], ['laptop', 'Ordinateur'], ['globe', 'Internet'], ['mail', 'Courrier'], ['folder', 'Classement'], ['key', 'Mots de passe'],
  ['wifi', 'Wi-Fi'], ['smartphone', 'Téléphone'], ['message', 'Messagerie'], ['shield', 'Sécurité'], ['camera', 'Photos'], ['clipboard', 'Formulaire'],
  ['search', 'Recherche'], ['heart', 'Cœur'], ['home', 'Maison'], ['user', 'Personne'], ['euro', 'Euro'], ['calendar', 'Calendrier'],
  ['bike', 'Vélo'], ['star', 'Étoile'], ['check', 'Coche'],
];

// Catalogue des prestations (accueil) : des catégories, chacune avec ses prestations (icône, titre facultatif, texte).
export const CATALOGUE_DEFAUT = [
  {
    titre: 'Assistance administrative',
    intro: 'Un accompagnement complet sur vos démarches du quotidien.',
    icone: 'file',
    items: [
      { titre: 'Démarches en ligne', icone: 'globe', texte: 'CAF, France Travail, Ameli / CPAM, déclaration d’impôts, ANTS (carte grise, identité).' },
      { titre: 'Gestion de courriers', icone: 'mail', texte: 'Rédaction, mise en forme et envoi de lettres officielles ou administratives.' },
      { titre: 'Organisation & classement', icone: 'folder', texte: 'Rangement de vos factures, documents de santé et création d’un dossier numérique sécurisé.' },
      { titre: 'Comptes personnels', icone: 'key', texte: 'Création et gestion simplifiée de vos identifiants (FranceConnect) et mots de passe en toute sécurité.' },
    ],
  },
  {
    titre: 'Assistance informatique',
    intro: 'Installation, prise en main et dépannage tout en douceur.',
    icone: 'laptop',
    items: [
      { titre: 'Matériel & réseau', icone: 'wifi', texte: 'Configuration de votre box Internet (Wi-Fi), imprimante, ordinateur portable, tablette ou smartphone.' },
      { titre: 'Initiation', icone: 'message', texte: 'Apprendre à envoyer des e-mails, faire un appel vidéo avec vos proches (WhatsApp) et naviguer sans risque.' },
      { titre: 'Sécurité & nettoyage', icone: 'shield', texte: 'Protection contre les arnaques Internet, suppression des fenêtres publicitaires, appareil sécurisé.' },
      { titre: 'Sauvegarde de souvenirs', icone: 'camera', texte: 'Transfert de vos photos familiales et documents sur clé USB ou disque dur externe.' },
    ],
  },
];

// Questions fréquentes (accueil). Dans les réponses : [texte](/page) = lien ; {pct} {reste} {communes} {telephone} {tel} {email} {annulation} = valeurs du site.
export const FAQ_DEFAUT = [
  {
    q: 'Comment fonctionne le crédit d’impôt de {pct} % ?',
    r: 'Grâce au dispositif Avance Immédiate du Cesu / Urssaf, vous ne réglez que le montant net ({reste} % de la prestation). Si vous préférez le paiement classique, {pct} % du montant dépensé vous sera déduit lors de votre déclaration d’impôt annuelle. [Estimer mon reste à charge](/simulation)',
  },
  { q: 'Y a-t-il des frais de déplacement ?', r: 'Non : le déplacement est inclus dans les communes desservies ({communes}). Aucun supplément ne vous sera facturé.' },
  { q: 'Je n’ai pas Internet chez moi, est-ce un problème ?', r: 'Pas du tout : je viens avec un équipement d’appoint et une connexion Internet 5G+ sécurisée pour pouvoir avancer sur vos démarches.' },
  { q: 'Comment réserver ?', r: 'En ligne, [en choisissant une date et un créneau](/rendez-vous), ou simplement par téléphone au [{telephone}]({tel}).' },
  { q: 'Et si je dois annuler ou reporter ?', r: '{annulation} Vous disposez aussi d’un droit de rétractation de 14 jours. [Voir toutes les conditions](/annulation-remboursement)' },
  { q: 'Mes données sont-elles protégées ?', r: 'Vos informations servent uniquement à traiter votre demande et ne sont jamais revendues. [Lire la politique de confidentialité](/politique-de-confidentialite)' },
];

export const eur = (n) => n.toFixed(2).replace('.', ',') + ' €';
// 25 → « 25 », 50.5 → « 50,50 » (toujours 2 décimales quand le nombre n'est pas rond)
export const nombre = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
export const heuresTxt = (h) => String(h).replace('.', ',');

// Tarif horaire de référence = prix par heure de la formule la plus courte (sert à facturer les heures « hors forfait »)
export function tarifHoraire(formules) {
  const f = [...formules].sort((a, b) => a.heures - b.heures)[0];
  return f.prix / f.heures;
}

// Économie d'une formule par rapport au tarif horaire de référence (0 si aucune)
export function reductionFormule(f, ref) {
  return Math.max(0, Math.round((f.heures * ref - f.prix) * 100) / 100);
}

// Choix proposés dans le formulaire de rendez-vous : une ligne par formule + une ligne par catégorie du catalogue
export function construirePrestations({ formules, catalogue = [] }) {
  return [
    ...formules.map((f) => ({ value: `${f.nom} (${nombre(f.prix)} €)`, label: `${f.nom} (${nombre(f.prix)} €)` })),
    ...catalogue.map((c) => ({ value: c.titre, label: c.titre })),
  ];
}

// Budget pour N heures avec une formule : forfaits complets, puis le reste à l'heure (sans jamais dépasser le prix d'un forfait).
// creditImpot : fraction (0,5 = 50 %). « net » = ce que paie réellement le client.
export function calculerBudget(heures, formule, ref, creditImpot) {
  const forfaits = Math.floor(heures / formule.heures + 1e-9);
  const reste = Math.max(0, Math.round((heures - forfaits * formule.heures) * 2) / 2);
  const brut = forfaits * formule.prix + Math.min(reste * ref, formule.prix);
  return { brut, net: brut * (1 - creditImpot) };
}
