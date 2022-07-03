import React from "react";
import {graphql} from "gatsby";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import ConstructionIcon from "@mui/icons-material/Construction";
import InputIcon from "@mui/icons-material/Input";
import {MDXRenderer} from "gatsby-plugin-mdx";
import {MDXProvider} from "@mdx-js/react";

const stageToColor = {
  "S3": "rgba(122, 196, 165, 0.75)",
  "S1": "rgba(124, 51, 111, 0.75)",
  "S2": "rgba(229, 191, 33, 0.75)",
};

const GraphNode = (props) => {
  const {node, meta, highlight, unattached, description, setSelected=null} = props;

  const updateSelected = (evt) => {
    if(setSelected !== null) {
      evt.stopPropagation();
      setSelected(node);
    }
  };

  return (
    <Paper id={node} className={"graph-node"} style={{padding: "5px",
      margin: "20px 25px", display: "inline-block",
      border: "3px solid "+stageToColor[meta["stage_id"]],
      backgroundColor: "rgba(229,191,33,"+highlight+")"}} onClick={updateSelected}>
      <div>
        <Typography component={"div"} variant={"body2"}>{node}: {meta["name"]}</Typography>
        {((meta["materials"].length > 0) || (meta["tools"].length > 0)) &&
          <Typography component={"p"} variant={"body2"}>
            {meta["materials"].length > 0 && <span style={{marginRight: "10px"}}>{meta["materials"].map((material) =>
              <Link href={"/details/" + material.toLowerCase()} style={{paddingLeft: "5px"}} key={material.toLowerCase()}>
                <InputIcon style={{fontSize: "90%"}}/>
              </Link>)}
              </span>}
            <span>{meta["tools"].map((tool) =>
              <Link href={"/details/" + tool.toLowerCase()} style={{paddingLeft: "5px"}} key={tool.toLowerCase()}>
                <ConstructionIcon style={{fontSize: "90%"}}/>
              </Link>)}
              </span>
          </Typography>}
      </div>
    </Paper>
  )
};

export default GraphNode;
