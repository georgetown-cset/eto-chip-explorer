import argparse
import csv
import json
import os
import pycountry

EXPECTED_TYPES = {"material_resource", "process", "stage", "tool_resource", "ultimate_output"}
BASE_NODE_TYPES = {"process", "ultimate_output"}


def mk_data(nodes: str, sequence: str, output_dir: str) -> dict:
    node_to_meta = {}
    graph = {}
    graph_reverse = {}
    variants = {}
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
            if node_type in BASE_NODE_TYPES:
                node_to_meta[node_id]["materials"] = []
                node_to_meta[node_id]["tools"] = []
    with open(sequence) as f:
        num_process_edges = 0
        for line in csv.DictReader(f):
            parent = line["input_id"]
            child = line["goes_into_id"]
            if line.get("is_type_of_id"):
                if line["is_type_of_id"] not in variants:
                    variants[line["is_type_of_id"]] = []
                variants[line["is_type_of_id"]].append(parent)
            had_missing = False
            for node in [parent, child]:
                if node and node not in node_to_meta:
                    print("Missing meta for "+node)
                    node_to_meta[node] = {
                        "name": "???",
                        "type": "???",
                        "stage_name": "???"
                    }
                    had_missing = True
                elif not node:
                    had_missing = True
            if had_missing:
                print(f"Skipping {line}")
                continue
            parent_type = node_to_meta[parent]["type"]
            child_type = node_to_meta[child]["type"]
            if parent and child:
                if (parent_type == "process") and (child_type in BASE_NODE_TYPES):
                    num_process_edges += 1
                    if parent not in graph:
                        graph[parent] = []
                    graph[parent].append(child)
                    if child not in graph_reverse:
                        graph_reverse[child] = []
                    graph_reverse[child].append(parent)
                elif not (child_type in BASE_NODE_TYPES):
                    print(f"Unexpected lineage: {line}")
                else:
                    node_to_meta[child]["materials" if parent_type == "material_resource" else "tools"].append(parent)
        print(f"Number of process edges should be {num_process_edges}")
    with open(os.path.join(output_dir, "graph.js"), mode="w") as f:
        f.write(f"const graph={json.dumps(graph)};\n")
        f.write(f"const graphReverse={json.dumps(graph_reverse)};\n")
        f.write(f"const nodeToMeta={json.dumps(node_to_meta)};\n")
        f.write(f"const variants={json.dumps(variants)};\n")
        f.write("\nexport {graph, graphReverse, nodeToMeta, variants};\n")
    return node_to_meta


def mk_provision(provision_fi: str, output_dir: str, node_to_meta: dict, provider_to_meta: dict):
    org_provision = {}
    country_provision = {}
    with open(provision_fi) as f:
        for line in csv.DictReader(f):
            assert sum([not line["share_provided"], not line["minor_share"]]) > 0
            provider_name = provider_to_meta[line["provider_id"]]["name"]
            provided = line["provided_id"]
            if provider_to_meta[line["provider_id"].strip()]["type"] == "country":
                country = pycountry.countries.get(alpha_3=provider_name)
                country_name = None if country is None else country.name
                if country_name is None:
                    print("pycountry could not find "+provider_name)
                    country_name = provider_name
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


def mk_text(nodes_fi: str, output_dir: str):
    with open(nodes_fi) as f:
        for line in csv.DictReader(f):
           with open(os.path.join(output_dir, line["input_id"])+".mdx", mode="w") as out:
               out.write(f"#### {line['input_name']}\n\n")
               out.write(line["description"])


def mk_provider_to_meta(provider_fi: str, basic_info_fi: str):
    provider_meta = {}
    name_to_id = {}
    with open(provider_fi) as f:
        for line in csv.DictReader(f):
            provider_meta[line["provider_id"]] = {
                "name": line["provider_name"],
                "type": line["provider_type"]
            }
            name_to_id[line["provider_name"]] = line["provider_id"]
    with open(basic_info_fi) as f:
        for line in csv.DictReader(f):
            company_id = name_to_id.get(line["Company"])
            if not company_id:
                continue
            provider_meta[company_id]["hq"] = pycountry.countries.lookup(line["HQ country"].strip()).flag
            provider_meta[company_id]["url"] = line["Website URL"]
    return provider_meta


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--nodes", default=os.path.join("data", "inputs.csv"))
    parser.add_argument("--sequence", default=os.path.join("data", "sequence.csv"))
    parser.add_argument("--providers", default=os.path.join("data", "providers.csv"))
    parser.add_argument("--basic_company_info", default=os.path.join("data", "basic_company_info.csv"))
    parser.add_argument("--provision", default=os.path.join("data", "provision.csv"))
    parser.add_argument("--output_dir", default=os.path.join("supply-chain", "data"))
    parser.add_argument("--output_text_dir", default=os.path.join("supply-chain", "src", "pages"))
    args = parser.parse_args()

    if not os.path.exists(args.output_dir):
        os.makedirs(args.output_dir)

    node_to_meta = mk_data(args.nodes, args.sequence, args.output_dir)
    provider_to_meta = mk_provider_to_meta(args.providers, args.basic_company_info)
    mk_provision(args.provision, args.output_dir, node_to_meta, provider_to_meta)
    mk_text(args.nodes, args.output_text_dir)
