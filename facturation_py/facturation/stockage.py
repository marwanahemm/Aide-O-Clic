"""Persistance dans une base SQLite locale (un simple fichier, sans serveur).

Schéma calqué sur supabase/factures.sql. Les montants sont stockés en texte
pour conserver la précision décimale exacte.
"""
from __future__ import annotations

import json
import sqlite3
import uuid
from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from pathlib import Path
from typing import Any, Mapping

from .regles import (
    ErreurValidation, Ligne, cle_client, numero_suivant, total_lignes,
    valider_coordonnees, valider_facture, valider_reglement,
)

SCHEMA = """
CREATE TABLE IF NOT EXISTS factures (
    id              TEXT PRIMARY KEY,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    numero          TEXT NOT NULL UNIQUE,   -- AAAA-NNN ; une facture n'est jamais supprimée, seulement annulée
    date_facture    TEXT NOT NULL,          -- AAAA-MM-JJ
    date_prestation TEXT NOT NULL,
    client_nom      TEXT NOT NULL,
    client_adresse  TEXT,
    lignes          TEXT NOT NULL,          -- JSON : [{designation, quantite, prix_unitaire}]
    total           TEXT NOT NULL,
    statut          TEXT NOT NULL DEFAULT 'emise' CHECK (statut IN ('emise', 'payee', 'annulee')),
    date_paiement   TEXT,
    mode_paiement   TEXT,
    notes           TEXT
);
CREATE INDEX IF NOT EXISTS factures_date_idx ON factures (date_facture);
"""


@dataclass(frozen=True)
class Facture:
    id: str
    numero: str
    date_facture: date
    date_prestation: date
    client_nom: str
    client_adresse: str | None
    lignes: tuple[Ligne, ...]
    total: Decimal
    statut: str
    date_paiement: date | None
    mode_paiement: str | None
    notes: str | None


def _vers_facture(r: sqlite3.Row) -> Facture:
    return Facture(
        id=r["id"],
        numero=r["numero"],
        date_facture=date.fromisoformat(r["date_facture"]),
        date_prestation=date.fromisoformat(r["date_prestation"]),
        client_nom=r["client_nom"],
        client_adresse=r["client_adresse"],
        lignes=tuple(
            Ligne(l["designation"], Decimal(l["quantite"]), Decimal(l["prix_unitaire"]))
            for l in json.loads(r["lignes"])
        ),
        total=Decimal(r["total"]),
        statut=r["statut"],
        date_paiement=date.fromisoformat(r["date_paiement"]) if r["date_paiement"] else None,
        mode_paiement=r["mode_paiement"],
        notes=r["notes"],
    )


def _lignes_en_json(lignes: tuple[Ligne, ...]) -> str:
    return json.dumps(
        [{"designation": l.designation, "quantite": str(l.quantite), "prix_unitaire": str(l.prix_unitaire)} for l in lignes],
        ensure_ascii=False,
    )


class Carnet:
    """Carnet de factures. Chaque écriture est une transaction."""

    def __init__(self, chemin: str | Path = "factures.db") -> None:
        # isolation_level=None : on gère BEGIN / COMMIT nous-mêmes
        self._db = sqlite3.connect(str(chemin), isolation_level=None)
        self._db.row_factory = sqlite3.Row
        self._db.executescript(SCHEMA)

    def __enter__(self) -> "Carnet":
        return self

    def __exit__(self, *_: Any) -> None:
        self.fermer()

    def fermer(self) -> None:
        self._db.close()

    # ---------- lecture ----------

    def obtenir(self, reference: str) -> Facture:
        """Retrouve une facture par son numéro (2026-001) ou son identifiant."""
        r = self._db.execute(
            "SELECT * FROM factures WHERE numero = ? OR id = ?", (reference, reference)
        ).fetchone()
        if r is None:
            raise ErreurValidation(f"Facture introuvable : {reference}.")
        return _vers_facture(r)

    def lister(self, annee: int | None = None) -> list[Facture]:
        if annee is None:
            rows = self._db.execute("SELECT * FROM factures ORDER BY numero").fetchall()
        else:
            rows = self._db.execute(
                "SELECT * FROM factures WHERE date_facture LIKE ? ORDER BY numero", (f"{annee}-%",)
            ).fetchall()
        return [_vers_facture(r) for r in rows]

    def reglements_par_client(self, annee: int) -> dict[str, list[Facture]]:
        """Factures réglées pendant l'année, regroupées par client, par date de règlement."""
        rows = self._db.execute(
            "SELECT * FROM factures WHERE statut = 'payee' AND date_paiement LIKE ? "
            "ORDER BY date_paiement, numero",
            (f"{annee}-%",),
        ).fetchall()
        groupes: dict[str, list[Facture]] = {}
        for r in rows:
            f = _vers_facture(r)
            groupes.setdefault(cle_client(f.client_nom), []).append(f)
        return groupes

    # ---------- création ----------

    def creer(self, brut: Mapping[str, Any], today: date | None = None) -> Facture:
        d = valider_facture(brut, today)
        annee = d.date_facture.year
        ident = str(uuid.uuid4())
        self._db.execute("BEGIN IMMEDIATE")  # verrou : deux créations simultanées ne prennent jamais le même numéro
        try:
            dernier = self._db.execute(
                "SELECT numero, date_facture FROM factures WHERE numero LIKE ? ORDER BY numero DESC LIMIT 1",
                (f"{annee}-%",),
            ).fetchone()
            # Numérotation chronologique : pas de facture datée avant la précédente
            if dernier and d.date_facture < date.fromisoformat(dernier["date_facture"]):
                raise ErreurValidation(
                    "La date d'émission doit être postérieure ou égale à celle de la facture précédente "
                    f"(n° {dernier['numero']}, du {dernier['date_facture']})."
                )
            numero = numero_suivant(annee, dernier["numero"] if dernier else None)
            self._db.execute(
                "INSERT INTO factures (id, numero, date_facture, date_prestation, client_nom, "
                "client_adresse, lignes, total, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    ident, numero, d.date_facture.isoformat(), d.date_prestation.isoformat(),
                    d.coordonnees.client_nom, d.coordonnees.client_adresse,
                    _lignes_en_json(d.lignes), str(d.total), d.coordonnees.notes,
                ),
            )
            self._db.execute("COMMIT")
        except BaseException:
            self._db.execute("ROLLBACK")
            raise
        return self.obtenir(ident)

    # ---------- édition ----------

    def corriger(self, reference: str, brut: Mapping[str, Any]) -> Facture:
        """Corrige le nom, l'adresse et les notes du client.
        Les lignes et le montant d'une facture émise ne changent jamais (comme dans l'application web)."""
        f = self.obtenir(reference)
        if f.statut == "annulee":
            raise ErreurValidation("Facture annulée : modification impossible.")
        c = valider_coordonnees(brut)
        self._db.execute(
            "UPDATE factures SET client_nom = ?, client_adresse = ?, notes = ? WHERE id = ?",
            (c.client_nom, c.client_adresse, c.notes, f.id),
        )
        return self.obtenir(f.id)

    def payer(self, reference: str, brut: Mapping[str, Any], today: date | None = None) -> Facture:
        f = self.obtenir(reference)
        if f.statut != "emise":
            raise ErreurValidation("Seule une facture émise (non réglée, non annulée) peut être marquée comme payée.")
        r = valider_reglement(brut, f.date_facture, today)
        cur = self._db.execute(
            "UPDATE factures SET statut = 'payee', date_paiement = ?, mode_paiement = ? WHERE id = ? AND statut = 'emise'",
            (r.date_paiement.isoformat(), r.mode, f.id),
        )
        if cur.rowcount != 1:
            raise ErreurValidation("Le statut de la facture a changé entre-temps, rechargez-la.")
        return self.obtenir(f.id)

    def rouvrir(self, reference: str) -> Facture:
        f = self.obtenir(reference)
        if f.statut != "payee":
            raise ErreurValidation("Seule une facture payée peut être rouverte.")
        self._db.execute(
            "UPDATE factures SET statut = 'emise', date_paiement = NULL, mode_paiement = NULL WHERE id = ? AND statut = 'payee'",
            (f.id,),
        )
        return self.obtenir(f.id)

    def annuler(self, reference: str) -> Facture:
        f = self.obtenir(reference)
        if f.statut != "emise":
            raise ErreurValidation(
                "Seule une facture émise et non réglée peut être annulée (rouvrez-la d'abord si elle est payée)."
            )
        self._db.execute("UPDATE factures SET statut = 'annulee' WHERE id = ? AND statut = 'emise'", (f.id,))
        return self.obtenir(f.id)
