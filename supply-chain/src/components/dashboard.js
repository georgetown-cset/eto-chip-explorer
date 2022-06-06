import React from "react";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

import "core-js/features/url";
import "core-js/features/url-search-params";


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

  const mkGraph = () => {
    let currNodes = [finalNode];
    const layers = [];
    const seen = new Set();
    while(currNodes.length > 0){
      const layer = mkLayer(currNodes);
      layers.push(layer);
      const newNodes = [];
      for(let node of currNodes){
        if(node in graphReverse){
          for(let childNode of graphReverse[node]){
            if(!seen.has(childNode)){
              seen.add(childNode);
              newNodes.push(childNode);
            }
          }
        }
      }
      currNodes = newNodes;
    }
    return <div>{layers}</div>;
  };
  return (
    <div style={{textAlign: "center"}}>
      {mkGraph()}
    </div>
  )
};

export default Dashboard;
