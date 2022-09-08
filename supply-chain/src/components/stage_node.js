import React from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import InfoIcon from '@mui/icons-material/Info';
import {nodeToMeta} from "../../data/graph";

const StageNode = (props) => {
  const {stage, stageClassName, parent, updateSelected} = props;

  return (
    <div>
      <div className="stage-border uncolored" style={{height: "20px"}}></div>
      <div id={stage}
        className={stageClassName}
        style={{
          paddingTop: "10px",
          textAlign: "left",
      }}>
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
            verticalAlign: "top",
            display: "inline-block",
            padding: "0px",
            backgroundColor: "unset",
          }}
          onClick={(evt) => updateSelected(evt, stage === parent ? null : stage, stage === parent ? null : stage)}
          disableRipple={true}
        >
          <InfoIcon style={{verticalAlign: "top"}} />
        </Button>
        {stage === parent &&
          <ArrowDropDownIcon
            style={{
              display: "block",
              marginTop: "-17px",
              fontSize: "40px",
            }}
          />
        }
      </div>
    </div>
  )
}

export default StageNode;
