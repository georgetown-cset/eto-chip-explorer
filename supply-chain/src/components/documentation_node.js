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
import GraphNode, { NodeHeading, SubNode } from "./graph_node";

const DocumentationNode = (props) => {
  const {node, highlights = {}, parent, descriptions, images, isStage, currSelectedNode, updateSelected, minimap, standalone=false} = props;
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

  const nodeToCountryProvision = getNodeToCountryProvision();
  const nodeToOrgProvision = getNodeToOrgProvision();

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
            marginTop: (parent === null) ? "1px" : "-15px", marginBottom: "20px", marginLeft: "10px",
            position: "relative",
      }}>
        {(currSelectedNode !== null) && !isStage &&
          <div>
            {minimap}
          </div>
        }
        <div style={{width: "20%"}}>
          {!(hasMaterials || hasTools) &&
            <div className="graph-node standalone-pane-heading" style={{textAlign: "left"}}>
              <Typography component={"p"}>
                {meta["name"]}
              </Typography>
            </div>
          }
          {(hasMaterials || hasTools) &&
            <div style={{textAlign: "left"}}>
              <GraphNode node={parent} highlights={highlights} parent={parent} inDocumentation={true} wide={true}
                updateSelected={updateSelected} currSelectedNode={currSelectedNode}
                content={<NodeHeading nodeType="parent" nodeId={parent} currSelectedNode={currSelectedNode} name={nodeToMeta[parent]["name"]} />} />
            </div>
          }
          {hasMaterials &&
            <div style={{textAlign: "left"}}>
              {nodeToMeta[parent]["materials"].map((node) =>
                <div>
                  <GraphNode node={node} highlights={highlights} currSelectedNode={currSelectedNode} parent={parent} inDocumentation={true}
                      updateSelected={updateSelected} nodeToMeta={nodeToMeta} wide={true} key={node}
                      content={<NodeHeading nodeType={nodeToMeta[node]["type"]} nodeId={node} currSelectedNode={currSelectedNode} name={nodeToMeta[node]["name"]} />}/>
                  {variants[node] &&
                    <div>
                      <Typography className="variants-heading" component={"p"}>Variants</Typography>
                      {variants[node].map((variant) =>
                        <SubNode nodeType={nodeToMeta[variant]["type"]}
                          name={nodeToMeta[variant]["name"]}
                          key={nodeToMeta[variant]["name"]}
                          nodeId={variant}
                          metadata={nodeToMeta}
                          highlight={variant in highlights ? highlights[variant] : 0}
                          updateSelected={updateSelected}
                          parent={parent}
                          highlights={highlights}
                          depth={2}
                          currSelectedNode={currSelectedNode}
                        />
                      )}
                    </div>
                  }
                </div>
              )}
            </div>
          }
          {hasTools &&
            <div style={{textAlign: "left"}}>
              {nodeToMeta[parent]["tools"].map((node) =>
                <div>
                  <GraphNode node={node} highlights={highlights} currSelectedNode={currSelectedNode} parent={parent} inDocumentation={true}
                      updateSelected={updateSelected} nodeToMeta={nodeToMeta} wide={true} key={node}
                      content={<NodeHeading nodeType={nodeToMeta[node]["type"]} nodeId={node} currSelectedNode={currSelectedNode} name={nodeToMeta[node]["name"]} />}/>
                  {variants[node] &&
                    <div>
                      <Typography className="variants-heading" component={"p"}>Variants</Typography>
                      {variants[node].map((variant) =>
                        <SubNode nodeType={nodeToMeta[variant]["type"]}
                          name={nodeToMeta[variant]["name"]}
                          key={nodeToMeta[variant]["name"]}
                          nodeId={variant}
                          metadata={nodeToMeta}
                          highlight={variant in highlights ? highlights[variant] : 0}
                          updateSelected={updateSelected}
                          parent={parent}
                          highlights={highlights}
                          depth={2}
                          currSelectedNode={currSelectedNode}
                        />
                      )}
                    </div>
                  }
                </div>
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
                        orgs={nodeToOrgProvision[currSelectedNode]} orgMeta={providerMeta} />
          }
        </div>
        <IconButton class="icon-wrapper" disableRipple={true} style={{verticalAlign: "top", float: "right"}}
          onClick={standalone ? () => updateSelected(false) : (evt) => updateSelected(evt, null, null)}>
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
