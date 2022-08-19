import React from "react";
import Typography from "@mui/material/Typography";

export const stageToColor = {
  "S3": "rgba(122, 196, 165, 0.75)",
  "S1": "rgba(124, 51, 111, 0.75)",
  "S2": "rgba(229, 191, 33, 0.75)",
  "": "rgba(255, 255, 255, 1)",  // white
};

const StageNode = (props) => {
  const {stage} = props;

  return (
    <div style={{
      borderLeft: `10px ${stageToColor[stage]} solid`,
      marginTop: "20px",
    }}>
      <Typography component={"p"} variant={"body2"}
        style={{
          textAlign: "left",
          paddingLeft: "5px",
      }}>
        {stage}
      </Typography>
    </div>
  )
}

export default StageNode;