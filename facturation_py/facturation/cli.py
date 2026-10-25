"""Ligne de commande : python -m facturation <commande> [options]."""
from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path

from .config import Config
from .pdf import generer_attestation, generer_facture
from .regles import ErreurValidation, aujourdhui, cle_client, format_euros, format_quantite
from .stockage import Carnet


def _parseur() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="facturation", description="Factures et attestations fiscales (PDF).")
    p.add_argument("--db", default=os.environ.get("FACTURATION_DB", "factures.db"), help="base SQLite")
    p.add_argument("--config", default=os.environ.get("FACTURATION_CONFIG", "config.json"), help="fichier de configuration")
    sub = p.add_subparsers(dest="commande", required=True)

    c = sub.add_parser("creer", help="créer une facture")
    c.add_argument("--client", required=True)
    c.add_argument("--adresse", default="")
    c.add_argument("--prestation", required=True, help="date de la prestation (AAAA-MM-JJ)")
    c.add_argument("--emission", help="date d'émission (défaut : aujourd'hui)")
    c.add_argument("--ligne", action="append", required=True, metavar="DESIGNATION;QUANTITE;PRIX",
                   help="répétable, de 1 à 8 lignes")
    c.add_argument("--notes", default="")

    l = sub.add_parser("lister", help="lister les factures")
    l.add_argument("--annee", type=int)

    v = sub.add_parser("voir", help="afficher une facture")
    v.add_argument("ref", help="numéro (2026-001) ou identifiant")

    k = sub.add_parser("corriger", help="corriger le client ou les notes (lignes et montant inchangés)")
    k.add_argument("ref")
    k.add_argument("--client")
    k.add_argument("--adresse")
    k.add_argument("--notes")

    pa = sub.add_parser("payer", help="marquer une facture réglée")
    pa.add_argument("ref")
    pa.add_argument("--mode", required=True, help="Chèque, Virement, Espèces, Carte bancaire, CESU préfinancé, Autre")
    pa.add_argument("--date", help="date du règlement (défaut : aujourd'hui)")

    r = sub.add_parser("rouvrir", help="remettre une facture payée en attente de règlement")
    r.add_argument("ref")

    a = sub.add_parser("annuler", help="annuler une facture non réglée")
    a.add_argument("ref")

    pd = sub.add_parser("pdf", help="générer le PDF d'une facture")
    pd.add_argument("ref")
    pd.add_argument("-o", "--sortie")

    at = sub.add_parser("attestation", help="générer les attestations fiscales annuelles")
    at.add_argument("--annee", type=int, required=True)
    at.add_argument("--client", help="un seul client (défaut : tous les clients ayant réglé)")
    at.add_argument("--dossier", default=".", help="dossier de sortie")
    return p


def _ligne(texte: str) -> dict:
    parties = texte.rsplit(";", 2)  # la désignation peut contenir des « ; »
    if len(parties) != 3:
        raise ErreurValidation(f"Ligne « {texte} » : format attendu DESIGNATION;QUANTITE;PRIX.")
    return {"designation": parties[0], "quantite": parties[1], "prix_unitaire": parties[2]}


def _slug(nom: str) -> str:
    return re.sub(r"[^\w]+", "-", nom).strip("-")


def _executer(args: argparse.Namespace, carnet: Carnet) -> None:
    cmd = args.commande

    if cmd == "creer":
        f = carnet.creer({
            "client_nom": args.client,
            "client_adresse": args.adresse,
            "date_prestation": args.prestation,
            "date_facture": args.emission,
            "notes": args.notes,
            "lignes": [_ligne(x) for x in args.ligne],
        })
        print(f"Facture {f.numero} créée : {format_euros(f.total)} (réf. {f.id})")

    elif cmd == "lister":
        for f in carnet.lister(args.annee):
            print(f"{f.numero}  {f.date_facture}  {f.statut:<7}  {format_euros(f.total):>12}  {f.client_nom}")

    elif cmd == "voir":
        f = carnet.obtenir(args.ref)
        print(f"Facture {f.numero} — {f.statut} — émise le {f.date_facture}, prestation le {f.date_prestation}")
        print(f"Client : {f.client_nom}" + (f", {f.client_adresse}" if f.client_adresse else ""))
        for ligne in f.lignes:
            print(f"  - {ligne.designation} : {format_quantite(ligne.quantite)} × "
                  f"{format_euros(ligne.prix_unitaire)} = {format_euros(ligne.montant)}")
        print(f"Total : {format_euros(f.total)}")
        if f.date_paiement:
            print(f"Réglée le {f.date_paiement} ({f.mode_paiement})")
        if f.notes:
            print(f"Notes : {f.notes}")

    elif cmd == "corriger":
        actuelle = carnet.obtenir(args.ref)
        f = carnet.corriger(args.ref, {
            "client_nom": args.client if args.client is not None else actuelle.client_nom,
            "client_adresse": args.adresse if args.adresse is not None else (actuelle.client_adresse or ""),
            "notes": args.notes if args.notes is not None else (actuelle.notes or ""),
        })
        print(f"Facture {f.numero} corrigée.")

    elif cmd == "payer":
        f = carnet.payer(args.ref, {"date_paiement": args.date, "mode": args.mode})
        print(f"Facture {f.numero} marquée réglée le {f.date_paiement} ({f.mode_paiement}).")

    elif cmd == "rouvrir":
        f = carnet.rouvrir(args.ref)
        print(f"Facture {f.numero} remise en attente de règlement.")

    elif cmd == "annuler":
        f = carnet.annuler(args.ref)
        print(f"Facture {f.numero} annulée (conservée dans le carnet).")

    elif cmd == "pdf":
        f = carnet.obtenir(args.ref)
        cfg = Config.charger(args.config)
        sortie = Path(args.sortie or f"Facture-{f.numero}.pdf")
        sortie.write_bytes(generer_facture(f, cfg))
        print(f"PDF écrit : {sortie}")

    elif cmd == "attestation":
        cfg = Config.charger(args.config)
        groupes = carnet.reglements_par_client(args.annee)
        if args.client:
            cle = cle_client(args.client)
            if cle not in groupes:
                raise ErreurValidation(f"Aucune facture réglée en {args.annee} pour « {args.client} ».")
            cles = [cle]
        else:
            cles = list(groupes)
        if not cles:
            raise ErreurValidation(
                f"Aucune facture réglée en {args.annee}. Marquez d'abord les factures comme réglées (commande payer)."
            )
        dossier = Path(args.dossier)
        dossier.mkdir(parents=True, exist_ok=True)
        for cle in cles:
            paiements = groupes[cle]
            nom = paiements[-1].client_nom
            adresse = next((p.client_adresse for p in reversed(paiements) if p.client_adresse), None)
            octets = generer_attestation(args.annee, nom, adresse, paiements, cfg, aujourdhui())
            fichier = dossier / f"Attestation-{args.annee}-{_slug(nom)}.pdf"
            fichier.write_bytes(octets)
            total = sum((p.total for p in paiements), 0)
            print(f"{fichier} — {nom} — {format_euros(total)} ({len(paiements)} règlement(s))")


def main(argv: list[str] | None = None) -> int:
    args = _parseur().parse_args(argv)
    try:
        with Carnet(args.db) as carnet:
            _executer(args, carnet)
        return 0
    except ErreurValidation as e:
        print(f"Erreur : {e}", file=sys.stderr)
    except KeyError as e:
        print(f"Configuration incomplète : clé manquante {e} dans {args.config}.", file=sys.stderr)
    except OSError as e:
        print(f"Erreur de fichier : {e}", file=sys.stderr)
    except RuntimeError as e:
        print(f"Erreur : {e}", file=sys.stderr)
    return 1
