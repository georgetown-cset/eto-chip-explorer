import unittest

from scripts.preprocess import Preprocess

class TestPreprocess(unittest.TestCase):
    def test_get_country_alpha3(self):
        self.assertEqual("United States", Preprocess.get_country("USA"))

    def test_get_country_alpha3_mapped(self):
        self.assertEqual("Taiwan", Preprocess.get_country("TWN"))

    def test_get_country_no_alpha3(self):
        self.assertEqual("Europe", Preprocess.get_country("Europe"))

    def test_get_country_no_alpha3_mapped(self):
        self.assertEqual("Malaysia", Preprocess.get_country("MAL"))