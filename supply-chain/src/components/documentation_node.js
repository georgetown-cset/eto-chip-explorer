import React from "react";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton'
import Paper from "@mui/material/Paper";
import CancelIcon from '@mui/icons-material/Cancel';
import DownloadIcon from '@mui/icons-material/Download';
import { HelpTooltip, UserFeedback } from "@eto/eto-ui-components";
import { nodeToMeta } from "../../data/graph";
import { countryProvision, orgProvision, providerMeta } from "../../data/provision";
import ProcessDetail from "./process_detail";
import { allSubVariantsList } from "../helpers/shared";
import InputDetail from "./input_detail";
import InputList from "./input_list";

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
        className={"documentation-node" + (standalone ? " standalone" : "")}
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
          !isStage && !standalone &&
          <div className="documentation-node-navigation">
            <InputList
              currSelectedNode={currSelectedNode}
              parent={parent}
              highlights={{}}
              updateSelected={updateSelected}
              inDocumentation={true}
            />
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
          {currSelectedNode !== null &&
            <div className="lower-bar-wrapper">
              <div className="caption">
              {imgFileName !== undefined && meta.image_license &&
                <div dangerouslySetInnerHTML={{__html: "Image credit: " + meta.image_license}} />
              }
              </div>
              <div className="lower-icons-wrapper">
                <HelpTooltip text="Download PDF">
                  <a href={pdfs.filter(i => i.name === currSelectedNode)[0]?.publicURL} download={meta["name"]}
                    onClick={() => window.plausible && window.plausible('Download PDF', {props: {node: node}})}>
                    <DownloadIcon />
                  </a>
                </HelpTooltip>
                <UserFeedback context={currSelectedNode} contextLabel={nodeToMeta[currSelectedNode]["name"]}
                              mkFormSubmitLink={(context, queryParams, feedback) => `https://docs.google.com/forms/d/e/1FAIpQLSeaAgmf2g6O80ebW_fsRAa6Ma0CxnRwxgEr480aIg5Xz96FJg/formResponse?usp=pp_url&entry.1524532195=${feedback}&entry.1308802318=${queryParams}&entry.135985468=${context}&submit=Submit`}/>
              </div>
            </div>
          }
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
              <figure>
                <img src={imgFileName} alt={node}
                  style={{maxWidth: "600px", maxHeight: "80vh", height: "auto"}}
                />
                <figcaption className="caption" dangerouslySetInnerHTML={{__html:
                  (meta.image_caption ? meta.image_caption + "<br/>" : "") +
                  (meta.image_license ? "Credit: " + meta.image_license : "")}}/>
              </figure>
            }
          </Box>
        </Modal>
      </Paper>
    )
  }

};

export default DocumentationNode;
