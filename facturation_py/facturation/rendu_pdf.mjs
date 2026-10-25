#!/usr/bin/env node
// Rendu PDF de la facture et de l'attestation fiscale avec pdf-lib.
// Port de src/lib/pdf.js (dépôt Aide-O-Clic) : même mise en page, mêmes mentions.
// Appelé par facturation/pdf.py. Usage :
//   node facturation/rendu_pdf.mjs facture|attestation < donnees.json > sortie.pdf
// Les montants arrivent déjà arrondis (chaînes décimales) : ce script ne fait que les afficher.
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

const L = 595.28; // A4
const H = 841.89;
const MARGE = 48;
const NAVY = rgb(0.106, 0.145, 0.208);
const BLEU = rgb(0, 0.467, 0.8);
const GRIS = rgb(0.278, 0.333, 0.412);
const CLAIR = rgb(0.902, 0.949, 0.988);
const TRAIT = rgb(0.796, 0.835, 0.882);
const VERT = rgb(0.078, 0.325, 0.176);
const VERT_FOND = rgb(0.863, 0.988, 0.906);
const ROUGE = rgb(0.76, 0.2, 0.2);
const BLANC = rgb(1, 1, 1);
const ZEBRA = rgb(0.973, 0.98, 0.988);
const BLEU_FOND = rgb(0.941, 0.969, 0.996);

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const dateFr = (iso) => {
  const [a, m, j] = String(iso).slice(0, 10).split('-').map(Number);
  return `${j === 1 ? '1er' : j} ${MOIS[m - 1]} ${a}`;
};
const eurTxt = (n) => `${Number(n).toFixed(2).replace('.', ',')} €`;
const qteTxt = (q) => String(Number(q)).replace('.', ',');

async function creer() {
  const pdf = await PDFDocument.create();
  const reg = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ok = new Set(reg.getCharacterSet());
  // Les polices standard n'acceptent que le jeu WinAnsi : le reste est remplacé
  const sain = (t) => [...String(t ?? '')]
    .map((c) => (ok.has(c.codePointAt(0)) ? c : c === '\u202f' || c === '\u00a0' ? ' ' : '?'))
    .join('');
  return { pdf, reg, bold, sain };
}

// Découpe un texte en lignes qui tiennent dans la largeur donnée
function lignes(font, texte, taille, largeur) {
  const out = [];
  for (const paragraphe of String(texte).split('\n')) {
    let courante = '';
    for (const mot of paragraphe.split(' ')) {
      const essai = courante ? `${courante} ${mot}` : mot;
      if (font.widthOfTextAtSize(essai, taille) <= largeur || !courante) courante = essai;
      else { out.push(courante); courante = mot; }
    }
    out.push(courante);
  }
  return out;
}

// Écrit un texte (avec retour à la ligne) et renvoie l'ordonnée suivante
function ecrire(ctx, page, texte, { x, y, taille = 10, font, couleur = NAVY, largeur = L - 2 * MARGE, interligne = 1.35, droite = false }) {
  const f = font || ctx.reg;
  for (const ligne of lignes(f, ctx.sain(texte), taille, largeur)) {
    const px = droite ? x - f.widthOfTextAtSize(ligne, taille) : x;
    page.drawText(ligne, { x: px, y, size: taille, font: f, color: couleur });
    y -= taille * interligne;
  }
  return y;
}

function logo(page, x, yHaut, taille = 38) {
  const k = taille / 48;
  page.drawSvgPath('M12 0H36Q48 0 48 12V36Q48 48 36 48H12Q0 48 0 36V12Q0 0 12 0Z', { x, y: yHaut, scale: k, color: NAVY });
  page.drawCircle({ x: x + 30 * k, y: yHaut - 18 * k, size: 9 * k, color: BLEU });
  page.drawSvgPath('M14 11L14 35L20.2 29.4L24.3 38L28.5 36L24.4 27.5L32.7 26.8Z', { x, y: yHaut, scale: k, color: BLANC, borderColor: NAVY, borderWidth: 0.9 });
}

function entete(ctx, page, { nomSite, sousTitre, titre, lignesDroite }) {
  logo(page, MARGE, H - MARGE + 4);
  page.drawText(ctx.sain(nomSite), { x: MARGE + 48, y: H - MARGE - 14, size: 18, font: ctx.bold, color: NAVY });
  if (sousTitre) page.drawText(ctx.sain(sousTitre), { x: MARGE + 48, y: H - MARGE - 28, size: 8.5, font: ctx.reg, color: GRIS });
  const wTitre = ctx.bold.widthOfTextAtSize(ctx.sain(titre), 22);
  page.drawText(ctx.sain(titre), { x: L - MARGE - wTitre, y: H - MARGE - 10, size: 22, font: ctx.bold, color: BLEU });
  let y = H - MARGE - 28;
  for (const t of lignesDroite) {
    y = ecrire(ctx, page, t.texte, { x: L - MARGE, y, taille: t.taille || 10, font: t.gras ? ctx.bold : ctx.reg, couleur: NAVY, droite: true, largeur: 260 });
  }
  page.drawLine({ start: { x: MARGE, y: H - MARGE - 62 }, end: { x: L - MARGE, y: H - MARGE - 62 }, thickness: 1.2, color: BLEU });
}

function blocPrestataire(ctx, page, site, x, yHaut, largeur) {
  const ed = site.editeur;
  page.drawText(ctx.sain('PRESTATAIRE'), { x, y: yHaut, size: 8, font: ctx.bold, color: BLEU });
  let y = yHaut - 14;
  y = ecrire(ctx, page, ed.nom, { x, y, taille: 11, font: ctx.bold, largeur });
  const infos = [ed.statut, ed.adresse, `SIRET : ${ed.siret}`, `Déclaration Services à la Personne : ${ed.sap}`, `${site.telephone} · ${site.email}`];
  for (const t of infos) y = ecrire(ctx, page, t, { x, y, taille: 9, couleur: GRIS, largeur });
  return y;
}

function pied(ctx, page, site) {
  page.drawLine({ start: { x: MARGE, y: 52 }, end: { x: L - MARGE, y: 52 }, thickness: 0.6, color: TRAIT });
  const ed = site.editeur;
  ecrire(ctx, page, `${site.nomSite} · ${ed.nom} · ${ed.statut} · SIRET ${ed.siret}`, { x: MARGE, y: 40, taille: 7.5, couleur: GRIS });
}

// Facture. facture : { numero, date_facture, date_prestation, client_nom, client_adresse, lignes[{designation, quantite, prix_unitaire, montant}], total, net, statut, date_paiement, mode_paiement, notes }
export async function genererFacturePdf(facture, site) {
  const ctx = await creer();
  const page = ctx.pdf.addPage([L, H]);
  const ed = site.editeur;
  const nomSite = site.nomSite || "Aide O'Clic";
  const s = { ...site, nomSite };

  entete(ctx, page, {
    nomSite, sousTitre: site.sousTitre, titre: 'FACTURE',
    lignesDroite: [
      { texte: `N° ${facture.numero}`, taille: 12, gras: true },
      { texte: `Date d'émission : ${dateFr(facture.date_facture)}`, taille: 9.5 },
      { texte: `Date de la prestation : ${dateFr(facture.date_prestation)}`, taille: 9.5 },
    ],
  });

  // Prestataire (gauche) et client (droite)
  const yBlocs = H - MARGE - 90;
  const yFinGauche = blocPrestataire(ctx, page, s, MARGE, yBlocs, 250);
  const xClient = 330;
  page.drawRectangle({ x: xClient - 12, y: yBlocs - 78, width: L - MARGE - xClient + 12, height: 94, color: CLAIR });
  page.drawText(ctx.sain('FACTURÉ À'), { x: xClient, y: yBlocs, size: 8, font: ctx.bold, color: BLEU });
  const yc0 = ecrire(ctx, page, facture.client_nom, { x: xClient, y: yBlocs - 14, taille: 11, font: ctx.bold, largeur: L - MARGE - xClient - 10 });
  if (facture.client_adresse) ecrire(ctx, page, facture.client_adresse, { x: xClient, y: yc0, taille: 9.5, couleur: GRIS, largeur: L - MARGE - xClient - 10 });

  // Tableau des lignes
  let y = Math.min(yFinGauche, yBlocs - 84) - 22;
  const colQte = 372, colPu = 452, colTot = L - MARGE;
  page.drawRectangle({ x: MARGE, y: y - 6, width: L - 2 * MARGE, height: 22, color: NAVY });
  const th = (t, x, droite) => {
    const w = ctx.bold.widthOfTextAtSize(ctx.sain(t), 9);
    page.drawText(ctx.sain(t), { x: droite ? x - w : x, y: y + 1, size: 9, font: ctx.bold, color: BLANC });
  };
  th('Désignation', MARGE + 8); th('Qté', colQte, true); th('Prix unitaire', colPu, true); th('Montant', colTot - 8, true);
  y -= 26;
  facture.lignes.forEach((l, i) => {
    const ls = lignes(ctx.reg, ctx.sain(l.designation), 10, colQte - 70 - MARGE - 8);
    const hauteur = ls.length * 13.5 + 8;
    if (i % 2 === 1) page.drawRectangle({ x: MARGE, y: y - hauteur + 12, width: L - 2 * MARGE, height: hauteur, color: ZEBRA });
    ls.forEach((t, k) => page.drawText(t, { x: MARGE + 8, y: y - k * 13.5, size: 10, font: ctx.reg, color: NAVY }));
    const droite = (t, x) => { const w = ctx.reg.widthOfTextAtSize(ctx.sain(t), 10); page.drawText(ctx.sain(t), { x: x - w, y, size: 10, font: ctx.reg, color: NAVY }); };
    droite(qteTxt(l.quantite), colQte); droite(eurTxt(l.prix_unitaire), colPu); droite(eurTxt(l.montant), colTot - 8);
    y -= hauteur;
  });
  page.drawLine({ start: { x: MARGE, y: y + 8 }, end: { x: L - MARGE, y: y + 8 }, thickness: 0.8, color: TRAIT });

  // Total
  y -= 12;
  const boite = { x: 330, w: L - MARGE - 330 };
  const payee = facture.statut === 'payee';
  page.drawRectangle({ x: boite.x, y: y - 30, width: boite.w, height: 40, color: CLAIR });
  page.drawText(ctx.sain(payee ? 'TOTAL RÉGLÉ' : 'TOTAL À RÉGLER'), { x: boite.x + 12, y: y - 14, size: 9.5, font: ctx.bold, color: BLEU });
  const tot = ctx.sain(eurTxt(facture.total));
  page.drawText(tot, { x: L - MARGE - 12 - ctx.bold.widthOfTextAtSize(tot, 16), y: y - 16, size: 16, font: ctx.bold, color: NAVY });
  y = ecrire(ctx, page, `${ed.tva}.`, { x: MARGE, y: y - 6, taille: 9, couleur: GRIS, largeur: 270 });
  y -= 22;

  // Mention services à la personne
  const pct = site.creditImpotPct;
  const mention = `Prestation de services à la personne (déclaration n° ${ed.sap}). Elle ouvre droit, sous conditions, à un crédit d'impôt de ${pct} % des sommes versées (article 199 sexdecies du Code général des impôts). Coût réel estimé après crédit d'impôt : ${eurTxt(facture.net)}. Une attestation fiscale annuelle vous sera remise.`;
  const lm = lignes(ctx.reg, ctx.sain(mention), 9, L - 2 * MARGE - 24);
  page.drawRectangle({ x: MARGE, y: y - lm.length * 12.5 - 8, width: L - 2 * MARGE, height: lm.length * 12.5 + 18, color: BLEU_FOND, borderColor: BLEU, borderWidth: 0.6 });
  lm.forEach((t, k) => page.drawText(t, { x: MARGE + 12, y: y - 6 - k * 12.5, size: 9, font: ctx.reg, color: NAVY }));
  y -= lm.length * 12.5 + 34;

  // Règlement
  if (payee) {
    page.drawRectangle({ x: MARGE, y: y - 12, width: L - 2 * MARGE, height: 30, color: VERT_FOND });
    page.drawText(ctx.sain(`FACTURE ACQUITTÉE le ${dateFr(facture.date_paiement)} — règlement par ${String(facture.mode_paiement || '').toLowerCase()}.`), { x: MARGE + 12, y: y - 2, size: 10, font: ctx.bold, color: VERT });
    y -= 40;
  } else {
    y = ecrire(ctx, page, "Règlement à réception, à l'issue de l'intervention. Merci de votre confiance.", { x: MARGE, y, taille: 10, font: ctx.bold });
    y -= 6;
  }
  if (facture.notes) ecrire(ctx, page, facture.notes, { x: MARGE, y, taille: 9, couleur: GRIS });

  if (facture.statut === 'annulee') {
    page.drawText('ANNULÉE', { x: 120, y: 330, size: 110, font: ctx.bold, color: ROUGE, opacity: 0.18, rotate: degrees(30) });
  }
  pied(ctx, page, s);
  return ctx.pdf.save();
}

// Attestation fiscale annuelle. data : { annee, client: {nom, adresse}, paiements: [{numero, date_paiement, total}], total, dateEdition }
export async function genererAttestationPdf(data, site) {
  const ctx = await creer();
  const page = ctx.pdf.addPage([L, H]);
  const ed = site.editeur;
  const nomSite = site.nomSite || "Aide O'Clic";
  const s = { ...site, nomSite };

  entete(ctx, page, {
    nomSite, sousTitre: site.sousTitre, titre: 'ATTESTATION',
    lignesDroite: [
      { texte: `Année ${data.annee}`, taille: 12, gras: true },
      { texte: 'Services à la personne', taille: 9.5 },
      { texte: `Établie le ${dateFr(data.dateEdition)}`, taille: 9.5 },
    ],
  });

  let y = H - MARGE - 96;
  page.drawText(ctx.sain('Attestation fiscale annuelle'), { x: MARGE, y, size: 17, font: ctx.bold, color: NAVY });
  y -= 30;
  y = ecrire(ctx, page, `Je soussigné(e) ${ed.nom}, ${ed.statut}, SIRET ${ed.siret}, déclaré(e) au titre des services à la personne sous le numéro ${ed.sap}, domicilié(e) professionnellement : ${ed.adresse}, atteste que :`, { x: MARGE, y, taille: 10.5, interligne: 1.5 });
  y -= 8;
  const hauteurClient = data.client.adresse ? 62 : 44;
  page.drawRectangle({ x: MARGE, y: y - hauteurClient + 14, width: L - 2 * MARGE, height: hauteurClient, color: CLAIR });
  page.drawText(ctx.sain(data.client.nom), { x: MARGE + 14, y: y - 8, size: 12.5, font: ctx.bold, color: NAVY });
  if (data.client.adresse) ecrire(ctx, page, data.client.adresse, { x: MARGE + 14, y: y - 25, taille: 10, couleur: GRIS, largeur: L - 2 * MARGE - 28 });
  y -= hauteurClient + 12;

  y = ecrire(ctx, page, `a réglé, au cours de l'année ${data.annee}, la somme totale de ${eurTxt(data.total)} pour des prestations de services à la personne (assistance administrative et informatique à domicile) réalisées à son domicile.`, { x: MARGE, y, taille: 10.5, interligne: 1.5 });
  y -= 14;

  // Tableau des règlements (nouvelle page si nécessaire)
  const colDate = 270, colMontant = L - MARGE;
  let pc = page;
  const enteteTableau = (p, yy) => {
    p.drawRectangle({ x: MARGE, y: yy - 6, width: L - 2 * MARGE, height: 22, color: NAVY });
    const th = (t, x, droite) => { const w = ctx.bold.widthOfTextAtSize(ctx.sain(t), 9); p.drawText(ctx.sain(t), { x: droite ? x - w : x, y: yy + 1, size: 9, font: ctx.bold, color: BLANC }); };
    th('Facture', MARGE + 8); th('Date du règlement', colDate); th('Montant payé', colMontant - 8, true);
  };
  enteteTableau(pc, y);
  y -= 26;
  data.paiements.forEach((p, i) => {
    if (y < 150) {
      pied(ctx, pc, s);
      pc = ctx.pdf.addPage([L, H]);
      y = H - MARGE - 30;
      enteteTableau(pc, y);
      y -= 26;
    }
    if (i % 2 === 1) pc.drawRectangle({ x: MARGE, y: y - 6, width: L - 2 * MARGE, height: 19, color: ZEBRA });
    pc.drawText(ctx.sain(`N° ${p.numero}`), { x: MARGE + 8, y, size: 10, font: ctx.reg, color: NAVY });
    pc.drawText(ctx.sain(dateFr(p.date_paiement)), { x: colDate, y, size: 10, font: ctx.reg, color: NAVY });
    const t = ctx.sain(eurTxt(p.total));
    pc.drawText(t, { x: colMontant - 8 - ctx.reg.widthOfTextAtSize(t, 10), y, size: 10, font: ctx.reg, color: NAVY });
    y -= 19;
  });
  if (y < 250) { // pas la place pour le total et la signature
    pied(ctx, pc, s);
    pc = ctx.pdf.addPage([L, H]);
    y = H - MARGE - 30;
  }
  pc.drawLine({ start: { x: MARGE, y: y + 10 }, end: { x: L - MARGE, y: y + 10 }, thickness: 0.8, color: TRAIT });
  pc.drawRectangle({ x: 330, y: y - 26, width: L - MARGE - 330, height: 32, color: CLAIR });
  pc.drawText(ctx.sain('TOTAL PAYÉ'), { x: 342, y: y - 12, size: 9.5, font: ctx.bold, color: BLEU });
  const tt = ctx.sain(eurTxt(data.total));
  pc.drawText(tt, { x: L - MARGE - 12 - ctx.bold.widthOfTextAtSize(tt, 14), y: y - 14, size: 14, font: ctx.bold, color: NAVY });
  y -= 56;

  y = ecrire(ctx, pc, "Les montants ci-dessus correspondent aux sommes effectivement payées par le bénéficiaire, déduction faite des aides éventuelles et des sommes avancées au titre de l'avance immédiate de crédit d'impôt. Ils peuvent ouvrir droit, sous conditions, au crédit d'impôt prévu à l'article 199 sexdecies du Code général des impôts.", { x: MARGE, y, taille: 9.5, couleur: GRIS, interligne: 1.45 });
  y -= 18;
  y = ecrire(ctx, pc, "Attestation établie pour servir et valoir ce que de droit. À conserver : elle peut être demandée par l'administration fiscale.", { x: MARGE, y, taille: 9.5, couleur: GRIS });
  y -= 30;
  pc.drawText(ctx.sain(`Fait le ${dateFr(data.dateEdition)}`), { x: 330, y, size: 10, font: ctx.reg, color: NAVY });
  pc.drawText(ctx.sain(ed.nom), { x: 330, y: y - 16, size: 10, font: ctx.bold, color: NAVY });
  pc.drawText(ctx.sain('Signature :'), { x: 330, y: y - 34, size: 9, font: ctx.reg, color: GRIS });
  pied(ctx, pc, s);
  return ctx.pdf.save();
}

// Point d'entrée : lit le JSON sur l'entrée standard, écrit le PDF sur la sortie standard
const mode = process.argv[2];
try {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  const donnees = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  let octets;
  if (mode === 'facture') octets = await genererFacturePdf(donnees.facture, donnees.site);
  else if (mode === 'attestation') octets = await genererAttestationPdf(donnees, donnees.site);
  else throw new Error(`mode inconnu : « ${mode} » (attendu : facture ou attestation)`);
  process.stdout.write(Buffer.from(octets));
} catch (e) {
  process.stderr.write(`${e.message}\n`);
  process.exitCode = 1;
}
