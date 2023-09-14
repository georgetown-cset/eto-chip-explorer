import argparse
import copy
import csv
import datetime
import json
import os
import re
import shutil
import urllib.request

import mistletoe
import pdfkit
import plotly.graph_objects as go
import pycountry
from google.cloud import bigquery
from jinja2 import Environment, FileSystemLoader
from tqdm import tqdm

env = Environment(loader=FileSystemLoader("templates"))

EXPECTED_TYPES = {
    "material_resource",
    "process",
    "stage",
    "tool_resource",
    "ultimate_output",
}
BASE_NODE_TYPES = {"process", "ultimate_output"}
TOOLS = "tools"
MATERIALS = "materials"

# TODO: somewhat duplicative of CAT, refactor into shared lib
COUNTRY_MAPPING = {
    "MAL": "Malaysia",
    "TAN": "Tanzania",
    "BAH": "Bahamas",
    "Venezuela, Bolivarian Republic of": "Venezuela",
    "Macao": "Macau",
    "Viet Nam": "Vietnam",
    "Cayman Islands": "Cayman Islands (the)",
    "China": "China (mainland)",
    "Eswatini": "Swaziland",
    "Korea, Republic of": "South Korea",
    "Korea": "South Korea",
    "Korea, Democratic People's Republic of": "North Korea",
    "Lao People's Democratic Republic": "Laos",
    "Bolivia, Plurinational State of": "Bolivia",
    "Palestine, State of": "Palestine",
    "Sao Tome and Principe": "São Tomé and Príncipe",
    "Syrian Arab Republic": "Syria",
    "Reunion": "Réunion",
    "Russian Federation": "Russia",
    "Iran, Islamic Republic of": "Iran",
    "Taiwan, Province of China": "Taiwan",
}

MAJOR_PROVISION = "Major"
MINOR_PROVISION = "negligible"
MARKET_SHARE_COL = "negligible_market_share"


class Preprocess:
    def __init__(self, args, is_test=False):  # pragma: no cover
        self.node_to_meta = {}
        self.provider_to_meta = {}
        self.variants = {}
        if not is_test:
            if not os.path.exists(args.output_dir):
                os.makedirs(args.output_dir)
            if not os.path.exists(args.output_pdfs_dir):
                os.makedirs(args.output_pdfs_dir)
                os.makedirs(args.output_pdfs_dir + "/images")

            self.mk_metadata(args.nodes, args.stages)
            self.write_descriptions(args.nodes, args.stages, args.output_text_dir)

            if args.images:
                # Delete existing images
                if os.path.exists(args.output_images_dir):
                    shutil.rmtree(args.output_images_dir)
                os.makedirs(args.output_images_dir)
            self.mk_images(args.images, args.images_file, args.output_images_dir)

            self.write_graphs(args.sequence, args.output_dir)
            self.mk_provider_to_meta(args.providers)
            self.write_provision(args.provision, args.output_dir)

            if args.refresh_bq:
                providers_bq = self.write_provider_bq_table(args.providers)
                self.write_to_bq(args.nodes, providers_bq)

            if args.pdfs:
                self.mk_pdfs(args.nodes, args.stages, args.output_pdfs_dir)

    def mk_metadata(self, nodes_fi: str, stages_fi: str):
        """
        Reads metadata from inputs sheet and instantiates a mapping between a node id and its metadata
        :param nodes: input csv
            (from https://docs.google.com/spreadsheets/d/1fqM2FIdzhrG5ZQnXUMyBfeSodJldrjY0vZeTA5TRqrg/edit#gid=0)
        :return: Dict mapping node ids to metadata
        """
        with open(nodes_fi, encoding="utf-8-sig") as f:
            for line in csv.DictReader(f):
                node_type = line["type"]
                node_id = line["input_id"]
                assert node_id not in self.node_to_meta, f"Duplicate id: {node_id}"
                self.node_to_meta[node_id] = {
                    "name": line["input_name"],
                    "type": node_type,
                    "stage_id": line["stage_id"],
                    "total_market_size": line[
                        "market_share_chart_global_market_size_info"
                    ].lower(),  # lowercasing to prevent "The market size is Over..."
                    "market_chart_caption": line["market_share_chart_caption"],
                    "market_chart_source": self.clean_md_link(
                        line["market_share_chart_source"]
                    ),
                }
                assert node_type in EXPECTED_TYPES
                self.node_to_meta[node_id][MATERIALS] = []
                self.node_to_meta[node_id][TOOLS] = []
        with open(stages_fi, encoding="utf-8-sig") as f:
            for line in csv.DictReader(f):
                self.node_to_meta[line["stage_id"]] = {
                    "name": line["stage_name"],
                    "type": "stage",
                    "total_market_size": line[
                        "market_share_chart_global_market_size_info"
                    ],
                    "market_chart_caption": line["market_share_chart_caption"],
                    "market_chart_source": self.clean_md_link(
                        line["market_share_chart_source"]
                    ),
                }

    def update_variants(self, parent: str, child: str, record: dict) -> bool:
        """
        Checks a sequence file row for variants, which should have a non-null is_type_of_id. Also prints
        warnings if other column values are unexpected
        :param parent: Parent (input) node
        :param child: Child (target) node
        :param record: A sequence file row
        :return: True if further processing of the record should be skipped
        """
        canonical_variant = record.get("is_type_of_id")
        if canonical_variant:
            if canonical_variant not in self.variants:
                self.variants[canonical_variant] = []
            self.variants[canonical_variant].append(parent)
            if not child:
                return True
        for node in [parent, child]:
            assert node, f"Unexpected null node in {record}"
            assert (
                node in self.node_to_meta
            ), f"Missing metadata for {node} from {record}"
        return False

    def generate_graph(self, lines: iter) -> tuple:
        """
        Generates dicts specifying a graph of process nodes, and associates nodes with their inputs
        :param lines: iterable of dict-like objects corresponding to node edge list
        :return: A tuple of the graph dict (parents: children) and its reverse (children: parents)
        """
        graph = {}
        graph_reverse = {}
        for line in lines:
            parent = line["input_id"]
            child = line["goes_into_id"]
            skip = self.update_variants(parent, child, line)
            if skip:
                continue
            parent_type = self.node_to_meta[parent]["type"]
            child_type = self.node_to_meta[child]["type"]
            if parent_type == "process":
                assert child_type in BASE_NODE_TYPES, f"Unexpected lineage: {line}"
                if parent not in graph:
                    graph[parent] = []
                graph[parent].append(child)
                if child not in graph_reverse:
                    graph_reverse[child] = []
                graph_reverse[child].append(parent)
            else:
                node_type = MATERIALS if parent_type == "material_resource" else TOOLS
                self.node_to_meta[child][node_type].append(parent)
        return graph, graph_reverse

    def write_graphs(self, sequence: str, output_dir: str) -> None:  # pragma: no cover
        """
        Parses a csv that specifies node type, the edges between nodes, and node variants
        :param sequence: sequence csv
            (from https://docs.google.com/spreadsheets/d/1DLfaIrmJYRy3FzculWDF2gRo74lDnf5WptnC7uIIkhE/edit#gid=0)
        :param output_dir: directory where graph metadata should be written
        :return: None
        """
        with open(sequence) as f:
            lines = csv.DictReader(f)
            graph, graph_reverse = self.generate_graph(lines)
        with open(os.path.join(output_dir, "graph.js"), mode="w") as f:
            f.write(f"const graph={json.dumps(graph)};\n")
            f.write(f"const graphReverse={json.dumps(graph_reverse)};\n")
            f.write(f"const nodeToMeta={json.dumps(self.node_to_meta)};\n")
            f.write(f"const variants={json.dumps(self.variants)};\n")
            f.write("\nexport {graph, graphReverse, nodeToMeta, variants};\n")

    @staticmethod
    def get_flag(country_name: str) -> str:
        """
        Return flag emoji for country
        :param raw_country_name: Country name string
        :return: Flag emoji (in unicode) for that country or None
        """
        try:
            country = pycountry.countries.lookup(country_name)
            return country.flag
        except LookupError:
            return None

    @staticmethod
    def get_country(raw_country_name: str) -> str:
        """
        Normalize country names, including mapping from alpha3
        :param raw_country_name: Raw analyst-specified country name
        :return: Normalized country name
        """
        country = pycountry.countries.get(alpha_3=raw_country_name)
        clean_country_name = None if country is None else country.name
        if clean_country_name is None:
            if raw_country_name not in COUNTRY_MAPPING:
                print(f"warning: pycountry could not find {raw_country_name}")
            clean_country_name = raw_country_name
        return COUNTRY_MAPPING.get(clean_country_name, clean_country_name)

    @staticmethod
    def get_provision(record: dict, is_org: bool = False):
        """
        Get numeric or descriptive provision value from row of provision data
        :param record: Row of provision data
        :param is_org: If true, the provider is an org and we should map any numeric
            provision to major
        :return: Provision value
        """
        assert not (
            (len(record["share_provided"]) > 0) and (len(record[MARKET_SHARE_COL]) > 0)
        ), f"Record should have either negligible share or provision, not both: {record}"
        if record["share_provided"]:
            if is_org:
                return MAJOR_PROVISION
            return int(record["share_provided"].strip("%"))
        share = record[MARKET_SHARE_COL].strip()
        if share:
            assert share.lower() == MINOR_PROVISION.lower(), share
            return MINOR_PROVISION
        return MAJOR_PROVISION

    @staticmethod
    def get_provision_concentration(country_provision):
        """
        Calculate how concentrated the country provision for each node is. This is
        approximated as the number of countries it takes to account for 75% of the
        market.
        :param country_provision: The country provision dictionary, created in the
            mk_provision function
        :return: A dictionary mapping node ID to number of countries
        """
        CONCENTRATION_THRESHOLD = 75
        # Create a mapping of a node to an array of country shares
        threshold_tracker = {}
        for country in country_provision:
            for node in country_provision[country]:
                provision_value = country_provision[country][node]
                # We drop minor providers because they are not relevant for concentration purposes
                if provision_value == MINOR_PROVISION:
                    continue
                if node not in threshold_tracker:
                    threshold_tracker[node] = [provision_value]
                else:
                    threshold_tracker[node].append(provision_value)
        country_provision_concentration = {}
        # Sort the country shares so we can add them in descending order
        for node in threshold_tracker:
            if MAJOR_PROVISION in threshold_tracker[node]:
                # Call the node highly concentrated if there are 2 or fewer "Major"
                # providers, and not concentrated if there are 3 or more
                if len(threshold_tracker[node]) < 3:
                    threshold_tracker[node] = [80]
                else:
                    threshold_tracker[node] = [20, 20, 20, 20]
            else:
                threshold_tracker[node].sort(reverse=True)
            # Add up how many country shares it takes to reach the threshold
            num_countries = 0
            curr_threshold = 0
            while curr_threshold < CONCENTRATION_THRESHOLD and num_countries < len(
                threshold_tracker[node]
            ):
                curr_threshold += threshold_tracker[node][num_countries]
                num_countries += 1
            country_provision_concentration[node] = (
                num_countries if num_countries > 0 else None
            )
        return country_provision_concentration

    def write_provision(self, provision_fi: str, output_dir: str) -> None:
        """
        Create metadata for providers
        :param provision_fi: provision csv
            (from https://docs.google.com/spreadsheets/d/1FGib0RJ2vEFOXNZOGWNcZJZu82r330337DjKIbsz2ao/edit#gid=0)
        :param output_dir: directory where output metadata should be written
        :return: None
        """
        self.org_provision = {}
        process_nodes_with_org_provision = set()
        self.country_provision = {}
        country_flags = {}
        with open(provision_fi) as f:
            for line in csv.DictReader(f):
                provider_id = line["provider_id"].strip()
                provider_meta = self.provider_to_meta[provider_id]
                provider_name = provider_meta["name"]
                provided = line["provided_id"]
                if provider_meta["type"] == "country":
                    country_name = self.get_country(provider_name)
                    if country_name not in self.country_provision:
                        self.country_provision[country_name] = {}
                        country_flags[country_name] = self.get_flag(provider_name)
                    provision_share = self.get_provision(line)
                    self.country_provision[country_name][provided] = provision_share
                    if (provided not in self.node_to_meta) or (
                        self.node_to_meta[provided]["type"]
                        not in ["tool_resource", "material_resource", "stage"]
                    ):
                        print(
                            f"unexpected country provision: {provided} "
                            + self.node_to_meta.get(provided, {}).get("type", "")
                        )
                else:
                    if provider_id not in self.org_provision:
                        self.org_provision[provider_id] = {}
                    self.org_provision[provider_id][provided] = self.get_provision(
                        line, True
                    )
                    if self.node_to_meta.get(provided, {}).get("type") == "process":
                        process_nodes_with_org_provision.add(provided)
        country_provision_concentration = self.get_provision_concentration(
            self.country_provision
        )
        with open(os.path.join(output_dir, "provision.js"), mode="w") as f:
            f.write(f"const countryProvision={json.dumps(self.country_provision)};\n")
            f.write(f"const countryFlags={json.dumps(country_flags)};\n")
            f.write(
                f"const countryProvisionConcentration={json.dumps(country_provision_concentration)};\n"
            )
            f.write(f"const orgProvision={json.dumps(self.org_provision)};\n")
            f.write(
                f"const processNodesWithOrgProvision={json.dumps(list(process_nodes_with_org_provision))};\n"
            )
            f.write(f"const providerMeta={json.dumps(self.provider_to_meta)};\n")
            f.write(
                "\nexport {countryProvision, countryFlags, "
                "countryProvisionConcentration, orgProvision, processNodesWithOrgProvision, "
                "providerMeta};\n"
            )

    def write_descriptions(
        self, nodes_fi: str, stages_fi: str, output_dir: str
    ) -> None:
        """
        Write out node or stage descriptions as markdown
        :param nodes_fi: inputs csv
            (from https://docs.google.com/spreadsheets/d/1fqM2FIdzhrG5ZQnXUMyBfeSodJldrjY0vZeTA5TRqrg/edit#gid=0)
        :param stages_fi: stages csv
            (from https://docs.google.com/spreadsheets/d/1zZnskTSTMyhEwlA8xGgJ7EjOqHaxwxRtYavTDYAOIqM/edit#gid=0)
        :param output_dir: Directory where output markdown should be written
        :return: None
        """
        header_template = "#### {}\n\n"
        with open(nodes_fi, encoding="utf-8-sig") as f:
            for line in csv.DictReader(f):
                with open(
                    os.path.join(output_dir, line["input_id"]) + ".mdx", mode="w"
                ) as out:
                    out.write(header_template.format(line["input_name"]))
                    out.write(line["description"])
        with open(stages_fi, encoding="utf-8-sig") as f:
            for line in csv.DictReader(f):
                with open(
                    os.path.join(output_dir, line["stage_id"]) + ".mdx", mode="w"
                ) as out:
                    out.write(header_template.format(line["stage_name"]))
                    out.write(line["description"])

    def _get_node_to_country_provision(self):
        """
        Generate dictionary mapping nodes to country provision shares
        :return: Above dictionary
        """
        node_to_country_provision = {}
        for country in self.country_provision:
            for node in self.country_provision[country]:
                if node not in node_to_country_provision:
                    node_to_country_provision[node] = {
                        "graph": [],
                        "undefined": [],
                        "all_names": [],
                    }
                provision = self.country_provision[country][node]
                node_to_country_provision[node]["all_names"].append(country)
                if type(provision) == int:
                    node_to_country_provision[node]["graph"].append(
                        {"country": country, "value": provision}
                    )
                else:
                    countryDesc = country
                    if provision == MINOR_PROVISION:
                        countryDesc += " (negligible)"
                    node_to_country_provision[node]["undefined"].append(countryDesc)
        for node in node_to_country_provision:
            node_to_country_provision[node]["graph"] = sorted(
                node_to_country_provision[node]["graph"],
                key=lambda d: d["value"],
                reverse=True,
            )
            node_to_country_provision[node]["undefined"].sort()
            node_to_country_provision[node]["all_names"].sort()
        return node_to_country_provision

    def _get_country_provision_graph(
        self, graph, output_dir, node_id
    ):  # pragma: no cover
        """
        Generate a graph representing country provisions for a node
        :return: A dictionary representation of a graph
        """
        fig = go.Figure(
            data=[
                go.Bar(
                    x=[e["value"] for e in graph],
                    y=[e["country"] for e in graph],
                    orientation="h",
                    text=[str(e["value"]) + "%" for e in graph],
                    textposition="auto",
                )
            ]
        )
        fig.update_layout(
            xaxis=dict(title="Share of global market"),
            yaxis=dict(categoryorder="total ascending"),
            margin=dict(t=30, r=30, b=35, l=120, pad=4),
        )
        fig.write_image(os.path.join(output_dir, "images", node_id) + ".jpg")

    def _get_node_to_org_desc_list(self):
        """
        Generate dictionary mapping nodes to lists of names of provider organizations
        :return: Above dictionary
        """
        node_to_org_desc_list = {}
        for org in self.org_provision:
            for node in self.org_provision[org]:
                if node not in node_to_org_desc_list:
                    node_to_org_desc_list[node] = []
                org_desc = self.provider_to_meta[org]["name"]
                if self.org_provision[org][node] == MINOR_PROVISION:
                    org_desc += " (negligible market share)"
                if self.provider_to_meta[org].get("hq_country"):
                    org_desc += " - " + self.provider_to_meta[org].get("hq_country")
                node_to_org_desc_list[node].append(org_desc.strip())
        for node in node_to_org_desc_list:
            node_to_org_desc_list[node].sort()
        return node_to_org_desc_list

    def _get_sub_variants(self):
        subVariants = copy.deepcopy(self.variants)
        for nodeWithVariants in subVariants:
            for nodeVariant in subVariants[nodeWithVariants]:
                if nodeVariant in subVariants:
                    subVariants[nodeWithVariants].extend(subVariants[nodeVariant])
        return subVariants

    @staticmethod
    def _preprocess_variants_list(variants_list):
        # Remove inapplicable text about negligible providers
        variants_list = [re.sub(r"\W\(negligible.*?\)", "", c) for c in variants_list]
        # Remove duplicates
        variants_list = list(set(variants_list))
        # Sort alphabetically
        variants_list.sort(key=lambda v: v.lower())
        return variants_list

    def _mk_pdf_for_node(
        self,
        node_id,
        line,
        images_folder,
        node_to_country_provision,
        node_to_org_desc_list,
        sub_variants,
        output_dir,
    ) -> None:
        """
        Generate and save a PDF with the description for a node
        :return: None
        """
        node_description = line["description"].replace("\n", "<br/>")
        node_countries = node_to_country_provision.get(node_id, {})
        if node_countries.get("graph"):
            self._get_country_provision_graph(
                node_countries["graph"], output_dir, node_id
            )
        node_orgs = node_to_org_desc_list.get(node_id)
        # Preprocess variant information.
        node_variants = [
            self.node_to_meta[variant_node]["name"]
            for variant_node in self.variants.get(node_id, [])
        ]
        node_variants.sort()

        node_countries_variants = []
        node_orgs_variants = []
        for variant_node in sub_variants.get(node_id, []):
            node_countries_variants.extend(
                node_to_country_provision.get(variant_node, {}).get("all_names", [])
            )
            node_orgs_variants.extend(node_to_org_desc_list.get(variant_node, []))
        node_countries_variants = self._preprocess_variants_list(
            node_countries_variants
        )
        node_orgs_variants = self._preprocess_variants_list(node_orgs_variants)
        # Create PDF
        template = env.get_template("pdf.html")
        cluster_page = template.render(
            node_description=node_description,
            node_id=node_id,
            node_name=self.node_to_meta[node_id]["name"],
            node_countries=node_countries,
            node_orgs=node_orgs,
            node_variants=node_variants,
            node_countries_variants=node_countries_variants,
            node_orgs_variants=node_orgs_variants,
            images_folder=images_folder,
        )
        pdfkit.from_string(
            cluster_page,
            os.path.join(output_dir, node_id) + ".pdf",
            {"enable-local-file-access": None},
        )

    def mk_pdfs(
        self, nodes_fi: str, stages_fi: str, output_dir: str
    ) -> None:  # pragma: no cover
        """
        Generate pdf version of the each node's description
        :param nodes_fi: CSV file with node information
        :param stages_fi: CSV file with stage information
        :param output_dir: name of directory where pdfs should be written
        :return: None
        """
        node_to_country_provision = self._get_node_to_country_provision()
        node_to_org_desc_list = self._get_node_to_org_desc_list()
        sub_variants = self._get_sub_variants()
        images_folder = os.path.abspath(output_dir + "/images")
        print("Generating node pdfs...")
        with open(nodes_fi, encoding="utf-8-sig") as f:
            for line in tqdm(csv.DictReader(f)):
                node_id = line["input_id"]
                self._mk_pdf_for_node(
                    node_id,
                    line,
                    images_folder,
                    node_to_country_provision,
                    node_to_org_desc_list,
                    sub_variants,
                    output_dir,
                )
        print("Generating stage pdfs...")
        with open(stages_fi, encoding="utf-8-sig") as f:
            for line in tqdm(csv.DictReader(f)):
                node_id = line["stage_id"]
                self._mk_pdf_for_node(
                    node_id,
                    line,
                    images_folder,
                    node_to_country_provision,
                    node_to_org_desc_list,
                    sub_variants,
                    output_dir,
                )

    def mk_provider_to_meta(self, provider_fi: str):
        """
        Create a mapping between provider ids and their metadata, such as name and type (for company providers)
        :param provider_fi: provider csv
            (from https://docs.google.com/spreadsheets/d/1QaUTc75gnwk1SwEy3vCx3J0w6oE0yCierYF2pO0Uino/edit#gid=0)
        :return: None (mutates self.provider_meta)
        """
        name_to_id = {}
        with open(provider_fi) as f:
            for line in csv.DictReader(f):
                self.provider_to_meta[line["provider_id"]] = {
                    "name": line["provider_name"],
                    "type": line["provider_type"],
                }
                if line["country"]:
                    self.provider_to_meta[line["provider_id"]][
                        "hq_flag"
                    ] = self.get_flag(line["country"].strip())
                    self.provider_to_meta[line["provider_id"]][
                        "hq_country"
                    ] = self.get_country(line["country"]).strip()
                name_to_id[line["provider_name"]] = line["provider_id"]

    def write_provider_bq_table(self, provider_fi: str):
        """
        Create a CSV table that can be loaded into bigquery. This table has
        the same data as the providers CSV, except that the country code is
        changed to a country name.
        :param provider_fi: provider csv
        :return: string representing file name of newly-created CSV
        """
        provider_bq_fi = provider_fi[:-4] + "_bq.csv"
        with open(provider_fi) as in_f:
            with open(provider_bq_fi, "w") as out_f:
                header_names = [
                    "provider_name",
                    "provider_id",
                    "provider_type",
                    "country",
                ]
                writer = csv.DictWriter(out_f, fieldnames=header_names)
                writer.writeheader()
                for line in csv.DictReader(in_f):
                    if line["country"]:
                        line["country"] = self.get_country(line["country"]).strip()
                    writer.writerow(line)
        return provider_bq_fi

    def write_to_bq(self, nodes_fi, provider_bq_fi):  # pragma: no cover
        """
        Load CSVs to bigquery tables, overwriting the existing tables.
        Also loads the CSVs to versioned backup tables.
        :param nodes_fi: inputs csv
        :param provider_bq_fi: provider csv
        """
        client = bigquery.Client(project="gcp-cset-projects")
        dataset_ids = [
            "gcp-cset-projects.eto_chipexplorer",
            "gcp-cset-projects.eto_chipexplorer_backups",
        ]
        table_ids = {
            "inputs": {
                "file": nodes_fi,
                "schema": [
                    bigquery.SchemaField("input_name", "STRING"),
                    bigquery.SchemaField("input_id", "STRING"),
                    bigquery.SchemaField("type", "STRING"),
                    bigquery.SchemaField("stage_name", "STRING"),
                    bigquery.SchemaField("stage_id", "STRING"),
                    bigquery.SchemaField("description", "STRING"),
                    bigquery.SchemaField(
                        "market_share_chart_global_market_size_info", "STRING"
                    ),
                    bigquery.SchemaField("market_share_chart_caption", "STRING"),
                    bigquery.SchemaField("market_share_chart_source", "STRING"),
                ],
            },
            "providers": {
                "file": provider_bq_fi,
                "schema": [
                    bigquery.SchemaField("provider_name", "STRING"),
                    bigquery.SchemaField("provider_id", "STRING"),
                    bigquery.SchemaField("provider_type", "STRING"),
                    bigquery.SchemaField("country", "STRING"),
                ],
            },
        }

        for table_id in table_ids:
            job_config = bigquery.LoadJobConfig(
                source_format=bigquery.SourceFormat.CSV,
                skip_leading_rows=1,
                autodetect=False,
                write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE,
                allow_quoted_newlines=True,
                schema=table_ids[table_id]["schema"],
            )
            with open(table_ids[table_id]["file"], "rb") as source_file:
                for dataset_id in dataset_ids:
                    table_name = f"{dataset_id}.{table_id}"
                    if "backups" in dataset_id:
                        table_name += "_" + datetime.date.today().strftime("%Y%m%d")
                    print(f"uploading data to {table_name}")
                    job = client.load_table_from_file(
                        source_file,
                        table_name,
                        job_config=job_config,
                        rewind=True,
                    )
                    job.result()  # Wait for the upload to complete

    @staticmethod
    def clean_md_link(text) -> str:
        """
        Turns markdown link into html link
        :param text: text that may contain a markdown link
        :return: text with markdown link replaced with html link
        """
        # TODO: either move the markdown parsing for the captions into the webapp or use a different
        #   mistletoe renderer rather than hacking up the default output
        return re.sub(
            r"<\/p>", "", re.sub(r"^<p>", "", mistletoe.markdown(text).strip())
        ).replace("a href=", "a target='_blank' rel='noopener' href=")

    def mk_images(self, download_images: bool, images_fi: str, output_dir: str) -> None:
        """
        Downloads images from an airtable CSV and renames them according to their associated node
        :param download_images: True if images should be re-downloaded
        :param images_fi: Path to airtable CSV
        :param output_dir: Path to output folder where images will be placed
        :return: None
        """
        with open(images_fi) as f:
            for line in csv.DictReader(f):
                # image_col is of the format "something.jpeg (https://link.com/to/something.jpeg)"
                image_col = line["image"]
                image_fi = re.search(r"\((http.*?)\)", image_col)[1]
                file_type = image_fi.split(".")[-1]
                image_node_id = line["input_id"]
                if download_images:
                    urllib.request.urlretrieve(
                        image_fi,
                        os.path.join(output_dir, image_node_id) + f".{file_type}",
                    )
                self.node_to_meta[image_node_id]["image_caption"] = self.clean_md_link(
                    line["caption"]
                )
                self.node_to_meta[image_node_id]["image_license"] = self.clean_md_link(
                    line["credit"]
                )
                self.node_to_meta[image_node_id]["image_offset"] = line["offset"]


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--nodes", default=os.path.join("data", "inputs.csv"))
    parser.add_argument("--sequence", default=os.path.join("data", "sequence.csv"))
    parser.add_argument("--stages", default=os.path.join("data", "stages.csv"))
    parser.add_argument("--providers", default=os.path.join("data", "providers.csv"))
    parser.add_argument("--provision", default=os.path.join("data", "provision.csv"))
    parser.add_argument("--images", action="store_true")
    parser.add_argument(
        "--images_file", default=os.path.join("data", "site_artifacts", "images.csv")
    )
    parser.add_argument("--output_dir", default=os.path.join("supply-chain", "data"))
    parser.add_argument(
        "--output_text_dir", default=os.path.join("supply-chain", "src", "pages")
    )
    parser.add_argument(
        "--output_images_dir",
        default=os.path.join("supply-chain", "src", "images", "nodes"),
    )
    parser.add_argument("--pdfs", action="store_true")
    parser.add_argument(
        "--output_pdfs_dir", default=os.path.join("supply-chain", "src", "pdfs")
    )
    parser.add_argument("--refresh_bq", action="store_true")
    args = parser.parse_args()

    Preprocess(args)
