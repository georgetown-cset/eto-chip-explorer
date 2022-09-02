import unittest

from scripts.preprocess import Preprocess, MAJOR_PROVISION, MINOR_PROVISION


class TestPreprocess(unittest.TestCase):
    def test_get_country_alpha3(self):
        self.assertEqual("United States", Preprocess.get_country("USA"))

    def test_get_country_alpha3_mapped(self):
        self.assertEqual("Taiwan", Preprocess.get_country("TWN"))

    def test_get_country_no_alpha3(self):
        self.assertEqual("Europe", Preprocess.get_country("Europe"))

    def test_get_country_no_alpha3_mapped(self):
        self.assertEqual("Malaysia", Preprocess.get_country("MAL"))

    def test_get_provision_concentration(self):
        pass

    def test_get_provision(self):
        self.assertEqual(90, Preprocess.get_provision({"share_provided": "90%", "minor_share": ""}))
        self.assertEqual(MAJOR_PROVISION, Preprocess.get_provision({"share_provided": "", "minor_share": ""}))
        self.assertEqual(MINOR_PROVISION, Preprocess.get_provision({"share_provided": "", "minor_share": "Minor"}))
        with self.assertRaises(AssertionError):
            Preprocess.get_provision({"share_provided": "", "minor_share": MAJOR_PROVISION})
        with self.assertRaises(AssertionError):
            Preprocess.get_provision({"share_provided": "30%", "minor_share": "Minor"})

    def test_generate_graph(self):
        pass

    def test_update_variants(self):
        pass
