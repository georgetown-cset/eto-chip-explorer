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
          head={HEAD.THIN}/>
      })}
    </div>
  };

  const mkGraph = () => {
    let currNodes = [finalNode];
    const layers = [];
    const seen = new Set();
    while(currNodes.length > 0){
      const layer = mkLayer(currNodes);
      layers.push(layer);
      const newNodes = [];
      const edgePairs = [];
      for(let node of currNodes){
        if(node in graphReverse){
          for(let childNode of graphReverse[node]){
            if(!seen.has(childNode)){
              seen.add(childNode);
              newNodes.push(childNode);
            }
            edgePairs.push([childNode, node])
          }
        }
      }
      const edges = mkEdges(edgePairs);
      layers.push(edges);
      currNodes = newNodes;
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
