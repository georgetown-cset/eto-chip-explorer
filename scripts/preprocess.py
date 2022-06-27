import argparse
import csv
import json
import os


def mk_data(nodes: str, sequence: str, output_dir: str) -> None:
    node_to_meta = {}
    graph = {}
    graph_reverse = {}
    with open(nodes) as f:
        for line in csv.DictReader(f):
            node_to_meta[line["input_id"]] = {
                "name": line["input_name"],
                "type": line["type"],
                "stage_name": line["stage_name"]
            }
    with open(sequence) as f:
        for line in csv.DictReader(f):
            parent = line["input_id"]
            child = line["goes_into_id"]
            for node in [parent, child]:
                if node and node not in node_to_meta:
                    print("Missing meta for "+node)
                    node_to_meta[node] = {
                        "name": "???",
                        "type": "???",
                        "stage_name": "???"
                    }
            if parent and child:
                if parent not in graph:
                    graph[parent] = []
                graph[parent].append(child)
                if child not in graph_reverse:
                    graph_reverse[child] = []
                graph_reverse[child].append(parent)
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
