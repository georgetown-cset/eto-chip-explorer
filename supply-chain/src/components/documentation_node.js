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
import getIcon from "../helpers/shared";
import GraphNode from "./graph_node";

const DocumentationNode = (props) => {
  const {node, highlights = {}, parent, descriptions, images, isStage, currSelectedNode, updateSelected, minimap} = props;
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

  // For image modal
  const [open, setOpen] = React.useState(false);

  if (node === currSelectedNode) {
    return (
      <Paper id={`${node}-documentation`}
        className="documentation-node"
        elevation={0}
        style={{
            padding: "5px",
            marginTop: "-15px", marginBottom: "20px", marginLeft: "10px",
            position: "relative",
      }}>
        {(currSelectedNode !== null) && !isStage &&
          <div>
            {minimap}
          </div>
        }
        <div style={{width: "20%"}}>
          {(hasMaterials || hasTools) &&
            <div style={{textAlign: "left"}}>
              <GraphNode node={parent} highlights={highlights} parent={parent} inDocumentation={true} wide={true}
                updateSelected={updateSelected} currSelectedNode={currSelectedNode} />
            </div>
          }
          {hasMaterials &&
            <div style={{textAlign: "left"}}>
              {nodeToMeta[parent]["materials"].map((node) =>
                <GraphNode node={node} highlights={highlights} currSelectedNode={currSelectedNode} parent={parent} inDocumentation={true}
                    updateSelected={updateSelected} nodeToMeta={nodeToMeta} wide={true} key={node}
                    content={<p style={{textAlign: "left"}}>{getIcon("materials", iconStyle)}{nodeToMeta[node]["name"]}</p>}/>
              )}
            </div>
          }
          {hasTools &&
            <div style={{textAlign: "left"}}>
              {nodeToMeta[parent]["tools"].map((node) =>
                <GraphNode node={node} highlights={highlights} currSelectedNode={currSelectedNode} parent={parent} inDocumentation={true}
                    updateSelected={updateSelected} nodeToMeta={nodeToMeta} wide={true} key={node}
                    content={<p style={{textAlign: "left"}}>{getIcon("tools", iconStyle)}{nodeToMeta[node]["name"]}</p>}/>
              )}
            </div>
          }
        </div>
        <div style={{width: "60%"}}>
          {images !== undefined && images.filter(i => i.name === node)[0] &&
            <div>
              <img src={images.filter(i => i.name === node)[0]?.publicURL}
                style={{maxWidth: "300px", height: "auto" }}
                onClick={() => setOpen(true)}
              />
              <Typography component="p" className="caption">
                Placeholder image caption
              </Typography>
            </div>
          }
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
        <IconButton class="icon-wrapper" disableRipple={true} style={{verticalAlign: "top", float: "right"}} onClick={(evt) => updateSelected(evt, null, null)}>
          <span className="icon"><CancelIcon/></span>
        </IconButton>

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
            <img src={images.filter(i => i.name === node)[0]?.publicURL}
              style={{maxWidth: "600px", height: "auto"}}
            />
            <Typography component="p" className="caption">
              Placeholder image caption
            </Typography>
          </Box>
        </Modal>
      </Paper>
    )
  }

};

export default DocumentationNode;
