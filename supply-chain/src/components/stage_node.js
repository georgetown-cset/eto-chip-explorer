import React from "react";
import {useXarrow} from "react-xarrows";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import InfoIcon from '@mui/icons-material/Info';


export const stageToColor = {
  "S3": "rgba(122, 196, 165, 0.75)",
  "S1": "rgba(124, 51, 111, 0.75)",
  "S2": "rgba(229, 191, 33, 0.75)",
  "": "rgba(255, 255, 255, 1)",  // white
};

const StageNode = (props) => {
  const {stage, parent, setSelected, setParent} = props;

  const updateXarrow = useXarrow();
  const updateSelected = (evt, selectedNode, parentNode) => {
    if(setSelected !== null) {
      evt.stopPropagation();
      setSelected(selectedNode);
    }
    if(setParent !== null) {
      setParent(parentNode);
    }
    updateXarrow();
  };

  return (
    <div style={{
      marginTop: "20px",
      textAlign: "left",
    }}>
      <Typography component={"p"} variant={"body2"}
        style={{
          textAlign: "left",
          paddingLeft: "5px",
          display: "inline-block",
      }}>
        {stage}
      </Typography>
      <Button style={{verticalAlign: "top", display: "inline-block"}} onClick={(evt) => updateSelected(evt, stage, stage)}>
        <InfoIcon style={{verticalAlign: "top"}} />
        Documentation
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
  )
}

export default StageNode;