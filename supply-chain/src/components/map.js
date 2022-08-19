import React from "react";
import Xarrow, {Xwrapper} from "react-xarrows";

import {graph, graphReverse, nodeToMeta} from "../../data/graph";
import DocumentationNode from "./documentation_node";
import GraphNode from "./graph_node";
import StageNode, {stageToColor} from "./stage_node";

const Map = (props) => {
  const {highlights, descriptions} = props;
  // Keeps track of the selected node, which can be a process node or a process input/tool/material
  const [selectedNode, setSelectedNode] = React.useState(null);
  // Keeps track of the parent node, which must be a process node. This is used to keep track of
  // where the documentation node should be displayed.
  const [parentNode, setParentNode] = React.useState(null);

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

  const mkStage = (stage) => {
    return <div style={{borderLeft: `10px ${stageToColor[stage]} solid`}}>
      <StageNode stage={stage} setParent={setParentNode} setSelected={setSelectedNode} parent={parentNode} />
      {stage === parentNode &&
        <DocumentationNode node={selectedNode} highlights={highlights} descriptions={descriptions} setParent={setParentNode}
          setSelected={setSelectedNode} currSelectedNode={selectedNode}/>
      }
    </div>
  }

  const mkLayer = (nodes, isUnattached=false) => {
    return <div style={{borderLeft: `10px ${stageToColor[nodeToMeta[nodes[0]]?.["stage_id"]]} solid`}}>
      {nodes.map(node =>
        <GraphNode node={node} highlights={highlights} key={node} setParent={setParentNode} parent={parentNode}
                   unattached={isUnattached} setSelected={setSelectedNode} currSelectedNode={selectedNode}/>
      )}
      {nodes.includes(parentNode) &&
        <DocumentationNode node={selectedNode} highlights={highlights} descriptions={descriptions} setParent={setParentNode}
          setSelected={setSelectedNode} currSelectedNode={selectedNode}/>
      }
    </div>
  };

  const arrowShape = {svgElem: <path d="M 0.5 0.25 L 1 0.5 L 0.5 0.75 z"/>, offsetForward: 0.75}

  const mkEdges = (edges, nodeToPosition, nodeToLayerNumber) => {
    return <div>
      {edges.map(edge => {
        let fromDirection = "bottom";
        let toDirection = "top";
        let gridBreak = "50%";
        let path = "grid";
        // If arrow is going from center to edge
        if(Math.abs(nodeToPosition[edge[0]]) < Math.abs(nodeToPosition[edge[1]])){
          // Arrow will leave center on the left or right
          fromDirection = nodeToPosition[edge[0]] > 0 ? "left" : "right";
          // Arrow will bend as far as possible from center
          gridBreak = "100%";
          // Arrow should enter from top if going to a lower layer node
          toDirection = fromDirection === "right" ? "left" : "right";
          if (nodeToLayerNumber[edge[0]] > nodeToLayerNumber[edge[1]]) {
            toDirection = "top";
          } else if (nodeToLayerNumber[edge[0]] < nodeToLayerNumber[edge[1]]) {
            toDirection = "bottom";
          } else {  // Same layer connection
            path = "straight";
          }
        // If arrow is going from edge to center
        } else if(Math.abs(nodeToPosition[edge[0]]) > Math.abs(nodeToPosition[edge[1]])){
          // Arrow will meet center on the left or right
          toDirection = nodeToPosition[edge[0]] > 0 ? "right" : "left";
          // Arrow will bend as far as possible from center
          gridBreak = "0%";
          // Arrow should leave from bottom if going to a lower layer node
          fromDirection = toDirection === "right" ? "left" : "right";
          if (nodeToLayerNumber[edge[0]] > nodeToLayerNumber[edge[1]]) {
            fromDirection = "bottom";
          } else if (nodeToLayerNumber[edge[0]] < nodeToLayerNumber[edge[1]]) {
            fromDirection = "top";
          } else {  // Same layer connection
            path = "straight";
          }
        }
        return <Xarrow
          start={edge[0]}
          end={edge[1]}
          key={`${edge[0]}-to-${edge[1]}`}
          path={path}
          gridBreak={gridBreak}
          startAnchor={fromDirection}
          endAnchor={toDirection}
          strokeWidth={2}
          headSize={10}
          headShape={arrowShape}
        />
      })}
    </div>
  };

  const mkGraph = () => {
    let currNodes = [finalNode];
    const layers = [mkLayer(currNodes)];
    const seen = new Set();
    currNodes.map(n => seen.add(n));
    // To help us figure out how to draw arrows
    const nodeToPosition = {};
    let layerNumber = 0;
    const nodeToLayerNumber = {};
    let currStage = null;
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
        filtEdges.push(edge);
        if(!seen.has(parent)) {
          currNodes.push(parent);
        }
        seen.add(parent);
      }
      const orderedLayerNodes = getLayerOrder(currNodes);
      // Add a stage layer if a new stage has started
      if (orderedLayerNodes && currStage !== nodeToMeta[orderedLayerNodes[0]]?.["stage_id"]) {
        if (layerNumber !== 0) {
          const stage = mkStage(currStage);
          layers.push(stage);
        }
        currStage = nodeToMeta[orderedLayerNodes[0]]?.["stage_id"];
      }
      // Add nodes for the current layer
      const layer = mkLayer(orderedLayerNodes);
      layers.push(layer);
      // Add edges for the current layer
      const centerPoint = orderedLayerNodes.length/2 - 0.5;
      orderedLayerNodes.forEach((node, idx) => {
        nodeToPosition[node] = idx - centerPoint;
        nodeToLayerNumber[node] = layerNumber;
      });
      const edges = mkEdges(filtEdges, nodeToPosition, nodeToLayerNumber);
      layers.push(edges);
      layerNumber += 1;
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
        <Xwrapper>
          <div>{mkStage(nodeToMeta[unattached[0]]["stage_id"])}</div>
          <div>{mkLayer(unattached, true)}</div>
          <div>{layers}</div>
        </Xwrapper>
      </div>
    );
  };

  return mkGraph();
};

export default Map;
