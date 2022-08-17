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


def mk_metadata(nodes: str) -> dict:
    """
    Reads metadata from inputs sheet and instantiates a mapping between a node id and its metadata
    :param nodes: input csv
        (from https://docs.google.com/spreadsheets/d/1fqM2FIdzhrG5ZQnXUMyBfeSodJldrjY0vZeTA5TRqrg/edit#gid=0)
    :return: Dict mapping node ids to metadata
    """
    node_to_meta = {}
    with open(nodes) as f:
        for line in csv.DictReader(f):
            node_type = line["type"]
            node_id = line["input_id"]
            node_to_meta[node_id] = {
                "name": line["input_name"],
                "type": node_type,
                "stage_id": line["stage_id"]
            }
            assert node_type in EXPECTED_TYPES
            node_to_meta[node_id]["materials"] = []
            node_to_meta[node_id]["tools"] = []
    return node_to_meta


def update_variants(parent: str, child: str, record: dict, variants: dict, node_to_meta: dict) -> bool:
    """
    Checks a sequence file row for variants, which should have a non-null is_type_of_id. Also prints
    warnings if other column values are unexpected
    :param parent: Parent (input) node
    :param child: Child (target) node
    :param canonical_variant: If not null, then the canonical id for a set of variants
    :param variants: Dict mapping canonical ids to variant ids
    :param node_to_meta: Dict mapping nodes to their metadata
    :return: True if further processing of the record should be skipped
    """
    canonical_variant = record.get("is_type_of_id")
    if canonical_variant:
        if canonical_variant not in variants:
            variants[canonical_variant] = []
        variants[canonical_variant].append(parent)
        if not child:
            return True
    for node in [parent, child]:
        if not node:
            print(f"Unexpected null node in {record}")
            return True
        if node not in node_to_meta:
            print(f"Missing meta for {node} from {record}")
            return True
    return False


def write_graphs(node_to_meta: dict, sequence: str, output_dir: str) -> None:
    """
    Parses a csv that specifies node type, the edges between nodes, and node variants
    :param node_to_meta:
    :param sequence: sequence csv
        (from https://docs.google.com/spreadsheets/d/1DLfaIrmJYRy3FzculWDF2gRo74lDnf5WptnC7uIIkhE/edit#gid=0)
    :param output_dir: directory where graph metadata should be written
    :return: None (mutates node_to_meta)
    """
    graph = {}
    graph_reverse = {}
    variants = {}
    with open(sequence) as f:
        for line in csv.DictReader(f):
            parent = line["input_id"]
            child = line["goes_into_id"]
            skip = update_variants(parent, child, line, variants, node_to_meta)
            if skip:
                continue
            parent_type = node_to_meta[parent]["type"]
            child_type = node_to_meta[child]["type"]
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
                node_to_meta[child][node_type].append(parent)
    with open(os.path.join(output_dir, "graph.js"), mode="w") as f:
        f.write(f"const graph={json.dumps(graph)};\n")
        f.write(f"const graphReverse={json.dumps(graph_reverse)};\n")
        f.write(f"const nodeToMeta={json.dumps(node_to_meta)};\n")
        f.write(f"const variants={json.dumps(variants)};\n")
        f.write("\nexport {graph, graphReverse, nodeToMeta, variants};\n")


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
            print("warning: pycountry could not find " + raw_country_name)
        clean_country_name = raw_country_name
    return COUNTRY_MAPPING.get(clean_country_name, clean_country_name)


def mk_provision(provision_fi: str, output_dir: str, node_to_meta: dict, provider_to_meta: dict) -> None:
    """
    Create metadata for providers
    :param provision_fi: provision csv
        (from https://docs.google.com/spreadsheets/d/1FGib0RJ2vEFOXNZOGWNcZJZu82r330337DjKIbsz2ao/edit#gid=0)
    :param output_dir: directory where output metadata should be written
    :param node_to_meta: dict mapping nodes to their metadata
    :param provider_to_meta: dict mapping provider ids to their metadata
    :return: None
    """
    org_provision = {}
    country_provision = {}
    with open(provision_fi) as f:
        for line in csv.DictReader(f):
            assert sum([not line["share_provided"], not line["minor_share"]]) > 0
            provider_name = provider_to_meta[line["provider_id"]]["name"]
            provided = line["provided_id"]
            if provider_to_meta[line["provider_id"].strip()]["type"] == "country":
                country_name = get_country(provider_name)
                if country_name not in country_provision:
                    country_provision[country_name] = {}
                provision_share = 50 if not line["share_provided"] else int(line["share_provided"].strip("%"))
                country_provision[country_name][provided] = provision_share/100
                if (provided not in node_to_meta) or \
                        (node_to_meta[provided]["type"] not in ["tool_resource", "material_resource"]):
                    print(f"unexpected country provision: {provided} "+
                          ("" if provided not in node_to_meta else node_to_meta[provided]["type"]))
            else:
                if provider_name not in org_provision:
                    org_provision[line["provider_id"]] = {}
                org_provision[line["provider_id"]][provided] = "Major" if (not line["minor_share"].strip()) \
                                                                         else "Minor"
    with open(os.path.join(output_dir, "provision.js"), mode="w") as f:
        f.write(f"const countryProvision={json.dumps(country_provision)};\n")
        f.write(f"const orgProvision={json.dumps(org_provision)};\n")
        f.write(f"const providerMeta={json.dumps(provider_to_meta)};\n")
        f.write("\nexport {countryProvision, orgProvision, providerMeta};\n")


def write_node_descriptions(nodes_fi: str, output_dir: str) -> None:
    """
    Write out node descriptions as markdown
    :param nodes_fi: inputs csv
        (from https://docs.google.com/spreadsheets/d/1fqM2FIdzhrG5ZQnXUMyBfeSodJldrjY0vZeTA5TRqrg/edit#gid=0)
    :param output_dir: Directory where output markdown should be written
    :return: None
    """
    with open(nodes_fi) as f:
        for line in csv.DictReader(f):
            with open(os.path.join(output_dir, line["input_id"])+".mdx", mode="w") as out:
                out.write(f"#### {line['input_name']}\n\n")
                out.write(line["description"])


def mk_provider_to_meta(provider_fi: str, company_metadata_fi: str) -> dict:
    """
    Create a mapping between provider ids and their metadata, such as name, type, and url (for company providers)
    :param provider_fi: provider csv
        (from https://docs.google.com/spreadsheets/d/1QaUTc75gnwk1SwEy3vCx3J0w6oE0yCierYF2pO0Uino/edit#gid=0)
    :param company_metadata_fi: Airtable export of basic company metadata
        (from https://airtable.com/apptyAYjYFVXWONzU/tblbaY2Qa4hMpknjk/viwHEhESHcbtBk2ya?blocks=hide)
    :return: Mapping from provider ids to their metadata
    """
    provider_meta = {}
    name_to_id = {}
    with open(provider_fi) as f:
        for line in csv.DictReader(f):
            provider_meta[line["provider_id"]] = {
                "name": line["provider_name"],
                "type": line["provider_type"]
            }
            name_to_id[line["provider_name"]] = line["provider_id"]
    with open(company_metadata_fi) as f:
        for line in csv.DictReader(f):
            company_id = name_to_id.get(line["Company"])
            if not company_id:
                continue
            provider_meta[company_id]["hq"] = pycountry.countries.lookup(line["HQ country"].strip()).flag
            provider_meta[company_id]["url"] = line["Website URL"]
    return provider_meta


def mk_images(images_fi: str, output_dir: str) -> None:
    """
    Downloads images from an airtable CSV and renames them according to their associated node
    :param image_fi: Path to airtable CSV
    :param output_dir: Path to output folder where images will be placed
    :return: None
    """
    with open(images_fi) as f:
        for line in csv.DictReader(f):
            # image_col is of the format 'something.jpeg (https://link.com/to/something.jpeg)'
            image_col = line['Image']
            image_fi = re.search(r'\((http.*?)\)', image_col)[1]
            file_type = image_fi.split('.')[-1]
            urllib.request.urlretrieve(
                image_fi,
                os.path.join(output_dir, line["Node ID for semi map"])+f".{file_type}"
            )


def main(args) -> None:
    """
    Generates data for the supply chain app from exports of google sheet and airtable files
    :return: None
    """
    if not os.path.exists(args.output_dir):
        os.makedirs(args.output_dir)
    if not os.path.exists(args.output_images_dir):
        os.makedirs(args.output_images_dir)

    node_to_meta = mk_metadata(args.nodes)
    write_node_descriptions(args.nodes, args.output_text_dir)

    write_graphs(node_to_meta, args.sequence, args.output_dir)
    provider_to_meta = mk_provider_to_meta(args.providers, args.basic_company_info)
    mk_provision(args.provision, args.output_dir, node_to_meta, provider_to_meta)
    if args.images:
        mk_images(args.images_file, args.output_images_dir)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--nodes", default=os.path.join("data", "inputs.csv"))
    parser.add_argument("--sequence", default=os.path.join("data", "sequence.csv"))
    parser.add_argument("--providers", default=os.path.join("data", "providers.csv"))
    parser.add_argument("--basic_company_info", default=os.path.join("data", "basic_company_info.csv"))
    parser.add_argument("--provision", default=os.path.join("data", "provision.csv"))
    parser.add_argument("--images", action='store_true')
    parser.add_argument("--images_file", default=os.path.join("data", "images.csv"))
    parser.add_argument("--output_dir", default=os.path.join("supply-chain", "data"))
    parser.add_argument("--output_text_dir", default=os.path.join("supply-chain", "src", "pages"))
    parser.add_argument("--output_images_dir", default=os.path.join("supply-chain", "src", "images"))
    args = parser.parse_args()

    main(args)
