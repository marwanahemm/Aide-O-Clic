import shutil
import subprocess
import tempfile
import unittest
from datetime import date
from decimal import Decimal
from pathlib import Path

from facturation import Carnet, Config, Editeur, ErreurValidation, generer_attestation, generer_facture
from facturation.regles import numero_suivant, valider_facture

CFG = Config(
    nom_site="Test", sous_titre="Assistance", telephone="0600000000", email="contact@exemple.fr",
    editeur=Editeur("Jean Test", "Entrepreneur individuel", "1 rue Exemple, 47000 Agen",
                    "123 456 789 00012", "SAP123456", "TVA non applicable, article 293 B du CGI"),
    credit_impot_pct=50,
)
JOUR = date(2026, 3, 10)


def nombre_de_pages(octets: bytes) -> int:
    """Lit le nombre de pages avec pdfinfo (poppler). Test ignoré si pdfinfo est absent."""
    if shutil.which("pdfinfo") is None:
        raise unittest.SkipTest("pdfinfo (poppler-utils) absent")
    with tempfile.TemporaryDirectory() as d:
        f = Path(d) / "a.pdf"
        f.write_bytes(octets)
        sortie = subprocess.run(["pdfinfo", str(f)], capture_output=True, text=True).stdout
    return int(next(l.split(":")[1] for l in sortie.splitlines() if l.startswith("Pages")))


def brut(**extra):
    base = {
        "client_nom": "Marie Dupont", "client_adresse": "2 rue Y, 47000 Agen",
        "date_prestation": "2026-03-10", "date_facture": "2026-03-10",
        "lignes": [{"designation": "Aide informatique", "quantite": "2", "prix_unitaire": "25"}],
    }
    base.update(extra)
    return base


class Regles(unittest.TestCase):
    def test_total_arrondi_et_virgule(self):
        d = valider_facture(brut(lignes=[
            {"designation": "Aide", "quantite": "1,5", "prix_unitaire": "33,33"},
            {"designation": "Visite", "quantite": "1", "prix_unitaire": "0.1"},
        ]), JOUR)
        self.assertEqual(d.total, Decimal("50.10"))

    def test_prestation_posterieure_refusee(self):
        with self.assertRaises(ErreurValidation):
            valider_facture(brut(date_prestation="2026-03-11"), JOUR)

    def test_date_future_refusee(self):
        with self.assertRaises(ErreurValidation):
            valider_facture(brut(date_facture="2026-03-11", date_prestation="2026-03-10"), JOUR)

    def test_nombre_de_lignes(self):
        with self.assertRaises(ErreurValidation):
            valider_facture(brut(lignes=[]), JOUR)
        with self.assertRaises(ErreurValidation):
            valider_facture(brut(lignes=[{"designation": "Aide", "quantite": "1", "prix_unitaire": "10"}] * 9), JOUR)

    def test_numerotation(self):
        self.assertEqual(numero_suivant(2026, None), "2026-001")
        self.assertEqual(numero_suivant(2026, "2026-009"), "2026-010")
        self.assertEqual(numero_suivant(2026, "2025-120"), "2026-001")


class Carnet_(unittest.TestCase):
    def setUp(self):
        self.carnet = Carnet(":memory:")

    def tearDown(self):
        self.carnet.fermer()

    def test_numerotation_continue(self):
        a = self.carnet.creer(brut(), JOUR)
        b = self.carnet.creer(brut(), JOUR)
        self.assertEqual((a.numero, b.numero), ("2026-001", "2026-002"))

    def test_ordre_chronologique(self):
        self.carnet.creer(brut(date_facture="2026-03-10", date_prestation="2026-03-10"), JOUR)
        with self.assertRaises(ErreurValidation):
            self.carnet.creer(brut(date_facture="2026-03-01", date_prestation="2026-03-01"), JOUR)

    def test_cycle_de_vie(self):
        f = self.carnet.creer(brut(), JOUR)
        p = self.carnet.payer(f.numero, {"mode": "virement", "date_paiement": "2026-03-12"}, date(2026, 4, 1))
        self.assertEqual((p.statut, p.mode_paiement), ("payee", "Virement"))
        with self.assertRaises(ErreurValidation):
            self.carnet.payer(f.numero, {"mode": "Virement", "date_paiement": "2026-03-12"}, date(2026, 4, 1))
        self.assertEqual(self.carnet.rouvrir(f.numero).statut, "emise")
        self.assertEqual(self.carnet.annuler(f.numero).statut, "annulee")
        with self.assertRaises(ErreurValidation):
            self.carnet.corriger(f.numero, {"client_nom": "Autre Nom"})

    def test_correction_ne_touche_ni_lignes_ni_total(self):
        f = self.carnet.creer(brut(), JOUR)
        g = self.carnet.corriger(f.numero, {"client_nom": "Marie Martin", "client_adresse": "", "notes": "Merci"})
        self.assertEqual(g.client_nom, "Marie Martin")
        self.assertIsNone(g.client_adresse)
        self.assertEqual(g.lignes, f.lignes)
        self.assertEqual(g.total, f.total)

    def test_attestation_regroupe_les_reglements(self):
        for jour in ("2026-03-10", "2026-04-10"):
            f = self.carnet.creer(brut(date_facture=jour, date_prestation=jour), date(2026, 4, 10))
            self.carnet.payer(f.numero, {"mode": "Virement", "date_paiement": jour}, date(2026, 4, 10))
        groupes = self.carnet.reglements_par_client(2026)
        self.assertEqual(len(groupes), 1)
        self.assertEqual(sum(p.total for p in next(iter(groupes.values()))), Decimal("100.00"))

    def test_pdf_facture_et_attestation(self):
        f = self.carnet.creer(brut(), JOUR)
        self.assertTrue(generer_facture(f, CFG).startswith(b"%PDF"))
        p = self.carnet.payer(f.numero, {"mode": "Chèque", "date_paiement": "2026-03-12"}, date(2026, 4, 1))
        self.assertTrue(generer_facture(p, CFG).startswith(b"%PDF"))
        octets = generer_attestation(2026, p.client_nom, p.client_adresse, [p], CFG, date(2026, 4, 1))
        self.assertTrue(octets.startswith(b"%PDF"))

    def test_attestation_longue_sur_plusieurs_pages(self):
        for _ in range(60):
            f = self.carnet.creer(brut(), JOUR)
            self.carnet.payer(f.numero, {"mode": "Virement", "date_paiement": "2026-03-10"}, date(2026, 4, 1))
        paiements = next(iter(self.carnet.reglements_par_client(2026).values()))
        octets = generer_attestation(2026, "Marie Dupont", None, paiements, CFG, date(2026, 4, 1))
        self.assertTrue(octets.startswith(b"%PDF"))
        self.assertGreater(nombre_de_pages(octets), 1)


if __name__ == "__main__":
    unittest.main()
