"""Règles métier : validation, montants, numérotation.

Fonctions pures, sans base de données ni PDF. Mêmes limites et mêmes messages
que src/lib/facturesAdmin.js du dépôt.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from decimal import ROUND_HALF_UP, Decimal, InvalidOperation
from typing import Any, Mapping, Sequence
from zoneinfo import ZoneInfo

FUSEAU = ZoneInfo("Europe/Paris")
MODES_PAIEMENT = ("Chèque", "Virement", "Espèces", "Carte bancaire", "CESU préfinancé", "Autre")
MAX_LIGNES = 8
ZERO = Decimal("0")


class ErreurValidation(ValueError):
    """Donnée invalide. Le message est destiné à l'utilisateur."""


def aujourdhui() -> date:
    return datetime.now(FUSEAU).date()


def arrondi(n: Decimal) -> Decimal:
    return n.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def format_euros(montant: Decimal | int | str) -> str:
    return f"{Decimal(str(montant)):.2f}".replace(".", ",") + " €"


def format_quantite(q: Decimal) -> str:
    return format(Decimal(q).normalize(), "f").replace(".", ",")


def cle_client(nom: str) -> str:
    """Deux noms identiques à la casse et aux espaces près sont le même client."""
    return " ".join(nom.split()).casefold()


def numero_suivant(annee: int, dernier: str | None) -> str:
    """AAAA-001, AAAA-002… continu par année d'émission."""
    if dernier and dernier.startswith(f"{annee}-"):
        n = int(dernier.split("-")[1]) + 1
    else:
        n = 1
    return f"{annee}-{n:03d}"


def _nombre(valeur: Any, nom: str) -> Decimal:
    try:
        n = Decimal(str(valeur).strip().replace(",", "."))
    except (InvalidOperation, ValueError):
        raise ErreurValidation(f"{nom} : nombre invalide.") from None
    if not n.is_finite():
        raise ErreurValidation(f"{nom} : nombre invalide.")
    return n


def _date(valeur: Any, nom: str) -> date:
    try:
        return date.fromisoformat(str(valeur).strip())
    except ValueError:
        raise ErreurValidation(f"{nom} invalide (format AAAA-MM-JJ).") from None


def _texte(valeur: Any, nom: str, minimum: int, maximum: int) -> str:
    s = " ".join(str(valeur or "").split())
    if not minimum <= len(s) <= maximum:
        raise ErreurValidation(f"{nom} : entre {minimum} et {maximum} caractères.")
    return s


@dataclass(frozen=True)
class Ligne:
    designation: str
    quantite: Decimal
    prix_unitaire: Decimal

    @property
    def montant(self) -> Decimal:
        return arrondi(self.quantite * self.prix_unitaire)


def total_lignes(lignes: Sequence[Ligne]) -> Decimal:
    return arrondi(sum((l.montant for l in lignes), ZERO))


def valider_lignes(brutes: Any) -> list[Ligne]:
    if not isinstance(brutes, (list, tuple)) or not 1 <= len(brutes) <= MAX_LIGNES:
        raise ErreurValidation(f"Une facture comporte de 1 à {MAX_LIGNES} lignes.")
    lignes = []
    for i, brute in enumerate(brutes, start=1):
        if not isinstance(brute, Mapping):
            raise ErreurValidation(f"Ligne {i} : données invalides.")
        designation = _texte(brute.get("designation"), f"Désignation de la ligne {i}", 2, 120)
        quantite = arrondi(_nombre(brute.get("quantite"), f"Quantité de la ligne {i}"))
        if not ZERO < quantite <= 100:
            raise ErreurValidation(f"Quantité de la ligne {i} : entre 0,01 et 100.")
        prix = arrondi(_nombre(brute.get("prix_unitaire"), f"Prix unitaire de la ligne {i}"))
        if not ZERO <= prix <= 1000:
            raise ErreurValidation(f"Prix unitaire de la ligne {i} : entre 0 et 1000 €.")
        lignes.append(Ligne(designation, quantite, prix))
    if total_lignes(lignes) <= ZERO:
        raise ErreurValidation("Le total de la facture doit être supérieur à 0 €.")
    return lignes


@dataclass(frozen=True)
class Coordonnees:
    client_nom: str
    client_adresse: str | None
    notes: str | None


def valider_coordonnees(brut: Mapping[str, Any]) -> Coordonnees:
    return Coordonnees(
        client_nom=_texte(brut.get("client_nom"), "Nom du client", 2, 100),
        client_adresse=_texte(brut.get("client_adresse"), "Adresse du client", 0, 250) or None,
        notes=_texte(brut.get("notes"), "Notes", 0, 500) or None,
    )


@dataclass(frozen=True)
class DonneesFacture:
    date_facture: date
    date_prestation: date
    coordonnees: Coordonnees
    lignes: tuple[Ligne, ...]

    @property
    def total(self) -> Decimal:
        return total_lignes(self.lignes)


def valider_facture(brut: Mapping[str, Any], today: date | None = None) -> DonneesFacture:
    today = today or aujourdhui()
    date_facture = _date(brut.get("date_facture") or today, "Date d'émission")
    if date_facture > today:
        raise ErreurValidation("La date d'émission ne peut pas être dans le futur.")
    date_prestation = _date(brut.get("date_prestation"), "Date de la prestation")
    if date_prestation > date_facture:
        raise ErreurValidation("La prestation ne peut pas être postérieure à la date d'émission.")
    return DonneesFacture(
        date_facture=date_facture,
        date_prestation=date_prestation,
        coordonnees=valider_coordonnees(brut),
        lignes=tuple(valider_lignes(brut.get("lignes"))),
    )


@dataclass(frozen=True)
class Reglement:
    date_paiement: date
    mode: str


def valider_reglement(brut: Mapping[str, Any], date_facture: date, today: date | None = None) -> Reglement:
    today = today or aujourdhui()
    date_paiement = _date(brut.get("date_paiement") or today, "Date de règlement")
    if date_paiement > today:
        raise ErreurValidation("La date de règlement ne peut pas être dans le futur.")
    if date_paiement < date_facture:
        raise ErreurValidation("Le règlement ne peut pas précéder la date d'émission de la facture.")
    saisi = str(brut.get("mode") or "").strip().casefold()
    correspondance = {m.casefold(): m for m in MODES_PAIEMENT}
    if saisi not in correspondance:
        raise ErreurValidation("Mode de règlement inconnu. Valeurs possibles : " + ", ".join(MODES_PAIEMENT) + ".")
    return Reglement(date_paiement, correspondance[saisi])
