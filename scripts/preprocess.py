import argparse
import csv
import json
import os

EXPECTED_TYPES = {"material_resource", "process", "stage", "tool_resource", "ultimate_output"}
BASE_NODE_TYPES = {"process", "ultimate_output"}

def mk_data(nodes: str, sequence: str, output_dir: str) -> None:
    node_to_meta = {}
    graph = {}
    graph_reverse = {}
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
        for line in csv.DictReader(f):
            parent = line["input_id"]
            child = line["goes_into_id"]
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
    with open(os.path.join(output_dir, "graph.js"), mode="w") as f:
        f.write(f"const graph={json.dumps(graph)};\n")
        f.write(f"const graphReverse={json.dumps(graph_reverse)};\n")
        f.write(f"const nodeToMeta={json.dumps(node_to_meta)};\n")
        f.write("\nexport {graph, graphReverse, nodeToMeta};\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--nodes", default=os.path.join("data", "inputs.csv"))
    parser.add_argument("--sequence", default=os.path.join("data", "sequence.csv"))
    parser.add_argument("--output_dir", default=os.path.join("supply-chain", "data"))
    args = parser.parse_args()

    if not os.path.exists(args.output_dir):
        os.makedirs(args.output_dir)

    mk_data(args.nodes, args.sequence, args.output_dir)
