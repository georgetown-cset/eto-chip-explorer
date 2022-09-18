import React from "react";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton'
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CancelIcon from '@mui/icons-material/Cancel';
import DownloadIcon from '@mui/icons-material/Download';
import {UserFeedback} from "@eto/eto-ui-components";
import { nodeToMeta, variants } from "../../data/graph";
import { countryProvision, orgProvision, providerMeta } from "../../data/provision";
import ProcessDetail from "./process_detail";
import InputDetail from "./input_detail";
import GraphNode, { NodeHeading, SubNode } from "./graph_node";

// List of all subvariants a parent variant has
const getAllSubVariantsList = () => {
  let subVariantsList = {...variants};
  for (const nodeWithVariants in subVariantsList) {
    // Deep copy
    subVariantsList[nodeWithVariants] = [...subVariantsList[nodeWithVariants]];
    for (const nodeVariant of subVariantsList[nodeWithVariants]) {
      if (nodeVariant in subVariantsList) {
        subVariantsList[nodeWithVariants].push(...subVariantsList[nodeVariant]);
      }
    }
  }
  return subVariantsList;
};
const allSubVariantsList = getAllSubVariantsList();

// Recursive component to construct variants tree
export const VariantsList = (props) => {
  const {node, currSelectedNode, inputType, updateSelected, parent, depth, parentSelected=false} = props;
  const thisNodeParentSelected = parentSelected || (node === currSelectedNode);
  return (
    <div>
      {variants[node] && (currSelectedNode === node || allSubVariantsList[node].includes(currSelectedNode)) &&
        <div>
          <Typography className={"variants-heading" + (thisNodeParentSelected ? " selected-node-child" : "")}
            component={"p"} style={{paddingLeft: depth > 2 ? `${depth*10}px`: null}}>Variants</Typography>
          {variants[node].sort(
            (a, b) => ('' + nodeToMeta[a]["name"]).localeCompare(nodeToMeta[b]["name"])
          ).map((variant) =>
            <SubNode nodeType={inputType}
              name={nodeToMeta[variant]["name"]}
              key={nodeToMeta[variant]["name"]}
              nodeId={variant}
              metadata={nodeToMeta}
              highlight={0}
              updateSelected={updateSelected}
              parent={parent}
              depth={depth}
              currSelectedNode={currSelectedNode}
              inDocumentation={true}
              parentSelected={thisNodeParentSelected}
            >
              <VariantsList node={variant} currSelectedNode={currSelectedNode} inputType={inputType} updateSelected={updateSelected}
                parent={parent} depth={depth+2} parentSelected={thisNodeParentSelected} />
            </SubNode>
          )}
        </div>
      }
    </div>
  )
}

const DocumentationNode = (props) => {
  const {node, parent, descriptions, images, pdfs, isStage, currSelectedNode, updateSelected, minimap=null, standalone=false} = props;
  const meta = node in nodeToMeta ? nodeToMeta[node] : {};

  const getNodeToCountryProvision = () => {
    const nodeToCountryProvision = {};
    for(let country in countryProvision){
      for(let node in countryProvision[country]){
        if(!(node in nodeToCountryProvision)){
          nodeToCountryProvision[node] = []
        }
        nodeToCountryProvision[node].push({
          country: country,
          value: countryProvision[country][node]
        })
      }
    }
    return nodeToCountryProvision;
  };

  const getNodeVariantsToProvision = (provisionDict, key=undefined) => {
    const variantsToProvision = {};
    if (!allSubVariantsList[currSelectedNode]) {
      return variantsToProvision;
    }
    for (const variant of allSubVariantsList[currSelectedNode]) {
      if (!(variant in provisionDict)) {
        continue;
      }
      const provisionList = key ? provisionDict[variant] : Object.keys(provisionDict[variant]);
      for (const provisionName of provisionList) {
        const provisionKey = key ? provisionName[key] : provisionName;
        if (!(provisionKey in variantsToProvision)) {
          variantsToProvision[provisionKey] = []
        }
        variantsToProvision[provisionKey].push(variant);
      }
    }
    return variantsToProvision;
  }

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

  const getInputList = (input_type) => {
    return (
      <div style={{textAlign: "left"}}>
        {nodeToMeta[parent][input_type].sort(
          (a, b) => ('' + nodeToMeta[a]["name"]).localeCompare(nodeToMeta[b]["name"])
        ).map((node) =>
          <div key={parent+input_type+node}>
            <GraphNode node={node} currSelectedNode={currSelectedNode} parent={parent} inDocumentation={true}
                updateSelected={updateSelected} nodeToMeta={nodeToMeta} wide={true} key={node}
                content={<NodeHeading nodeType={input_type} nodeId={node} currSelectedNode={currSelectedNode}
                name={nodeToMeta[node]["name"]} parentSelected={node === currSelectedNode} />}/>
            <VariantsList node={node} currSelectedNode={currSelectedNode} inputType={input_type} updateSelected={updateSelected} parent={parent} depth={2} />
          </div>
        )}
      </div>
    )
  };

  const nodeToCountryProvision = getNodeToCountryProvision();
  const nodeToOrgProvision = getNodeToOrgProvision();
  const nodeVariantsToCountryProvision = getNodeVariantsToProvision(nodeToCountryProvision, "country");
  const nodeVariantsToOrgProvision = getNodeVariantsToProvision(nodeToOrgProvision);

  const hasMaterials = nodeToMeta[parent]?.materials?.length > 0;
  const hasTools = nodeToMeta[parent]?.tools?.length > 0;

  const imgFileName = images?.filter(i => i.name === node)[0] ? images.filter(i => i.name === node)[0]?.publicURL : images.filter(i => i.name === "default")[0]?.publicURL;

  // For image modal
  const [open, setOpen] = React.useState(false);

  if (node === currSelectedNode) {
    return (
      <Paper id={`${node}-documentation`}
        className="documentation-node"
        elevation={0}
        style={{
            marginTop: (parent === null || isStage) ? "0px" : "-15px", marginBottom: isStage? "0px": "20px",
            position: "relative",
      }}>
        {(currSelectedNode !== null) && !isStage && minimap &&
          <div className="minimap">
            {minimap}
          </div>
        }
        {
          !isStage &&
          <div className="documentation-node-navigation">
            {!(hasMaterials || hasTools) ?
              <div className="graph-node standalone-pane-heading" style={{textAlign: "left"}}>
                <Typography component={"p"}>
                  {meta["name"]}
                </Typography>
              </div> :
              <div style={{textAlign: "left"}}>
                <GraphNode node={parent} parent={parent} inDocumentation={true} wide={true}
                  updateSelected={updateSelected} currSelectedNode={currSelectedNode}
                  content={<NodeHeading nodeType="parent" nodeId={parent} currSelectedNode={currSelectedNode} name={nodeToMeta[parent]["name"]} />} />
              </div>
            }
            {hasMaterials && getInputList("materials")}
            {hasTools && getInputList("tools")}
          </div>
        }
        <div className="documentation-node-description">
          {imgFileName !== undefined &&
            <div className="image-wrapper">
              <img src={imgFileName}
                onClick={() => setOpen(true)}
                onKeyDown={(evt) => {
                  if (evt.key === "Enter") {setOpen(true)};
                }}
                role="presentation"
                tabIndex={0}
                alt={meta.image_caption ? meta.image_caption : "Default"}
                style={{
                  transform: meta.image_offset ? `translateY(-${meta.image_offset}%)` : null
                }}
              />
              <IconButton className="icon-wrapper" disableRipple={true} style={{verticalAlign: "top", float: "right"}}
                onClick={standalone ? () => updateSelected(false) : (evt) => updateSelected(evt, null, null)}>
                <span className="icon"><CancelIcon/></span>
              </IconButton>
            </div>
          }
          {imgFileName !== undefined && meta.image_license &&
            <div className="caption" dangerouslySetInnerHTML={{__html: meta.image_license}}/>
          }
          {(currSelectedNode !== null) && (
            (nodeToMeta[currSelectedNode]?.["type"] !== "process") ?
              <InputDetail selectedNode={currSelectedNode} descriptions={descriptions}
                        updateSelected={updateSelected} parent={parent}
                        countries={nodeToCountryProvision?.[currSelectedNode]}
                        orgs={nodeToOrgProvision[currSelectedNode]} orgMeta={providerMeta}
                        variantCountries={nodeVariantsToCountryProvision}
                        variantOrgs={nodeVariantsToOrgProvision} /> :
              <ProcessDetail selectedNode={currSelectedNode} descriptions={descriptions}
                        orgs={nodeToOrgProvision[currSelectedNode]} orgMeta={providerMeta} />
          )}
          <div className="lower-icons-wrapper">
            <a href={pdfs.filter(i => i.name === node)[0].publicURL} download>
              <DownloadIcon />
            </a>
            <UserFeedback context={nodeToMeta[currSelectedNode]["name"]}
                          mkFormSubmitLink={(context, feedback) => `https://docs.google.com/forms/d/e/1FAIpQLSeaAgmf2g6O80ebW_fsRAa6Ma0CxnRwxgEr480aIg5Xz96FJg/formResponse?usp=pp_url&entry.1524532195=${feedback}&entry.135985468=${context}&submit=Submit`}/>
          </div>
        </div>

        <Modal
          open={open}
          onClose={() => setOpen(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: "white",
            border: '2px solid #fff',
            boxShadow: 24,
            p: 4,
          }}>
            {imgFileName !== undefined &&
              <img src={imgFileName} alt={node}
                style={{maxWidth: "600px", maxHeight: "80vh", height: "auto"}}
              />
            }
            {imgFileName !== undefined && meta.image_caption &&
              <div>
                <div className="caption" dangerouslySetInnerHTML={{__html: meta.image_caption}}/>
                <div className="caption" dangerouslySetInnerHTML={{__html: meta.image_license}}/>
              </div>
            }
          </Box>
        </Modal>
      </Paper>
    )
  }

};

export default DocumentationNode;
