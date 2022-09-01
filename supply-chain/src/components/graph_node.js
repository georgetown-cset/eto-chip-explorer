import React from "react";
import {useXarrow} from "react-xarrows";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import StarIcon from '@mui/icons-material/Star';
import {nodeToMeta} from "../../data/graph";

import getIcon from "../helpers/shared";

export const NodeHeading = (props) => {
  const {nodeType, nodeId, currSelectedNode, name} = props;
  const icon = getIcon(nodeType, {fontSize: "20px"}, nodeId === currSelectedNode);
  return (
    <Typography component="p" className={"node-heading" + ((nodeId === currSelectedNode) ? " selected-documentation-link" : "")}>
      <span className="graph-node-icon">{icon}</span>
      <span>{name}</span>
    </Typography>
  )
}

export const SubNode = (props) => {
  const {nodeType, name, parent, highlight, highlights, nodeId, updateSelected, currSelectedNode, depth=0} = props;
  const subMaterials = nodeToMeta?.[nodeId]?.["materials"];
  const subTools = nodeToMeta?.[nodeId]?.["tools"];

  return (
    <div>
      <Paper style={{backgroundColor: highlight !== 0 ? "rgba(229,191,33,"+highlight+")" : null, marginLeft: 10*depth+"px"}}
             elevation={0}
             className="graph-sub-node"
             onClick={(evt) => updateSelected(evt, nodeId, parent)}>
        <NodeHeading nodeType={nodeType} nodeId={nodeId} currSelectedNode={currSelectedNode} name={name} />
      </Paper>
      <Typography component={"div"} variant={"body2"}>
        {(subMaterials !== undefined) && (subMaterials.length > 0) && subMaterials.map((material) =>
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
        {(subTools !== undefined) && (subTools.length > 0) && subTools.map((tool) =>
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
    <div style={{display: "inline-block", position: "relative"}}>
      <Paper id={node} className={"graph-node"}
        style={{
          margin: wide ? "" : "20px 25px",
          marginBottom: node === currSelectedNode ? "0px" : (wide ? "" : "20px"),
          display: "inline-block",
          backgroundColor: node in highlights ? "rgba(229,191,33,"+highlights[node]+")": null,
          width: wide ? "": "250px"
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
          {!(inDocumentation && node === parent) && showInputs &&
            <Typography component={"div"} variant={"body2"}>
              {("materials" in meta ) && (meta["materials"].length > 0) && meta["materials"].map((material) =>
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
              {("tools" in meta) && (meta["tools"].length > 0) && meta["tools"].map((tool) =>
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
          }}
        />
      }
    </div>
  )
};

export const MiniGraphNode = (props) => {
  const {node, currSelectedNode, parent} = props;
  const meta = node in nodeToMeta ? nodeToMeta[node] : {};

  return (
    <div id={`${node}-minimap`} className={`graph-node ${node === parent ? "minimap-dark" : "minimap-light"}`}
      style={{
        margin: "5px",
        display: "inline-block",
        height: "10px",
        width: "20px",
      }}
    >
      {(meta["materials"]?.includes(currSelectedNode) || meta["tools"]?.includes(currSelectedNode) || (node === parent && node !== currSelectedNode)) &&
        <span class="star-icon">
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
