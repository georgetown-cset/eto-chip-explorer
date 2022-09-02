import copy
import unittest

from scripts.preprocess import Preprocess, MAJOR_PROVISION, MINOR_PROVISION, TOOLS, MATERIALS


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
        self.assertEqual({"N1": 2, "N2": 1}, Preprocess.get_provision_concentration({
            "Malaysia": {"N1": 50, "N2": 100},
            "United States": {"N1": 50}
        }))
        self.assertEqual({"N1": 4}, Preprocess.get_provision_concentration({
            "Malaysia": {"N1": "Major"},
            "United States": {"N1": "Major"},
            "South Africa": {"N1": "Major"}
        }))
        self.assertEqual({"N1": 1}, Preprocess.get_provision_concentration({
            "Malaysia": {"N1": "Major"},
            "United States": {"N1": "Major"},
            "South Africa": {"N1": "Minor"}
        }))

    def test_get_provision(self):
        self.assertEqual(90, Preprocess.get_provision({"share_provided": "90%", "minor_share": ""}))
        self.assertEqual(MAJOR_PROVISION, Preprocess.get_provision({"share_provided": "", "minor_share": ""}))
        self.assertEqual(MINOR_PROVISION, Preprocess.get_provision({"share_provided": "", "minor_share": "Minor"}))
        with self.assertRaises(AssertionError):
            Preprocess.get_provision({"share_provided": "", "minor_share": MAJOR_PROVISION})
        with self.assertRaises(AssertionError):
            Preprocess.get_provision({"share_provided": "30%", "minor_share": "Minor"})

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
            {"input_id": "M1", "goes_into_id": "N6"}
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
            "N7": ["N6"]
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
        pass
