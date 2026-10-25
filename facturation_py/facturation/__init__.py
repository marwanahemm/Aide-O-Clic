"""Factures et attestations fiscales annuelles (services à la personne), en Python.

Port de la logique du dépôt Aide-O-Clic (src/lib/facturesAdmin.js et src/lib/pdf.js).
"""
from .config import Config, Editeur
from .pdf import generer_attestation, generer_facture
from .regles import ErreurValidation
from .stockage import Carnet, Facture

__all__ = [
    "Carnet", "Config", "Editeur", "ErreurValidation", "Facture",
    "generer_attestation", "generer_facture",
]
