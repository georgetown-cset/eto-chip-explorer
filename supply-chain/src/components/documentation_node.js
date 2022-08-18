import React from "react";
import {useXarrow} from "react-xarrows";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { nodeToMeta, variants } from "../../data/graph";
import { countryProvision, orgProvision, providerMeta } from "../../data/provision";
import ProcessDetail from "./process_detail";
import InputDetail from "./input_detail";

const stageToColor = {
  "S3": "rgba(122, 196, 165, 0.75)",
  "S1": "rgba(124, 51, 111, 0.75)",
  "S2": "rgba(229, 191, 33, 0.75)",
};


const DocumentationNode = (props) => {
  const {node, highlights = {}, descriptions, currSelectedNode, setSelected=null, setParent=null, wide=false, content=null} = props;
  const meta = node in nodeToMeta ? nodeToMeta[node] : {};

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

  const getBorderStyle = (currNode, isParent=false) => {
    if(currNode === currSelectedNode){
      return "3px solid red";
    }
    if(isParent && (meta["stage_id"] in stageToColor)){
      return "3px solid "+stageToColor[meta["stage_id"]];
    }
    return "0px";
  };

  const getNodeToCountryProvision = () => {
    const nodeToCountryProvision = {};
    for(let country in countryProvision){
      for(let node in countryProvision[country]){
        if(!(node in nodeToCountryProvision)){
          nodeToCountryProvision[node] = {"countries": [], "values": []}
        }
        nodeToCountryProvision[node]["countries"].push(country);
        nodeToCountryProvision[node]["values"].push(countryProvision[country][node]);
      }
    }
    return nodeToCountryProvision;
  };

  const getNodeToOrgProvision = () => {
    const nodeToOrgProvision = {};
    for(let org in orgProvision){
      for(let node in orgProvision[org]){
        if(!(node in nodeToOrgProvision)){
          nodeToOrgProvision[node] = {}
        }
        nodeToOrgProvision[node][org] = orgProvision[org][node]
      }
    }
    return nodeToOrgProvision;
  };

  const getVariantsOf = () => {
    const variantsOf = {};
    for(let node in variants){
      for(let v of variants[node]){
        variantsOf[v] = node;
      }
    }
    return variantsOf;
  };

  const nodeToCountryProvision = getNodeToCountryProvision();
  const nodeToOrgProvision = getNodeToOrgProvision();
  const variantsOf = getVariantsOf();

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
        <Button style={{verticalAlign: "top", float: "right"}} onClick={(evt) => updateSelected(evt, null, null)}><HighlightOffIcon/></Button>
        {(currSelectedNode !== null) && (nodeToMeta[currSelectedNode]["type"] === "process") &&
          <ProcessDetail selectedNode={currSelectedNode} descriptions={descriptions}
                        setSelectedNode={setSelected} highlights={highlights}/>
        }
        {(currSelectedNode !== null) && (nodeToMeta[currSelectedNode]["type"] !== "process") &&
          <InputDetail selectedNode={currSelectedNode} descriptions={descriptions}
                      countries={nodeToCountryProvision?.[currSelectedNode]?.["countries"]}
                      countryValues={nodeToCountryProvision?.[currSelectedNode]?.["values"]}
                      orgs={nodeToOrgProvision[currSelectedNode]} orgMeta={providerMeta} variants={variants[currSelectedNode]}
                      setSelectedNode={setSelected} variantOf={variantsOf[currSelectedNode]}/>
        }
      </Paper>
    )
  }

};

export default DocumentationNode;
