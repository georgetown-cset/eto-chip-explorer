import React from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ConstructionIcon from "@mui/icons-material/Construction";
import InputIcon from "@mui/icons-material/Input";

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
  const {nodeType, name, highlight, nodeId, updateSelected} = props;
  const [elevation, setElevation] = React.useState(1);
  const iconStyle = {fontSize: "20px"};
  const icon = nodeType === "tools" ? <ConstructionIcon style={iconStyle}/> : <InputIcon style={iconStyle}/>;

  return (
    <Paper style={{width: "20px", height: "20px", display: "inline-block", padding: "3px", margin: "5px",
            textAlign: "center", backgroundColor: "rgba(229,191,33,"+highlight+")"}}
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
  const {node, nodeToMeta, highlights, setSelected=null} = props;
  const [elevation, setElevation] = React.useState(1);
  const meta = nodeToMeta[node];

  const updateSelected = (evt, selectedNode) => {
    if(setSelected !== null) {
      evt.stopPropagation();
      setSelected(selectedNode);
    }
  };

  return (
    <Paper id={node} className={"graph-node"} style={{padding: "5px",
      margin: "20px 25px", display: "inline-block",
      border: "3px solid "+stageToColor[meta["stage_id"]]}} onClick={(evt) => updateSelected(evt, node)} elevation={elevation}
      onMouseEnter={()=>setElevation(7)} onMouseLeave={()=>setElevation(1)}>
      <div style={{textAlign: "left"}}>
        <Typography component={"div"} variant={"body2"} style={{textAlign: "center", marginBottom: "5px"}}>
          {node}: {meta["name"]}
        </Typography>
        {((meta["materials"].length > 0) || (meta["tools"].length > 0)) &&
          <Typography component={"p"} variant={"body2"}>
            {meta["materials"].length > 0 && meta["materials"].map((material) =>
              <SubNode nodeType={"materials"} name={nodeToMeta[material]["name"]}
                       highlight={material in highlights ? highlights[material] : 0}
                       updateSelected={(evt) => updateSelected(evt, material)}/>)}
            {meta["tools"].length > 0 && <span style={{marginRight: "10px"}}>{meta["tools"].map((tool) =>
              <SubNode nodeType={"tools"} name={nodeToMeta[tool]["name"]}
                       highlight={tool in highlights ? highlights[tool] : 0}
                       updateSelected={(evt) => updateSelected(evt, tool)}/>)}</span>}
          </Typography>}
      </div>
    </Paper>
  )
};

export default GraphNode;
