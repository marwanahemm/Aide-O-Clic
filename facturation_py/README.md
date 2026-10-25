# facturation — factures et attestations fiscales (Python)

Création et modification de factures, suivi des règlements, PDF de facture et
attestation fiscale annuelle pour les services à la personne. Reprend les règles
de l'application web du dépôt Aide-O-Clic (onglet « Factures » du back-office).

## Installation

Prérequis : Python 3.10 ou plus, et Node.js 18 ou plus (https://nodejs.org).

Les PDF sont générés avec **pdf-lib** (la bibliothèque du site), via le script
`facturation/rendu_pdf.mjs`. Dans le dossier du projet :

    npm install

Aucune dépendance Python à installer.

## Configuration

Copier `config.exemple.json` en `config.json` et remplir l'identité de l'éditeur
(nom, statut, adresse, SIRET, n° de déclaration SAP, mention TVA).

## Utilisation

    python -m facturation creer --client "Marie Dupont" --adresse "2 rue des Lilas, 47000 Agen" \
        --prestation 2026-10-20 --ligne "Aide à la déclaration en ligne;2;25" --notes "Merci"
    python -m facturation lister --annee 2026
    python -m facturation voir 2026-001
    python -m facturation corriger 2026-001 --adresse "Nouvelle adresse"
    python -m facturation payer 2026-001 --mode Virement --date 2026-10-23
    python -m facturation pdf 2026-001 -o facture.pdf
    python -m facturation attestation --annee 2026 --dossier ./attestations
    python -m facturation attestation --annee 2026 --client "Marie Dupont"

Autres commandes : `rouvrir` (remet une facture payée en attente), `annuler`.
Option globale `--db` (défaut `factures.db`, ou variable `FACTURATION_DB`) et
`--config` (défaut `config.json`, ou variable `FACTURATION_CONFIG`).

Chaque ligne `--ligne` s'écrit `DESIGNATION;QUANTITE;PRIX`, de 1 à 8 lignes par facture.

## Règles appliquées

- Numérotation continue `AAAA-NNN`, sans trou, par année d'émission. Une facture
  n'est jamais supprimée : on l'annule.
- Pas de facture datée avant la précédente ; la prestation ne peut pas être
  postérieure à l'émission ; pas de date future.
- Une facture émise garde ses lignes et son montant. La correction ne porte que
  sur le nom, l'adresse et les notes du client.
- Seule une facture émise et non réglée peut être payée ou annulée.
- Attestation annuelle : somme des factures réglées pendant l'année, par client
  (deux noms identiques à la casse près sont regroupés).
- Montants en `Decimal`, arrondi au centime à chaque ligne (pas de erreurs de flottants).

## Tests

    python -m unittest tests.test_facturation -v

Le test de pagination utilise `pdfinfo` (poppler-utils) s'il est présent, sinon il est ignoré.
