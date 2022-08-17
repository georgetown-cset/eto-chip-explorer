import unittest

from scripts.preprocess import get_country

class TestPreprocess(unittest.TestCase):
    def test_get_country_alpha3(self):
        self.assertEqual("United States", get_country("USA"))

    def test_get_country_alpha3_mapped(self):
        self.assertEqual("Taiwan", get_country("TWN"))

    def test_get_country_no_alpha3(self):
        self.assertEqual("Europe", get_country("Europe"))

    def test_get_country_no_alpha3_mapped(self):
        self.assertEqual("Malaysia", get_country("MAL"))