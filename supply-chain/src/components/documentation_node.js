import React from "react";
import {useXarrow} from "react-xarrows";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import {nodeToMeta} from "../../data/graph";

const stageToColor = {
  "S3": "rgba(122, 196, 165, 0.75)",
  "S1": "rgba(124, 51, 111, 0.75)",
  "S2": "rgba(229, 191, 33, 0.75)",
};


const DocumentationNode = (props) => {
  const {node, highlights = {}, currSelectedNode, setSelected=null, wide=false, content=null} = props;
  const meta = node in nodeToMeta ? nodeToMeta[node] : {};

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

  if (node === currSelectedNode) {
    return (
      <Paper id={`${node}-documentation`}
        style={{
            padding: "5px",
            display: "inline-block",
            backgroundColor: "lightgray",
            border: getBorderStyle(node, true),
            marginTop: "-15px", marginBottom: "20px",
            position: "relative",
      }}>
        <Button style={{verticalAlign: "top", float: "right"}} onClick={(evt) => updateSelected(evt, null)}><HighlightOffIcon/></Button>
        <Typography component={"p"} variant={"body2"}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
            et dolore magna aliqua. In fermentum posuere urna nec tincidunt praesent semper feugiat nibh. Phasellus
            vestibulum lorem sed risus. Molestie ac feugiat sed lectus. Pulvinar sapien et ligula ullamcorper
            malesuada proin. Cursus in hac habitasse platea dictumst. Nunc id cursus metus aliquam eleifend mi.
            Purus in massa tempor nec feugiat. Morbi blandit cursus risus at ultrices. Nisl rhoncus mattis
            rhoncus urna neque viverra justo nec ultrices. Purus sit amet luctus venenatis lectus. Et ligula
            ullamcorper malesuada proin libero nunc. At risus viverra adipiscing at in tellus.
        </Typography>
      </Paper>
    )
  }

};

export default DocumentationNode;
