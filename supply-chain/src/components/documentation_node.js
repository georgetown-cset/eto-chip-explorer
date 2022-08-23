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
import { stageToColor } from "./stage_node";
import getIcon from "../helpers/shared";
import GraphNode from "./graph_node";

const DocumentationNode = (props) => {
  const {node, highlights = {}, parent, descriptions, images, isStage, currSelectedNode, updateSelected, minimap} = props;
  const meta = node in nodeToMeta ? nodeToMeta[node] : {};

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

  const hasMaterials = nodeToMeta[parent]?.materials?.length > 0;
  const hasTools = nodeToMeta[parent]?.tools?.length > 0;
  const iconStyle= {verticalAlign: "middle", margin: "2px 5px"};

  if (node === currSelectedNode) {
    return (
      <Paper id={`${node}-documentation`}
        style={{
            padding: "5px",
            display: "inline-block",
            backgroundColor: "whitesmoke",
            border: getBorderStyle(node, true),
            marginTop: "-15px", marginBottom: "20px", marginLeft: "10px",
            position: "relative",
      }}>
        <Button style={{verticalAlign: "top", float: "right"}} onClick={(evt) => updateSelected(evt, null, null)}><HighlightOffIcon/></Button>
        {(currSelectedNode !== null) && !isStage &&
          <div style={{float: "left"}}>
            {minimap}
          </div>
        }
        <div style={{width: "10%", display: "inline-block"}}>
          {(hasMaterials || hasTools) &&
            <div>
              <GraphNode node={parent} highlights={highlights} parent={parent} inDocumentation={true} wide={true}
                updateSelected={updateSelected} currSelectedNode={currSelectedNode} />
            </div>
          }
          {hasMaterials &&
            <div>
              {nodeToMeta[parent]["materials"].map((node) =>
                <GraphNode node={node} highlights={highlights} currSelectedNode={currSelectedNode} parent={parent} inDocumentation={true}
                    updateSelected={updateSelected} nodeToMeta={nodeToMeta} wide={true} key={node}
                    content={<p style={{textAlign: "left"}}>{getIcon("materials", iconStyle)}{nodeToMeta[node]["name"]}</p>}/>
              )}
            </div>
          }
          {hasTools &&
            <div>
              {nodeToMeta[parent]["tools"].map((node) =>
                <GraphNode node={node} highlights={highlights} currSelectedNode={currSelectedNode} parent={parent} inDocumentation={true}
                    updateSelected={updateSelected} nodeToMeta={nodeToMeta} wide={true} key={node}
                    content={<p style={{textAlign: "left"}}>{getIcon("tools", iconStyle)}{nodeToMeta[node]["name"]}</p>}/>
              )}
            </div>
          }
        </div>
        <div style={{width: "70%", display: "inline-block"}}>
          {images !== undefined && <img src={images.filter(i => i.name === node)[0]?.publicURL} style={{maxWidth: "300px", height: "auto"}} />}
          {(currSelectedNode !== null) && (nodeToMeta[currSelectedNode]?.["type"] === "process") &&
            <ProcessDetail selectedNode={currSelectedNode} parent={parent} descriptions={descriptions}
                        updateSelected={updateSelected} highlights={highlights}/>
          }
          {(currSelectedNode !== null) && (nodeToMeta[currSelectedNode]?.["type"] !== "process") &&
            <InputDetail selectedNode={currSelectedNode} parent={parent} descriptions={descriptions}
                        countries={nodeToCountryProvision?.[currSelectedNode]?.["countries"]}
                        countryValues={nodeToCountryProvision?.[currSelectedNode]?.["values"]}
                        orgs={nodeToOrgProvision[currSelectedNode]} orgMeta={providerMeta} variants={variants[currSelectedNode]}
                        updateSelected={updateSelected} variantOf={variantsOf[currSelectedNode]}/>
          }
        </div>
      </Paper>
    )
  }

};

export default DocumentationNode;
