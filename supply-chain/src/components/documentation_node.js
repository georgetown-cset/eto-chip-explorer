import React from "react";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton'
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CancelIcon from '@mui/icons-material/Cancel';
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
const VariantsList = (props) => {
  const {node, currSelectedNode, input_type, updateSelected, parent, depth} = props;
  return (
    <div>
      {variants[node] && (currSelectedNode === node || allSubVariantsList[node].includes(currSelectedNode)) &&
        <div>
          <Typography className="variants-heading" component={"p"} style={{marginLeft: depth > 2 ? `${depth*10}px`: null}}>Variants</Typography>
          {variants[node].sort(
            (a, b) => ('' + nodeToMeta[a]["name"]).localeCompare(nodeToMeta[b]["name"])
          ).map((variant) =>
            <SubNode nodeType={input_type}
              name={nodeToMeta[variant]["name"]}
              key={nodeToMeta[variant]["name"]}
              nodeId={variant}
              metadata={nodeToMeta}
              highlight={0}
              updateSelected={updateSelected}
              parent={parent}
              depth={depth}
              currSelectedNode={currSelectedNode}
            >
              <VariantsList node={variant} currSelectedNode={currSelectedNode} input_type={input_type} updateSelected={updateSelected} parent={parent} depth={depth+2} />
            </SubNode>
          )}
        </div>
      }
    </div>
  )
}

const DocumentationNode = (props) => {
  const {node, parent, descriptions, images, isStage, currSelectedNode, updateSelected, minimap, standalone=false} = props;
  const meta = node in nodeToMeta ? nodeToMeta[node] : {};

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

  const getInputList = (input_type) => {
    return (
      <div style={{textAlign: "left"}}>
        {nodeToMeta[parent][input_type].sort(
          (a, b) => ('' + nodeToMeta[a]["name"]).localeCompare(nodeToMeta[b]["name"])
        ).map((node) =>
          <div key={parent+input_type+node}>
            <GraphNode node={node} currSelectedNode={currSelectedNode} parent={parent} inDocumentation={true}
                updateSelected={updateSelected} nodeToMeta={nodeToMeta} wide={true} key={node}
                content={<NodeHeading nodeType={input_type} nodeId={node} currSelectedNode={currSelectedNode} name={nodeToMeta[node]["name"]} />}/>
            <VariantsList node={node} currSelectedNode={currSelectedNode} input_type={input_type} updateSelected={updateSelected} parent={parent} depth={2} />
          </div>
        )}
      </div>
    )
  };

  const nodeToCountryProvision = getNodeToCountryProvision();
  const nodeToOrgProvision = getNodeToOrgProvision();

  const hasMaterials = nodeToMeta[parent]?.materials?.length > 0;
  const hasTools = nodeToMeta[parent]?.tools?.length > 0;

  const imgFileName = images?.filter(i => i.name === node)[0] ? images.filter(i => i.name === node)[0] : images.filter(i => i.name === "default")[0];

  // For image modal
  const [open, setOpen] = React.useState(false);

  if (node === currSelectedNode) {
    return (
      <Paper id={`${node}-documentation`}
        className="documentation-node"
        elevation={0}
        style={{
            marginTop: (parent === null) ? "1px" : "-15px", marginBottom: "20px", marginLeft: "10px",
            position: "relative",
      }}>
        {(currSelectedNode !== null) && !isStage &&
          <div>
            {minimap}
          </div>
        }
        {
          !isStage &&
          <div style={{width: "20%"}}>
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
              <img src={imgFileName.publicURL}
                onClick={() => setOpen(true)}
                onKeyDown={(evt) => {
                  if (evt.key === "Enter") {setOpen(true)};
                }}
                role="presentation"
                tabIndex={0}
                alt={meta.image_caption ? meta.image_caption : "Default"}
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
                        countries={nodeToCountryProvision?.[currSelectedNode]?.["countries"]}
                        countryValues={nodeToCountryProvision?.[currSelectedNode]?.["values"]}
                        orgs={nodeToOrgProvision[currSelectedNode]} orgMeta={providerMeta} /> :
              <ProcessDetail selectedNode={currSelectedNode} descriptions={descriptions}/>
          )}
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
              <img src={imgFileName.publicURL} alt={node}
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
