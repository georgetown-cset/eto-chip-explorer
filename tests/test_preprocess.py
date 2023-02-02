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
    def test_mk_metadata(self):
        self.maxDiff = None
        nodes_fi = "./tests/test_input.csv"
        stages_fi = "./tests/test_stages.csv"
        pp = Preprocess(None, True)
        pp.mk_metadata(nodes_fi, stages_fi)
        self.assertEqual(
            pp.node_to_meta,
            {
                "N1": {
                    "market_chart_caption": "",
                    "market_chart_source": "<a target='_blank' rel='noopener' "
                    'href="https://cset.georgetown.edu/publication/the-semiconductor-supply-chain/">CSET</a> '
                    "(citing SIA, IC Insights, TrendForce, "
                    "financial statements)",
                    "materials": [],
                    "name": "Logic chip design: Advanced CPUs",
                    "stage_id": "S1",
                    "tools": [],
                    "total_market_size": "$56.2 billion (microprocessors) (2019)",
                    "type": "process",
                },
                "N2": {
                    "market_chart_caption": "",
                    "market_chart_source": "<a target='_blank' rel='noopener' "
                    'href="https://cset.georgetown.edu/publication/the-semiconductor-supply-chain/">CSET</a> '
                    "(citing SIA, IC Insights, TrendForce, "
                    "financial statements)",
                    "materials": [],
                    "name": "Logic chip design: Discrete GPUs",
                    "stage_id": "S1",
                    "tools": [],
                    "total_market_size": "$11.9 billion (2019)",
                    "type": "process",
                },
                "S1": {
                    "market_chart_caption": "Chart shows market shares for the overall "
                    "global logic chip design market.",
                    "market_chart_source": "<a target='_blank' rel='noopener' "
                    'href="https://cset.georgetown.edu/publication/the-semiconductor-supply-chain/">CSET</a> '
                    "(citing SIA, IC Insights, TrendForce, "
                    "financial statements)",
                    "name": "Design",
                    "total_market_size": "Over $70 billion (2019)",
                    "type": "stage",
                },
            },
        )

    def test_mk_provider_to_meta(self):
        self.maxDiff = None
        provider_fi = "./tests/test_providers.csv"
        pp = Preprocess(None, True)
        pp.mk_provider_to_meta(provider_fi)
        self.assertEqual(
            pp.provider_to_meta,
            {
                "P1": {"name": "USA", "type": "country"},
                "P10": {
                    "hq_country": "United States",
                    "hq_flag": "🇺🇸",
                    "name": "AMD",
                    "type": "organization",
                },
                "P15": {
                    "hq_country": "China (mainland)",
                    "hq_flag": "🇨🇳",
                    "name": "Phytium",
                    "type": "organization",
                },
                "P2": {"name": "CHN", "type": "country"},
                "P4": {"name": "KOR", "type": "country"},
                "P9": {
                    "hq_country": "United States",
                    "hq_flag": "🇺🇸",
                    "name": "Intel",
                    "type": "organization",
                },
            },
        )

    def test_get_flag(self):
        self.assertEqual("🇺🇸", Preprocess.get_flag("USA"))

    def test_get_flag_invalid(self):
        self.assertEqual(None, Preprocess.get_flag("NoSuchCountry"))

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
            "T3": {"type": "tool_resource", MATERIALS: [], TOOLS: []},
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
            {"input_id": "T3", "goes_into_id": "", "is_type_of_id": "T2"},
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

    def test_get_node_to_country_provision(self):
        preproc = Preprocess(None, is_test=True)
        preproc.country_provision = {
            "US": {
                "N1": MAJOR_PROVISION,
                "N2": 30,
            },
            "JP": {
                "N1": MINOR_PROVISION,
                "N2": 60,
            },
        }
        self.assertEqual(
            {
                "N1": {
                    "all_names": ["JP", "US"],
                    "graph": [],
                    "undefined": ["JP (negligible)", "US"],
                },
                "N2": {
                    "all_names": ["JP", "US"],
                    "graph": [
                        {"country": "JP", "value": 60},
                        {"country": "US", "value": 30},
                    ],
                    "undefined": [],
                },
            },
            preproc._get_node_to_country_provision(),
        )

    def test_get_node_to_org_desc_list(self):
        preproc = Preprocess(None, is_test=True)
        preproc.org_provision = {
            "P35": {
                "N1": MAJOR_PROVISION,
                "N2": 30,
            },
            "P36": {
                "N1": MINOR_PROVISION,
                "N2": 60,
            },
        }
        preproc.provider_to_meta = {
            "P35": {"name": "Acme", "hq_country": "US"},
            "P36": {"name": "Widgets", "hq_country": "US"},
        }
        self.assertEqual(
            {
                "N1": ["Acme - US", "Widgets (negligible market share) - US"],
                "N2": ["Acme - US", "Widgets - US"],
            },
            preproc._get_node_to_org_desc_list(),
        )

    def test_get_sub_variants(self):
        preproc = Preprocess(None, is_test=True)
        preproc.variants = {"N1": ["N2", "N3"], "N2": ["N4"]}
        self.assertEqual(
            {"N1": ["N2", "N3", "N4"], "N2": ["N4"]}, preproc._get_sub_variants()
        )

    def test_preprocess_variants_list(self):
        variants = ["Widgets Co.", "Acme (negligible market share)", "Widgets Co."]
        self.assertEqual(
            ["Acme", "Widgets Co."], Preprocess._preprocess_variants_list(variants)
        )

    def test_clean_md_link(self):
        self.assertEqual(
            "Flickr user <a target='_blank' rel='noopener' href=\"https://www.flickr.com/photos/130561288@N04/50914099198/\">FritzchensFritz</a>",
            Preprocess.clean_md_link(
                "Flickr user [FritzchensFritz](https://www.flickr.com/photos/130561288@N04/50914099198/)"
            ),
        )
