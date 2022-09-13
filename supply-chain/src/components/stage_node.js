import React from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import InfoIcon from '@mui/icons-material/Info';
import {nodeToMeta} from "../../data/graph";

const StageNode = (props) => {
  const {stage, stageClassName, parent, updateSelected} = props;

  return (
    <div className="stage-node-wrapper">
      <div className="uncolored" style={{height: "20px"}}></div>
      <div id={stage} className={"stage-node " + stageClassName}
        onClick={(evt) => updateSelected(evt, stage === parent ? null : stage, stage === parent ? null : stage)}
        style={{
          textAlign: "left",
        }}
      >
        <Typography component={"h3"}
          style={{
            textAlign: "left",
            paddingLeft: "5px",
            display: "inline-block",
        }}>
          {nodeToMeta[stage]["name"]}
        </Typography>
        <Button
          style={{
            display: "inline-block",
            padding: "0px",
            backgroundColor: "unset",
          }}
          disableRipple={true}
        >
          <InfoIcon style={{verticalAlign: "top"}} /> General overview
        </Button>
      </div>
    </div>
  )
}

export default StageNode;
