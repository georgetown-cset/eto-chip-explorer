import React from "react";
import Arrow, { DIRECTION } from "react-arrows";

import {graph, graphReverse, nodeToMeta} from "../../data/graph";
import GraphNode from "./graph_node";

const Map = (props) => {
  const {highlights, selectedNode, setSelectedNode} = props;
  const finalNode = Object.keys(nodeToMeta).filter(k => nodeToMeta[k]["type"] === "ultimate_output")[0];

  const getLayerOrder = (nodes) => {
    nodes.sort((e1, e2) => (e1 in graph ? graph[e1].length : 0) > (e2 in graph ? graph[e2].length : 0));
    // Now that we have sorted the nodes by number of outgoing edges, we want to put the nodes with the fewest
    // edges in the middle of the node list
    const nodesPrefix = [];
    const nodesSuffix = [];
    for(let idx = 0; idx < nodes.length; idx ++){
      if(idx % 2 === 0){
        nodesSuffix.push(nodes[idx])
      } else {
        nodesPrefix.push(nodes[idx])
      }
    }
    nodesPrefix.reverse();
    return nodesPrefix.concat(nodesSuffix);
  };

  const mkLayer = (nodes, isUnattached=false) => {
    return <div>
      {nodes.map(node =>
        <GraphNode node={node} nodeToMeta={nodeToMeta} highlight={node in highlights ? highlights[node]: 0}
                   unattached={isUnattached} setSelected={setSelectedNode}/>
      )}
    </div>
  };

  const mkEdges = (edges, nodeToPosition) => {
    return <div>
      {edges.map(edge => {
        let fromDirection = DIRECTION.BOTTOM;
        let toDirection = DIRECTION.TOP;
        if(nodeToPosition[edge[0]] > 0){
          fromDirection = DIRECTION.LEFT;
          toDirection = DIRECTION.RIGHT;
        } else if(nodeToPosition[edge[0]] < 0){
          fromDirection = DIRECTION.RIGHT;
          toDirection = DIRECTION.LEFT;
        }
        return <Arrow
          className={"arrow"}
          from={{
            direction: fromDirection,
            node: () => document.getElementById(edge[0]),
            translation: [0, 0]
          }}
          to={{
            direction: toDirection,
            node: () => document.getElementById(edge[1]),
            translation: [0, 0]
          }}
          />
      })}
    </div>
  };

  const mkGraph = () => {
    let currNodes = [finalNode];
    const layers = [mkLayer(currNodes)];
    const seen = new Set();
    currNodes.map(n => seen.add(n));
    const nodeToPosition = {};
    while(currNodes.length > 0){
      const edgePairs = [];
      for(let node of currNodes){
        if(node in graphReverse){
          for(let parentNode of graphReverse[node]){
            edgePairs.push([parentNode, node])
          }
        }
      }
      const newNodes = edgePairs.map(e => e[0]);
      const filtEdges = [];
      currNodes = [];
      const bump = [];
      for(let edge of edgePairs){
        let siblings = [];
        const parent = edge[0];
        const child = edge[1];
        if(parent in graphReverse) {
          for (let grandParent of graphReverse[parent]) {
            siblings = siblings.concat(graph[grandParent]);
          }
        }
        let allSiblingsSeen = true;
        for(let sib of siblings){
          allSiblingsSeen &= (newNodes.includes(sib) || seen.has(sib));
        }
        if(true){
          filtEdges.push(edge);
          if(!seen.has(parent)) {
            currNodes.push(parent);
          }
          seen.add(parent);
        } else{
          bump.push(child);
        }
      }
      const orderedLayerNodes = getLayerOrder(currNodes);
      const centerPoint = orderedLayerNodes.length/2 - 0.5;
      orderedLayerNodes.forEach((node, idx) => {
        nodeToPosition[node] = idx - centerPoint;
      });
      const layer = mkLayer(orderedLayerNodes);
      layers.push(layer);
      currNodes = currNodes.concat(bump);
      const edges = mkEdges(filtEdges, nodeToPosition);
      layers.push(edges);
    }
    layers.reverse();
    const unattached = [];
    for(let node in nodeToMeta){
      if((! seen.has(node)) && (nodeToMeta[node]["type"] === "process")){
        unattached.push(node)
      }
    }
    return (
      <div>
        <div>{mkLayer(unattached, true)}</div>
        <div>{layers}</div>
      </div>
    );
  };

  return mkGraph();
};

export default Map;
