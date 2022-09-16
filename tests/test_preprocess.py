import copy
import unittest

from scripts.preprocess import (
    MAJOR_PROVISION,
    MARKET_SHARE_COL,
    MATERIALS,
    MINOR_PROVISION,
    TOOLS,
    Preprocess,
)


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
        self.assertEqual(
            {"N1": 2, "N2": 1},
            Preprocess.get_provision_concentration(
                {"Malaysia": {"N1": 50, "N2": 100}, "United States": {"N1": 50}}
            ),
        )
        self.assertEqual(
            {"N1": 4},
            Preprocess.get_provision_concentration(
                {
                    "Malaysia": {"N1": "Major"},
                    "United States": {"N1": "Major"},
                    "South Africa": {"N1": "Major"},
                }
            ),
        )
        self.assertEqual(
            {"N1": 1},
            Preprocess.get_provision_concentration(
                {
                    "Malaysia": {"N1": "Major"},
                    "United States": {"N1": "Major"},
                    "South Africa": {"N1": "negligible"},
                }
            ),
        )

    def test_get_provision(self):
        self.assertEqual(
            90,
            Preprocess.get_provision({"share_provided": "90%", MARKET_SHARE_COL: ""}),
        )
        self.assertEqual(
            MAJOR_PROVISION,
            Preprocess.get_provision({"share_provided": "", MARKET_SHARE_COL: ""}),
        )
        self.assertEqual(
            MINOR_PROVISION,
            Preprocess.get_provision(
                {"share_provided": "", MARKET_SHARE_COL: "negligible"}
            ),
        )
        with self.assertRaises(AssertionError):
            Preprocess.get_provision(
                {"share_provided": "", MARKET_SHARE_COL: MAJOR_PROVISION}
            )
        with self.assertRaises(AssertionError):
            Preprocess.get_provision(
                {"share_provided": "30%", MARKET_SHARE_COL: "negligible"}
            )
        self.assertEqual(
            MAJOR_PROVISION,
            Preprocess.get_provision(
                {"share_provided": "10%", MARKET_SHARE_COL: ""}, True
            ),
        )

    def test_generate_graph(self):
        preproc = Preprocess(None, is_test=True)
        preproc.node_to_meta = {
            "N1": {"type": "process", MATERIALS: [], TOOLS: []},
            "N2": {"type": "process", MATERIALS: [], TOOLS: []},
            "N3": {"type": "process", MATERIALS: [], TOOLS: []},
            "N4": {"type": "process", MATERIALS: [], TOOLS: []},
            "N5": {"type": "process", MATERIALS: [], TOOLS: []},
            "N6": {"type": "process", MATERIALS: [], TOOLS: []},
            "N7": {"type": "process", MATERIALS: [], TOOLS: []},
            "N100": {"type": "ultimate_output", MATERIALS: [], TOOLS: []},
            "T1": {"type": "tool_resource", MATERIALS: [], TOOLS: []},
            "T2": {"type": "tool_resource", MATERIALS: [], TOOLS: []},
            "M1": {"type": "material_resource", MATERIALS: [], TOOLS: []},
        }
        lines = [
            {"input_id": "N1", "goes_into_id": "N2"},
            {"input_id": "N2", "goes_into_id": "N100"},
            {"input_id": "N1", "goes_into_id": "N3"},
            {"input_id": "N4", "goes_into_id": "N3"},
            {"input_id": "N3", "goes_into_id": "N100"},
            {"input_id": "N5", "goes_into_id": "N6"},
            {"input_id": "N6", "goes_into_id": "N7"},
            {"input_id": "N7", "goes_into_id": "N100"},
            {"input_id": "T1", "goes_into_id": "N3"},
            {"input_id": "T2", "goes_into_id": "N3"},
            {"input_id": "M1", "goes_into_id": "T1"},
            {"input_id": "M1", "goes_into_id": "N6"},
        ]
        expected_graph = {
            "N1": ["N2", "N3"],
            "N2": ["N100"],
            "N4": ["N3"],
            "N3": ["N100"],
            "N5": ["N6"],
            "N6": ["N7"],
            "N7": ["N100"],
        }
        expected_graph_reverse = {
            "N2": ["N1"],
            "N3": ["N1", "N4"],
            "N100": ["N2", "N3", "N7"],
            "N6": ["N5"],
            "N7": ["N6"],
        }
        expected_node_to_meta = copy.deepcopy(preproc.node_to_meta)
        expected_node_to_meta["N3"][TOOLS] = ["T1", "T2"]
        expected_node_to_meta["T1"][MATERIALS] = ["M1"]
        expected_node_to_meta["N6"][MATERIALS] = ["M1"]

        returned_graph, returned_graph_reverse = preproc.generate_graph(lines)
        self.assertEqual(expected_graph, returned_graph)
        self.assertEqual(expected_graph_reverse, returned_graph_reverse)
        self.assertEqual(expected_node_to_meta, preproc.node_to_meta)

    def test_update_variants(self):
        preproc = Preprocess(None, is_test=True)
        preproc.node_to_meta = {
            "N1": {},
            "N2": {},
            "N3": {},
            "N4": {},
            "N5": {},
            "N6": {},
        }
        self.assertTrue(preproc.update_variants("N1", "", {"is_type_of_id": "N4"}))
        with self.assertRaises(AssertionError):
            preproc.update_variants("N2", "", {"is_type_of_id": ""})
        with self.assertRaises(AssertionError):
            preproc.update_variants("", "N7", {"is_type_of_id": ""})
        self.assertFalse(preproc.update_variants("N2", "N3", {"is_type_of_id": "N4"}))
        self.assertFalse(preproc.update_variants("N5", "N6", {"is_type_of_id": ""}))

    def test_clean_md_link(self):
        self.assertEqual(
            "Flickr user <a target='_blank' rel='noopener' href=\"https://www.flickr.com/photos/130561288@N04/50914099198/\">FritzchensFritz</a>",
            Preprocess.clean_md_link(
                "Flickr user [FritzchensFritz](https://www.flickr.com/photos/130561288@N04/50914099198/)"
            ),
        )
