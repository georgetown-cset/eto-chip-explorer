import React from "react";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

import "core-js/features/url";
import "core-js/features/url-search-params";
import Arrow, { DIRECTION, HEAD } from "react-arrows";


const Dashboard = () => {
  const finalNode = "E";
  const graphReverse = {
    "B": ["A"],
    "C": ["A"],
    "D": ["B"],
    "E": ["C", "D"]
  };
  const graph = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": ["E"],
    "D": ["E"]
  };

  const mkLayer = (edges) => {
    return <div>
      {edges.map(edge => {
        return <Paper id={edge} style={{width: "200px", margin: "20px", display: "inline-block"}}>{edge}</Paper>
      })}
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
        if(allSiblingsSeen){
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
