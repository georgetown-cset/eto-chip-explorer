import React from "react";
import {useXarrow} from "react-xarrows";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {nodeToMeta} from "../../data/graph";
import {stageToColor} from "./stage_node";

import getIcon from "../helpers/shared";

const SubNode = (props) => {
  const {nodeType, name, parent, highlight, highlights, nodeId, updateSelected, borderStyle, getBorderStyle, depth=0} = props;
  const [elevation, setElevation] = React.useState(1);
  const icon = getIcon(nodeType, {fontSize: "20px"});
  const subMaterials = nodeToMeta?.[nodeId]?.["materials"];
  const subTools = nodeToMeta?.[nodeId]?.["tools"];

  return (
    <div>
      <Paper style={{backgroundColor: "rgba(229,191,33,"+highlight+")", border: borderStyle, marginLeft: 10*depth+"px"}}
             onMouseEnter={()=>setElevation(7)} onMouseLeave={()=>setElevation(1)} elevation={elevation}
             onClick={(evt) => updateSelected(evt, nodeId, parent)}>
        {icon} {name}
      </Paper>
      <Typography component={"div"} variant={"body2"}>
        {(subMaterials !== undefined) && (subMaterials.length > 0) && subMaterials.map((material) =>
          <SubNode nodeType={"materials"}
                  name={nodeToMeta[material]["name"]}
                  key={nodeToMeta[material]["name"]}
                  metadata={nodeToMeta}
                  highlight={material in highlights ? highlights[material] : 0}
                  updateSelected={(evt) => updateSelected(evt, material, parent)}
                  borderStyle={getBorderStyle(material)}
                  depth={1}
                  />)}
        {(subTools !== undefined) && (subTools.length > 0) && <span style={{marginRight: "10px"}}>{subTools.map((tool) =>
          <SubNode nodeType={"tools"}
                  name={nodeToMeta[tool]["name"]}
                  key={nodeToMeta[tool]["name"]}
                  metadata={nodeToMeta}
                  highlight={tool in highlights ? highlights[tool] : 0}
                  updateSelected={(evt) => updateSelected(evt, tool, parent)}
                  borderStyle={getBorderStyle(tool)}
                  depth={1}
                  />)}</span>}
      </Typography>
    </div>
  );
};

const GraphNode = (props) => {
  const {node, highlights = {}, currSelectedNode, parent, updateSelected, wide=false, content=null, inDocumentation=false} = props;
  const [elevation, setElevation] = React.useState(1);
  const meta = node in nodeToMeta ? nodeToMeta[node] : {};
  const header = content === null ? node+": "+meta["name"] : content;
  const showInputs = (("materials" in meta) && (meta["materials"].length > 0)) ||
    (("tools" in meta) && (meta["tools"].length > 0));

  const getBorderStyle = (currNode, isParent=false) => {
    if(currNode === currSelectedNode){
      return "3px solid red";
    }
    if(isParent && (meta["stage_id"] in stageToColor)){
      return "3px solid "+stageToColor[meta["stage_id"]];
    }
    return "0px";
  };

  return (
    <div style={{display: "inline-block", position: "relative"}}>
      <Paper id={node} className={"graph-node"}
        style={{
          padding: "5px",
          margin: wide ? "5px 0px" : "20px 25px",
          marginBottom: node === currSelectedNode ? "0px" : (wide ? "5px" : "20px"),
          display: "inline-block",
          backgroundColor: node in highlights ? "rgba(229,191,33,"+highlights[node]+")": "white",
          border: getBorderStyle(node, true),
          width: wide ? "100%": "250px"
        }}
        onClick={(evt) => updateSelected(evt, node, inDocumentation ? parent : node)} elevation={elevation}
        onMouseEnter={()=>setElevation(7)} onMouseLeave={()=>setElevation(1)}
      >
        <div style={{textAlign: "left"}}>
          <Typography component={"div"} variant={"body2"} style={{textAlign: "center", marginBottom: "5px"}}>
            {header}
          </Typography>
          {showInputs &&
            <Typography component={"div"} variant={"body2"}>
              {("materials" in meta ) && (meta["materials"].length > 0) && meta["materials"].map((material) =>
                <SubNode nodeType={"materials"}
                        name={nodeToMeta[material]["name"]}
                        key={nodeToMeta[material]["name"]}
                        nodeId={material}
                        metadata={nodeToMeta}
                        highlight={material in highlights ? highlights[material] : 0}
                        updateSelected={updateSelected}
                        borderStyle={getBorderStyle(material)}
                        parent={node}
                        highlights={highlights}
                        getBorderStyle={getBorderStyle}
                />)}
              {("tools" in meta) && (meta["tools"].length > 0) && <span style={{marginRight: "10px"}}>{meta["tools"].map((tool) =>
                <SubNode nodeType={"tools"}
                        name={nodeToMeta[tool]["name"]}
                        key={nodeToMeta[tool]["name"]}
                        nodeId={tool}
                        metadata={nodeToMeta}
                        highlight={tool in highlights ? highlights[tool] : 0}
                        updateSelected={updateSelected}
                        borderStyle={getBorderStyle(tool)}
                        parent={node}
                        highlights={highlights}
                        getBorderStyle={getBorderStyle}
                />)}</span>}
            </Typography>}
        </div>
      </Paper>
      {node === parent &&
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
    <div id={`${node}-minimap`} className={"graph-node"}
      style={{
        margin: "5px",
        display: "inline-block",
        height: "10px",
        width: "20px",
        backgroundColor: node === parent ? "darkblue" : "lightblue"
      }}
    >
    </div>
  )
};

export default GraphNode;
