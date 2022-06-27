import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import React from "react";

const stageToColor = {
  "S3": "rgba(122, 196, 165, 0.75)",
  "S1": "rgba(124, 51, 111, 0.75)",
  "S2": "rgba(229, 191, 33, 0.75)",
};

const GraphNode = (props) => {
  const {node, meta} = props;

  return (
    <Paper id={node} style={{width: "200px", padding: "5px",
      margin: "50px 20px", display: "inline-block", border: "3px solid "+stageToColor[meta["stage_id"]]}}>
      <div>
        {node}
        <Typography component={"p"} variant={"body2"}>{meta["name"]}</Typography>
        {meta["materials"].length > 0 &&
          <Typography component={"p"} variant={"body2"}>
            Materials: {meta["materials"].join(", ")}
          </Typography>}
        {meta["tools"].length > 0 &&
          <Typography component={"p"} variant={"body2"}>
            Tools: {meta["tools"].join(", ")}
          </Typography>}
      </div>
    </Paper>
  )
};

export default GraphNode;