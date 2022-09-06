import React, {useEffect} from "react";
import Xarrow, {Xwrapper, useXarrow} from "react-xarrows";
import { useStaticQuery, graphql } from "gatsby"

import {graph, graphReverse, nodeToMeta} from "../../data/graph";
import DocumentationNode from "./documentation_node";
import GraphNode, {MiniGraphNode, getBackgroundGradient} from "./graph_node";
import StageNode from "./stage_node";

const Map = (props) => {
  const {highlights, filterValues, defaultFilterValues, documentationPanelToggle, setDocumentationPanelToggle} = props;
  // Keeps track of the selected node, which can be a process node or a process input/tool/material
  const [selectedNode, setSelectedNode] = React.useState(null);
  // Keeps track of the parent node, which must be a process node. This is used to keep track of
  // where the documentation node should be displayed.
  const [parentNode, setParentNode] = React.useState(null);
  // Function to update the above nodes
  const updateXarrow = useXarrow();
  const updateSelected = (evt, selectedNode, parentNode) => {
    evt.stopPropagation();
    setSelectedNode(selectedNode);
    setParentNode(parentNode);
    updateXarrow();
    // Put filter values in URL parameters.
    const urlParams = new URLSearchParams(window.location.search);
    const filterKeys = ["parentNode", "selectedNode"];
    for (const filterKey of filterKeys) {
      const filterVal = (filterKey === "parentNode") ? parentNode : selectedNode;
      if (filterVal) {
        urlParams.set(filterKey, filterVal);
      } else {
        urlParams.delete(filterKey);
      }
    }
    window.history.replaceState(null, null, window.location.pathname + "?" + urlParams.toString());
  };

  // Sets the state of the app based on the queries in the URL.
  // This will only run once, when the component is initially rendered.
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paramsParentNode = urlParams.get("parentNode");
    const paramsSelectedNode = urlParams.get("selectedNode");
    setParentNode(paramsParentNode);
    setSelectedNode(paramsSelectedNode);
    updateXarrow();
    // Scroll the open documentation into view
    if (paramsParentNode) {
      const parentElem = document.getElementById(paramsParentNode);
      parentElem.scrollIntoView({behavior: "smooth", block: "start"});
    }
  }, [])

  const finalNode = Object.keys(nodeToMeta).filter(k => nodeToMeta[k]["type"] === "ultimate_output")[0];

  const minimapLayers = [];
  const standaloneMinimapLayers = [];
  const data = useStaticQuery(graphql`
  query getData {
      allFile(filter: {sourceInstanceName: {eq: "images"}}) {
        nodes {
          id
          name
          publicURL
        }
      },
      allMdx {
        nodes {
          body,
          slug
        }
      }
    }
  `);

  const descriptions= data.allMdx.nodes;
  const images = data.allFile.nodes;

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
    return <div key={stage} className={"stage-border" + (stage in highlights ? " highlighted " + getBackgroundGradient(highlights[stage], highlights) : "")}>
      <StageNode stage={stage} updateSelected={updateSelected} parent={parentNode} />
      {stage === parentNode &&
        <DocumentationNode node={selectedNode} parent={parentNode}
          descriptions={descriptions} images={images} isStage={true}
          updateSelected={updateSelected} currSelectedNode={selectedNode}/>
      }
    </div>
  }

  const mkLayer = (nodes, isUnattached=false, minimap=false, standalone=false) => {
    if (minimap) {
      return <div key={JSON.stringify(nodes)}>
        {nodes.map(node =>
          <MiniGraphNode node={node} key={node} parent={standalone ? null : parentNode} standalone={standalone}
            currSelectedNode={standalone ? filterValues["input-resource"] : selectedNode}/>
        )}
      </div>
    }
    else {
      // Making an assumption that the first node in the list has a stage provided
      const stage = nodeToMeta[nodes[0]]?.["stage_id"];
      let stageClassName = "stage-border";
      if (!stage) {stageClassName += " uncolored"};
      if (stage in highlights) {stageClassName += " highlighted " + getBackgroundGradient(highlights[stage], highlights)};
      return <div className={stageClassName} key={JSON.stringify(nodes)}>
        {nodes.map(node =>
          <GraphNode node={node} highlights={highlights} key={node} parent={parentNode}
                    unattached={isUnattached} updateSelected={updateSelected} currSelectedNode={selectedNode}/>
        )}
        {nodes.includes(parentNode) &&
          <DocumentationNode node={selectedNode} parent={parentNode}
            descriptions={descriptions} images={images} isStage={false}
            updateSelected={updateSelected} currSelectedNode={selectedNode} minimap={minimapLayers} />
        }
      </div>
    }
  };

  const arrowShape = {svgElem: <path d="M 0.5 0.25 L 1 0.5 L 0.5 0.75 z"/>, offsetForward: 0.75}

  const mkEdges = (edges, nodeToPosition, nodeToLayerNumber, minimap=false, standalone=false) => {
    return <div className="graph-arrows-wrapper" key={JSON.stringify(edges)}>
      {edges.map(edge => {
        let startEdge = edge[0] + (minimap ? ("-minimap" + (standalone ? "-standalone" : "")) : "");
        let endEdge = edge[1] + (minimap ? ("-minimap" + (standalone ? "-standalone" : "")) : "");
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
          start={startEdge}
          end={endEdge}
          key={`${startEdge}-to-${endEdge}`}
          path={path}
          gridBreak={gridBreak}
          startAnchor={fromDirection}
          endAnchor={toDirection}
          strokeWidth={minimap ? 0.6 : 2}
          headSize={10}
          headShape={arrowShape}
          color={minimap ? "rgb(0, 0, 0)" : "rgb(76, 152, 255)"} // color is --bright-blue or --black
        />
      })}
    </div>
  };

  const mkGraph = () => {
    let currNodes = [finalNode];
    const layers = [mkLayer(currNodes)];
    minimapLayers.push(mkLayer(currNodes, false, true));
    standaloneMinimapLayers.push(mkLayer(currNodes, false, true, true));
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
      const filtEdges = [];
      currNodes = [];
      for(let edge of edgePairs){
        let siblings = [];
        const parent = edge[0];
        if(parent in graphReverse) {
          for (let grandParent of graphReverse[parent]) {
            siblings = siblings.concat(graph[grandParent]);
          }
        }
        filtEdges.push(edge);
        if(!seen.has(parent)) {
          // Nodes N59 and N60 get special handling.
          // By default, these nodes would appear near the bottom of stage 2.
          // However, because they are a parent to almost every node in stage 2,
          // it makes more sense if they appear near the top (especially in mobile
          // view where arrows cannot provide guidance to the user).
          // Therefore, this algorithm skips placing these two nodes in the map
          // until we reach the top of stage 2 (node N35), although we still
          // need to assign them a position and layer number to make the arrows
          // behave correctly.
          if (((parent === "N59") || (parent === "N60")) && (!seen.has("N35"))) {
            nodeToPosition["N59"] = -1;
            nodeToLayerNumber["N59"] = layerNumber;
            nodeToPosition["N60"] = 1;
            nodeToLayerNumber["N60"] = layerNumber;
            continue;
          }
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
      const minimapLayer = mkLayer(orderedLayerNodes, false, true);
      minimapLayers.push(minimapLayer);
      const standaloneMinimapLayer = mkLayer(orderedLayerNodes, false, true, true);
      standaloneMinimapLayers.push(standaloneMinimapLayer);
      // Add edges for the current layer
      const centerPoint = orderedLayerNodes.length/2 - 0.5;
      orderedLayerNodes.forEach((node, idx) => {
        nodeToPosition[node] = idx - centerPoint;
        nodeToLayerNumber[node] = layerNumber;
      });
      const edges = mkEdges(filtEdges, nodeToPosition, nodeToLayerNumber);
      layers.push(edges);
      const minimapEdges = mkEdges(filtEdges, nodeToPosition, nodeToLayerNumber, true);
      minimapLayers.push(minimapEdges);
      const standaloneMinimapEdges = mkEdges(filtEdges, nodeToPosition, nodeToLayerNumber, true, true);
      standaloneMinimapLayers.push(standaloneMinimapEdges);
      layerNumber += 1;
    }
    layers.reverse();
    minimapLayers.reverse();
    standaloneMinimapLayers.reverse();
    const unattached = [];
    for(let node in nodeToMeta){
      if((! seen.has(node)) && (nodeToMeta[node]["type"] === "process")){
        unattached.push(node)
      }
    }
    minimapLayers.unshift(mkLayer(unattached, true, true));
    standaloneMinimapLayers.unshift(mkLayer(unattached, true, true, true));
    return (
      <div>
        {filterValues["input-resource"] !== defaultFilterValues["input-resource"] && documentationPanelToggle &&
          <DocumentationNode node={filterValues["input-resource"]} parent={null}
            descriptions={descriptions} images={images} isStage={false} standalone={true}
            updateSelected={setDocumentationPanelToggle} currSelectedNode={filterValues["input-resource"]}
            minimap={standaloneMinimapLayers} />
        }
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
