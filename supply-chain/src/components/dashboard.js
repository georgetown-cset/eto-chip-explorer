import React from "react";
import Arrow, { DIRECTION, HEAD } from "react-arrows";

import GraphNode from "./graph_node";

import {graph, graphReverse, nodeToMeta} from "../../data/graph";


const Dashboard = () => {
  const finalNode = Object.keys(nodeToMeta).filter(k => nodeToMeta[k]["type"] === "ultimate_output")[0];

  const mkLayer = (nodes) => {
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
    const reorderedNodes = nodesPrefix.concat(nodesSuffix);
    
    return <div>
      {reorderedNodes.map(node =>
        <GraphNode node={node} meta={nodeToMeta[node]}/>
      )}
    </div>
  };

  const mkEdges = (edges) => {
    return <div>
      {edges.map(edge => {
        return <Arrow
          className={"arrow"}
          from={{
            direction: DIRECTION.BOTTOM,
            node: () => document.getElementById(edge[0]),
            translation: [0, 0]
          }}
          to={{
            direction: DIRECTION.TOP,
            node: () => document.getElementById(edge[1]),
            translation: [0, 0]
          }}
          head={HEAD.NORMAL}/>
      })}
    </div>
  };

  const mkGraph = () => {
    let currNodes = [finalNode];
    const layers = [mkLayer(currNodes)];
    const seen = new Set();
    currNodes.map(n => seen.add(n));
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
      const layer = mkLayer(currNodes);
      layers.push(layer);
      currNodes = currNodes.concat(bump);
      const edges = mkEdges(filtEdges);
      layers.push(edges);
    }
    layers.reverse();
    return <div>{layers}</div>;
  };

  return (
    <div style={{textAlign: "center"}}>
      {mkGraph()}
    </div>
  )
};

export default Dashboard;
