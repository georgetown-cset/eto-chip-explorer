import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import React from "react";

const stageToColor = {
  "S3": "rgba(122, 196, 165, 0.75)",
  "S1": "rgba(124, 51, 111, 0.75)",
  "S2": "rgba(229, 191, 33, 0.75)",
};

const GraphNode = (props) => {
  const {node, meta, highlight, unattached} = props;

  return (
    <Paper id={node} style={{width: "200px", padding: "5px",
      margin: "50px 50px", display: "inline-block", border: "3px solid "+stageToColor[meta["stage_id"]],
      backgroundColor: "rgba(229,191,33,"+highlight+")"}}>
      <div>
        {node}
        <Typography component={"p"} variant={"body2"}>{meta["name"]}</Typography>
        {meta["materials"].length > 0 &&
          <Typography component={"p"} variant={"body2"}>
            Materials: {meta["materials"].map((material) => <Link href={"/details/"+material.toLowerCase()} style={{paddingLeft: "5px"}}>{material}</Link>)}
          </Typography>}
        {meta["tools"].length > 0 &&
          <Typography component={"p"} variant={"body2"}>
            Tools: {meta["tools"].map((tool) => <Link href={"/details/"+tool.toLowerCase()} style={{paddingLeft: "5px"}}>{tool}</Link>)}
          </Typography>}
      </div>
    </Paper>
  )
};

export default GraphNode;