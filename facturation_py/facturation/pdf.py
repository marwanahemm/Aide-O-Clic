"""Génération des PDF avec pdf-lib (JavaScript), comme sur le site Aide-O-Clic.

Python calcule et arrondit les montants, puis transmet les données au script
rendu_pdf.mjs, qui les met en page avec pdf-lib et renvoie le PDF.
Prérequis : Node.js 18 ou plus, et « npm install » à la racine du projet.
"""
from __future__ import annotations

import json
import shutil
import subprocess
from dataclasses import asdict
from datetime import date
from decimal import Decimal
from pathlib import Path
from typing import Sequence

from .config import Config
from .regles import arrondi
from .stockage import Facture

RACINE = Path(__file__).resolve().parent.parent
SCRIPT_RENDU = Path(__file__).resolve().parent / "rendu_pdf.mjs"


def _appeler_node(mode: str, donnees: dict) -> bytes:
    node = shutil.which("node")
    if node is None:
        raise RuntimeError(
            "Node.js est introuvable. Installez Node.js 18 ou plus (https://nodejs.org), "
            "puis lancez « npm install » dans le dossier du projet."
        )
    resultat = subprocess.run(
        [node, str(SCRIPT_RENDU), mode],
        input=json.dumps(donnees, ensure_ascii=False).encode("utf-8"),
        capture_output=True,
        cwd=RACINE,
    )
    if resultat.returncode != 0:
        detail = resultat.stderr.decode("utf-8", "replace").strip()
        raise RuntimeError(f"Génération du PDF échouée : {detail or 'erreur inconnue'}")
    return resultat.stdout


def _site(cfg: Config) -> dict:
    return {
        "nomSite": cfg.nom_site,
        "sousTitre": cfg.sous_titre,
        "editeur": asdict(cfg.editeur),
        "telephone": cfg.telephone,
        "email": cfg.email,
        "creditImpotPct": cfg.credit_impot_pct,
    }


def generer_facture(facture: Facture, cfg: Config) -> bytes:
    """PDF d'une facture. Les montants viennent de la base, jamais de la saisie."""
    net = arrondi(facture.total * (1 - Decimal(cfg.credit_impot_pct) / 100))
    donnees = {
        "facture": {
            "numero": facture.numero,
            "date_facture": facture.date_facture.isoformat(),
            "date_prestation": facture.date_prestation.isoformat(),
            "client_nom": facture.client_nom,
            "client_adresse": facture.client_adresse,
            "lignes": [
                {
                    "designation": l.designation,
                    "quantite": str(l.quantite),
                    "prix_unitaire": str(l.prix_unitaire),
                    "montant": str(l.montant),
                }
                for l in facture.lignes
            ],
            "total": str(facture.total),
            "net": str(net),
            "statut": facture.statut,
            "date_paiement": facture.date_paiement.isoformat() if facture.date_paiement else None,
            "mode_paiement": facture.mode_paiement,
            "notes": facture.notes,
        },
        "site": _site(cfg),
    }
    return _appeler_node("facture", donnees)


def generer_attestation(annee: int, client_nom: str, client_adresse: str | None,
                        paiements: Sequence[Facture], cfg: Config, date_edition: date) -> bytes:
    """Attestation fiscale annuelle : sommes réglées par le client pendant l'année."""
    total = sum((p.total for p in paiements), Decimal("0"))
    donnees = {
        "annee": annee,
        "client": {"nom": client_nom, "adresse": client_adresse or ""},
        "paiements": [
            {"numero": p.numero, "date_paiement": p.date_paiement.isoformat(), "total": str(p.total)}
            for p in paiements
        ],
        "total": str(total),
        "dateEdition": date_edition.isoformat(),
        "site": _site(cfg),
    }
    return _appeler_node("attestation", donnees)
