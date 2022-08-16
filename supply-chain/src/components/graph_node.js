import React from "react";
import {useXarrow} from "react-xarrows";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {nodeToMeta} from "../../data/graph";

import getIcon from "../helpers/shared";

const stageToColor = {
  "S3": "rgba(122, 196, 165, 0.75)",
  "S1": "rgba(124, 51, 111, 0.75)",
  "S2": "rgba(229, 191, 33, 0.75)",
};

// from https://mui.com/material-ui/react-tooltip/#customization

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: 'rgb(240,240,240)',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
  [`a`] : {
    textDecoration: "none"
  }
}));

const SubNode = (props) => {
  const {nodeType, name, highlight, nodeId, updateSelected, borderStyle} = props;
  const [elevation, setElevation] = React.useState(1);
  const icon = getIcon(nodeType, {fontSize: "20px"});

  return (
    <Paper style={{width: "20px", height: "20px", display: "inline-block", padding: "3px", margin: "5px",
            textAlign: "center", backgroundColor: "rgba(229,191,33,"+highlight+")", border: borderStyle}}
           onMouseEnter={()=>setElevation(7)} onMouseLeave={()=>setElevation(1)} elevation={elevation}
           onClick={updateSelected}>
      <HtmlTooltip title={
        <div style={{padding: "5px"}}>
          <Typography component={"div"} variant={"body2"}>{name}</Typography>
        </div>
      }>
        {icon}
      </HtmlTooltip>
    </Paper>
  );
};

const GraphNode = (props) => {
  const {node, highlights = {}, currSelectedNode, setSelected=null, wide=false, content=null} = props;
  const [elevation, setElevation] = React.useState(1);
  const meta = node in nodeToMeta ? nodeToMeta[node] : {};
  const header = content === null ? node+": "+meta["name"] : content;
  const showInputs = (("materials" in meta) && (meta["materials"].length > 0)) ||
    (("tools" in meta) && (meta["tools"].length > 0));

  const updateXarrow = useXarrow();
  const updateSelected = (evt, selectedNode) => {
    if(setSelected !== null) {
      evt.stopPropagation();
      setSelected(selectedNode);
    }
    updateXarrow();
  };

  const getBorderStyle = (currNode, isParent=false) => {
    if(currNode === currSelectedNode){
      return "3px solid red";
    }
    if(isParent && (meta["stage_id"] in stageToColor)){
      return "3px solid "+stageToColor[meta["stage_id"]];
    }
    return "0px";
  }

  return (
    <div style={{display: "inline-block", position: "relative"}}>
      <Paper id={node} className={"graph-node"} style={{padding: "5px",
        margin: wide ? "5px 0px" : "20px 25px",
        marginBottom: node === currSelectedNode ? "0px" : (wide ? "5px" : "20px"),
        display: "inline-block",
        backgroundColor: node in highlights ? "rgba(229,191,33,"+highlights[node]+")": "white",
        border: getBorderStyle(node, true), width: wide ? "100%": "150px"}} onClick={(evt) => updateSelected(evt, node)} elevation={elevation}
        onMouseEnter={()=>setElevation(7)} onMouseLeave={()=>setElevation(1)}>
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
                        highlight={material in highlights ? highlights[material] : 0}
                        updateSelected={(evt) => updateSelected(evt, material)}
                        borderStyle={getBorderStyle(material)}/>)}
              {("tools" in meta) && (meta["tools"].length > 0) && <span style={{marginRight: "10px"}}>{meta["tools"].map((tool) =>
                <SubNode nodeType={"tools"}
                        name={nodeToMeta[tool]["name"]}
                        key={nodeToMeta[tool]["name"]}
                        highlight={tool in highlights ? highlights[tool] : 0}
                        updateSelected={(evt) => updateSelected(evt, tool)}
                        borderStyle={getBorderStyle(tool)}/>)}</span>}
            </Typography>}
        </div>
      </Paper>
      {node === currSelectedNode &&
        <ArrowDropDownIcon
          style={{
            display: "block",
            marginTop: "-17px",
            marginLeft: "auto",
            marginRight: "auto",
            fontSize: "40px",
          }}
        />
      }
    </div>
  )
};

export default GraphNode;
