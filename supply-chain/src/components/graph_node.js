import React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import StarIcon from '@mui/icons-material/Star';
import {graph, graphReverse, nodeToMeta} from "../../data/graph";

import getIcon from "../helpers/shared";

export const NodeHeading = (props) => {
  const {nodeType, nodeId, currSelectedNode, name, depth=0} = props;
  const icon = getIcon(nodeType, {fontSize: "20px"}, nodeId === currSelectedNode);
  return (
    <Typography component="p"
      className={
        "node-heading" +
        ((nodeId === currSelectedNode) ? " selected-documentation-link" : "")
      }
    >
      <span style={{marginLeft: 10*depth+"px"}} className="graph-node-icon">{icon}</span>
      <span>{name}</span>
    </Typography>
  )
}

export const getBackgroundGradient = (highlight, highlights) => {
  let backgroundGradient = "gradient-100";
  if (highlights && highlights.type === "gradient") {
    if (highlight <= 20) {backgroundGradient = "gradient-20"}
    else if (highlight <= 40) {backgroundGradient = "gradient-40"}
    else if (highlight <= 60) {backgroundGradient = "gradient-60"}
    else if (highlight <= 80) {backgroundGradient = "gradient-80"}
    else {backgroundGradient = "gradient-100"};
  }
  return backgroundGradient;
}

export const SubNode = (props) => {
  const {nodeType, name, parent, highlight, highlights, nodeId, updateSelected, currSelectedNode, depth=0} = props;
  const subMaterials = nodeToMeta?.[nodeId]?.["materials"];
  const subTools = nodeToMeta?.[nodeId]?.["tools"];

  return (
    <div>
      <Paper elevation={0}
             className={"graph-sub-node" + (highlight !== 0 ? " highlighted " + getBackgroundGradient(highlight, highlights) : "")}
             onClick={(evt) => updateSelected(evt, nodeId, parent)}>
        <NodeHeading nodeType={nodeType} nodeId={nodeId} currSelectedNode={currSelectedNode} name={name} depth={depth} />
      </Paper>
      <Typography component={"div"} variant={"body2"}>
        {(subMaterials !== undefined) && (subMaterials.length > 0) && subMaterials.sort(
          (a, b) => ('' + nodeToMeta[a]["name"]).localeCompare(nodeToMeta[b]["name"])
        ).map((material) =>
          <SubNode nodeType={"materials"}
                  name={nodeToMeta[material]["name"]}
                  key={nodeToMeta[material]["name"]}
                  nodeId={material}
                  metadata={nodeToMeta}
                  highlight={material in highlights ? highlights[material] : 0}
                  updateSelected={(evt) => updateSelected(evt, material, parent)}
                  depth={1}
                  currSelectedNode={currSelectedNode}
                  />)}
        {(subTools !== undefined) && (subTools.length > 0) && subTools.sort(
          (a, b) => ('' + nodeToMeta[a]["name"]).localeCompare(nodeToMeta[b]["name"])
        ).map((tool) =>
          <SubNode nodeType={"tools"}
                  name={nodeToMeta[tool]["name"]}
                  key={nodeToMeta[tool]["name"]}
                  nodeId={tool}
                  metadata={nodeToMeta}
                  highlight={tool in highlights ? highlights[tool] : 0}
                  updateSelected={(evt) => updateSelected(evt, tool, parent)}
                  depth={1}
                  currSelectedNode={currSelectedNode}
                  />)}
        {props.children}
      </Typography>
    </div>
  );
};

const GraphNode = (props) => {
  const {node, highlights = {}, currSelectedNode, parent, updateSelected, wide=false, content=null, inDocumentation=false} = props;
  const meta = node in nodeToMeta ? nodeToMeta[node] : {};
  const showInputs = (("materials" in meta) && (meta["materials"].length > 0)) ||
    (("tools" in meta) && (meta["tools"].length > 0));

  return (
    <div className="graph-node-wrapper">
      <Paper id={node} className={"graph-node" + (node in highlights ? " highlighted " + getBackgroundGradient(highlights[node], highlights) : "")}
        style={{
          margin: wide ? "" : "20px 25px",
          marginBottom: node === currSelectedNode ? "0px" : (wide ? "" : "20px"),
          display: "inline-block",
          width: wide ? "": "320px",
        }}
        onClick={(evt) => updateSelected(evt, node, inDocumentation ? parent : node)}
        elevation={0}
      >
        <div style={{textAlign: "left"}}>
          {content !== null && content}
          {content === null &&
            <Typography component="h3">
              {meta["name"]}
            </Typography>
          }
          {!inDocumentation &&
            <div className="graph-node-connections-text">
              {graphReverse[node] &&
                <div className="connection-text">
                  <span className="bold">
                    Input processes:
                  </span>
                  <span>
                    {graphReverse[node].map((n) => nodeToMeta[n].name).join(", ")}
                  </span>
                </div>
              }
              {graph[node] &&
                <div className="connection-text">
                  <span className="bold">
                    Dependent processes:
                  </span>
                  <span>
                    {graph[node].map((n) => nodeToMeta[n].name).join(", ")}
                  </span>
                </div>
              }
            </div>
          }
          {!(inDocumentation && node === parent) && showInputs &&
            <Typography component={"div"} variant={"body2"} style={{paddingRight: "10px"}}>
              {("materials" in meta ) && (meta["materials"].length > 0) && meta["materials"].sort(
                (a, b) => ('' + nodeToMeta[a]["name"]).localeCompare(nodeToMeta[b]["name"])
              ).map((material) =>
                <SubNode nodeType={"materials"}
                        name={nodeToMeta[material]["name"]}
                        key={nodeToMeta[material]["name"]}
                        nodeId={material}
                        metadata={nodeToMeta}
                        highlight={material in highlights ? highlights[material] : 0}
                        updateSelected={updateSelected}
                        parent={inDocumentation ? parent : node}
                        highlights={highlights}
                        depth={inDocumentation ? 2 : 0}
                        currSelectedNode={currSelectedNode}
                />)}
              {("tools" in meta) && (meta["tools"].length > 0) && meta["tools"].sort(
                (a, b) => ('' + nodeToMeta[a]["name"]).localeCompare(nodeToMeta[b]["name"])
              ).map((tool) =>
                <SubNode nodeType={"tools"}
                        name={nodeToMeta[tool]["name"]}
                        key={nodeToMeta[tool]["name"]}
                        nodeId={tool}
                        metadata={nodeToMeta}
                        highlight={tool in highlights ? highlights[tool] : 0}
                        updateSelected={updateSelected}
                        parent={inDocumentation ? parent : node}
                        highlights={highlights}
                        depth={inDocumentation ? 2 : 0}
                        currSelectedNode={currSelectedNode}
                />)}
            </Typography>}
        </div>
      </Paper>
      {!inDocumentation && node === parent &&
        <ArrowDropDownIcon
          style={{
            display: "block",
            marginTop: node === currSelectedNode ? "-17px" : "-37px",
            marginLeft: "auto",
            marginRight: "auto",
            fontSize: "40px",
            zIndex: "5",
          }}
        />
      }
    </div>
  )
};

export const MiniGraphNode = (props) => {
  const {node, currSelectedNode, parent, standalone=false} = props;
  const meta = node in nodeToMeta ? nodeToMeta[node] : {};

  return (
    <div id={`${node}-minimap` + (standalone ? "-standalone" : "") } className={`graph-node ${node === parent ? "minimap-dark" : "minimap-light"}`}
      style={{
        margin: "5px",
        display: "inline-block",
        height: "10px",
        width: "20px",
        verticalAlign: "middle"
      }}
    >
      {(meta["materials"]?.includes(currSelectedNode) || meta["tools"]?.includes(currSelectedNode) || (node === parent && node !== currSelectedNode)) &&
        <span className="star-icon">
          <StarIcon
            style={{
              display: "inline-block",
              fontSize: "10px",
              verticalAlign: "top"
            }}
          />
        </span>
      }
    </div>
  )
};

export default GraphNode;
