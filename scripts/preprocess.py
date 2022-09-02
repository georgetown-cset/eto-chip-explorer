import argparse
import csv
import json
import os
import pycountry
import re
import urllib.request

EXPECTED_TYPES = {"material_resource", "process", "stage", "tool_resource", "ultimate_output"}
BASE_NODE_TYPES = {"process", "ultimate_output"}

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
MINOR_PROVISION = "Minor"

class Preprocess:
    def __init__(self, args):
        self.node_to_meta = {}
        self.provider_to_meta = {}
        self.variants = {}
        if not os.path.exists(args.output_dir):
            os.makedirs(args.output_dir)
        if not os.path.exists(args.output_images_dir):
            os.makedirs(args.output_images_dir)

        self.mk_metadata(args.nodes)
        self.write_descriptions(args.nodes, args.stages, args.output_text_dir)

        self.write_graphs(args.sequence, args.output_dir)
        self.mk_provider_to_meta(args.providers, args.basic_company_info)
        self.mk_provision(args.provision, args.output_dir)
        if args.images:
            self.mk_images(args.images_file, args.output_images_dir)

    def mk_metadata(self, nodes: str):
        """
        Reads metadata from inputs sheet and instantiates a mapping between a node id and its metadata
        :param nodes: input csv
            (from https://docs.google.com/spreadsheets/d/1fqM2FIdzhrG5ZQnXUMyBfeSodJldrjY0vZeTA5TRqrg/edit#gid=0)
        :return: Dict mapping node ids to metadata
        """
        with open(nodes) as f:
            for line in csv.DictReader(f):
                node_type = line["type"]
                node_id = line["input_id"]
                self.node_to_meta[node_id] = {
                    "name": line["input_name"],
                    "type": node_type,
                    "stage_id": line["stage_id"]
                }
                assert node_type in EXPECTED_TYPES
                self.node_to_meta[node_id]["materials"] = []
                self.node_to_meta[node_id]["tools"] = []

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
            if not node:
                print(f"Unexpected null node in {record}")
                return True
            if node not in self.node_to_meta:
                print(f"Missing meta for {node} from {record}")
                return True
        return False

    def write_graphs(self, sequence: str, output_dir: str) -> None:
        """
        Parses a csv that specifies node type, the edges between nodes, and node variants
        :param sequence: sequence csv
            (from https://docs.google.com/spreadsheets/d/1DLfaIrmJYRy3FzculWDF2gRo74lDnf5WptnC7uIIkhE/edit#gid=0)
        :param output_dir: directory where graph metadata should be written
        :return: None
        """
        graph = {}
        graph_reverse = {}
        with open(sequence) as f:
            for line in csv.DictReader(f):
                parent = line["input_id"]
                child = line["goes_into_id"]
                skip = self.update_variants(parent, child, line)
                if skip:
                    continue
                parent_type = self.node_to_meta[parent]["type"]
                child_type = self.node_to_meta[child]["type"]
                if parent_type == "process":
                    if child_type in BASE_NODE_TYPES:
                        if parent not in graph:
                            graph[parent] = []
                        graph[parent].append(child)
                        if child not in graph_reverse:
                            graph_reverse[child] = []
                        graph_reverse[child].append(parent)
                    else:
                        print(f"Unexpected lineage: {line}")
                else:
                    node_type = "materials" if parent_type == "material_resource" else "tools"
                    self.node_to_meta[child][node_type].append(parent)
        with open(os.path.join(output_dir, "graph.js"), mode="w") as f:
            f.write(f"const graph={json.dumps(graph)};\n")
            f.write(f"const graphReverse={json.dumps(graph_reverse)};\n")
            f.write(f"const nodeToMeta={json.dumps(self.node_to_meta)};\n")
            f.write(f"const variants={json.dumps(self.variants)};\n")
            f.write("\nexport {graph, graphReverse, nodeToMeta, variants};\n")

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

    def get_provision(self, record: dict):
        """
        Get numeric or descriptive provision value from row of provision data
        :param record: Row of provision data
        :return: Provision value
        """
        if record["share_provided"]:
            return int(record["share_provided"].strip("%"))
        if not record["minor_share"].strip():
            return MINOR_PROVISION
        return MAJOR_PROVISION

    def get_provision_concentration(self, country_provision):
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
                if provision_value == MAJOR_PROVISION:
                    provision_value = 80
                elif provision_value == MINOR_PROVISION:
                    provision_value = 20
                if node not in threshold_tracker:
                    threshold_tracker[node] = [provision_value]
                else:
                    threshold_tracker[node].append(provision_value)
        # Sort the country shares so we can add them in descending order
        for arr in threshold_tracker.values():
            arr.sort(reverse=True)
        # Add up how many country shares it takes to reach the threshold
        country_provision_concentration = {}
        for node in threshold_tracker:
            i = 0
            curr_threshold = 0
            while curr_threshold < CONCENTRATION_THRESHOLD and i < len(threshold_tracker[node]):
                curr_threshold += threshold_tracker[node][i]
                i += 1
            country_provision_concentration[node] = i if i > 0 else None
        return country_provision_concentration


    def mk_provision(self, provision_fi: str, output_dir: str) -> None:
        """
        Create metadata for providers
        :param provision_fi: provision csv
            (from https://docs.google.com/spreadsheets/d/1FGib0RJ2vEFOXNZOGWNcZJZu82r330337DjKIbsz2ao/edit#gid=0)
        :param output_dir: directory where output metadata should be written
        :return: None
        """
        org_provision = {}
        country_provision = {}
        with open(provision_fi) as f:
            for line in csv.DictReader(f):
                assert sum([not line["share_provided"], not line["minor_share"]]) > 0
                provider_name = self.provider_to_meta[line["provider_id"]]["name"]
                provided = line["provided_id"]
                if self.provider_to_meta[line["provider_id"].strip()]["type"] == "country":
                    country_name = self.get_country(provider_name)
                    if country_name not in country_provision:
                        country_provision[country_name] = {}
                    provision_share = self.get_provision(line)
                    country_provision[country_name][provided] = provision_share
                    if (provided not in self.node_to_meta) or \
                            (self.node_to_meta[provided]["type"] not in ["tool_resource", "material_resource"]):
                        print(f"unexpected country provision: {provided} " +
                              ("" if provided not in self.node_to_meta else self.node_to_meta[provided]["type"]))
                else:
                    if provider_name not in org_provision:
                        org_provision[line["provider_id"]] = {}
                    org_provision[line["provider_id"]][provided] = self.get_provision(line)
        country_provision_concentration = self.get_provision_concentration(country_provision)
        with open(os.path.join(output_dir, "provision.js"), mode="w") as f:
            f.write(f"const countryProvision={json.dumps(country_provision)};\n")
            f.write(f"const countryProvisionConcentration={json.dumps(country_provision_concentration)};\n")
            f.write(f"const orgProvision={json.dumps(org_provision)};\n")
            f.write(f"const providerMeta={json.dumps(self.provider_to_meta)};\n")
            f.write("\nexport {countryProvision, orgProvision, providerMeta};\n")

    @staticmethod
    def write_descriptions(nodes_fi: str, stages_fi: str, output_dir: str) -> None:
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
        with open(nodes_fi) as f:
            for line in csv.DictReader(f):
                with open(os.path.join(output_dir, line["input_id"])+".mdx", mode="w") as out:
                    out.write(header_template.format(line["input_name"]))
                    out.write(line["description"])
        with open(stages_fi) as f:
            for line in csv.DictReader(f):
                with open(os.path.join(output_dir, line["stage_id"])+".mdx", mode="w") as out:
                    out.write(header_template.format(line["stage_name"]))
                    out.write(line["description"])

    def mk_provider_to_meta(self, provider_fi: str, company_metadata_fi: str):
        """
        Create a mapping between provider ids and their metadata, such as name, type, and url (for company providers)
        :param provider_fi: provider csv
            (from https://docs.google.com/spreadsheets/d/1QaUTc75gnwk1SwEy3vCx3J0w6oE0yCierYF2pO0Uino/edit#gid=0)
        :param company_metadata_fi: Airtable export of basic company metadata
            (from https://airtable.com/apptyAYjYFVXWONzU/tblbaY2Qa4hMpknjk/viwHEhESHcbtBk2ya?blocks=hide)
        :return: None (mutates self.provider_meta)
        """
        name_to_id = {}
        with open(provider_fi) as f:
            for line in csv.DictReader(f):
                self.provider_to_meta[line["provider_id"]] = {
                    "name": line["provider_name"],
                    "type": line["provider_type"]
                }
                name_to_id[line["provider_name"]] = line["provider_id"]
        with open(company_metadata_fi) as f:
            for line in csv.DictReader(f):
                company_id = name_to_id.get(line["Company"])
                if not company_id:
                    continue
                self.provider_to_meta[company_id]["hq"] = pycountry.countries.lookup(line["HQ country"].strip()).flag
                self.provider_to_meta[company_id]["url"] = line["Website URL"]

    @staticmethod
    def mk_images(images_fi: str, output_dir: str) -> None:
        """
        Downloads images from an airtable CSV and renames them according to their associated node
        :param image_fi: Path to airtable CSV
        :param output_dir: Path to output folder where images will be placed
        :return: None
        """
        with open(images_fi) as f:
            for line in csv.DictReader(f):
                # image_col is of the format "something.jpeg (https://link.com/to/something.jpeg)"
                image_col = line["Image"]
                image_fi = re.search(r"\((http.*?)\)", image_col)[1]
                file_type = image_fi.split(".")[-1]
                urllib.request.urlretrieve(
                    image_fi,
                    os.path.join(output_dir, line["Node ID for semi map"])+f".{file_type}"
                )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--nodes", default=os.path.join("data", "inputs.csv"))
    parser.add_argument("--sequence", default=os.path.join("data", "sequence.csv"))
    parser.add_argument("--stages", default=os.path.join("data", "stages.csv"))
    parser.add_argument("--providers", default=os.path.join("data", "providers.csv"))
    parser.add_argument("--basic_company_info", default=os.path.join("data", "basic_company_info.csv"))
    parser.add_argument("--provision", default=os.path.join("data", "provision.csv"))
    parser.add_argument("--images", action="store_true")
    parser.add_argument("--images_file", default=os.path.join("data", "images.csv"))
    parser.add_argument("--output_dir", default=os.path.join("supply-chain", "data"))
    parser.add_argument("--output_text_dir", default=os.path.join("supply-chain", "src", "pages"))
    parser.add_argument("--output_images_dir", default=os.path.join("supply-chain", "src", "images"))
    args = parser.parse_args()

    Preprocess(args)
