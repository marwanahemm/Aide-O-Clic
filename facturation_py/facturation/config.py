"""Identité de l'éditeur et paramètres de facturation, lus dans config.json."""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Editeur:
    nom: str
    statut: str
    adresse: str
    siret: str
    sap: str  # numéro de déclaration au titre des services à la personne
    tva: str  # mention TVA affichée sous le total


@dataclass(frozen=True)
class Config:
    nom_site: str
    sous_titre: str
    editeur: Editeur
    telephone: str
    email: str
    credit_impot_pct: int = 50

    @classmethod
    def charger(cls, chemin: str | Path) -> "Config":
        donnees = json.loads(Path(chemin).read_text(encoding="utf-8"))
        ed = donnees["editeur"]
        return cls(
            nom_site=donnees.get("nom_site", "Mon activité"),
            sous_titre=donnees.get("sous_titre", ""),
            editeur=Editeur(
                nom=ed["nom"], statut=ed["statut"], adresse=ed["adresse"],
                siret=ed["siret"], sap=ed["sap"], tva=ed["tva"],
            ),
            telephone=donnees["telephone"],
            email=donnees["email"],
            credit_impot_pct=int(donnees.get("credit_impot_pct", 50)),
        )
