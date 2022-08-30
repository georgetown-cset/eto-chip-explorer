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
  const {stage, parent, updateSelected} = props;

  return (
    <div style={{
      marginTop: "20px",
      textAlign: "left",
    }}>
      <Typography component={"h3"}
        style={{
          textAlign: "left",
          paddingLeft: "5px",
          display: "inline-block",
      }}>
        {stage}
      </Typography>
      <Button
        style={{
          verticalAlign: "top",
          display: "inline-block",
          padding: "0px",
          backgroundColor: "unset",
        }}
        onClick={(evt) => updateSelected(evt, stage, stage)}
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
  )
}

export default StageNode;